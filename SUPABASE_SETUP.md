# Supabase Setup Guide

Complete step-by-step guide to set up Supabase for the Mental Health Booking Platform.

## Prerequisites

- A Supabase account (sign up at [supabase.com](https://supabase.com))
- Basic knowledge of SQL

---

## Step 1: Create a New Supabase Project

1. Go to [app.supabase.com](https://app.supabase.com)
2. Click **"New Project"**
3. Fill in the project details:
   - **Name**: `mental-health-booking` (or your preferred name)
   - **Database Password**: Choose a strong password (save it!)
   - **Region**: Choose the closest region to your users
   - **Pricing Plan**: Free tier is sufficient for development
4. Click **"Create new project"**
5. Wait for the project to be created (takes 1-2 minutes)

---

## Step 2: Get Your Project Credentials

1. In your project dashboard, go to **Settings** (gear icon) → **API**
2. Find these values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)
3. Copy these values - you'll need them for your `.env` file

---

## Step 3: Set Up the Database

### 3.1 Open SQL Editor

1. In the Supabase dashboard, click **SQL Editor** in the left sidebar
2. Click **"New query"**

### 3.2 Run the Setup Scripts

Run these SQL scripts **in order**:

#### Script 1: Database Setup
1. Open the file `supabase/setup.sql`
2. Copy all the SQL code
3. Paste it into the SQL Editor
4. Click **"Run"** (or press `Ctrl+Enter`)
5. Wait for success message: "Success. No rows returned"

#### Script 2: Row Level Security Policies
1. Open the file `supabase/rls_policies.sql`
2. Copy all the SQL code
3. Paste it into the SQL Editor
4. Click **"Run"**
5. Verify success

#### Script 3: Storage Policies (after creating bucket - see Step 4)
1. First complete Step 4 below
2. Then open `supabase/storage_policies.sql`
3. Copy and run the SQL

---

## Step 4: Create Storage Bucket

1. In Supabase dashboard, click **Storage** in the left sidebar
2. Click **"New bucket"**
3. Configure the bucket:
   - **Name**: `doctor-images` (must be exactly this name)
   - **Public bucket**: ✅ **Check this** (important!)
   - **File size limit**: `5` MB (optional)
   - **Allowed MIME types**: `image/*` (optional)
4. Click **"Create bucket"**

### 4.1 Set Up Storage Policies

1. Go back to **SQL Editor**
2. Open `supabase/storage_policies.sql`
3. Copy and run the SQL code

---

## Step 5: Create Your First Admin Account

### Option A: Using Supabase Dashboard (Recommended)

1. Go to **Authentication** → **Users** in Supabase dashboard
2. Click **"Add user"** → **"Create new user"**
3. Fill in:
   - **Email**: Your admin email (e.g., `admin@example.com`)
   - **Password**: Choose a strong password
   - **Auto Confirm User**: ✅ Check this
4. Click **"Create user"**
5. **Copy the User ID** (UUID) - you'll need it for the next step

6. Go to **SQL Editor** and run:
   ```sql
   INSERT INTO staff (user_id, email, role, is_active)
   VALUES ('<PASTE_USER_ID_HERE>', '<PASTE_EMAIL_HERE>', 'admin', true);
   ```
   
   Replace:
   - `<PASTE_USER_ID_HERE>` with the User ID you copied
   - `<PASTE_EMAIL_HERE>` with the email you used

7. Click **"Run"**

### Option B: Using SQL Only (Alternative)

If you prefer to create the user via SQL:

```sql
-- This requires service role key, so use Option A for simplicity
-- Or use Supabase Admin API from a backend service
```

---

## Step 6: Configure Environment Variables

1. In your project root (`healthcare/healthcare/`), create a `.env` file:
   ```bash
   # Windows PowerShell
   New-Item -Path .env -ItemType File
   
   # Or create manually in your editor
   ```

2. Add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

3. Replace:
   - `https://your-project-id.supabase.co` with your Project URL from Step 2
   - `your-anon-key-here` with your anon key from Step 2

4. **Important**: Never commit `.env` to git! It should already be in `.gitignore`

---

## Step 7: Verify Setup

### 7.1 Check Tables

1. Go to **Table Editor** in Supabase dashboard
2. You should see 4 tables:
   - ✅ `staff`
   - ✅ `doctors`
   - ✅ `time_slots`
   - ✅ `appointments`

### 7.2 Check Storage

1. Go to **Storage** → **Buckets**
2. You should see:
   - ✅ `doctor-images` bucket (public)

### 7.3 Check Authentication

1. Go to **Authentication** → **Users**
2. You should see your admin user
3. Verify the user is confirmed (green checkmark)

### 7.4 Test Admin Login

1. Start your React app:
   ```bash
   cd healthcare
   npm run dev
   ```

2. Go to `http://localhost:5173/login`
3. Login with your admin credentials
4. You should be redirected to `/admin` dashboard

---

## Step 8: Create Test Data (Optional)

### Add a Test Doctor

Run this in SQL Editor:

```sql
-- Insert a test doctor
INSERT INTO doctors (name, specialty, description)
VALUES (
  'Dr. Jane Smith',
  'Clinical Psychology',
  'Experienced clinical psychologist specializing in anxiety and depression. Over 10 years of experience helping patients achieve better mental health.'
);

-- Get the doctor ID (you'll need it for time slots)
SELECT id, name FROM doctors WHERE name = 'Dr. Jane Smith';
```

### Add Test Time Slots

```sql
-- Replace <DOCTOR_ID> with the ID from above
INSERT INTO time_slots (doctor_id, date, start_time, end_time, is_available)
VALUES 
  ('<DOCTOR_ID>', CURRENT_DATE + INTERVAL '1 day', '09:00', '10:00', true),
  ('<DOCTOR_ID>', CURRENT_DATE + INTERVAL '1 day', '10:00', '11:00', true),
  ('<DOCTOR_ID>', CURRENT_DATE + INTERVAL '2 days', '14:00', '15:00', true),
  ('<DOCTOR_ID>', CURRENT_DATE + INTERVAL '2 days', '15:00', '16:00', true);
```

---

## Troubleshooting

### Issue: "relation does not exist"
- **Solution**: Make sure you ran `setup.sql` first

### Issue: "permission denied"
- **Solution**: Check that RLS policies were created correctly

### Issue: "bucket does not exist"
- **Solution**: Create the `doctor-images` bucket manually first

### Issue: Can't login as admin
- **Solution**: 
  1. Verify user exists in Authentication → Users
  2. Verify user is confirmed
  3. Check that staff record exists: `SELECT * FROM staff WHERE email = 'your-email';`

### Issue: "Invalid API key"
- **Solution**: 
  1. Check your `.env` file has correct values
  2. Restart your dev server after changing `.env`
  3. Verify you're using the **anon key**, not the service role key

---

## Security Checklist

- ✅ RLS is enabled on all tables
- ✅ Storage bucket policies are set
- ✅ Admin account is created and active
- ✅ `.env` file is not committed to git
- ✅ Service role key is kept secret (never use in frontend)

---

## Next Steps

1. ✅ Database is set up
2. ✅ Storage is configured
3. ✅ Admin account is created
4. ✅ Environment variables are set

**You're ready to use the application!**

- Start the app: `npm run dev`
- Login at: `http://localhost:5173/login`
- Access admin dashboard: `http://localhost:5173/admin`

---

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Storage Guide](https://supabase.com/docs/guides/storage)

---

## Support

If you encounter issues:
1. Check the Troubleshooting section above
2. Review Supabase logs in the dashboard
3. Check browser console for errors
4. Verify all SQL scripts ran successfully

