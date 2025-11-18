# Admin Section Setup Guide

This guide provides instructions on how to configure your environment to access the admin section of your website.

## 1. Environment Variables

The admin authentication relies on Supabase. Create a `.env.local` file in the root of your project and add the following variables:

-   `SUPABASE_URL` **and** `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL. Next.js only exposes variables prefixed with `NEXT_PUBLIC` to the browser, so set both values to the same URL.
-   `SUPABASE_ANON_KEY` **and** `NEXT_PUBLIC_SUPABASE_ANON_KEY`: The Supabase anon key. Again, set both so the browser login client can read the key.
-   `ADMIN_EMAILS`: A comma-separated list of Supabase user emails that are allowed to access the admin section. There should be no trailing commas.
-   `NEXT_PUBLIC_ADMIN_EMAIL` (optional): If provided, the login form will resolve the `kejsan` username to this email address before signing in.

### Example `.env.local` file:

```
SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
ADMIN_EMAILS=your.email@example.com
NEXT_PUBLIC_ADMIN_EMAIL=your.email@example.com
```

The admin pages also expect a PostgreSQL connection for Prisma migrations. Set `DATABASE_URL` (and optionally `DIRECT_URL`) to point at your Supabase database before running migrations so the Skill table is created.

## 2. Supabase User Setup

Create (or confirm) a Supabase user account that matches one of the emails listed in `ADMIN_EMAILS`. Disable public sign-ups inside Supabase Authentication settings so only the seeded admin user can log in.

If you want to sign in with a username, add a `profiles` table row for your user with a `username` column set to the desired alias (e.g., `kejsan`) and ensure row level security allows the anon key to read that column. The login form first checks the optional hard-coded mapping and then queries the `profiles` table to resolve the email.

## 3. Troubleshooting

### Still can't log in?

If you've followed all the steps and still can't log in, double-check the following:

-   **Restart your application:** After updating `.env.local`, restart the development server.
-   **Allowed email:** Confirm the Supabase account you are using appears in `ADMIN_EMAILS` exactly (comparison is case-insensitive).
-   **Row Level Security:** Ensure the `profiles` table allows the anon key to read the `email` field when doing username lookups. Alternatively, sign in with the email address directly.
-   **Cookies cleared:** The browser stores a secure admin cookie for server-side validation. If you change credentials, sign out completely or clear cookies before testing again.

## 4. Managing skills

-   Run the latest migrations to add the `Skill` table (`pnpm prisma migrate deploy` in production, or `pnpm prisma migrate dev` locally).
-   After signing in to the admin dashboard, open **Skills** in the sidebar to create, edit, or remove skills.
-   Each skill supports a name, optional icon/emoji, category label, and a level (1–5). Slugs are generated from the name but can be overridden in the dialog if you need a custom anchor.
-   Saved skills are reused by both the homepage marquee and the Skills & Experience page; updates appear as soon as the API cache refreshes.

By following this guide, you should be able to resolve any login issues with the admin section.
