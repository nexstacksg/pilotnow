# UX Flow — Digital Signature Page

| Field | Value |
|-------|-------|
| **Screen** | DO Report Digital Signature Page |
| **URL** | /sign/{token} |
| **PRD Ref** | See PRD v2.0 |
| **Access** | Site Manager / authorized client-side signer (external, unauthenticated — verified by mobile + IC) |
| **Date** | 2026-02-23 |

---

## Purpose

A dedicated external web flow in PilotNow. Site managers open this link (received via WhatsApp or shared through approved channels) to verify their identity, review the DO report summary, and provide a digital signature. Link expires after 1 hour.

## Entry Points

- WhatsApp message with signature link: `https://app.pilotnow.sg/sign/{token}`
- Tapping the link opens the page in the device's default browser

## Layout

### Header
- PilotNow logo (centered, small)
- "Deployment Order — Signature" title
- Job reference: "Job #1042"

### Section 1: Identity Verification
- **Mobile number** — pre-filled (read-only, masked: ****4567)
- **IC last 4 digits** — text input, 4 characters, numeric only
- **Verify button** — primary CTA

### Section 2: Report Summary (shown after verification)
- Site name and address
- Date and shift time
- Officer names and check-in/out times
- Total hours per officer
- Number of photos submitted
- Remarks / incident notes (if any)
- "📄 View Full PDF" link — opens PDF in new tab

### Section 3: Signature Pad (shown after verification)
- Canvas area for finger/stylus signature (white background, black ink)
- "Clear" button (secondary) — resets canvas
- Name input — pre-filled with site manager name (editable)
- "Sign & Submit" button — primary CTA

### Footer
- PilotNow product footer and support information
- Link expiry countdown: "This link expires in XX minutes"
- Support contact info

## Interactive Elements

| Element | Type | Action |
|---------|------|--------|
| IC last 4 digits | Text input (numeric, maxlength=4) | Identity verification |
| Verify | Primary button | Validates mobile + IC, reveals report |
| View Full PDF | Text link | Opens PDF in new tab |
| Signature canvas | Touch/mouse canvas | Captures signature drawing |
| Clear | Secondary button | Clears signature canvas |
| Name | Text input | Signer's printed name |
| Sign & Submit | Primary button | Submits signature, completes flow |

## States

### 1. Verification State (Initial)
- Only Section 1 visible
- IC input focused
- Verify button disabled until 4 digits entered

### 2. Verification Failed
- Inline error below IC input: "Incorrect. Please check your IC last 4 digits."
- Max 3 attempts. After 3 failures:
  - Input disabled
  - Message: "Too many attempts. Please contact the security provider."
  - Admin notified via WhatsApp

### 3. Verified — Report Review
- Section 1 collapses to show ✅ "Verified as Sarah Tan"
- Section 2 and 3 revealed with slide-down animation
- Report summary displayed
- Signature pad ready

### 4. Signing in Progress
- User draws signature on canvas
- "Clear" button visible when canvas has content
- "Sign & Submit" enabled when canvas has content AND name field filled

### 5. Submitting
- "Sign & Submit" shows loading spinner
- Button disabled to prevent double-submit
- All inputs disabled

### 6. Success
- Full page replaced with success state:
  - ✅ Large green checkmark
  - "Signature received!"
  - "Thank you, Sarah Tan. The signed report has been sent to [Company Name]."
  - "You may close this page."
- No further actions available

### 7. Link Expired
- Full page replaced with expiry state:
  - ⏰ Clock icon
  - "This link has expired"
  - "Please contact [Company Name] to request a new signature link."
  - No input elements

### 8. Link Invalid / Already Signed
- "This report has already been signed" or "Invalid link"
- Contact info for support

### 9. Error State
- "Something went wrong. Please try again."
- "Retry" button
- If persistent, "Contact support" with phone number

## Responsive Notes

### Mobile (<768px) — Primary Target
- Single column, full width
- Signature canvas: full viewport width minus padding (min-height: 200px)
- Large touch targets (min 48×48px)
- IC input: large font (18px), centered, numeric keyboard (`inputmode="numeric"`)
- Sign & Submit: full-width sticky button at bottom
- Report summary: stacked layout, clear typography

### Tablet (768–1023px)
- Centered content card (max-width: 640px)
- Signature canvas: 600px wide
- Same vertical layout as mobile

### Desktop (≥1024px)
- Centered content card (max-width: 640px)
- Signature canvas supports mouse drawing
- Same layout — this is a mobile-first page used on-site

## Accessibility

- [x] All inputs have visible labels (not just placeholders)
- [x] IC input: `inputmode="numeric"` for numeric keyboard on mobile
- [x] Signature canvas: fallback "Type your name" option for screen reader / keyboard users
- [x] Colour contrast ≥ 4.5:1 for all text
- [x] Focus indicators visible on all interactive elements
- [x] Error messages linked to inputs via `aria-describedby`
- [x] Success/error states announced via `aria-live="polite"` region
- [x] Touch targets ≥ 48×48px on mobile
- [x] Page works without JavaScript gracefully (shows "Please enable JavaScript" message)
- [x] Countdown timer accessible: `aria-live="polite"`, updates every minute (not every second)
- [x] Tab order: IC input → Verify → Report → Signature canvas → Name → Sign & Submit

## Security

| Measure | Details |
|---------|---------|
| Token | Single-use, cryptographically random, URL-safe |
| Expiry | 1 hour from generation |
| Verification | Mobile number (pre-matched) + IC last 4 digits |
| Rate limit | 3 verification attempts, then locked |
| HTTPS | Required (no HTTP fallback) |
| No login | No account needed — link + IC verification only |

## Navigation Map

```
WhatsApp link tap
    │
    └─→ /sign/{token}
            │
            ├─→ Token valid → Verification screen
            │       ├─→ IC correct → Report + signature
            │       │       ├─→ Sign & Submit → ✅ Success
            │       │       └─→ Page idle → Expiry warning at 10 min
            │       └─→ IC wrong (×3) → Locked out → Admin notified
            │
            ├─→ Token expired → Expiry message
            │
            └─→ Token invalid/used → Error message
```

---

**Created by:** Aira · 2026-02-23
