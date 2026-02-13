# Disclaimer: 
100% vibe coded
- Front end developed with lovable ( free version was sufficient )
- BE developed by cursor pro. 


# Use with caution: 
I have not reveiwed the code or script. if you find any security issue or risk to use this locally please email me at najim.ju@gmail.com. 

# Docker images: 
Published images are multi-platform (linux/amd64, linux/arm64) and work on Windows (WSL2), Linux, and macOS (Intel and Apple Silicon).

https://hub.docker.com/r/ivplay4689/ruthless-execution/tags


Find the latest fe and be docker image then - 

# Run it locally:
Clone the repo locally or just download the docker-compose.images.yml file.


#### export FE_TAG=fe-2026-02-13-0742-4569ff4 BE_TAG=be-2026-02-13-0742-4569ff4
Optional: set these to auto-create a user so you can log in right after "up"
- export BOOTSTRAP_USER_EMAIL=you@example.com - BOOTSTRAP_USER_PASSWORD=yourpassword
- docker compose -f docker-compose.images.yml up -d


#### Example: 
```
export FE_TAG=fe-2026-02-13-0803-ec8e614 BE_TAG=be-2026-02-13-0803-ec8e614 BOOTSTRAP_USER_EMAIL=you@example.com BOOTSTRAP_USER_PASSWORD=yourpassword
docker compose -f docker-compose.images.yml up -d
```
If you didn't use bootstrap env vars, create a user manually (after the stack is up):

docker compose -f docker-compose.images.yml exec be npm run create-user <EMAIL> <PASSWORD>







