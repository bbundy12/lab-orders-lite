FROM node:22-bookworm-slim AS base

WORKDIR /app

ENV PNPM_HOME=/root/.local/share/pnpm
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

FROM base AS runtime

COPY . .

RUN pnpm prisma generate

CMD ["pnpm", "dev"]

