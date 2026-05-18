# Kubernetes with CNPG/Postgres

Karakeep is SQLite-first by default. The Postgres-only deployment variant is
available for Kubernetes clusters that already run
[CloudNativePG](https://cloudnative-pg.io/).

Use this variant when you want Karakeep application data and background jobs to
live in Postgres instead of SQLite. The `/data` volume remains only for assets
and local app state.

## Requirements

- Kubernetes
- kubectl
- kustomize
- CloudNativePG operator installed
- a Postgres-only Karakeep image built from the `aio-postgres` Docker target

## Manifests

The example overlay lives in `kubernetes/cnpg`.

It deploys:

- a CNPG `Cluster` named `karakeep-postgres`
- Karakeep with `DB_DRIVER=postgres`
- Meilisearch
- the browser worker dependency
- a `/data` PVC for assets

The default CNPG cluster uses `instances: 3` for an HA public deployment. For a
local or development cluster, set `instances: 1` in
`kubernetes/cnpg/postgres-cluster.yaml`.

## Configuration

Copy and edit the sample files:

```sh
cd kubernetes/cnpg
cp .env_sample .env
cp .secrets_sample .secrets
```

Set these values before deploying:

```env
NEXTAUTH_URL=https://karakeep.example.com
KARAKEEP_IMAGE=ghcr.io/yaelmoshi/karakeep
KARAKEEP_VERSION=postgres
DB_DRIVER=postgres
```

Generate fresh secret values:

```sh
openssl rand -base64 36
```

CloudNativePG creates the `karakeep-postgres-app` secret for the application
owner. Karakeep reads the `uri` key from that secret as `DATABASE_URL`.

## Deploy

Render first:

```sh
kustomize build kubernetes/cnpg
```

Then apply:

```sh
kubectl apply -k kubernetes/cnpg
```

## Connection Pooling

The default deployment connects to the CNPG read-write service through the
generated app secret. An optional PgBouncer `Pooler` example is provided in
`kubernetes/cnpg/postgres-pooler.example.yaml`.

Validate migrations and application startup against the direct read-write
service before switching application traffic to a pooler.

## Backups

Backups are required for production. The example files
`kubernetes/cnpg/backup-objectstore.example.yaml` and
`kubernetes/cnpg/scheduled-backup.example.yaml` show the shape of a CNPG object
store backup configuration and scheduled backup without shipping credentials.

Create the referenced object-store secret yourself and test restore before
using the deployment for real data.
