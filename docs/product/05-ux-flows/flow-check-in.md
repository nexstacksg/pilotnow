# UX Flow — Officer Check-In

| Field | Value |
|-------|-------|
| **Screen** | WhatsApp Conversation — GPS + Photo Check-In |
| **URL** | N/A (WhatsApp chat) |
| **PRD Ref** | Feature 3: GPS-Verified Attendance |
| **Access** | Security Officer |
| **Date** | 2026-02-23 |

---

## Purpose

Officer checks in at the job site by sending a photo with GPS location via WhatsApp. System validates GPS is within the allowed radius of the site. This creates a timestamped, verifiable attendance record.

## Entry Points

- Officer taps "📍 Check In" button from reminder message
- Officer sends a photo with location to the bot at/near shift start time
- Bot prompts officer at shift start time if not already checked in

## Conversation Flow

### Step 1: Bot Prompts Check-In

**Bot → Officer (at shift start time):**
```
📍 Time to check in!

📍 Mapletree Business City Tower A
⏰ Shift: 08:00 – 18:00

Please send a photo of yourself at the site with your location attached.

Tap 📍 Check In to start.
```

**Buttons:**
| Button | Action |
|--------|--------|
| 📍 Check In | Prompts photo + location submission |

### Step 2: Officer Sends Photo + Location

Officer sends a WhatsApp photo with location sharing enabled.

**Requirements:**
- Photo must be attached (not a text message)
- Location must be shared (WhatsApp location attachment or live location)
- Both must be in the same message or within 60 seconds of each other

### Step 3a: Check-In Success (GPS Valid)

**Bot → Officer:**
```
✅ Checked in!

📍 Mapletree Business City Tower A
⏰ 07:58 AM
📏 GPS: 23m from site (within range ✅)

Have a good shift! I'll check in with you for periodic photos.
```

**Bot → Admin:**
```
✅ Ahmad bin Hassan checked in
📍 Mapletree Business City Tower A
⏰ 07:58 AM · GPS: 23m ✅
```

### Step 3b: Check-In Failed — GPS Out of Range

**Bot → Officer:**
```
⚠️ GPS check failed

Your location is 250m from the site (max: 100m).
📍 Expected: Mapletree Business City Tower A

Please move closer to the site and try again, or contact your admin.
```

**Buttons:**
| Button | Action |
|--------|--------|
| 🔄 Try Again | Re-prompts for photo + location |
| 📞 Contact Admin | Sends message to admin about GPS issue |

**If officer taps 📞 Contact Admin:**

**Bot → Admin:**
```
⚠️ Ahmad bin Hassan GPS check failed at Mapletree Business City Tower A.
Distance: 250m (limit: 100m)

The officer is requesting help.
```

**Buttons:**
| Button | Action |
|--------|--------|
| ✅ Override & Accept | Manually approves check-in |
| 💬 Message Officer | Opens chat with officer |

### Step 3c: Check-In Failed — No Location

**Bot → Officer:**
```
📍 I need your location to check in.

Please send a photo AND share your location. 

Tip: Tap the 📎 attachment icon → Location → Send Your Current Location.
```

### Step 3d: Check-In Failed — No Photo

**Bot → Officer:**
```
📸 I need a photo to check in.

Please send a photo of yourself at the site along with your location.
```

## Interactive Elements

| Element | Type | Action |
|---------|------|--------|
| 📍 Check In | WhatsApp button | Prompts photo + location |
| Photo + location | WhatsApp media + location | Validates GPS, stores proof |
| 🔄 Try Again | WhatsApp button | Re-prompts for submission |
| 📞 Contact Admin | WhatsApp button | Escalates GPS issue to admin |
| ✅ Override & Accept (admin) | WhatsApp button | Manual GPS override |

## States

### Early Check-In (>30 min before shift)
```
⏰ Your shift doesn't start until 08:00. 
Check-in opens at 07:30. I'll remind you then!
```

### Late Check-In (after shift start)
Check-in still accepted but flagged:
```
✅ Checked in (late)

📍 Mapletree Business City Tower A
⏰ 08:15 AM (15 min late)
📏 GPS: 18m ✅

⚠️ Late check-in has been noted and admin notified.
```

**Bot → Admin:**
```
⚠️ Ahmad bin Hassan checked in LATE
📍 Mapletree Business City Tower A
⏰ 08:15 AM (15 min late) · GPS: 18m ✅
```

### GPS Accuracy Poor
```
⚠️ Your GPS accuracy is low (~500m). This might be due to being indoors.

Try:
1. Step outside briefly for better GPS signal
2. Turn WiFi on (helps GPS accuracy)
3. Wait 30 seconds and try again
```

### System Error
```
⚠️ Something went wrong processing your check-in. Please try again.
```

Auto-retry once. If still failing, notify admin.

## Navigation Map

```
Shift start time
    │
    ├─→ Bot prompts check-in
    │       │
    │       └─→ Officer sends photo + location
    │               ├─→ GPS valid → ✅ Checked in → Admin notified
    │               ├─→ GPS out of range → Retry or escalate
    │               ├─→ Missing location → Re-prompt
    │               └─→ Missing photo → Re-prompt
    │
    └─→ No response within 10 min → Escalation flow (see flow-escalation.md)
```

## Timeout Behaviour

| Scenario | Timeout | Action |
|----------|---------|--------|
| No check-in after shift start | 10 minutes | Triggers no-show escalation (see flow-escalation.md) |
| GPS retry pending | 5 minutes | Bot reminds: "Still trying to check in?" |

---

**Created by:** Aira · 2026-02-23
