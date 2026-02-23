# PilotNow – Open Questions

These questions need answers before or during development. Reply inline or discuss in GitHub Issues.

---

### Q1: Natural Language Parsing Approach

How robust does the job creation parser need to be at MVP? Security job descriptions tend to follow patterns.

**Options:**
- **A) Template-based parser** — Simpler, cheaper, predictable. Admin follows a loose format.
- **B) LLM-powered parsing** — More flexible, handles free-form text. Adds cost and latency per message.

**Recommendation:** Start with template-based + fallback to LLM for ambiguous inputs.

---

### Q2: Auto-Assignment Logic

"Auto-assignment based on response order" — is it truly first-come-first-served?

- Does admin want to **review requests** before confirming assignment?
- Or is it fully automatic — first officer to tap "Request" gets the job?
- What if multiple officers are needed for one job?

---

### Q3: Digital Signature Trust

Site managers will receive a signature link from a WhatsApp number they may not recognize.

- How do we establish trust? Options:
  - Admin informs site manager in advance
  - PIN-based verification (admin shares PIN with site manager)
  - Branded landing page with company logo
- What if the site manager doesn't sign? Timeout? Escalation?

---

### Q4: Hourly Photo Reminder Frequency

Hourly reminders could be too frequent or too infrequent depending on the site.

- Should reminder frequency be **configurable per job**?
- What's the acceptable range? (e.g., every 30 min to every 4 hours)
- What happens if an officer misses a photo submission? Alert to admin?

---

### Q5: GPS Accuracy Threshold

What's the acceptable GPS radius for check-in validation?

- **Strict:** 100m (may cause false rejections in areas with poor GPS)
- **Moderate:** 200–300m
- **Lenient:** 500m
- Should this be configurable per site?

---

### Q6: WhatsApp Business API Readiness

The 5-week timeline is tight. WhatsApp Business API approval can take 1–2 weeks.

- Is the WhatsApp Business API account already approved?
- Which BSP (Business Solution Provider) are we using? (e.g., Twilio, 360dialog, official Meta Cloud API)
- Do we have the phone number ready?

---

### Q7: Officer No-Show Handling

What happens when an assigned officer doesn't check in?

- Is there an escalation flow? (e.g., alert admin after X minutes)
- Can admin reassign the job to another officer?
- Is this manual for MVP or do we need automated escalation?

---

### Q8: Data Model Clarifications

A few details to confirm:

- Can one job have **multiple officers** assigned?
- Can one officer be assigned to **multiple concurrent jobs**?
- What's the maximum shift duration?
- Is there a concept of **recurring jobs** (same site, same time, every week)?

---

### Q9: DO Report Contents

What exactly goes into a Delivery Order report?

- Job details (site, date, time, officer)
- Check-in/check-out timestamps with GPS
- Photo evidence summary
- Site manager signature
- Anything else? (e.g., incident notes, officer remarks)

---

### Q10: Finance Integration

"Report emailed to finance" — clarify:

- Is it a PDF attachment?
- Fixed email address or configurable per job/client?
- Any specific format required by finance systems?
- Do we need to track whether finance has received/acknowledged it?

---

*Last updated: 2026-02-23*
