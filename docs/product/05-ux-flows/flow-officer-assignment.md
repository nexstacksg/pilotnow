# UX Flow — Officer Assignment

| Field | Value |
|-------|-------|
| **Screen** | WhatsApp Conversation — Officer Assignment |
| **URL** | N/A (WhatsApp chat) |
| **PRD Ref** | Feature 2: Admin-Driven Assignment |
| **Access** | Admin / Ops Manager |
| **Date** | 2026-02-23 |

---

## Purpose

Admin assigns one or more officers to a created job. Officers receive WhatsApp notifications with job details and must acknowledge. System enforces one-active-job-per-officer constraint.

## Entry Points

- Directly after job creation (tap "👤 Assign Officers")
- Admin sends message like "assign Ahmad to job 1042"
- Admin sends officer names without job context (bot asks which job)

## Conversation Flow

### Step 1: Admin Assigns Officers

**Option A — From job creation flow:**
Admin taps 👤 Assign Officers after creating job.

**Bot reply:**
```
👥 Assign officers to Job #1042
📍 Mapletree Business City Tower A
📅 Mon, 24 Feb · 08:00–18:00
👥 Need: 2 officers

Send officer names (e.g., "Ahmad and Ravi") or tap:
```

**Buttons:**
| Button | Action |
|--------|--------|
| 📋 Show Available | Lists officers free on that date/time |

**Option B — Natural language:**
```
Assign Ahmad and Ravi to the Mapletree job tomorrow
```

### Step 2: Bot Confirms Assignment

**Bot reply:**
```
✅ Assigning to Job #1042 (Mapletree Business City Tower A):

1. Ahmad bin Hassan ✅
2. Ravi Kumar ✅

2/2 officers assigned. Notifications will be sent now.
```

**Buttons:**
| Button | Action |
|--------|--------|
| ✅ Done | Ends flow |
| ➕ Add More | Add additional officers |
| 🔄 Change | Replace an officer |

### Step 3: Officers Receive Notification

**Bot → Officer (individual chat):**
```
📢 New Assignment

📍 Mapletree Business City Tower A
📅 Mon, 24 Feb 2026
⏰ 08:00 – 18:00 (10 hrs)
👤 Contact: Sarah Tan (91234567)
📝 Valid security license required

Please confirm:
```

**Buttons:**
| Button | Action |
|--------|--------|
| ✅ Accept | Officer acknowledges |
| ❌ Cannot Make It | Officer declines |

### Step 4a: Officer Accepts

**Bot → Officer:**
```
✅ Confirmed! You're assigned to:
📍 Mapletree Business City Tower A
📅 Mon, 24 Feb · 08:00–18:00

I'll remind you 1 hour before. See you there! 👍
```

**Bot → Admin:**
```
✅ Ahmad bin Hassan accepted Job #1042 (Mapletree Business City Tower A)
```

### Step 4b: Officer Declines

**Bot → Officer:**
```
Got it. I've notified the admin. No worries!
```

**Bot → Admin:**
```
⚠️ Ahmad bin Hassan declined Job #1042 (Mapletree Business City Tower A).

1/2 officers confirmed. You still need 1 more.

Send a replacement name or tap:
```

**Buttons:**
| Button | Action |
|--------|--------|
| 📋 Show Available | Lists available officers |

## Interactive Elements

| Element | Type | Action |
|---------|------|--------|
| Officer names (text) | WhatsApp message | Triggers assignment lookup |
| 📋 Show Available | WhatsApp button | Lists officers free for the job's timeslot |
| ✅ Accept (officer) | WhatsApp button | Confirms assignment |
| ❌ Cannot Make It (officer) | WhatsApp button | Declines, notifies admin |
| ➕ Add More | WhatsApp button | Opens add-officer sub-flow |
| 🔄 Change | WhatsApp button | Remove + replace officer |

## States

### Officer Not Found
```
⚠️ I couldn't find "John" in the system. Did you mean:
1. Johnny Lim
2. John Tan

Reply with the number or full name.
```

### Officer Already Assigned (Conflict)
```
⚠️ Ahmad bin Hassan is already assigned to Job #1039 (VivoCity) on Mon 24 Feb 08:00–18:00.

Choose another officer or reassign Ahmad from the other job?
```

**Buttons:** 📋 Show Available | 🔄 Reassign Ahmad

### All Officers Assigned
```
✅ Job #1042 fully staffed!

📍 Mapletree Business City Tower A
👥 Ahmad bin Hassan, Ravi Kumar
📅 Mon, 24 Feb · 08:00–18:00

Both officers have been notified.
```

### Officer Acknowledgement Timeout
| Timeout | Action |
|---------|--------|
| 30 min no response | Bot re-sends notification to officer |
| 1 hour no response | Admin alerted: "Ahmad hasn't responded to Job #1042. Reassign?" |

### Show Available List
```
📋 Available officers for Mon 24 Feb, 08:00–18:00:

1. Ravi Kumar
2. Siti Aminah
3. Jason Ng
4. David Lim

Reply with names to assign.
```

## Navigation Map

```
Admin assigns officers (text or button)
    │
    ├─→ Officers found → Confirmation → Notify officers
    │       ├─→ Officer accepts → Admin notified
    │       ├─→ Officer declines → Admin prompted to replace
    │       └─→ Officer no response → Reminder → Escalate to admin
    │
    ├─→ Officer not found → Suggestion list → Retry
    │
    └─→ Officer conflict → Conflict resolution options
```

## Reminder Schedule

| When | To | Message |
|------|----|---------|
| 1 hour before shift | Officer | "⏰ Reminder: Your shift at Mapletree starts at 08:00. Be there 10 min early!" |
| 30 min before shift | Officer (if not checked in) | "📍 Heading to Mapletree? Check in when you arrive." |

---

**Created by:** Aira · 2026-02-23
