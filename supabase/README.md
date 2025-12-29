# Supabase SQL Scripts

This directory contains all SQL scripts needed to set up the Supabase database.

## Scripts Overview

### 1. `setup.sql` ⭐ **START HERE**
   - Creates all database tables
   - Sets up indexes for performance
   - Creates triggers for `updated_at` timestamps
   - Enables Row Level Security (RLS)
   - **Run this first!**

### 2. `rls_policies.sql`
   - Sets up Row Level Security policies
   - Defines who can access what data
   - **Run this after setup.sql**

### 3. `storage_policies.sql`
   - Sets up storage bucket policies for `doctor-images`
   - **Run this after creating the storage bucket manually**

### 4. `create_admin.sql`
   - Helper script to create admin accounts
   - **Run this after creating a user in Authentication**

## Quick Start

1. **Run `setup.sql`** in Supabase SQL Editor
2. **Create storage bucket** `doctor-images` (public) in Storage
3. **Run `storage_policies.sql`**
4. **Create user** in Authentication dashboard
5. **Run `create_admin.sql`** (update with your user_id and email)

## Detailed Instructions

See `../SUPABASE_SETUP.md` for complete step-by-step instructions.

## Order of Execution

```
1. setup.sql          → Creates tables and structure
2. rls_policies.sql   → Sets up security
3. [Create bucket manually]
4. storage_policies.sql → Sets up storage access
5. [Create user manually]
6. create_admin.sql   → Links user to admin role
```

## Notes

- All scripts use `IF NOT EXISTS` and `DROP IF EXISTS` for safety
- You can run scripts multiple times without issues
- Scripts are idempotent (safe to re-run)

