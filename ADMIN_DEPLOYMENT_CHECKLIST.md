# Admin Section Fix - Deployment Checklist

## Before Deploying

- [ ] Review the changes made in `ADMIN_SECTION_FIX_ANALYSIS.md`
- [ ] Understand the architectural issues and solutions

## Netlify Environment Variables (MUST BE SET)

### Required for Admin Authentication
```
✓ NEXT_PUBLIC_SUPABASE_URL
✓ SUPABASE_URL (server-side, can be same as above)
✓ NEXT_PUBLIC_SUPABASE_ANON_KEY
✓ SUPABASE_ANON_KEY (server-side, can be same as above)
✓ ADMIN_EMAILS (comma-separated: admin@example.com,other@example.com)
```

### Check these are set:
Navigate to **Netlify Dashboard** → **Site Settings** → **Build & Deploy** → **Environment**

Verify all 5 variables above have values set.

## Database Migrations (Supabase)

- [ ] Run `pnpm exec prisma migrate deploy` locally with `DATABASE_URL`/`DIRECT_URL` pointing at your Supabase instance before deploying.
- [ ] Confirm the `Audit` table exists in Supabase (SQL editor: `select * from "Audit" limit 1;`).
- [ ] If the table is missing, rerun the command above to apply the `20250904091500_add_audit_table` migration so audit logging works.

## Deployment Steps

1. **Push these changes to main branch:**
   ```bash
   git add .
   git commit -m "Fix admin section Server Components errors

   - Convert app/admin/layout.tsx from client to server component
   - Create DashboardLayout client boundary component
   - Add error handling to auth functions
   - Add try-catch to session API
   - Fixes opaque Server Components render errors (digest 1336551846)"
   git push
   ```

2. **Netlify will automatically deploy** when you push to main

3. **Monitor the deployment** in Netlify dashboard
   - Check build logs for any errors
   - Ensure build completes successfully

## Testing After Deployment

### Test 1: Access Admin with No Session
```
1. Go to https://your-domain.com/admin/login
2. Should see login form (no error)
3. No digest errors
```

### Test 2: Login with Valid Credentials
```
1. Enter your admin email and password
2. Click "Sign in"
3. Should redirect to dashboard
4. Should see sidebar, topbar, and content
```

### Test 3: Check Dashboard
```
1. Navigate to https://your-domain.com/admin
2. Should see dashboard with stats
3. Should be able to click menu items
4. No errors in browser console
```

### Test 4: Logout and Redirect
```
1. On dashboard, click logout (if available)
2. Should redirect to login page
3. Session cookie should be cleared
```

## If Issues Persist

### Check Netlify Build Logs
1. Go to Netlify Dashboard
2. Select your site
3. Go to **Deploys** tab
4. Click the latest deploy
5. Go to **Deploy Log**
6. Look for errors (especially during build or function execution)

### Check Browser Console
- Press F12 to open dev tools
- Go to Console tab
- Look for any error messages or warnings
- The error should be more descriptive now (not a digest)

### Common Issues

**"Supabase configuration required" error:**
- ✓ This is expected if env vars aren't set
- Action: Set the environment variables in Netlify

**"Failed to acquire admin session" error:**
- Check Netlify logs
- Usually means Supabase connection failed
- Verify `SUPABASE_URL` and `SUPABASE_ANON_KEY` are correct

**Login form doesn't submit:**
- Check browser console for JavaScript errors
- Verify `NEXT_PUBLIC_SUPABASE_ANON_KEY` is set
- Try incognito/private window (clears caches)

## Rollback Plan

If something goes wrong, you can quickly rollback:

1. Go to Netlify Dashboard
2. **Deploys** tab
3. Find the previous working deploy
4. Click **...** menu and select **Rollback to this deploy**
5. Verify admin section works again

## Key Changes Summary

| File | Change | Reason |
|------|--------|--------|
| `app/admin/layout.tsx` | Client → Server component | Removed architectural anti-pattern |
| `components/admin/dashboard-layout.tsx` | NEW component | Proper client boundary for UI |
| `app/admin/(dashboard)/layout.tsx` | Added try-catch + new component | Error handling + proper structure |
| `lib/auth.ts` | Added try-catch to `getAdminSession()` | Prevent unhandled exceptions |
| `app/api/admin/session/route.ts` | Added try-catch to POST | Graceful error handling |

## Success Indicators

✅ Can access `/admin/login` without errors
✅ Can login with valid credentials
✅ Can access `/admin` dashboard after login
✅ Dashboard shows content (posts, apps, tools, etc.)
✅ Browser console has no errors (except third-party)
✅ Sidebar and topbar render correctly

---

**Need Help?** Check the detailed analysis in `ADMIN_SECTION_FIX_ANALYSIS.md`
