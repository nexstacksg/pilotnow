# UX Flow — Periodic Photo Submission

| Field | Value |
|-------|-------|
| **Screen** | WhatsApp Conversation — Periodic Photo Reminders |
| **URL** | N/A (WhatsApp chat) |
| **PRD Ref** | Feature 4: Periodic Photo Reminders |
| **Access** | Security Officer |
| **Date** | 2026-02-23 |

---

## Purpose

During a shift, officers receive periodic photo reminders (frequency configured per job type). Photos serve as ongoing proof of presence and are included in the DO report. Missed photos trigger immediate admin alerts.

## Entry Points

- System-initiated: bot sends reminder at configured intervals after check-in
- Frequency defined per job (e.g., hourly, every 2 hours)

## Conversation Flow

### Step 1: Bot Sends Photo Reminder

**Bot → Officer (at scheduled interval):**
```
📸 Photo check — 10:00 AM

Please send a photo from your current location at Mapletree Business City Tower A.
```

**Buttons:**
| Button | Action |
|--------|--------|
| 📸 Send Photo | Prompts officer to send photo |

### Step 2a: Officer Sends Photo

Officer sends a photo via WhatsApp.

**Bot → Officer:**
```
✅ Photo received — 10:02 AM
📍 Mapletree Business City Tower A

Next photo due at 11:00 AM. 👍
```

### Step 2b: Officer Sends Photo with Remarks

Officer can include text with the photo (e.g., incident notes).

**Bot → Officer:**
```
✅ Photo received — 10:02 AM
📝 Remark noted: "Visitor car parked in restricted zone"

Next photo due at 11:00 AM.
```

### Step 3: Missed Photo — First Reminder

**Bot → Officer (5 min after due time):**
```
⏰ Photo reminder overdue!

Your 10:00 AM photo for Mapletree Business City Tower A hasn't been received.

Please send a photo now.
```

**Buttons:**
| Button | Action |
|--------|--------|
| 📸 Send Photo | Prompts photo |
| ⚠️ Issue | Reports a problem to admin |

### Step 4: Missed Photo — Admin Alert

**If no photo after 10 minutes past due:**

**Bot → Admin:**
```
⚠️ Missed photo alert

👤 Ahmad bin Hassan
📍 Mapletree Business City Tower A
📸 10:00 AM photo not received (10 min overdue)

Last activity: Check-in at 08:00 AM
```

**Buttons:**
| Button | Action |
|--------|--------|
| 💬 Message Officer | Send WhatsApp to officer |
| 📞 Call Officer | Initiate call (opens dialer) |
| ⏭️ Skip This One | Dismiss alert, wait for next |

## Interactive Elements

| Element | Type | Action |
|---------|------|--------|
| 📸 Send Photo | WhatsApp button | Prompts photo submission |
| Photo (media) | WhatsApp image | Stored with timestamp as proof |
| Photo + text | WhatsApp image + caption | Photo + remark stored |
| ⚠️ Issue | WhatsApp button | Escalates to admin |
| 💬 Message Officer (admin) | WhatsApp button | Opens officer chat |
| ⏭️ Skip This One (admin) | WhatsApp button | Dismisses single alert |

## States

### Normal — On Schedule
Officer submits photos on time. No admin notifications. Next reminder scheduled.

### Late Submission (within grace period)
Photo received 1–5 min after due time — accepted silently, flagged in DO report as late.

### Missed — Escalated
Photo not received after 10 min — admin alerted. Photo can still be submitted late and will be recorded with actual timestamp.

### Officer Reports Issue
**Officer taps ⚠️ Issue:**
```
What's the issue?
```

**Buttons:**
| Button | Action |
|--------|--------|
| 📱 Phone problem | Camera/phone issue |
| 🚨 Incident | Security incident in progress |
| 🚻 On break | Stepped away briefly |

**Bot → Admin (if incident):**
```
🚨 Officer reports incident in progress
👤 Ahmad bin Hassan
📍 Mapletree Business City Tower A
⏰ 10:05 AM

Photo submission paused. Officer will resume after incident.
```

### System Error
```
⚠️ Couldn't process your photo. Please send it again.
```

## Navigation Map

```
Check-in complete
    │
    ├─→ Timer starts (interval per job config)
    │       │
    │       └─→ Photo reminder sent
    │               ├─→ Photo received → ✅ Stored → Next timer
    │               ├─→ No response (5 min) → Second reminder to officer
    │               ├─→ No response (10 min) → Admin alerted
    │               └─→ Officer reports issue → Admin notified
    │
    └─→ Repeats until check-out
```

## Timing Configuration

| Setting | Default | Configurable |
|---------|---------|-------------|
| Photo interval | 1 hour | Yes, per job type |
| Grace period | 5 minutes | No |
| Admin alert trigger | 10 minutes overdue | No |
| Reminder to officer | 5 minutes overdue | No |

---

**Created by:** Aira · 2026-02-23
