import bcrypt from 'bcryptjs';
import prisma from '../config/database.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * If BOOTSTRAP_USER_EMAIL and BOOTSTRAP_USER_PASSWORD are set, ensure that user
 * exists (create only if missing). Idempotent; safe to run on every backend startup.
 * Used by docker-compose so users can set a local login and just run `docker compose up`.
 */
export async function bootstrapUser(): Promise<void> {
  const email = process.env.BOOTSTRAP_USER_EMAIL?.trim();
  const password = process.env.BOOTSTRAP_USER_PASSWORD;

  if (!email || !password) {
    if (process.env.BOOTSTRAP_USER_EMAIL !== undefined || process.env.BOOTSTRAP_USER_PASSWORD !== undefined) {
      console.warn('[bootstrap] BOOTSTRAP_USER_EMAIL and BOOTSTRAP_USER_PASSWORD must both be set; skipping bootstrap user.');
    }
    return;
  }

  const normalizedEmail = email.toLowerCase();

  if (!EMAIL_REGEX.test(normalizedEmail)) {
    console.warn('[bootstrap] BOOTSTRAP_USER_EMAIL invalid format; skipping bootstrap user.');
    return;
  }

  if (password.length < 8) {
    console.warn('[bootstrap] BOOTSTRAP_USER_PASSWORD must be at least 8 characters; skipping bootstrap user.');
    return;
  }

  try {
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      console.log(`[bootstrap] User already exists: ${normalizedEmail}`);
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
      },
    });
    console.log(`[bootstrap] Created user: ${normalizedEmail}`);
  } catch (e: unknown) {
    const err = e as { code?: string };
    if (err?.code === 'P2002') {
      console.log(`[bootstrap] User already exists: ${normalizedEmail}`);
      return;
    }
    console.error('[bootstrap] Failed to create user:', err);
    // Don't throw - allow server to start; user can create account manually or fix env
  }
}
