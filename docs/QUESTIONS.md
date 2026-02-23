# PilotNow – Open Questions (Resolved)

All questions answered on 2026-02-23.

---

### Q1: Natural Language Parsing Approach ✅

**Answer:** LLM-powered parsing (Option B). Free-form text input from admin, parsed by LLM into structured job data.

---

### Q2: Auto-Assignment Logic ✅

**Answer:** Original question was based on wrong assumption. The flow is:
- **Customer** sends the job request (or email) to PilotNow company
- **Admin** then assigns officers — not officer self-selection
- This is admin-driven assignment, not first-come-first-served

---

### Q3: Digital Signature Trust ✅

**Answer:** No complex trust mechanism needed.
- System sends a link to the site manager
- Site manager fills in **mobile number** and **last 4 digits of IC** for verification
- If site manager doesn't sign within **1 hour**, escalation triggers

---

### Q4: Hourly Photo Reminder Frequency ✅

**Answer:**
- Reminder frequency is part of the **job's nature/behaviour** (defined per job type)
- Configurable frequency per job is **good to have**
- If officer misses a photo submission → **alert admin immediately**

---

### Q5: GPS Accuracy Threshold ✅

**Answer:**
- Default: **100m** (strict)
- **Configurable per site** — yes

---

### Q6: WhatsApp Business API Readiness ✅

**Answer:**
- WhatsApp Business API: **Already approved**
- BSP: **GreenAPI** (WhatsApp)
- Timeline revised to **8 weeks total**

---

### Q7: Officer No-Show Handling ✅

**Answer:**
- Alert admin if officer doesn't check in within **10 minutes**
- Admin **can reassign** to another officer
- **Automated escalation** (not manual) for MVP

---

### Q8: Data Model Clarifications ✅

**Answer:**
- One job → **multiple officers**: Yes
- One officer → **multiple concurrent jobs**: No
- Maximum shift duration: **3 shifts**
- Recurring jobs: **Yes** (same site, same time, weekly)

---

### Q9: DO Report Contents ✅

**Answer:** All of the following included:
- Job details (site, date, time, officer)
- Check-in/check-out timestamps with GPS
- Photo evidence summary
- Site manager signature
- Incident notes / officer remarks

---

### Q10: Finance Integration ✅

**Answer:**
- PDF attachment: **Yes**
- Email configurable per job/client: **Yes**
- Specific format required: **No**
- Track finance acknowledgement: **No**

---

*All questions resolved: 2026-02-23*
