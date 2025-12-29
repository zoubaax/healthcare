# Database Schema Documentation

This document describes the database schema for the Online Mental Health Session Booking Platform using Supabase.

## Tables

### 1. `staff` Table
Stores Admin and Staff account information.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key (auto-generated) |
| `user_id` | uuid | Foreign key to `auth.users` (Supabase Auth) |
| `email` | text | Staff email address (stored for easy access) |
| `role` | text | Role: 'admin' or 'staff' |
| `is_active` | boolean | Whether the account is active |
| `created_at` | timestamp | Account creation timestamp |
| `updated_at` | timestamp | Last update timestamp |

**Indexes:**
- Primary key on `id`
- Foreign key on `user_id` referencing `auth.users(id)`
- Index on `role` for faster role-based queries

**Row Level Security (RLS):**
- Admins can read all staff records
- Staff can only read their own record
- Only admins can create, update, or delete staff records

---

### 2. `doctors` Table
Stores doctor/psychologist information.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key (auto-generated) |
| `name` | text | Doctor's full name |
| `specialty` | text | Doctor's specialty area |
| `description` | text | Professional description |
| `profile_image_url` | text | URL to profile image in Supabase Storage |
| `created_at` | timestamp | Record creation timestamp |
| `updated_at` | timestamp | Last update timestamp |

**Indexes:**
- Primary key on `id`
- Index on `name` for search functionality

**Row Level Security (RLS):**
- Public read access (for user browsing)
- Only staff and admins can create, update, or delete

---

### 3. `time_slots` Table
Stores available time slots for each doctor.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key (auto-generated) |
| `doctor_id` | uuid | Foreign key to `doctors.id` |
| `date` | date | Date of the time slot |
| `start_time` | time | Start time (HH:MM format) |
| `end_time` | time | End time (HH:MM format) |
| `is_available` | boolean | Whether the slot is available for booking |
| `created_at` | timestamp | Record creation timestamp |
| `updated_at` | timestamp | Last update timestamp |

**Indexes:**
- Primary key on `id`
- Foreign key on `doctor_id` referencing `doctors(id)`
- Index on `doctor_id` and `date` for faster queries
- Index on `is_available` for filtering available slots

**Row Level Security (RLS):**
- Public read access (for booking)
- Only staff and admins can create, update, or delete

---

### 4. `appointments` Table
Stores patient appointment bookings.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key (auto-generated) |
| `doctor_id` | uuid | Foreign key to `doctors.id` |
| `time_slot_id` | uuid | Foreign key to `time_slots.id` |
| `first_name` | text | Patient's first name |
| `last_name` | text | Patient's last name |
| `education_level` | text | Patient's education level |
| `email` | text | Patient's email address |
| `phone_number` | text | Patient's phone number |
| `status` | text | Status: 'pending', 'confirmed', or 'cancelled' |
| `created_at` | timestamp | Booking creation timestamp |
| `updated_at` | timestamp | Last update timestamp |

**Indexes:**
- Primary key on `id`
- Foreign key on `doctor_id` referencing `doctors(id)`
- Foreign key on `time_slot_id` referencing `time_slots(id)`
- Index on `status` for filtering appointments
- Index on `email` for patient lookup

**Row Level Security (RLS):**
- Public can create appointments (for booking)
- Only staff and admins can read, update, or delete appointments

---

## Storage Buckets

### `doctor-images` Bucket
Stores doctor profile pictures.

**Configuration:**
- Public access: Enabled (for displaying images)
- File size limit: 5MB
- Allowed file types: image/*

**Path structure:**
- `doctor-profiles/{random_filename}.{ext}`

---

## Supabase Setup Instructions

### 1. Create Tables

Run the following SQL in your Supabase SQL Editor:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create staff table
CREATE TABLE staff (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'staff')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create doctors table
CREATE TABLE doctors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  specialty TEXT NOT NULL,
  description TEXT,
  profile_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create time_slots table
CREATE TABLE time_slots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create appointments table
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  time_slot_id UUID NOT NULL REFERENCES time_slots(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  education_level TEXT NOT NULL,
  email TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_staff_user_id ON staff(user_id);
CREATE INDEX idx_staff_role ON staff(role);
CREATE INDEX idx_doctors_name ON doctors(name);
CREATE INDEX idx_time_slots_doctor_date ON time_slots(doctor_id, date);
CREATE INDEX idx_time_slots_available ON time_slots(is_available);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_email ON appointments(email);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER update_staff_updated_at BEFORE UPDATE ON staff
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_doctors_updated_at BEFORE UPDATE ON doctors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_time_slots_updated_at BEFORE UPDATE ON time_slots
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 2. Set Up Row Level Security (RLS)

```sql
-- Enable RLS on all tables
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Staff table policies
CREATE POLICY "Admins can manage all staff"
  ON staff FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM staff
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Staff can view their own record"
  ON staff FOR SELECT
  USING (user_id = auth.uid());

-- Doctors table policies
CREATE POLICY "Public can view doctors"
  ON doctors FOR SELECT
  USING (true);

CREATE POLICY "Staff and admins can manage doctors"
  ON doctors FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM staff
      WHERE user_id = auth.uid() AND (role = 'staff' OR role = 'admin')
    )
  );

-- Time slots table policies
CREATE POLICY "Public can view available time slots"
  ON time_slots FOR SELECT
  USING (true);

CREATE POLICY "Staff and admins can manage time slots"
  ON time_slots FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM staff
      WHERE user_id = auth.uid() AND (role = 'staff' OR role = 'admin')
    )
  );

-- Appointments table policies
CREATE POLICY "Public can create appointments"
  ON appointments FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Staff and admins can manage appointments"
  ON appointments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM staff
      WHERE user_id = auth.uid() AND (role = 'staff' OR role = 'admin')
    )
  );
```

### 3. Create Storage Bucket

1. Go to Storage in Supabase dashboard
2. Create a new bucket named `doctor-images`
3. Set it to **Public**
4. Configure policies:

```sql
-- Allow public read access
CREATE POLICY "Public can view doctor images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'doctor-images');

-- Allow staff and admins to upload
CREATE POLICY "Staff and admins can upload doctor images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'doctor-images' AND
    EXISTS (
      SELECT 1 FROM staff
      WHERE user_id = auth.uid() AND (role = 'staff' OR role = 'admin')
    )
  );

-- Allow staff and admins to delete
CREATE POLICY "Staff and admins can delete doctor images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'doctor-images' AND
    EXISTS (
      SELECT 1 FROM staff
      WHERE user_id = auth.uid() AND (role = 'staff' OR role = 'admin')
    )
  );
```

### 4. Create Initial Admin Account

After setting up the database, create your first admin account:

1. Go to Authentication in Supabase dashboard
2. Create a new user manually or use the Admin API
3. Insert a record in the `staff` table:

```sql
INSERT INTO staff (user_id, email, role, is_active)
VALUES ('<user_id_from_auth>', '<email_address>', 'admin', true);
```

---

## Environment Variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## Notes

- All timestamps use `TIMESTAMP WITH TIME ZONE` for proper timezone handling
- Foreign keys use `ON DELETE CASCADE` to maintain referential integrity
- The `staff` table links to Supabase Auth users via `user_id`
- RLS policies ensure proper access control based on user roles
- Time slots are marked as unavailable when booked
- Appointments start with 'pending' status and can be confirmed or cancelled by staff

