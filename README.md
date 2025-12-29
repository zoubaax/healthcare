# Online Mental Health Session Booking Platform

A web-based frontend application built with React and Supabase for booking mental health listening sessions and psychological consultations.

## Features

### Admin Dashboard
- Create, edit, activate, and deactivate Staff accounts
- View system overview (read-only statistics)
- Admin-only access

### Staff Dashboard
- Add, edit, and delete doctors/psychologists
- Upload and manage doctor profile pictures
- Manage professional descriptions and specialties
- Manage available time slots for each doctor
- View, confirm, update, and cancel appointments

### User Side (Public)
- Browse available doctors with photos, descriptions, and specialties
- Select a doctor and choose an available date and time
- Book sessions online
- Fill in personal information during booking (name, education level, email, phone)

## Tech Stack

- **React 19** - Frontend framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Supabase** - Backend (Authentication, Database, Storage)
- **React Router** - Routing
- **date-fns** - Date manipulation

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Supabase account and project

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd healthcare/healthcare
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
   - Copy `.env.example` to `.env` (if it exists) or create a new `.env` file
   - Add your Supabase credentials:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Set up Supabase database:
   - Follow the instructions in `DATABASE_SCHEMA.md`
   - Run the SQL scripts to create tables, indexes, and RLS policies
   - Create the `doctor-images` storage bucket

5. Create your first admin account:
   - Go to Supabase Dashboard > Authentication
   - Create a new user manually
   - Note the user ID and email
   - Run this SQL in the SQL Editor:
   ```sql
   INSERT INTO staff (user_id, email, role, is_active)
   VALUES ('<user_id_from_auth>', '<email_address>', 'admin', true);
   ```

## Running the Application

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Project Structure

```
healthcare/
├── src/
│   ├── components/
│   │   ├── admin/
│   │   │   ├── StaffManagement.jsx
│   │   │   └── SystemOverview.jsx
│   │   ├── staff/
│   │   │   ├── DoctorManagement.jsx
│   │   │   ├── TimeSlotManagement.jsx
│   │   │   └── AppointmentManagement.jsx
│   │   └── ProtectedRoute.jsx
│   ├── contexts/
│   │   └── AuthContext.jsx
│   ├── lib/
│   │   └── supabase.js
│   ├── pages/
│   │   ├── admin/
│   │   │   └── AdminDashboard.jsx
│   │   ├── staff/
│   │   │   └── StaffDashboard.jsx
│   │   ├── user/
│   │   │   ├── Home.jsx
│   │   │   └── BookAppointment.jsx
│   │   ├── Login.jsx
│   │   └── Unauthorized.jsx
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── DATABASE_SCHEMA.md
└── README.md
```

## Important Notes

### Admin API Functions

The `StaffManagement` component uses `supabase.auth.admin` functions which require the **service role key** (not the anon key). For security reasons, these should not be exposed in the frontend.

**Recommended Solutions:**

1. **Use Supabase Edge Functions** (Recommended):
   - Create Edge Functions for admin operations
   - Keep service role key secure on the server

2. **Manual Admin Creation**:
   - Create admin/staff accounts manually through Supabase Dashboard
   - Use the SQL insert method shown above

3. **Backend API**:
   - Create a separate backend API that handles admin operations
   - Use the service role key only on the backend

For now, the code includes these functions but they will fail without proper backend setup. You can create staff accounts manually or implement Edge Functions.

## Routes

- `/` - Public home page (browse doctors)
- `/book/:doctorId` - Book appointment page
- `/login` - Admin/Staff login
- `/admin` - Admin dashboard (protected)
- `/staff` - Staff dashboard (protected)
- `/unauthorized` - Unauthorized access page

## Database Schema

See `DATABASE_SCHEMA.md` for complete database schema documentation.

## Security

- Row Level Security (RLS) is enabled on all tables
- Public users can only create appointments and view doctors
- Staff can manage doctors, time slots, and appointments
- Admins can manage staff accounts and view system overview
- All authentication is handled through Supabase Auth

## Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## License

[Your License Here]
