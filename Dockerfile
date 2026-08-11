FROM node:22-alpine
WORKDIR /app
COPY package.json ./
COPY bin ./bin
# Zero runtime dependencies — the bridge uses Node's built-in fetch.
ENTRYPOINT ["node", "bin/racing-alpha-mcp.mjs"]
