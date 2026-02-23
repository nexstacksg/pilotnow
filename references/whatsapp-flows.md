# PilotNow – WhatsApp Conversation Flows

> TODO: Finalize message templates after GreenAPI setup

## Table of Contents

1. [Admin Flows](#admin-flows)
2. [Officer Flows](#officer-flows)
3. [Escalation Flows](#escalation-flows)

---

## Admin Flows

### Job Creation

```
ADMIN: "Need 2 guards at Raffles Place Tower, Mon 8am-8pm, uniform required"

BOT: 📋 New Job Created
     📍 Site: Raffles Place Tower
     📅 Date: Monday, 3 Mar 2026
     ⏰ Time: 08:00 – 20:00
     👥 Officers needed: 2
     👔 Uniform: Required
     
     [✅ Confirm]  [✏️ Edit]  [❌ Cancel]

ADMIN: [taps Confirm]

BOT: ✅ Job #1234 created. Assign officers now?
     [👥 Assign Officers]  [⏰ Later]
```

### Officer Assignment

```
ADMIN: [taps Assign Officers]

BOT: Available officers:
     1. Ahmad bin Hassan
     2. Raj Kumar
     3. Lim Wei Ming
     
     Reply with numbers (e.g., "1,3") or officer names.

ADMIN: "1, 2"

BOT: ✅ Assigned to Job #1234:
     • Ahmad bin Hassan
     • Raj Kumar
     Notifications sent.
```

### Attendance Monitor

```
BOT: ⚠️ Alert: Job #1234
     Ahmad bin Hassan has not checked in.
     Job started 10 min ago.
     
     [📞 Call Officer]  [🔄 Reassign]

ADMIN: [taps Reassign]

BOT: Available officers:
     1. Lim Wei Ming
     2. Siti Nurhaliza
     
     Reply with number.
```

## Officer Flows

### Assignment Notification

```
BOT: 📋 New Assignment
     📍 Site: Raffles Place Tower
     📅 Date: Monday, 3 Mar 2026
     ⏰ Time: 08:00 – 20:00
     👔 Uniform: Required
     
     [✅ Acknowledge]

OFFICER: [taps Acknowledge]

BOT: ✅ Assignment confirmed. 
     You'll receive a check-in reminder at 07:45.
```

### Check-In

```
BOT: ⏰ Time to check in for Job #1234
     📍 Raffles Place Tower
     
     Please send a photo of the site with your location.

OFFICER: [sends photo with location]

BOT: ✅ Check-in confirmed
     📍 Location verified (42m from site)
     📸 Photo received
     ⏰ 08:02 SGT
     
     Next photo due at 09:00.
```

### Periodic Photo Reminder

```
BOT: 📸 Hourly photo reminder
     Job #1234 – Raffles Place Tower
     
     Please send a site photo now.

OFFICER: [sends photo]

BOT: ✅ Photo received – 09:01 SGT
     Next photo due at 10:00.
```

### Check-Out

```
BOT: ⏰ Shift ending soon – Job #1234
     Please send your check-out photo.

OFFICER: [sends photo with location]

BOT: ✅ Check-out confirmed
     📍 Location verified
     ⏰ 19:58 SGT
     
     Thank you! DO report is being generated.
```

## Escalation Flows

### Missed Photo

```
[Officer misses periodic photo]

BOT → ADMIN: ⚠️ Missed Photo Alert
              Job #1234 – Raffles Place Tower
              Officer: Ahmad bin Hassan
              Expected at: 10:00
              
BOT → OFFICER: 📸 Reminder: Photo overdue
                Job #1234 – Raffles Place Tower
                Please send a site photo now.
```

### No-Show (10 min)

```
BOT → ADMIN: 🚨 No-Show Alert
              Job #1234 – Raffles Place Tower
              Officer: Ahmad bin Hassan
              Job started: 08:00
              No check-in as of: 08:10
              
              [📞 Call Officer]  [🔄 Reassign]
```

### Unsigned DO Report (1 hour)

```
BOT → ADMIN: ⚠️ DO Report Unsigned
              Job #1234 – Raffles Place Tower
              Signature link sent to: Site Manager
              Sent at: 20:05
              Expired at: 21:05
              
              [🔄 Resend Link]  [📞 Contact Site Manager]
```
