# Deploy Cosmo Manager

Production stack runs through Docker Compose:

- Traefik on ports `80` and `443`
- ASP.NET backend on the internal Docker network
- React static frontend served by nginx
- PostgreSQL with a named Docker volume

## DNS

Point these records to the server IP `84.54.57.253`:

```text
@    A    84.54.57.253
*    A    84.54.57.253
```

The wildcard record covers `api.cosmo-manager.ru`. `www.cosmo-manager.ru` is also supported by Traefik.

## Server Requirements

Open ports:

```bash
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
```

Install Docker Engine and the Compose plugin on Ubuntu/Debian if they are not installed yet.

## Environment

On the server:

```bash
cd /opt/cosmo-manager
cp .env.example .env
```

Edit `.env` and replace:

- `ACME_EMAIL`
- `POSTGRES_PASSWORD`
- `JWT_KEY`
- `SEED_ADMIN_EMAIL`

Generate a JWT key with:

```bash
openssl rand -base64 48
```

## Run

```bash
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml ps
```

Logs:

```bash
docker compose -f docker-compose.prod.yml logs -f traefik backend frontend postgres
```

After the first successful deploy, register a user with the email from `SEED_ADMIN_EMAIL`, then restart backend so the startup seeder gives that user the administrator role:

```bash
docker compose -f docker-compose.prod.yml restart backend
```

## Checks

```bash
curl -I https://cosmo-manager.ru
curl -I https://api.cosmo-manager.ru/api/auth/me
docker compose -f docker-compose.prod.yml logs --tail=100 traefik
```

If certificates are not issued, verify that DNS already resolves and ports `80`/`443` are reachable from the internet.
