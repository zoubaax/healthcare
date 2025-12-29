# EmailJS Setup Guide

This guide explains how to set up email notifications using EmailJS.

## Overview

The platform sends two types of emails:
1. **New Booking Notification** → Sent to staff when a patient books an appointment
2. **Confirmation Email** → Sent to patient when staff confirms their booking

## Setup Steps

### 1. Create an EmailJS Account (Free)

1. Go to [EmailJS.com](https://www.emailjs.com/) and sign up for a free account
2. Free tier includes **200 emails/month** - perfect for small usage

### 2. Add an Email Service

1. In the EmailJS dashboard, go to **Email Services**
2. Click **Add New Service**
3. Choose your email provider (Gmail, Outlook, Yahoo, etc.)
4. Follow the connection steps for your provider
5. Copy the **Service ID** (e.g., `service_abc123`)

### 3. Create Email Templates

You need to create **2 templates**:

---

#### Template 1: New Booking Notification (for Staff)

1. Go to **Email Templates** → **Create New Template**
2. Configure:

**To Email:** Your staff email address (e.g., `staff@yourdomain.com`)

**Subject:**
```
🆕 New Appointment Booking - {{patient_name}}
```

**Content:**
```html
<h2>New Appointment Booking</h2>

<h3>Patient Information</h3>
<ul>
  <li><strong>Name:</strong> {{patient_name}}</li>
  <li><strong>Email:</strong> {{patient_email}}</li>
  <li><strong>Phone:</strong> {{patient_phone}}</li>
  <li><strong>Education Level:</strong> {{education_level}}</li>
</ul>

<h3>Appointment Details</h3>
<ul>
  <li><strong>Doctor:</strong> {{doctor_name}}</li>
  <li><strong>Specialty:</strong> {{doctor_specialty}}</li>
  <li><strong>Date:</strong> {{appointment_date}}</li>
  <li><strong>Time:</strong> {{appointment_time}}</li>
</ul>

<p><strong>⚠️ Action Required:</strong> Please review and confirm this appointment in the staff dashboard.</p>
```

3. Click **Save** and copy the **Template ID**

---

#### Template 2: Confirmation Email (for Patient)

1. Go to **Email Templates** → **Create New Template**
2. Configure:

**To Email:** `{{to_email}}` (this will be the patient's email)

**Subject:**
```
✅ Your Appointment is Confirmed!
```

**Content:**
```html
<h2>Your Appointment is Confirmed!</h2>

<p>Dear {{patient_name}},</p>

<p>Great news! Your appointment has been confirmed. Here are the details:</p>

<h3>Appointment Details</h3>
<ul>
  <li><strong>Doctor:</strong> {{doctor_name}}</li>
  <li><strong>Specialty:</strong> {{doctor_specialty}}</li>
  <li><strong>Date:</strong> {{appointment_date}}</li>
  <li><strong>Time:</strong> {{appointment_time}}</li>
</ul>

<h3>Important Reminders</h3>
<ul>
  <li>Please arrive 10-15 minutes before your appointment</li>
  <li>Bring any relevant documents or previous records</li>
  <li>If you need to cancel or reschedule, please contact us as soon as possible</li>
</ul>

<p>We look forward to seeing you!</p>

<p>Best regards,<br>Mental Health Session Booking Team</p>
```

3. Click **Save** and copy the **Template ID**

---

### 4. Get Your Public Key

1. Go to **Account** in the EmailJS dashboard
2. Find your **Public Key** (e.g., `user_abc123xyz`)

### 5. Configure Environment Variables

Update your `.env` file with your EmailJS credentials:

```env
VITE_EMAILJS_SERVICE_ID=service_abc123
VITE_EMAILJS_TEMPLATE_ID=template_booking_notification
VITE_EMAILJS_CONFIRMATION_TEMPLATE_ID=template_patient_confirmation
VITE_EMAILJS_PUBLIC_KEY=user_abc123xyz
```

### 6. Restart the Dev Server

After updating `.env`, restart your development server:

```bash
# Stop the current server (Ctrl+C) then run:
npm run dev
```

## Template Variables Reference

### Booking Notification Template (Staff)

| Variable | Description | Example |
|----------|-------------|---------|
| `{{patient_name}}` | Full name | "John Doe" |
| `{{patient_email}}` | Email address | "john@example.com" |
| `{{patient_phone}}` | Phone number | "+1234567890" |
| `{{education_level}}` | Education level | "Bachelor's Degree" |
| `{{doctor_name}}` | Doctor's name | "Dr. Smith" |
| `{{doctor_specialty}}` | Specialty | "Clinical Psychology" |
| `{{appointment_date}}` | Formatted date | "December 29, 2024" |
| `{{appointment_time}}` | Time range | "09:00 - 10:00" |

### Confirmation Template (Patient)

| Variable | Description | Example |
|----------|-------------|---------|
| `{{to_email}}` | Patient's email (for To field) | "john@example.com" |
| `{{patient_name}}` | Full name | "John Doe" |
| `{{doctor_name}}` | Doctor's name | "Dr. Smith" |
| `{{doctor_specialty}}` | Specialty | "Clinical Psychology" |
| `{{appointment_date}}` | Formatted date | "December 29, 2024" |
| `{{appointment_time}}` | Time range | "09:00 - 10:00" |

## Email Flow

```
Patient Books Appointment
         ↓
   Staff receives email notification
         ↓
   Staff confirms in dashboard
         ↓
   Patient receives confirmation email
```

## Testing

1. Fill in your EmailJS credentials in `.env`
2. Restart the dev server
3. Make a test booking on the platform
4. Check staff email for booking notification
5. Log in as staff and confirm the appointment
6. Check patient email for confirmation

## Troubleshooting

### Emails not being sent?

1. **Check browser console**: Look for EmailJS errors
2. **Verify credentials**: Double-check your Service ID, Template IDs, and Public Key
3. **Check EmailJS dashboard**: View the email history and any failed attempts
4. **Template variables**: Make sure your template uses the exact variable names listed above

### Gmail not connecting?

1. Make sure 2FA is enabled on your Gmail account
2. Generate an App Password for EmailJS
3. Use the App Password in EmailJS service setup

### Rate limits?

Free tier allows 200 emails/month. For more, upgrade to a paid plan.

## File Locations

- Booking Page: `src/pages/user/BookAppointment.jsx`
- Appointment Management: `src/components/staff/AppointmentManagement.jsx`
- Environment Variables: `.env`
