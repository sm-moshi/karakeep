# Karakeep on CNPG/Postgres

This overlay is the Postgres-only Kubernetes example. It expects the
CloudNativePG operator to be installed in the cluster and deploys:

- Karakeep with `DB_DRIVER=postgres`
- a CNPG `Cluster` named `karakeep-postgres`
- the browser worker dependency
- Meilisearch
- a `/data` PVC for assets and local app state only

The database lives on CNPG-managed PVCs. Do not use `/data` for database
persistence in this variant.

## Quick Start

Copy the sample configuration files and edit them:

```sh
cp .env_sample .env
cp .secrets_sample .secrets
```

At minimum, set:

- `NEXTAUTH_URL`
- `KARAKEEP_IMAGE`
- `KARAKEEP_VERSION`
- the generated secrets in `.secrets`

Then render or apply the overlay:

```sh
kustomize build .
kubectl apply -k .
```

## Database Connection

The `karakeep-postgres` cluster bootstraps a `karakeep` database owned by a
`karakeep` user. CloudNativePG creates the `karakeep-postgres-app` secret with
application credentials. Karakeep reads the `uri` key from that secret as
`DATABASE_URL`.

The default app connection targets the CNPG read-write service:

```text
karakeep-postgres-rw.karakeep.svc
```

If you enable the optional PgBouncer `Pooler` example, point `DATABASE_URL` at
the pooler read-write service after verifying migrations and application
startup against your pooler mode.

## High Availability

The public example uses `instances: 3`. For local development, change
`instances` to `1` in `postgres-cluster.yaml`.

## Backups

Production deployments need CNPG backups before accepting real data. The
`scheduled-backup.example.yaml` and `backup-objectstore.example.yaml` files show
the shape of the resources without shipping object-store credentials. Create the
referenced secret yourself and validate restore procedures before relying on the
deployment.
