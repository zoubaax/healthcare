# 🏥 Healthcare Appointment & Mental Health Booking Platform

A modern, full-stack web application designed for booking mental health listening sessions and psychological consultations. Built with **React 19**, **Tailwind CSS**, and **Supabase**.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![Tailwind](https://img.shields.io/badge/Tailwind-4.0-38B2AC?logo=tailwind-css)
![Supabase](https://img.shields.io/badge/Supabase-Database-3EC98E?logo=supabase)

## ✨ Key Features

### 🌓 Premium Theme System
- **Dynamic Dark/Light Mode**: Smooth transitions between themes with persistent user preference.
- **System Awareness**: Automatically detects and matches OS theme settings.
- **Glassmorphism UI**: Modern, sleek components with subtle blur effects.

### 👥 User Experience (Public)
- **Doctor Discovery**: Browse professional profiles with photos, specialties, and bios.
- **Real-time Booking**: Interactive time-slot selection for instant appointment scheduling.
- **Seamless Flow**: Optimized booking process with personalized information collection.

### 👨‍⚕️ Staff Management Dashboard
- **Profile Control**: Manage professional details, specialties, and profile imagery.
- **Availability Management**: Interactive calendar/slot management for each doctor.
- **Appointment Oversight**: View, confirm, and manage upcoming patient sessions.

### 🛡️ Admin Administration
- **Staff Control**: Comprehensive management of staff accounts (creation, activation/deactivation).
- **System Insights**: High-level overview of platform statistics and activity.
- **Secure Access**: Role-based access control (RBAC) powered by Supabase Auth and RLS.

## 🚀 Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS 4.0
- **State & Routing**: React Context API, React Router 7
- **Backend-as-a-Service**: Supabase (Auth, PostgreSQL, Storage)
- **Icons & UI**: Lucide React, Framer Motion (micro-animations)
- **Utilities**: date-fns, EmailJS

## 🛠️ Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn
- A Supabase project

### Installation

1. **Clone & Install**
   ```bash
   git clone <repository-url>
   cd healthcare/healthcare
   npm install
   ```

2. **Environment Configuration**
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_project_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```

3. **Database Setup**
   - Execute the SQL scripts located in `/supabase` (follow the order in `SUPABASE_SETUP.md`).
   - Create a public storage bucket named `doctor-images` in your Supabase dashboard.

4. **Launch**
   ```bash
   npm run dev
   ```

## 📂 Project Structure

```text
src/
├── assets/             # Images, logos, and global styles
├── components/         # Reusable UI components
│   ├── admin/          # Admin-specific modules (Staff, Logs)
│   ├── staff/          # Staff-specific modules (Doctors, Appointments)
│   └── ui/             # Common UI elements (ThemeToggle, etc.)
├── contexts/           # State management (Auth, Theme)
├── lib/                # Third-party configurations (Supabase client)
├── pages/              # Main route components
│   ├── admin/          # Administrator views
│   ├── staff/          # Physician/Staff views
│   └── user/           # Patient-facing views
└── styles/             # Global CSS and theme overrides
```

## 🔒 Security & Performance

- **Row Level Security (RLS)**: Sensitive data is protected at the database level.
- **Optimized Assets**: Lazy loading and optimized image handling.
- **Persistent Sessions**: Secure authentication with automatically refreshed tokens.

## 📄 Documentation

- [Supabase Setup Guide](SUPABASE_SETUP.md)
- [Database Schema Details](DATABASE_SCHEMA.md)
- [Email Integration Guide](EMAIL_SETUP.md)

---

Developed with ZOUBAA Mohammed ❤️ for the Healthcare Community.
