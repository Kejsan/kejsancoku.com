# Kejsan website revamp

## Authentication setup

This project uses [NextAuth](https://next-auth.js.org/) with GitHub OAuth for the admin section. Configure the following environment variables:

- `GITHUB_ID` and `GITHUB_SECRET` – credentials for your GitHub OAuth app.
- `NEXTAUTH_URL` – the base URL of your deployment.
- `NEXTAUTH_SECRET` – random string used to sign session tokens.
- `ADMIN_EMAILS` – comma separated list of GitHub email addresses allowed to access `/admin` and related API routes.

The admin dashboard lives at `/admin` and provides links to manage posts, experiences, apps, work samples, and the site footer.

> [!IMPORTANT]
> For a detailed guide on setting up the environment variables and ensuring your GitHub email is configured correctly for admin access, please see the [Admin Section Setup Guide](./ADMIN_GUIDE.md).

## Database migrations

Netlify builds run with the `NETLIFY=true` environment variable, so the automated build pipeline skips `prisma migrate deploy`. Apply migrations from CI or manually before triggering a Netlify deploy to ensure the production database schema matches the application.
