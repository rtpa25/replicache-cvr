# Replicache-Row-Versioning-Setup

This is a guide for setting up replicache with the row versioning backend strategy, in a production ready setup. This mono-repo is bootstraped using Turbo and consists of the following components:

## Setup

Clone the repo

```bash
git clone https://github.com/rtpa25/replicache-cvr.git
```

Install dependencies

```bash
pnpm install
```

Copy the `.env.example` file to `.env` and fill in the required values

```bash
cp .env.example .env
```

Make sure to populate it with your api keys

You will need docker setup for running postgres and redis, you can start the services using

```bash
docker-compose up -d
```

Run the migrations

```bash
pnpm db:migrate:dev
```

Generate the prisma client

```bash
pnpm db:generate
```

Start the server -- this will start the api server and the web server using turbo

```bash
pnpm dev
```

## Apps

- **Web**:
  - A Next.js app that sets up a Replicache client with typescript
  - A simple UI to add and view todos with nextUI
  - React Query for fetching data from the API
  - Replicache for real-time sync of data
- **API**:
  - A simple express server that syncs mutations from the client to the central data store
  - This server exposes two primary endpoints push and pull for replicache to work.

## Packages

- **Lib**:

  - A shared library that contains basic utility functions
  - In this case it houses JWT, Custom Logger, Redis and Ably(thirdy party socket server) setup

- **Models**:

  - prisma schema and migrations, also exports the whole prisma client, so any types that are needed are imported from the models package
  - zod schemas that are shared across apps
  - all the type-system that we have around
  - I also export replicache from this package, so as not to manage multiple versions of this lib over my client and server
  - various other types and utility classes

- **eslint-config**:

  - contains es-lint config for different types of projects inside the monorepo

- **typescript-config**:
  - consists of ts-config files for different environments
