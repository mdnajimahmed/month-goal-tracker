import { Request } from 'express';

/** Get a single route param as string (Express may type params as string | string[]). */
export function getParam(req: Request, key: string): string {
  const p = req.params[key];
  return Array.isArray(p) ? p[0] ?? '' : (p ?? '');
}
