# Replicache-Row-Versioning-Setup

This is a guide for setting up replicache with the row versioning backend strategy, in a production ready setup. This mono-repo is bootstraped using Turbo and consists of the following components:

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
  - A custom replicache client that extends the default replicache client
  - This client is used to setup the replicache client with the row versioning strategy
