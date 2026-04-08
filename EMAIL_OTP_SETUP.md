# Email OTP Setup Guide

The registration form has been updated to use **Email OTP** instead of Phone OTP. Follow these steps to enable it in Supabase:

## Steps to Enable Email OTP in Supabase

1. **Go to Supabase Dashboard**
   - Open https://app.supabase.com
   - Select your project (beyond-classroom)

2. **Navigate to Authentication Settings**
   - Click on **Authentication** in the left sidebar
   - Click on **Providers**

3. **Configure Email Provider**
   - Find and click on **Email**
   - Under **Email Provider**, ensure you see options for:
     - ✅ **Email/Password** (for sign up with password) - disable if not needed
     - ✅ **Email link** (for passwordless email links) - can enable
     - ✅ **One-Time Password (OTP)** - **ENABLE THIS** ← Required for our app
4. **Email OTP Settings**
   - Expand the **One-Time Password (OTP)** section
   - Set the **OTP expiration** to a reasonable time (e.g., 10 minutes)
   - Leave other settings as default

5. **SMTP Configuration (Optional but Recommended)**
   - By default, Supabase uses a demo SMTP server
   - For production, configure your own SMTP:
     - Click **SMTP Settings** (under Email)
     - Enter your email service credentials (Gmail, SendGrid, etc.)
   - For testing, you can use Supabase's built-in email testing

6. **Test the Setup**
   - Go back to your app
   - Open the registration screen
   - Select a role (e.g., "Student")
   - Click "Continue"
   - Enter your email address
   - Click "Send OTP"
   - You should receive an email with a 6-digit code
   - Enter the code to verify

## What Changed in the Code

- **Before**: Used phone number with SMS OTP

  ```typescript
  signInWithOtp({
    phone: formattedPhone,
  });
  ```

- **After**: Uses email address with Email OTP
  ```typescript
  signInWithOtp({
    email: email.trim(),
  });
  ```

## Registration Flow (4 Steps)

1. **Select Role** (Student, Parent, Teacher, Admin)
2. **Enter Email** (receives OTP code)
3. **Verify OTP** (6-digit code from email)
4. **Complete Profile** (Name, School, Grade/City, Photo)

## If Email is Not Arriving

1. Check Supabase Logs:
   - In Supabase Dashboard → Authentication → Logs
   - Look for any error messages

2. Verify SMTP Settings:
   - Make sure Email/OTP provider is enabled
   - Check SMTP credentials if custom SMTP is configured

3. Check Spam Folder:
   - OTP emails might be marked as spam
   - Add Supabase email to your contacts

## Environment Variables

No new environment variables needed. Your existing Supabase configuration handles Email OTP automatically:

```typescript
// In config/supabase.ts
const supabaseUrl =
  process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey =
  process.env
    .EXPO_PUBLIC_SUPABASE_ANON_KEY;
```

## Troubleshooting

| Issue                        | Solution                                                                                      |
| ---------------------------- | --------------------------------------------------------------------------------------------- |
| "Email is required" error    | Make sure you enter a valid email address                                                     |
| OTP not arriving             | Check Supabase logs and SMTP settings                                                         |
| "Invalid OTP" when verifying | Make sure you're using the correct 6-digit code from your email                               |
| User not created in database | Check that RLS policies allow user creation (they should automatically insert on auth signup) |

## Next Steps

After Email OTP is working:

1. Test the complete registration flow
2. Verify user data appears in Supabase `users` table
3. Check that profile setup screen loads correctly
4. Test competition browsing and registration
