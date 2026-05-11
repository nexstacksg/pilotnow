# UX Flow — Escalation

| Field | Value |
|-------|-------|
| **Screen** | WhatsApp Conversation — No-Show & Missed Photo Escalation |
| **URL** | N/A (chat flow) |
| **PRD Ref** | Feature 5: Automated Escalation |
| **Access** | Admin / Ops Manager |
| **Date** | 2026-02-23 |

---

## Purpose

Automated alerts when officers fail to check in (no-show), miss periodic photos, or don't respond to assignments. Admin can contact the officer, reassign, or take other action — all within WhatsApp.

## Entry Points

- System-triggered: officer doesn't check in within 10 min of shift start
- System-triggered: periodic photo missed (10 min overdue)
- System-triggered: officer doesn't acknowledge assignment (1 hour)

## Conversation Flow

### Escalation Type 1: No-Show (No Check-In)

**Timeline:**

| Time | Action |
|------|--------|
| Shift start | System sends check-in prompt to officer |
| +5 min | System sends urgent reminder to officer |
| +10 min | Admin alerted (no-show) |

**System → Officer (+5 min):**
```
⚠️ URGENT: Check in now!

📍 Mapletree Business City Tower A
⏰ Your shift started at 08:00. It's now 08:05.

Please send your photo + location immediately.
```

**System → Admin (+10 min):**
```
🚨 NO-SHOW ALERT

👤 Ahmad bin Hassan
📍 Mapletree Business City Tower A
⏰ Shift started 08:00 — no check-in after 10 min

Job #1042 needs 2 officers. Currently: 1/2 on site.
```

**Buttons:**
| Button | Action |
|--------|--------|
| 💬 Message Officer | Send WhatsApp to officer |
| 📞 Call Officer | Opens phone dialer |
| 🔄 Reassign | Replace with another officer |
| ⏳ Wait 10 More Min | Extend deadline, re-alert later |

### Admin Taps 🔄 Reassign

**System → Admin:**
```
📋 Available officers for Mon 24 Feb, 08:00–18:00:

1. Jason Ng
2. Siti Aminah
3. David Lim

Reply with a name to reassign, or tap:
```

**Buttons:**
| Button | Action |
|--------|--------|
| 📋 Show All Available | Full available list |

**After admin picks replacement:**

**System → Admin:**
```
✅ Reassigned!

❌ Ahmad bin Hassan → removed from Job #1042
✅ Jason Ng → assigned & notified

Ahmad has been notified of removal.
```

**System → Original Officer:**
```
ℹ️ You've been removed from Job #1042 (Mapletree Business City Tower A) due to no check-in.

Please contact your admin if this is an error.
```

**System → New Officer:**
```
🚨 URGENT Assignment

📍 Mapletree Business City Tower A
📅 Mon, 24 Feb 2026
⏰ 08:00 – 18:00 (shift already started)
👤 Contact: Sarah Tan (91234567)

Please confirm and head there immediately:
```

**Buttons:** ✅ Accept | ❌ Cannot Make It

### Escalation Type 2: Missed Periodic Photo

See [flow-periodic-photos.md](flow-periodic-photos.md) for detailed flow. Summary:

| Time | Action |
|------|--------|
| Photo due | Reminder sent to officer |
| +5 min | Second reminder to officer |
| +10 min | Admin alerted |

### Escalation Type 3: Assignment No-Response

| Time | Action |
|------|--------|
| Assignment sent | Notification to officer |
| +30 min | Re-send notification |
| +1 hour | Admin alerted |

**System → Admin:**
```
⚠️ No response to assignment

👤 Ahmad bin Hassan hasn't responded to Job #1042
📍 Mapletree Business City Tower A
📅 Mon, 24 Feb · 08:00–18:00

Sent 1 hour ago. No accept/decline received.
```

**Buttons:**
| Button | Action |
|--------|--------|
| 💬 Message Officer | Contact officer |
| 🔄 Reassign | Pick different officer |
| ⏳ Wait | Extend deadline |

## Interactive Elements

| Element | Type | Action |
|---------|------|--------|
| 💬 Message Officer | WhatsApp button | Opens chat with officer |
| 📞 Call Officer | WhatsApp button | Opens phone dialer |
| 🔄 Reassign | WhatsApp button | Starts replacement flow |
| ⏳ Wait 10 More Min | WhatsApp button | Delays escalation |
| Officer name (text) | WhatsApp message | Assigns replacement |

## States

### Resolved — Officer Checks In Late
If officer checks in after escalation but before reassignment:
```
✅ Ahmad bin Hassan checked in (late)
📍 Mapletree Business City Tower A
⏰ 08:12 AM (12 min late) · GPS: 45m ✅

No-show alert resolved.
```

### Resolved — Reassigned
Original officer removed, new officer assigned and notified.

### Unresolved — Admin Takes No Action
| Timeout | Action |
|---------|--------|
| 30 min after admin alert | System: "🚨 Reminder: Job #1042 still has a no-show. Need to reassign?" |
| 1 hour | Second reminder |

### Multiple No-Shows (Same Job)
```
🚨 CRITICAL: Job #1042 — 0/2 officers on site

📍 Mapletree Business City Tower A
⏰ Shift started 08:00

Neither officer has checked in:
❌ Ahmad bin Hassan — no check-in
❌ Ravi Kumar — no check-in

Immediate action needed.
```

## Navigation Map

```
Trigger (no check-in / missed photo / no response)
    │
    ├─→ Officer reminded
    │       ├─→ Officer responds → Resolved
    │       └─→ No response → Admin alerted
    │               ├─→ 💬 Message → Contact officer
    │               ├─→ 🔄 Reassign → Pick replacement → Notify both
    │               ├─→ ⏳ Wait → Re-alert later
    │               └─→ No action → Periodic reminders to admin
```

---

**Created by:** Aira · 2026-02-23
