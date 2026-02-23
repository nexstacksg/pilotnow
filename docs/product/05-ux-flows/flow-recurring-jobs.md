# UX Flow — Recurring Jobs

| Field | Value |
|-------|-------|
| **Screen** | WhatsApp Conversation — Recurring Job Setup & Management |
| **URL** | N/A (WhatsApp chat) |
| **PRD Ref** | Feature 9: Recurring Jobs |
| **Access** | Admin / Ops Manager |
| **Date** | 2026-02-23 |

---

## Purpose

Admin sets up weekly recurring jobs so the same site/shift/officer assignments repeat automatically without manual re-creation each week. Supports both natural language and structured input.

## Entry Points

- Admin sends natural language: "Make this a weekly recurring job"
- Admin adds recurrence during job creation
- Admin sends: "Set up a recurring job at Mapletree every Monday 8am-6pm"

## Conversation Flow

### Step 1: Creating a Recurring Job

**Option A — During job creation:**

After job confirmation (see [flow-job-creation.md](flow-job-creation.md)):

**Bot → Admin:**
```
✅ Job #1042 created!

Make this a recurring job?
```

**Buttons:**
| Button | Action |
|--------|--------|
| 🔄 Yes, Weekly | Sets up weekly recurrence |
| ⏭️ No, One-Time | Keeps as single job |

**Option B — Natural language:**
```
Set up recurring job: 2 officers at Mapletree Business City every Monday and Wednesday, 8am-6pm
```

### Step 2: Bot Confirms Recurrence

**Bot → Admin:**
```
🔄 Recurring Job Setup

📍 Mapletree Business City Tower A
📅 Every Monday & Wednesday
⏰ 08:00 – 18:00
👥 2 officers needed

📆 Starts: Mon, 24 Feb 2026
📆 Ends: ♾️ No end date (until cancelled)

Assign the same officers each week?
```

**Buttons:**
| Button | Action |
|--------|--------|
| 👥 Same Officers | Use current assignment weekly |
| 🔄 Assign Each Week | Admin assigns manually each week |
| ✏️ Edit Schedule | Change days/times |
| ❌ Cancel | Don't set up recurrence |

### Step 3a: Same Officers Weekly

**Admin taps:** 👥 Same Officers

**Bot → Admin:**
```
✅ Recurring job created!

🔄 Job Template: RJ-001
📍 Mapletree Business City Tower A
📅 Every Mon & Wed · 08:00–18:00
👥 Ahmad bin Hassan, Ravi Kumar (auto-assigned weekly)

Next job will be auto-created on Sun, 23 Feb at 20:00 (12hr before shift).

I'll notify you and the officers each week.
```

### Step 3b: Manual Assignment Each Week

**Admin taps:** 🔄 Assign Each Week

**Bot → Admin:**
```
✅ Recurring job created!

🔄 Job Template: RJ-001
📍 Mapletree Business City Tower A
📅 Every Mon & Wed · 08:00–18:00
👥 Officers: Assigned manually each week

I'll remind you to assign officers 24 hours before each shift.
```

### Weekly Auto-Creation Notification

**Bot → Admin (24 hours before next occurrence):**
```
🔄 Recurring job auto-created

📋 Job #1087 (from RJ-001)
📍 Mapletree Business City Tower A
📅 Mon, 3 Mar 2026 · 08:00–18:00
👥 Ahmad bin Hassan, Ravi Kumar (auto-assigned)

Officers have been notified. All good?
```

**Buttons:**
| Button | Action |
|--------|--------|
| ✅ Looks Good | Confirm, no changes |
| ✏️ Change Officers | Modify assignment for this week |
| ⏭️ Skip This Week | Cancel this occurrence only |

### Managing Recurring Jobs

**Admin sends:** "Show my recurring jobs"

**Bot → Admin:**
```
🔄 Active Recurring Jobs

1. RJ-001 — Mapletree Business City Tower A
   📅 Mon & Wed · 08:00–18:00 · 👥 2 officers
   
2. RJ-002 — VivoCity Level 1
   📅 Daily · 20:00–08:00 · 👥 1 officer

Reply with number to manage, or:
```

**Buttons:**
| Button | Action |
|--------|--------|
| ➕ New Recurring | Create new |
| 📋 View Details | Pick one to view |

**Admin replies:** "1"

**Bot → Admin:**
```
🔄 RJ-001 — Mapletree Business City Tower A

📅 Every Mon & Wed · 08:00–18:00
👥 Ahmad bin Hassan, Ravi Kumar
📆 Started: 24 Feb 2026
📊 Jobs created: 4 (2 completed, 2 upcoming)
```

**Buttons:**
| Button | Action |
|--------|--------|
| ✏️ Edit Schedule | Change days/times |
| 👥 Change Officers | Update default officers |
| ⏸️ Pause | Temporarily stop |
| 🗑️ Delete | Permanently remove |

### Pausing a Recurring Job

**Admin taps:** ⏸️ Pause

**Bot → Admin:**
```
⏸️ RJ-001 paused.

📍 Mapletree Business City Tower A
No new jobs will be created until you resume.

Resume anytime by saying "resume RJ-001" or:
```

**Buttons:** ▶️ Resume | 🗑️ Delete Permanently

### Deleting a Recurring Job

**Admin taps:** 🗑️ Delete

**Bot → Admin:**
```
⚠️ Delete recurring job RJ-001?

📍 Mapletree Business City Tower A
📅 Every Mon & Wed · 08:00–18:00

This won't affect jobs already created. Only stops future auto-creation.
```

**Buttons:** ✅ Yes, Delete | ❌ Keep It

## Interactive Elements

| Element | Type | Action |
|---------|------|--------|
| 🔄 Yes, Weekly | WhatsApp button | Enables recurrence |
| 👥 Same Officers | WhatsApp button | Auto-assigns same officers |
| 🔄 Assign Each Week | WhatsApp button | Manual weekly assignment |
| ✏️ Edit Schedule | WhatsApp button | Modify recurrence pattern |
| ⏸️ Pause | WhatsApp button | Temporarily stops recurrence |
| ▶️ Resume | WhatsApp button | Resumes paused recurrence |
| 🗑️ Delete | WhatsApp button | Permanently removes template |
| ⏭️ Skip This Week | WhatsApp button | Cancels single occurrence |
| Natural language | WhatsApp message | Create/manage via free text |

## States

### Officer Conflict (Auto-Assignment)
```
⚠️ Auto-assignment conflict for Job #1087 (RJ-001)

Ahmad bin Hassan is already assigned to another job on Mon 3 Mar 08:00–18:00.

Please assign a replacement for this week:
```

**Buttons:** 📋 Show Available | ✏️ Change Officers

### Recurring Job with No Officers
If admin hasn't assigned by 12 hours before shift:
```
⚠️ Reminder: Job #1087 needs officers!

📍 Mapletree Business City Tower A
📅 Tomorrow, Mon 3 Mar · 08:00–18:00
👥 0/2 officers assigned

Assign now?
```

### Edit Schedule
**Admin taps ✏️ Edit Schedule:**
```
Current: Every Mon & Wed · 08:00–18:00

What would you like to change? E.g.:
- "Add Friday"
- "Change to 9am-5pm"
- "Mon, Wed, Fri"
```

Admin replies naturally. Bot updates and confirms.

## Navigation Map

```
Job created / Admin request
    │
    ├─→ Set up recurrence → Configure schedule + officers
    │       ├─→ Same officers weekly → Auto-create + auto-assign
    │       └─→ Manual each week → Auto-create + remind to assign
    │
    ├─→ Weekly: Auto-create job 24hr before
    │       ├─→ ✅ Confirmed → Normal job flow
    │       ├─→ ✏️ Change → Modify this week
    │       └─→ ⏭️ Skip → Cancel this occurrence
    │
    └─→ Manage: Edit / Pause / Resume / Delete
```

---

**Created by:** Aira · 2026-02-23
