# UX Flow — Officer Check-Out

| Field | Value |
|-------|-------|
| **Screen** | WhatsApp Conversation — Check-Out |
| **URL** | N/A (WhatsApp chat) |
| **PRD Ref** | Feature 3: GPS-Verified Attendance |
| **Access** | Security Officer |
| **Date** | 2026-02-23 |

---

## Purpose

Officer checks out at shift end, completing the attendance record. System captures final timestamp and optional remarks/incident notes. Triggers DO report generation.

## Entry Points

- Bot prompts at shift end time
- Officer sends "check out" or similar message
- Admin initiates early check-out for an officer

## Conversation Flow

### Step 1: Bot Prompts Check-Out

**Bot → Officer (at shift end time):**
```
⏰ Shift ending — 18:00

📍 Mapletree Business City Tower A

Time to check out! Any remarks or incidents to report?
```

**Buttons:**
| Button | Action |
|--------|--------|
| ✅ Check Out | Simple check-out, no remarks |
| 📝 Add Remarks | Add notes before checking out |

### Step 2a: Simple Check-Out

**Officer taps:** ✅ Check Out

**Bot → Officer:**
```
✅ Checked out!

📍 Mapletree Business City Tower A
⏰ In: 07:58 AM → Out: 18:00 PM
⏱️ Total: 10h 2m

Thanks for your shift! 👍
```

### Step 2b: Check-Out with Remarks

**Officer taps:** 📝 Add Remarks

**Bot → Officer:**
```
📝 Type your remarks or incident notes below:
```

**Officer sends:**
```
Visitor vehicle towed at 3pm. New CCTV camera installed at lobby B.
```

**Bot → Officer:**
```
✅ Checked out with remarks!

📍 Mapletree Business City Tower A
⏰ In: 07:58 AM → Out: 18:02 PM
⏱️ Total: 10h 4m
📝 Remarks saved

Thanks for your shift! 👍
```

### Step 3: Admin Notification

**Bot → Admin:**
```
✅ Ahmad bin Hassan checked out
📍 Mapletree Business City Tower A
⏰ 07:58 – 18:02 (10h 4m)
📝 Remarks: Visitor vehicle towed at 3pm. New CCTV camera installed at lobby B.

📊 Job #1042 attendance complete (2/2 officers checked out).
```

When all officers for a job have checked out:

**Bot → Admin:**
```
📋 Job #1042 complete — all officers checked out.

DO report is being generated. You'll receive it shortly.
```

**Buttons:**
| Button | Action |
|--------|--------|
| 📄 View Report | Preview when ready (links to DO report flow) |

## Interactive Elements

| Element | Type | Action |
|---------|------|--------|
| ✅ Check Out | WhatsApp button | Completes check-out |
| 📝 Add Remarks | WhatsApp button | Opens text input for remarks |
| Remarks text | WhatsApp message | Stored with check-out record |
| 📄 View Report (admin) | WhatsApp button | Links to DO report flow |

## States

### Early Check-Out (before shift end)
Officer can check out early. Bot flags it:
```
⚠️ Your shift ends at 18:00 (1h 30m remaining).

Check out early?
```

**Buttons:** ✅ Yes, Check Out | ❌ Stay On Shift

If confirmed → admin notified of early departure.

### Late Check-Out (officer doesn't respond)
| Timeout | Action |
|---------|--------|
| 15 min after shift end | Bot: "⏰ Shift ended. Please check out." |
| 30 min after shift end | Admin alerted: "Officer hasn't checked out" |
| 1 hour after shift end | Auto check-out at shift end time, flagged as "auto" |

### Admin-Initiated Check-Out
Admin can force check-out:
```
Check out Ahmad from Mapletree job
```

**Bot → Admin:**
```
✅ Ahmad bin Hassan checked out (by admin)
📍 Mapletree Business City Tower A
⏰ 18:00 PM
```

**Bot → Officer:**
```
ℹ️ You've been checked out by admin.
📍 Mapletree Business City Tower A
⏰ 18:00 PM
```

### System Error
```
⚠️ Check-out failed. Please try again.
```

## Navigation Map

```
Shift end time
    │
    ├─→ Bot prompts check-out
    │       ├─→ ✅ Simple check-out → Record saved → Admin notified
    │       └─→ 📝 Remarks → Text input → Record saved → Admin notified
    │
    ├─→ No response → Reminders → Auto check-out after 1hr
    │
    └─→ All officers out → DO report generation (see flow-do-report.md)
```

---

**Created by:** Aira · 2026-02-23
