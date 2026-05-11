# UX Flow — DO Report Generation, Signature, and Delivery

| Field | Value |
|-------|-------|
| **Screen** | DO Report Closure Flow |
| **URL** | Web app admin flow + WhatsApp/site-manager touchpoints |
| **PRD Ref** | See PRD v2.0 |
| **Access** | Admin / Ops Manager |
| **Date** | 2026-02-23 |

---

## Purpose

Auto-generate a PDF DO (Deployment Order) report when a job completes or reaches closure criteria. Report includes full audit trail: job details, timestamps, GPS data, photos, remarks, incident notes, and exception markers where relevant. Admin reviews, signature link is sent to site manager, and signed or unsigned report is delivered to finance with traceability.

## Entry Points

- Auto-triggered when all officers check out for a job
- Admin requests manually: "Generate DO report for job 1042"

## Conversation Flow

### Step 1: Report Auto-Generated

**System → Admin (after all officers check out):**
```
📄 DO Report Ready — Job #1042

📍 Mapletree Business City Tower A
📅 Mon, 24 Feb 2026
⏰ 08:00 – 18:00

👥 Officers:
  • Ahmad bin Hassan — 07:58–18:02 (10h 4m)
  • Ravi Kumar — 08:01–18:00 (9h 59m)

📸 Photos: 20 collected (0 missed)
📝 Remarks: 1 entry
⚠️ Incidents: None
```

**Buttons:**
| Button | Action |
|--------|--------|
| 📄 View PDF | Sends PDF file in chat |
| ✍️ Send for Signature | Sends signature link to site manager |
| ✏️ Add Remarks | Admin adds notes to report |

### Step 2: Admin Reviews PDF

Admin taps 📄 View PDF. System sends or opens the PDF according to the active admin surface.

Admin can review and then proceed to signature or add remarks first.

### Step 3: Send for Signature

**Admin taps:** ✍️ Send for Signature

**System → Admin:**
```
📱 Site manager details for signature:

👤 Name: Sarah Tan
📱 Mobile: 91234567

Send signature link to this contact?
```

**Buttons:**
| Button | Action |
|--------|--------|
| ✅ Send | Sends signature link via WhatsApp |
| ✏️ Change Contact | Update site manager details |

**Admin taps ✅ Send:**

**System → Admin:**
```
✅ Signature link sent to Sarah Tan (91234567).

⏰ Link expires in 1 hour.
I'll notify you when it's signed or if it expires.
```

**System → Site Manager (via WhatsApp or approved delivery channel):**
```
📋 DO Report — Signature Required

📍 Mapletree Business City Tower A
📅 Mon, 24 Feb 2026
🏢 Security Provider: [Company Name]

Please review and sign the deployment report:

🔗 https://app.pilotnow.sg/sign/abc123

⏰ This link expires in 1 hour.
```

### Step 4a: Signature Completed

(See [flow-signature-page.md](flow-signature-page.md) for the web page flow)

**System → Admin:**
```
✅ DO Report SIGNED

📍 Mapletree Business City Tower A
📅 Mon, 24 Feb 2026
✍️ Signed by: Sarah Tan
⏰ Signed at: 18:45 PM

📧 Sending to finance now...
🔎 Delivery trace will be recorded.
```

### Step 5: Email to Finance

**System → Admin:**
```
📧 DO Report emailed!

📍 Job #1042 — Mapletree Business City Tower A
📬 Sent to: finance@clientcompany.com
📎 Attachment: DO_Report_1042_20260224.pdf

✅ Complete — this job is fully closed.
```

### Step 4b: Signature Expired

**System → Admin (after 1 hour):**
```
⏰ Signature link expired!

📍 Job #1042 — Mapletree Business City Tower A
✍️ Sarah Tan did not sign within 1 hour.
```

**Buttons:**
| Button | Action |
|--------|--------|
| 🔄 Resend Link | Generate new link, send again |
| 📞 Contact Site Manager | Opens dialer |
| ⏭️ Send Without Signature | Email unsigned report to finance |

## Interactive Elements

| Element | Type | Action |
|---------|------|--------|
| 📄 View PDF | Chat action / web action | Sends or opens PDF |
| ✍️ Send for Signature | Chat action / web action | Initiates signature flow |
| ✏️ Add Remarks | Chat action / web action | Admin adds notes |
| ✅ Send (signature) | Chat action / web action | Sends link to site manager |
| 🔄 Resend Link | Chat action / web action | New signature link |
| ⏭️ Send Without Signature | Chat action / web action | Emails unsigned report |

## States

### Report Generation Failed
```
⚠️ Failed to generate DO report for Job #1042. Retrying...
```

Auto-retry up to 3 times. If still failing:
```
⚠️ DO report generation failed. Our team has been notified. You'll receive it as soon as it's ready.
```

### Unsigned Report Sent to Finance
Marked as "UNSIGNED" watermark on PDF. Admin explicitly chose this option. Delivery logs must preserve the unsigned decision and reason.

### Partial Data (Missing Photos)
Report still generates but flags gaps and exception notes:
```
📄 DO Report Ready — Job #1042
⚠️ Note: 2 periodic photos were missed during this shift.
```

## Navigation Map

```
All officers checked out
    │
    └─→ DO Report auto-generated → Admin notified
            ├─→ 📄 View PDF → Review
            ├─→ ✍️ Send for Signature → Site manager receives link
            │       ├─→ Signed → Admin notified → Email to finance → Done
            │       └─→ Expired → Resend / Contact / Send unsigned
            └─→ ✏️ Add Remarks → Updated report
```

---

**Created by:** Aira · 2026-02-23
