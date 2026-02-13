# Disclaimer: 
100% vibe coded
- Front end developed with lovable ( free version was sufficient )
- BE developed by cursor pro. 


# Use with caution: 
I have not reveiwed the code or script. if you find any security issue or risk to use this locally please email me at najim.ju@gmail.com. If you are convinced that it secured to use, then clone the repo locally or just download the docker-compose.images.yml file.

# Docker images: 
Published images are multi-platform (linux/amd64, linux/arm64) and work on Windows (WSL2), Linux, and macOS (Intel and Apple Silicon).

https://hub.docker.com/r/ivplay4689/ruthless-execution/tags


Find the latest fe and be docker image and note it down in a text editor.



# Run it locally:

## Environment variables to know:

Pass these to `docker compose` (e.g. `export` in your shell or put them in a `.env` file). They are used when starting the **be** service.

| Variable | Required | Description |
|----------|----------|-------------|
| `FE_TAG` | Yes | Frontend image tag (e.g. `fe-2026-02-13-0803-ec8e614`). |
| `BE_TAG` | Yes | Backend image tag (e.g. `be-2026-02-13-0803-ec8e614`). Must be `be-...`, not `be-fe-...`. |
| `JWT_SECRET` | No | Secret for signing auth tokens. Default: `change-me-in-production`. Set in production. |
| `BOOTSTRAP_USER_EMAIL` | No | If set with `BOOTSTRAP_USER_PASSWORD`, a user is created on first backend start so you can log in. |
| `BOOTSTRAP_USER_PASSWORD` | No | Password for the bootstrap user (min 8 characters). Ignored unless `BOOTSTRAP_USER_EMAIL` is set. |

## Sample command:
```
export FE_TAG=fe-2026-02-13-0803-ec8e614 BE_TAG=be-2026-02-13-0803-ec8e614 BOOTSTRAP_USER_EMAIL=you@example.com BOOTSTRAP_USER_PASSWORD=yourpassword
docker compose -f docker-compose.images.yml up -d
```

If you didn't use bootstrap env vars, create a user manually (after the stack is up):

docker compose -f docker-compose.images.yml exec be npm run create-user <EMAIL> <PASSWORD>







