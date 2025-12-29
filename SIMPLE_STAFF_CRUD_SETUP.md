# Simple Staff CRUD Setup Guide

**Super Simple Setup** - No Edge Functions, No HTTP Extensions, No Complex Setup!

## ✅ How It Works

The admin dashboard uses **Supabase's built-in `signUp` API** which works with the anon key. It's that simple!

1. **Create**: Uses `signUp()` → Creates auth user → Links to staff table
2. **Update**: Direct database UPDATE
3. **Delete/Deactivate**: Direct database UPDATE (sets inactive)

## 🚀 Setup (Optional - Only if you want extra validation)

The frontend works **without** running any SQL! But if you want extra validation, you can optionally run:

```sql
-- Copy contents of: supabase/simple_staff_crud.sql
-- This is OPTIONAL - frontend works without it
```

## 📋 Required: Disable Email Confirmation

For staff accounts created by admin, you should disable email confirmation:

1. Go to **Supabase Dashboard → Authentication → Settings**
2. Find **"Enable email confirmations"**
3. Turn it **OFF** (or keep it ON and staff will need to confirm email)

## 🎯 How to Use

### Create Staff Account
1. Admin clicks "Create Staff Account"
2. Fills in: Email, Password, Role
3. Clicks "Create"
4. ✅ Done! Staff can login immediately

### Update Staff
1. Click "Edit" on any staff member
2. Change role or status
3. Click "Update"
4. ✅ Done!

### Deactivate Staff
1. Click "Deactivate" on any staff member
2. ✅ Done! Staff is now inactive

## 🔧 That's It!

No Edge Functions, no HTTP extensions, no complex setup. Just:
- ✅ Frontend code (already done)
- ✅ Disable email confirmation (recommended)
- ✅ Optional SQL functions (for extra validation)

## 🐛 Troubleshooting

**Error: "User already registered"**
- User already exists in auth
- System will try to link existing user to staff table
- If it fails, create user manually in Authentication dashboard

**Error: "Permission denied"**
- Make sure RLS policies are set up (from `rls_policies.sql`)
- Make sure you're logged in as admin

**Staff can't login**
- Check if email confirmation is enabled
- If enabled, staff needs to confirm email first
- Or disable email confirmation in Supabase settings

## ✨ Features

- ✅ **Create**: Fully automated via signUp API
- ✅ **Read**: View all staff in table
- ✅ **Update**: Change role and status
- ✅ **Delete**: Soft delete (set inactive)

All CRUD operations work directly from the admin dashboard!
