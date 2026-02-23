# Product Requirement Document (PRD)

| Field | Value |
|-------|-------|
| **Project** | PilotNow |
| **Client** | NexStack Pte Ltd |
| **Version** | 1.0 |
| **Status** | Draft |
| **Author** | Aira Ling |
| **Reviewers** | Ken Ling |
| **Created** | 2026-02-23 |
| **Last Updated** | 2026-02-23 |

### Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-02-23 | Aira Ling | Initial PRD |

---

## 1. Executive Summary

PilotNow is a WhatsApp-first workforce management system for security manpower companies in Singapore. It replaces manual WhatsApp group chats, phone calls, spreadsheets, and paper-based processes with an automated pipeline: admins create jobs via natural language WhatsApp messages (parsed by LLM), assign officers, track GPS-verified attendance with timestamped photo proof, and auto-generate digitally signed Duty Officer (DO) reports for billing.

The system targets an 80%+ reduction in admin effort per job, 100% verifiable attendance coverage, and immediate DO report generation upon shift completion — eliminating the billing delays caused by manual paper processes. MVP scope is 8 weeks, 50K SGD budget, targeting 1,000 officers/jobs per day at pilot scale.

WhatsApp is the sole user interface for both admins and officers. No mobile app or web dashboard is required for MVP. The only web touchpoint is the digital signature page for site managers.

## 2. Problem Statement & Hypothesis

### Problem

Security manpower companies manage daily operations through WhatsApp group chats, phone calls, and paper forms. A single job takes 10–15 minutes to create and post manually. Tracking officer acceptance in busy group chats is unreliable. Attendance verification requires phone calls. Paper-based DO signatures are frequently delayed or lost. The entire cycle — job creation → assignment → attendance → DO report → billing — is manual, creating bottlenecks at every step and causing cash-flow gaps from delayed invoicing.

### Hypothesis

If we build a WhatsApp-native system where admins create jobs via natural language, officers check in with GPS + photo, and DO reports auto-generate with digital signatures, then security manpower operations teams will reduce per-job admin effort by 80%+, achieve 100% verifiable attendance, and generate DO reports immediately upon shift completion — enabling same-day billing initiation.

## 3. User Personas

### Persona: Admin / Ops Manager

| Attribute | Details |
|-----------|---------|
| **Who** | Operations staff managing 10–50+ officers daily. Moderate tech comfort, fluent with WhatsApp. Age 30–50. |
| **Goals** | Create jobs fast, assign officers reliably, track attendance without phone calls, get DO reports instantly |
| **Frustrations** | Repetitive manual posting, chasing officers for check-ins, lost paper signatures, delayed billing |
| **Frequency** | All day, every working day |
| **Devices** | Smartphone (WhatsApp) |

### Persona: Security Officer

| Attribute | Details |
|-----------|---------|
| **Who** | Field worker at client sites. Has smartphone with WhatsApp + GPS. Basic tech comfort — can tap buttons, send photos. Age 25–60. |
| **Goals** | Know where to go and when, check in simply, finish shift without hassle |
| **Frustrations** | Unclear job details, frequent calls from admin, confusion in group chats |
| **Frequency** | Daily, per shift |
| **Devices** | Smartphone (WhatsApp) |

### Persona: Site Manager (External)

| Attribute | Details |
|-----------|---------|
| **Who** | Client-side person at security site. Varying tech comfort. No system account. |
| **Goals** | Confirm officer attendance, sign DO report quickly |
| **Frustrations** | Paper forms, delays in signing, being chased for signatures |
| **Frequency** | Per shift end |
| **Devices** | Smartphone (web browser for signature) |

### Persona: Finance Team (External)

| Attribute | Details |
|-----------|---------|
| **Who** | Receives DO reports for billing. No system interaction. |
| **Goals** | Receive timely, complete, accurate PDF reports |
| **Frustrations** | Missing reports, incomplete data, delays |
| **Frequency** | Daily |
| **Devices** | Email (desktop) |

## 4. User Journey Maps

### Journey: Admin Creates a Job

```
Admin sends WhatsApp message with job details (free-form text)
    → System parses via LLM → Sends structured summary back for confirmation
    → Admin confirms (or edits) → Job created
        ↓ (parse failure)
        System asks for clarification with specific missing fields
```

**Happy path:** Admin types "Need 2 guards at Tampines Mall tomorrow 8am to 8pm", system extracts all fields, admin confirms with one tap.
**Drop-off risks:** LLM misparses → admin must re-type. Mitigated by showing parsed result and allowing field-level correction.

### Journey: Officer Assignment & Acknowledgement

```
Admin selects officers for job → System sends WhatsApp notification to each officer
    → Officer acknowledges → Assignment confirmed
        ↓ (no acknowledgement)
        System reminds after configurable interval → Admin notified if still no response
```

### Journey: Officer Check-In

```
Job start time approaches → System sends check-in reminder to officer
    → Officer sends photo + location → System validates GPS (within radius)
    → Check-in recorded with timestamp, GPS, photo
        ↓ (GPS outside radius)
        System rejects, tells officer to move closer and retry
        ↓ (no check-in after 10 min)
        No-show alert sent to admin → Admin can reassign
```

### Journey: Periodic Photo Proof

```
Timer fires per job-type frequency → System sends photo reminder to officer
    → Officer sends photo → Stored with timestamp
        ↓ (missed / no response)
        Immediate alert to admin
```

### Journey: DO Report & Signature

```
Shift ends → System auto-generates DO report PDF
    → Signature link sent to site manager via WhatsApp
    → Site manager opens web link → Enters mobile + IC last 4 digits → Signs
    → Signed PDF stored → Emailed to finance
        ↓ (signature timeout after 1hr)
        Admin notified for escalation
```

---

## 5. Feature Requirements (Functional)

### Epic: Job Management

---

#### FR-001: Natural Language Job Creation

| Field | Value |
|-------|-------|
| **Priority** | Must |
| **Epic** | Job Management |
| **Description** | Admin sends a free-form WhatsApp message describing a job. The system uses LLM (Gemini/OpenAI) to parse it into structured fields: site name, address, date(s), start time, end time, number of officers required, special requirements. The parsed result is sent back to admin for confirmation before the job is created. |

**Acceptance Criteria:**

1. **Given** an admin sends a WhatsApp message like "Need 2 guards at Tampines Mall 10 Tampines Central 1 tomorrow 8am to 8pm", **When** the LLM processes it, **Then** the system replies with a structured summary showing site, address, date, start time, end time, officer count and asks for confirmation.
2. **Given** the admin confirms the parsed job, **When** the system processes the confirmation, **Then** a job record is created with status "open" and a unique job ID is returned.
3. **Given** the admin rejects or wants to edit, **When** they reply with corrections (e.g., "change to 3 guards"), **Then** the system updates the parsed fields and re-presents for confirmation.
4. **Given** the LLM cannot parse one or more required fields, **When** the parse is incomplete, **Then** the system asks the admin to provide the specific missing fields (not a generic error).
5. **Given** the admin sends a message that is not a job request (e.g., "hello"), **When** the system processes it, **Then** it does not create a job and responds appropriately.

**Edge Cases:**
- Ambiguous dates ("next Monday" when sent on Monday — clarify which Monday)
- Multiple jobs in one message — parse each separately and confirm individually
- Non-English text or mixed language — attempt parse, ask for clarification if uncertain
- LLM service unavailable — queue message, notify admin of delay, retry with fallback provider
- Duplicate job detection — warn admin if a job with same site/date/time already exists

---

#### FR-002: Job Confirmation & Editing

| Field | Value |
|-------|-------|
| **Priority** | Must |
| **Epic** | Job Management |
| **Description** | After LLM parsing, admin reviews the structured job summary and can confirm, edit specific fields, or cancel. Editing is done via WhatsApp reply — the system re-parses corrections and re-presents. |

**Acceptance Criteria:**

1. **Given** a parsed job summary is displayed, **When** admin replies "confirm" or taps confirm button, **Then** the job is created.
2. **Given** a parsed job summary is displayed, **When** admin replies with a correction (e.g., "change time to 9am-9pm"), **Then** the system updates only the specified field(s) and re-presents the summary.
3. **Given** a parsed job summary is displayed, **When** admin replies "cancel", **Then** no job is created and the conversation is cleared.
4. **Given** no response from admin within 30 minutes, **When** the timeout expires, **Then** the pending job is discarded and admin is notified.

**Edge Cases:**
- Admin sends a new job message while a previous one is pending confirmation — queue the new one, finish current first
- Admin edits a field to an invalid value (e.g., end time before start time) — validate and reject with explanation

---

#### FR-003: Recurring Job Creation

| Field | Value |
|-------|-------|
| **Priority** | Must |
| **Epic** | Job Management |
| **Description** | Admins can create weekly recurring jobs via natural language (e.g., "every Monday and Wednesday") or structured input. The system generates individual job instances for each occurrence. Recurring jobs can be modified or cancelled (single instance or entire series). |

**Acceptance Criteria:**

1. **Given** an admin says "Need 1 guard at ABC Building every Monday 8am-6pm", **When** the LLM parses it, **Then** the system identifies it as recurring (weekly, Monday) and confirms the pattern with the admin.
2. **Given** a recurring job is confirmed, **When** the system processes it, **Then** individual job instances are created for the next 4 weeks (configurable) with a shared recurring_job_id.
3. **Given** a recurring job exists, **When** the admin says "cancel next Monday's job at ABC Building", **Then** only that single instance is cancelled; remaining instances are unaffected.
4. **Given** a recurring job exists, **When** the admin says "cancel all jobs at ABC Building", **Then** all future instances are cancelled; past/in-progress instances are unchanged.
5. **Given** a recurring job has officer assignments, **When** a new weekly instance is auto-created, **Then** the same officers are pre-assigned (admin can modify before the job date).

**Edge Cases:**
- Public holiday falls on a recurring day — create instance as normal (admin can cancel manually; PH detection is Phase 2)
- Admin creates a recurring job that overlaps with existing jobs at the same site — warn but allow

---

#### FR-004: Job Cancellation

| Field | Value |
|-------|-------|
| **Priority** | Must |
| **Epic** | Job Management |
| **Description** | Admin can cancel a job at any time before it is completed. All assigned officers are notified. In-progress jobs can also be cancelled (early termination). |

**Acceptance Criteria:**

1. **Given** a job with status "open" or "assigned", **When** admin sends "cancel job [ID]", **Then** the job status changes to "cancelled" and all assigned officers receive a cancellation notice via WhatsApp.
2. **Given** a job with status "in-progress" (officer already checked in), **When** admin cancels it, **Then** the job is marked "cancelled", the officer is notified to stand down, and a partial DO report is generated.
3. **Given** a completed job, **When** admin tries to cancel it, **Then** the system rejects with "Job already completed. Cannot cancel."

**Edge Cases:**
- Officer is mid-check-in when cancellation happens — check-in is rejected, officer notified
- Multiple officers on a cancelled job — all receive notification simultaneously

---

#### FR-005: Job Listing & Status Query

| Field | Value |
|-------|-------|
| **Priority** | Must |
| **Epic** | Job Management |
| **Description** | Admin can query job status via WhatsApp. Supports listing today's jobs, a specific job by ID, jobs by site, or jobs by status. |

**Acceptance Criteria:**

1. **Given** an admin sends "today's jobs", **When** the system processes it, **Then** it returns a formatted list of all jobs for today with status, site, time, and assigned officer count.
2. **Given** an admin sends "job 12345", **When** the system looks it up, **Then** it returns full job details including status, assigned officers (with check-in status), and site info.
3. **Given** an admin asks "unassigned jobs", **When** the system queries, **Then** it returns all jobs with status "open" (no officers assigned).
4. **Given** there are more than 10 jobs matching the query, **When** the result is returned, **Then** the system paginates (shows 10 with "reply MORE for next page").

**Edge Cases:**
- No matching jobs — reply "No jobs found matching your query"
- Ambiguous query — ask for clarification

---

### Epic: Assignment

---

#### FR-006: Admin-Driven Officer Assignment

| Field | Value |
|-------|-------|
| **Priority** | Must |
| **Epic** | Assignment |
| **Description** | Admin assigns one or more officers to a job by specifying officer names or IDs. The system validates that each officer has no conflicting active job (one officer = one active job at a time). One job can have multiple officers. |

**Acceptance Criteria:**

1. **Given** a job with status "open" requiring 2 officers, **When** admin sends "assign Ahmad and Bala to job 12345", **Then** both officers are assigned and notified via WhatsApp with job details (site, address, date, time, special instructions).
2. **Given** an officer is already assigned to an active/in-progress job, **When** admin tries to assign them to another job, **Then** the system rejects with "Officer [name] is already assigned to job [ID] ([site], [time]). Reassign?"
3. **Given** an officer is assigned, **When** they receive the notification, **Then** the message includes: job ID, site name, address, date, start time, end time, and any special instructions.
4. **Given** more officers are assigned than required by the job, **When** admin confirms, **Then** the system allows it (admin override) but shows a warning.

**Edge Cases:**
- Officer name is ambiguous (multiple officers named "Ahmad") — show list and ask admin to specify
- Officer not found — "Officer [name] not found. Did you mean [suggestions]?"
- Assigning to a job in the past — reject
- Assigning officer who hasn't been onboarded (no WhatsApp number) — reject with reason

---

#### FR-007: Officer Acknowledgement

| Field | Value |
|-------|-------|
| **Priority** | Must |
| **Epic** | Assignment |
| **Description** | When assigned, officers receive a WhatsApp message with job details and must acknowledge. Acknowledgement is tracked. Admin is notified of unacknowledged assignments. |

**Acceptance Criteria:**

1. **Given** an officer receives an assignment notification, **When** they reply "ok" or tap the acknowledge button, **Then** the assignment status changes to "acknowledged" and admin can see this.
2. **Given** an officer does not acknowledge within 30 minutes (configurable), **When** the timeout expires, **Then** the admin receives an alert: "Officer [name] has not acknowledged job [ID]. Reassign?"
3. **Given** an officer declines (replies "cannot" or similar), **When** the system detects the decline, **Then** admin is notified immediately with option to reassign.

**Edge Cases:**
- Officer replies with something ambiguous (e.g., "maybe") — treat as non-acknowledgement, ask for clear yes/no
- Officer acknowledges after timeout alert was already sent — update status, notify admin that officer eventually acknowledged
- WhatsApp delivery failure (officer phone off) — track delivery status via GreenAPI, alert admin

---

#### FR-008: Officer Reassignment

| Field | Value |
|-------|-------|
| **Priority** | Must |
| **Epic** | Assignment |
| **Description** | Admin can reassign a job from one officer to another at any time before job completion. The removed officer is notified of removal; the new officer receives assignment notification. |

**Acceptance Criteria:**

1. **Given** officer A is assigned to job 12345, **When** admin sends "reassign job 12345 from Ahmad to Charlie", **Then** Ahmad is removed and notified, Charlie is assigned and notified, concurrency check is applied to Charlie.
2. **Given** a no-show escalation, **When** admin chooses to reassign, **Then** the system prompts for a replacement officer and follows the standard assignment flow.

**Edge Cases:**
- Reassigning to an officer who also has a conflict — reject with conflict details
- Reassigning after check-in — allowed, but original officer's check-in is preserved in audit trail

---

#### FR-009: Officer Onboarding (Registration)

| Field | Value |
|-------|-------|
| **Priority** | Must |
| **Epic** | Assignment |
| **Description** | Admin registers officers in the system by providing name, phone number (WhatsApp), and IC last 4 digits. Officers are stored and can be assigned to jobs. Officers are contacted via their registered WhatsApp number. |

**Acceptance Criteria:**

1. **Given** an admin sends "add officer Ahmad 91234567 IC 5678", **When** the system processes it, **Then** a new officer record is created with name, phone, IC last 4 digits.
2. **Given** the phone number is already registered, **When** admin tries to add it again, **Then** the system rejects with "This number is already registered to officer [name]."
3. **Given** an admin wants to list officers, **When** they send "list officers", **Then** the system returns a paginated list of all registered officers with name and phone.

**Edge Cases:**
- Admin provides invalid phone number format — validate SG format (8 digits starting with 8 or 9), reject if invalid
- Admin wants to deactivate an officer — "deactivate officer [name]" marks them as inactive (cannot be assigned but record preserved)

---

### Epic: Attendance & Proof

---

#### FR-010: GPS + Photo Check-In

| Field | Value |
|-------|-------|
| **Priority** | Must |
| **Epic** | Attendance & Proof |
| **Description** | At job start, officers check in by sending a photo with location via WhatsApp. The system extracts GPS coordinates from the message, validates against the job site's configured radius (default 100m), and records the check-in with timestamp, GPS, and photo. |

**Acceptance Criteria:**

1. **Given** an officer is assigned to a job starting at 8am, **When** they send a photo with location at 7:55am, **Then** the system validates GPS is within the site radius, records the check-in (timestamp, GPS coordinates, photo URL), and confirms to the officer: "✅ Checked in at [site] at 7:55am."
2. **Given** an officer sends a photo with location that is outside the configured radius, **When** the system validates, **Then** it rejects: "❌ Your location is [X]m from [site]. Please move closer and try again." The officer can retry.
3. **Given** an officer sends a photo without location, **When** the system receives it, **Then** it prompts: "Please send your photo with location enabled. Tap the 📎 icon → Location to share your location."
4. **Given** an officer sends location without a photo, **When** the system receives it, **Then** it prompts: "Please also send a photo of the site for check-in."
5. **Given** a successful check-in, **When** the job status is updated, **Then** the admin can see the officer's check-in status when querying the job.

**Edge Cases:**
- Officer checks in more than 30 minutes early — accept but flag to admin: "Early check-in: [officer] checked in 35 min early for job [ID]"
- Officer checks in late (after start time but within 10 min) — accept, record as late check-in
- Multiple check-in attempts — only the first successful check-in counts; subsequent attempts are logged but don't override
- GPS accuracy poor (accuracy radius > 200m from device) — warn officer: "Location accuracy is low. Move to an open area and try again."
- Photo is too dark / blurry — accept (quality validation is Phase 2)

---

#### FR-011: Check-Out

| Field | Value |
|-------|-------|
| **Priority** | Must |
| **Epic** | Attendance & Proof |
| **Description** | At shift end, officers check out by sending a photo with location. Same GPS validation as check-in. Check-out triggers DO report generation. |

**Acceptance Criteria:**

1. **Given** an officer is checked in for a job ending at 8pm, **When** they send a photo with location at 8:00pm, **Then** the system validates GPS, records check-out, and confirms: "✅ Checked out at [site] at 8:00pm. Shift complete."
2. **Given** an officer tries to check out more than 30 minutes before the scheduled end, **When** the system receives it, **Then** it warns: "Shift ends at [time]. Are you sure you want to check out early?" Admin is notified of early checkout.
3. **Given** all officers on a job have checked out, **When** the last check-out is recorded, **Then** the DO report generation is triggered automatically.
4. **Given** an officer hasn't checked out 15 minutes after shift end, **When** the timeout triggers, **Then** the system prompts the officer to check out and alerts the admin.

**Edge Cases:**
- Officer sends checkout from different location (left site early) — record with flag, include in DO report
- Multiple officers on same job — each checks out independently; DO report generated after last checkout
- System downtime during checkout window — queue checkout attempts, process when back online

---

#### FR-012: Periodic Photo Reminders

| Field | Value |
|-------|-------|
| **Priority** | Must |
| **Epic** | Attendance & Proof |
| **Description** | During a shift, the system sends periodic photo reminders to officers at a frequency defined per job type (e.g., every 2 hours, every 4 hours). Officers must respond with a photo. Missed responses trigger immediate admin alerts. |

**Acceptance Criteria:**

1. **Given** a job type configured with 2-hour photo reminders and an officer checked in at 8am for an 8am-8pm shift, **When** the clock hits 10am, **Then** the system sends: "📸 Photo check reminder for [site]. Please send a photo now."
2. **Given** an officer receives a photo reminder, **When** they send a photo within 15 minutes, **Then** the photo is stored with timestamp and linked to the job.
3. **Given** an officer does not respond to a photo reminder within 15 minutes, **When** the timeout expires, **Then** the admin receives an immediate alert: "⚠️ [Officer] missed photo check at [time] for [site]. No response."
4. **Given** an officer responds after the 15-minute window, **When** the system receives the late photo, **Then** it is accepted and stored but flagged as late. Admin alert is updated.
5. **Given** a job type with no photo reminder frequency set, **When** the shift is in progress, **Then** no periodic reminders are sent (only check-in and check-out required).

**Edge Cases:**
- Officer sends a photo proactively (without reminder) — accept and store, does not reset the reminder timer
- Reminder due at a time very close to shift end (within 30 min) — skip the reminder
- Officer has poor connectivity — photos queued by WhatsApp; accept when delivered with original send timestamp

---

#### FR-013: Site Configuration (GPS Radius)

| Field | Value |
|-------|-------|
| **Priority** | Must |
| **Epic** | Attendance & Proof |
| **Description** | Each job site has a GPS coordinate and configurable check-in radius. Default is 100m. Admin can set a custom radius per site (e.g., 200m for large campuses, 50m for small offices). |

**Acceptance Criteria:**

1. **Given** admin creates a new site, **When** they provide address, **Then** the system geocodes the address to GPS coordinates and sets default radius of 100m.
2. **Given** admin sends "set radius for Tampines Mall to 200m", **When** the system processes it, **Then** the site's radius is updated to 200m for all future check-ins.
3. **Given** a site with custom radius, **When** an officer checks in, **Then** the GPS validation uses the custom radius, not the default.

**Edge Cases:**
- Geocoding fails for an address — ask admin to provide GPS coordinates manually or refine address
- Admin sets radius to 0m or unreasonably small — reject, enforce minimum of 20m
- Admin sets radius > 1000m — allow but warn: "Radius is set to [X]m. This is larger than usual. Confirm?"

---

### Epic: Escalation

---

#### FR-014: No-Show Detection & Escalation

| Field | Value |
|-------|-------|
| **Priority** | Must |
| **Epic** | Escalation |
| **Description** | If an officer does not check in within 10 minutes of the job start time, the system automatically alerts the admin with the officer's details and provides options to call the officer or reassign the job. |

**Acceptance Criteria:**

1. **Given** a job starts at 8am and the assigned officer has not checked in, **When** 8:10am is reached, **Then** the admin receives: "🚨 No-show alert: [Officer] has not checked in for job [ID] at [site]. Job started at 8:00am. Reply REASSIGN to assign another officer or CALL to get their number."
2. **Given** a no-show alert is sent, **When** the officer checks in at 8:12am (after the alert), **Then** the admin is updated: "[Officer] has checked in late (12 min) for job [ID]." The check-in is accepted and flagged as late.
3. **Given** a no-show alert, **When** admin replies "REASSIGN", **Then** the system prompts for a replacement officer name and follows the assignment flow (FR-008).
4. **Given** multiple officers on a job, **When** one no-shows but others check in, **Then** the alert is only for the missing officer(s).

**Edge Cases:**
- All officers on a multi-officer job no-show — escalation message lists all missing officers
- Officer checks in at exactly 10 minutes (8:10:00) — treat as on-time, no alert
- Admin doesn't respond to no-show alert — system sends one follow-up reminder at 8:20am

---

#### FR-015: Missed Photo Alert

| Field | Value |
|-------|-------|
| **Priority** | Must |
| **Epic** | Escalation |
| **Description** | When an officer misses a periodic photo reminder (no response within 15 minutes), the admin is immediately alerted. This is handled within FR-012 but escalation tracking is separate. |

**Acceptance Criteria:**

1. **Given** an officer misses a photo reminder, **When** 15 minutes pass, **Then** admin receives: "⚠️ Missed photo: [Officer] at [site] did not respond to [time] photo check."
2. **Given** multiple consecutive missed reminders from the same officer, **When** the second miss occurs, **Then** the alert is escalated: "🚨 [Officer] has missed 2 consecutive photo checks at [site]. Possible issue."

**Edge Cases:**
- Admin is overwhelmed with alerts (many officers missing photos) — batch alerts: send summary every 5 minutes instead of individual alerts if more than 5 pending

---

#### FR-016: Signature Timeout Escalation

| Field | Value |
|-------|-------|
| **Priority** | Must |
| **Epic** | Escalation |
| **Description** | When a DO report signature link is not completed within 1 hour, the admin is alerted. The link remains valid but admin can take manual action. |

**Acceptance Criteria:**

1. **Given** a signature link is sent to site manager, **When** 1 hour passes without signature, **Then** admin receives: "⏰ Signature pending: DO report for job [ID] at [site] has not been signed. Link sent to [phone]. Resend or mark as unsigned?"
2. **Given** admin replies "RESEND", **When** the system processes it, **Then** a new signature link is sent to the site manager (new 1hr timeout).
3. **Given** admin replies "UNSIGNED", **When** the system processes it, **Then** the DO report is marked as "unsigned" and proceeds to finance email with an "UNSIGNED" watermark.

**Edge Cases:**
- Site manager partially completes verification (enters phone but not IC) and abandons — treat as unsigned after timeout
- Site manager's phone number is wrong — admin can update and resend

---

### Epic: Reporting

---

#### FR-017: DO Report Auto-Generation

| Field | Value |
|-------|-------|
| **Priority** | Must |
| **Epic** | Reporting |
| **Description** | Upon shift completion (all officers checked out), the system automatically generates a PDF DO report containing: job details, officer details, check-in/out timestamps, GPS coordinates, all photos (check-in, check-out, periodic), officer remarks, incident notes, and signature status. |

**Acceptance Criteria:**

1. **Given** all officers on a job have checked out, **When** the DO report is triggered, **Then** a PDF is generated within 60 seconds containing all audit trail data.
2. **Given** a generated DO report, **When** the admin queries it, **Then** they receive the PDF via WhatsApp.
3. **Given** a job with multiple officers, **When** the DO report is generated, **Then** each officer's data (check-in, check-out, photos, remarks) appears in a separate section.
4. **Given** a job with incidents or remarks logged by officers, **When** the report is generated, **Then** all remarks and incidents appear in chronological order with timestamps.

**Edge Cases:**
- Photo storage fails — DO report generated with placeholder: "Photo unavailable" and admin notified
- Job cancelled mid-shift — partial DO report generated with data up to cancellation
- Very long shift with many photos — PDF pagination handles large content

---

#### FR-018: Digital Signature

| Field | Value |
|-------|-------|
| **Priority** | Must |
| **Epic** | Reporting |
| **Description** | After DO report generation, a unique web link is sent to the site manager via WhatsApp. The link opens a mobile-optimized page where the site manager verifies identity (mobile number + IC last 4 digits), reviews the report summary, and signs digitally (finger/stylus on canvas). Link expires after 1 hour. |

**Acceptance Criteria:**

1. **Given** a DO report is generated, **When** the system triggers signature, **Then** a unique URL is sent to the site manager's WhatsApp: "Please sign the DO report for [site] on [date]: [link]. This link expires in 1 hour."
2. **Given** a site manager opens the link, **When** they enter mobile number and IC last 4 digits, **Then** the system verifies against stored site manager data. If matched, the report summary and signature canvas are shown.
3. **Given** verification passes, **When** the site manager draws their signature and taps "Submit", **Then** the signature is embedded in the DO report PDF, the report status changes to "signed", and admin is notified.
4. **Given** the link is accessed after 1 hour, **When** the page loads, **Then** it shows "This link has expired. Please contact the admin for a new link."
5. **Given** verification fails (wrong mobile or IC), **When** 3 attempts are made, **Then** the link is locked and admin is notified: "Signature verification failed for [site]. Link locked."

**Edge Cases:**
- Site manager doesn't have WhatsApp — admin can get a direct web link to share via other means
- Multiple site managers at one site — signature link is sent to the configured site manager; admin can override
- Browser compatibility — page must work on Chrome, Safari (iOS), Samsung Internet

---

#### FR-019: Finance Email Delivery

| Field | Value |
|-------|-------|
| **Priority** | Must |
| **Epic** | Reporting |
| **Description** | Signed (or unsigned-with-watermark) DO report PDFs are emailed to the finance team. Email recipients are configurable per job or per client. |

**Acceptance Criteria:**

1. **Given** a DO report is signed, **When** the signature is completed, **Then** the PDF is emailed to the configured finance recipient(s) within 5 minutes.
2. **Given** a DO report is marked "unsigned" by admin, **When** the admin confirms, **Then** the PDF (with "UNSIGNED" watermark) is emailed to finance.
3. **Given** a client has a configured finance email, **When** a job for that client completes, **Then** the email goes to that client's finance email. If no client-level config exists, it uses the default company finance email.
4. **Given** email delivery fails, **When** the bounce is detected, **Then** admin is notified and can retry or update the email address.

**Edge Cases:**
- Multiple finance recipients per client — support comma-separated email list
- PDF exceeds email attachment size limit (>25MB) — compress images in PDF or provide download link

---

#### FR-020: Officer Remarks & Incident Logging

| Field | Value |
|-------|-------|
| **Priority** | Should |
| **Epic** | Reporting |
| **Description** | Officers can send text remarks or incident reports during their shift via WhatsApp. These are timestamped and included in the DO report. |

**Acceptance Criteria:**

1. **Given** an officer is checked in for a job, **When** they send a text message (not a photo/location), **Then** the system stores it as a remark with timestamp, linked to the job.
2. **Given** an officer sends "incident: fire alarm triggered at level 3", **When** the system detects the "incident:" prefix, **Then** it is flagged as an incident (higher visibility in DO report) and admin is immediately notified.
3. **Given** remarks exist for a job, **When** the DO report is generated, **Then** all remarks appear in a "Remarks & Incidents" section in chronological order.

**Edge Cases:**
- Officer sends a remark when not checked in — reject: "You are not currently checked in to any job."
- Very long remark text — truncate at 1000 characters, store full text in DB

---

### Epic: System & Configuration

---

#### FR-021: Job Type Configuration

| Field | Value |
|-------|-------|
| **Priority** | Should |
| **Epic** | System & Configuration |
| **Description** | Admin can define job types (e.g., "Event Security", "Static Guard", "Patrol") with default settings: photo reminder frequency, special instructions template, default officer count. |

**Acceptance Criteria:**

1. **Given** admin sends "create job type Event Security, photo every 1 hour", **When** processed, **Then** a job type is created with the specified photo frequency.
2. **Given** a job is created and tagged with a job type, **When** the shift is in progress, **Then** the photo reminder frequency from the job type is used.
3. **Given** no job type is specified for a job, **When** the shift is in progress, **Then** default settings are used (e.g., photo every 4 hours).

**Edge Cases:**
- Admin changes job type settings — changes apply to future jobs only, not in-progress jobs

---

#### FR-022: Client Management

| Field | Value |
|-------|-------|
| **Priority** | Should |
| **Epic** | System & Configuration |
| **Description** | Admin can register clients with: company name, contact person, phone, email, finance email, and associated sites. Jobs are linked to clients for reporting and billing. |

**Acceptance Criteria:**

1. **Given** admin sends "add client ABC Corp, finance email finance@abc.com", **When** processed, **Then** a client record is created.
2. **Given** a client exists, **When** a job is created for that client's site, **Then** the job is automatically linked to the client.
3. **Given** a client has a finance email, **When** a DO report for their job is signed, **Then** the PDF is emailed to the client's finance email.

**Edge Cases:**
- Client name already exists — warn and ask to confirm or rename

---

#### FR-023: Site Management

| Field | Value |
|-------|-------|
| **Priority** | Must |
| **Epic** | System & Configuration |
| **Description** | Admin can register sites with: name, address, GPS coordinates, check-in radius, associated client, site manager name, and site manager phone number. Sites are referenced in job creation and GPS validation. |

**Acceptance Criteria:**

1. **Given** admin sends "add site Tampines Mall, 10 Tampines Central 1, client ABC Corp, site manager John 91112222", **When** processed, **Then** a site record is created with geocoded GPS coordinates and default 100m radius.
2. **Given** a site exists, **When** admin creates a job mentioning that site name, **Then** the job is linked to the site and inherits its GPS coordinates and radius.
3. **Given** a job at a site with a site manager, **When** the DO report needs signing, **Then** the signature link is sent to the site manager's registered WhatsApp number.

**Edge Cases:**
- Site name mentioned in job creation doesn't match any registered site — create new site record, ask admin to confirm address
- Site has no site manager — skip digital signature step, mark DO report as "no signature required", notify admin

---

## 6. Non-Functional Requirements

### Performance

| Metric | Target |
|--------|--------|
| WhatsApp message processing | < 5s from receipt to response |
| LLM job parsing | < 10s end-to-end |
| GPS validation | < 2s |
| DO report PDF generation | < 60s |
| API response time | < 500ms p95 (internal APIs) |
| Concurrent active jobs | 1,000 per day |
| Concurrent officers | 1,000 per day |
| Uptime | 99.5% (excl. scheduled maintenance) |

### Security

- [x] WhatsApp communication via GreenAPI (encrypted by WhatsApp)
- [x] Signature page: HTTPS only, token-based unique URLs
- [x] Signature verification: mobile + IC last 4 digits
- [x] Database: PostgreSQL with encrypted connections
- [x] API authentication: internal service tokens
- [x] Photo storage: private bucket with signed URLs
- [ ] PDPA compliance: Not required for MVP (Phase 2)

### Accessibility

- Signature web page: mobile-optimized, large touch targets, readable fonts
- WhatsApp is inherently accessible via device accessibility features

### Scalability

- Expected growth: 1,000 officers/jobs per day at pilot; 5,000 in Phase 2
- Horizontal scaling: stateless Hono.js workers behind load balancer
- Photo storage: DigitalOcean Spaces (S3-compatible)
- Message queue for WhatsApp API rate limiting
- Data retention: 1 year for MVP (configurable)

### Browser Support (Signature Page Only)

- Chrome (Android) — latest 2 versions
- Safari (iOS) — latest 2 versions
- Samsung Internet — latest version

## 7. Information Architecture / Sitemap

WhatsApp is the UI. There is no traditional sitemap. The system is conversational.

```
WhatsApp (Admin)
├── Job Management
│   ├── Create job (natural language)
│   ├── Confirm / edit parsed job
│   ├── Create recurring job
│   ├── Cancel job
│   ├── Query job status
│   └── List jobs (today / by site / by status)
├── Assignment
│   ├── Assign officer(s) to job
│   ├── Reassign officer
│   └── View assignments
├── Officer Management
│   ├── Add officer
│   ├── List officers
│   └── Deactivate officer
├── Site & Client Management
│   ├── Add/edit site
│   ├── Add/edit client
│   └── Set GPS radius
├── Configuration
│   ├── Job types & photo frequency
│   └── Finance email settings
└── Alerts (Incoming)
    ├── No-show alerts
    ├── Missed photo alerts
    ├── Signature timeout alerts
    └── Officer incident alerts

WhatsApp (Officer)
├── Receive assignment notification
├── Acknowledge assignment
├── Check-in (photo + location)
├── Respond to photo reminders
├── Send remarks / incident reports
└── Check-out (photo + location)

Web (Site Manager — signature page only)
├── Verify identity (mobile + IC)
├── Review DO report summary
└── Sign digitally
```

## 8. Screen-by-Screen Specs

Since WhatsApp is the UI, "screens" are message flows. Each flow describes the messages exchanged, states, and edge cases.

---

### Screen: Job Creation Flow (Admin)

| Field | Details |
|-------|---------|
| **Channel** | WhatsApp (Admin → System) |
| **Purpose** | Create a new job from natural language input |
| **Access** | Admin only |

**Message Flow:**

1. **Admin sends:** Free-form text (e.g., "Need 2 guards at Tampines Mall tomorrow 8am to 8pm event security")
2. **System replies:** Parsed summary in structured format:
   ```
   📋 New Job Summary
   ━━━━━━━━━━━━━━━━
   🏢 Site: Tampines Mall
   📍 Address: 10 Tampines Central 1
   📅 Date: 24 Feb 2026 (Mon)
   ⏰ Time: 08:00 – 20:00
   👥 Officers needed: 2
   🏷️ Type: Event Security
   📝 Notes: —

   Reply CONFIRM to create, or send corrections.
   ```
3. **Admin replies:** "confirm" → Job created, ID returned
   OR corrections → System re-parses and re-presents

**States:**
- **Parsing:** "⏳ Processing your job request..."
- **Parse success:** Structured summary (as above)
- **Parse failure:** "I couldn't understand some details. Please provide: [missing fields]"
- **Confirmed:** "✅ Job #12345 created. Assign officers with: assign [names] to 12345"
- **Cancelled:** "❌ Job creation cancelled."
- **Duplicate warning:** "⚠️ A similar job exists: #12340 at Tampines Mall on 24 Feb. Still create? Reply CONFIRM or CANCEL."
- **Timeout (30 min):** "⏰ Job creation timed out. Send your job details again to start over."

---

### Screen: Officer Assignment Flow (Admin)

| Field | Details |
|-------|---------|
| **Channel** | WhatsApp (Admin → System → Officer) |
| **Purpose** | Assign officers to a job |
| **Access** | Admin initiates; officer receives |

**Message Flow:**

1. **Admin sends:** "assign Ahmad and Bala to 12345"
2. **System validates:** Checks conflicts, officer existence
3. **System replies to admin:**
   ```
   ✅ Assignment confirmed for Job #12345:
   • Ahmad (9123-4567) — notified
   • Bala (9234-5678) — notified
   Awaiting acknowledgement.
   ```
4. **System sends to each officer:**
   ```
   📋 Job Assignment
   ━━━━━━━━━━━━━━━━
   🏢 Site: Tampines Mall
   📍 Address: 10 Tampines Central 1
   📅 Date: 24 Feb 2026 (Mon)
   ⏰ Time: 08:00 – 20:00
   📝 Notes: Event security

   Reply OK to acknowledge.
   ```
5. **Officer replies:** "ok" → Acknowledged

**States:**
- **Conflict:** "❌ Ahmad is already assigned to Job #12340 (MBS, 24 Feb 08:00-20:00). Assign anyway? (This will remove Ahmad from #12340)"
- **Officer not found:** "❓ Officer 'Charli' not found. Did you mean: Charlie (9345-6789)?"
- **Acknowledged:** Admin sees: "✅ Ahmad acknowledged Job #12345"
- **Ack timeout (30 min):** Admin sees: "⚠️ Ahmad has not acknowledged Job #12345. Reassign?"
- **Declined:** Admin sees: "❌ Ahmad declined Job #12345. Reassign?"

---

### Screen: Check-In Flow (Officer)

| Field | Details |
|-------|---------|
| **Channel** | WhatsApp (System → Officer → System) |
| **Purpose** | Officer checks in at job site |
| **Access** | Assigned officer |

**Message Flow:**

1. **System sends (15 min before start):**
   ```
   ⏰ Reminder: Your shift at Tampines Mall starts at 08:00.
   When you arrive, send a photo of the site with your location to check in.
   ```
2. **Officer sends:** Photo + location
3. **System validates GPS** and replies:
   - ✅ Success: "✅ Checked in at Tampines Mall at 07:58. Have a good shift!"
   - ❌ Too far: "❌ You are 250m from Tampines Mall. Please move closer and send another photo with location."
   - ❌ No location: "📍 Please send your photo with location sharing enabled."
   - ❌ No photo: "📸 Please include a photo with your location for check-in."

**States:**
- **Pre-shift reminder:** Sent 15 min before start
- **Check-in success:** Confirmed with timestamp
- **Check-in rejected (GPS):** Distance shown, retry allowed
- **Check-in rejected (missing data):** Specific instruction given
- **Late check-in (1-10 min):** Accepted, flagged as late
- **No-show (>10 min):** Escalation to admin (FR-014)

---

### Screen: Photo Reminder Flow (Officer)

| Field | Details |
|-------|---------|
| **Channel** | WhatsApp (System → Officer → System) |
| **Purpose** | Periodic proof-of-presence during shift |
| **Access** | Checked-in officer |

**Message Flow:**

1. **System sends:** "📸 Photo check for Tampines Mall. Please send a photo now."
2. **Officer sends:** Photo
3. **System replies:** "✅ Photo received at 10:02. Next check at 12:00."

**States:**
- **Reminder sent:** Awaiting photo
- **Photo received (on time):** Confirmed, next reminder scheduled
- **Photo received (late, within 15 min):** Accepted, flagged as late
- **Missed (no response in 15 min):** Admin alerted (FR-015)

---

### Screen: Check-Out Flow (Officer)

| Field | Details |
|-------|---------|
| **Channel** | WhatsApp (System → Officer → System) |
| **Purpose** | Officer checks out at shift end |
| **Access** | Checked-in officer |

**Message Flow:**

1. **System sends (at shift end time):** "🏁 Your shift at Tampines Mall is ending. Please send a photo with location to check out."
2. **Officer sends:** Photo + location
3. **System validates** and replies: "✅ Checked out at Tampines Mall at 20:02. Shift complete. Thank you!"

**States:**
- **Checkout prompt:** Sent at shift end time
- **Checkout success:** Confirmed
- **Checkout rejected (GPS):** Same as check-in
- **Early checkout:** Warning + admin notification
- **Late checkout (no response in 15 min):** Reminder sent, admin alerted

---

### Screen: DO Signature Page (Web — Site Manager)

| Field | Details |
|-------|---------|
| **URL** | https://app.pilotnow.sg/sign/{token} |
| **Purpose** | Site manager signs DO report digitally |
| **Access** | Anyone with the link (verified by mobile + IC) |

**Key Elements:**
- Header: PilotNow logo, "DO Report Signature"
- Verification form: Mobile number input, IC last 4 digits input, "Verify" button
- Report summary (after verification): Job details, officer names, check-in/out times, shift duration
- Signature canvas: Touch-draw area, "Clear" and "Submit" buttons
- Confirmation: "Thank you! Signature recorded." with checkmark

**States:**
- **Loading:** Spinner while verifying token
- **Verification:** Mobile + IC form
- **Verification failed:** "Details do not match. [X] attempts remaining."
- **Locked (3 failed attempts):** "This link has been locked. Please contact the admin."
- **Report summary + signature:** Main signing view
- **Submitted:** "✅ Signature recorded. Thank you!"
- **Expired:** "This link has expired. Please contact the admin for a new link."
- **Error:** "Something went wrong. Please try again or contact the admin."

---

### Screen: No-Show Alert (Admin)

| Field | Details |
|-------|---------|
| **Channel** | WhatsApp (System → Admin) |
| **Purpose** | Alert admin of officer no-show |
| **Access** | Admin |

**Message:**
```
🚨 No-Show Alert
━━━━━━━━━━━━━━━━
Job #12345 — Tampines Mall
Officer: Ahmad (9123-4567)
Start time: 08:00
No check-in as of 08:10

Reply:
• REASSIGN 12345 — assign replacement
• CALL 12345 — get officer's number
```

---

## 9. API / Integration Requirements

| Integration | Type | Purpose | Direction | Auth | Owner |
|-------------|------|---------|-----------|------|-------|
| GreenAPI | REST API + Webhooks | WhatsApp messaging (send/receive) | Bidirectional | API token | NexStack BE |
| Google Gemini | REST API | Primary LLM for job parsing | Outbound | API key | NexStack BE |
| OpenAI | REST API | Fallback LLM for job parsing | Outbound | API key | NexStack BE |
| Google Maps Geocoding | REST API | Address → GPS coordinates | Outbound | API key | NexStack BE |
| Email (SMTP / Resend) | SMTP / REST | DO report PDF delivery | Outbound | API key | NexStack BE |
| DigitalOcean Spaces | S3-compatible API | Photo storage | Outbound | Access key | NexStack BE |

### GreenAPI Integration Detail

- **Inbound:** Webhook receives all WhatsApp messages (text, photo, location, mixed)
- **Outbound:** Send text messages, send media (PDF), send messages with buttons
- **Rate limits:** Respect GreenAPI rate limits; implement message queue with exponential backoff
- **Delivery status:** Track message delivery/read status via webhook events
- **Error handling:** On send failure → retry 3x with backoff → log and alert admin

### LLM Integration Detail

- **Primary:** Google Gemini — used for job parsing, intent detection
- **Fallback:** OpenAI — used when Gemini is unavailable or returns low-confidence parse
- **Prompt engineering:** System prompt with examples of job creation messages and expected structured output
- **Response format:** JSON with fields: site, address, date, start_time, end_time, officer_count, job_type, notes, is_recurring, recurrence_pattern
- **Confidence threshold:** If LLM confidence < 0.7, ask admin for clarification on uncertain fields
- **Timeout:** 15s per LLM call; if exceeded, retry once with fallback provider

## 10. Data Model Overview

```
Client (1) ──── (N) Site
Site (1) ──── (N) Job
Site (1) ──── (N) SiteManager
RecurringJob (1) ──── (N) Job
Job (1) ──── (N) JobAssignment
Officer (1) ──── (N) JobAssignment
JobAssignment (1) ──── (N) AttendanceEvent
JobAssignment (1) ──── (N) PhotoProof
JobAssignment (1) ──── (N) Remark
Job (1) ──── (1) DOReport
DOReport (1) ──── (0..1) Signature
JobType (1) ──── (N) Job
```

**Key Entities:**

| Entity | Key Fields | Notes |
|--------|-----------|-------|
| **Client** | id, name, contact_name, contact_phone, finance_email, created_at | Company that requests security services |
| **Site** | id, client_id, name, address, latitude, longitude, radius_m, created_at | Physical location; default radius 100m |
| **SiteManager** | id, site_id, name, phone, ic_last4 | Person who signs DO reports at site |
| **Officer** | id, name, phone, ic_last4, status (active/inactive), created_at | Security officer; phone is WhatsApp number |
| **JobType** | id, name, photo_frequency_min, default_instructions | Template with default settings |
| **RecurringJob** | id, site_id, job_type_id, day_of_week, start_time, end_time, officer_count, status, created_at | Weekly pattern; generates Job instances |
| **Job** | id, site_id, job_type_id, recurring_job_id, date, start_time, end_time, officer_count, status (open/assigned/in_progress/completed/cancelled), notes, created_at | Individual job instance |
| **JobAssignment** | id, job_id, officer_id, status (assigned/acknowledged/declined/checked_in/checked_out/no_show), assigned_at, acknowledged_at | Links officer to job |
| **AttendanceEvent** | id, job_assignment_id, type (check_in/check_out), latitude, longitude, accuracy_m, timestamp, photo_url, is_late | GPS-verified attendance record |
| **PhotoProof** | id, job_assignment_id, photo_url, requested_at, received_at, is_late, is_missed | Periodic photo proof |
| **Remark** | id, job_assignment_id, text, is_incident, timestamp | Officer text remarks during shift |
| **DOReport** | id, job_id, pdf_url, status (generated/signature_sent/signed/unsigned/emailed), generated_at | Auto-generated PDF report |
| **Signature** | id, do_report_id, token, site_manager_id, signature_image_url, signed_at, expires_at, attempts, is_locked | Digital signature with verification |

## 11. Error Handling & Edge Cases

| Scenario | User Message | System Action | Severity |
|----------|-------------|---------------|----------|
| GreenAPI down | (Admin) "⚠️ WhatsApp connection issue. We're working on it." | Queue outbound messages, retry every 30s, alert ops team | Critical |
| LLM service unavailable | "⏳ Job parsing is temporarily slow. Your message is queued." | Retry with fallback provider, queue if both fail, process when restored | High |
| LLM parse confidence low | "I'm not sure about [field]. Can you confirm: [options]?" | Ask admin for clarification on specific fields | Medium |
| GPS location missing from message | "📍 Please send your photo with location enabled." | Reject check-in, instruct officer | Medium |
| GPS outside radius | "❌ You are [X]m away. Please move closer." | Reject check-in, allow retry | Medium |
| Officer sends message but not assigned to any job | "You don't have any active job assignments." | Ignore non-actionable messages | Low |
| Admin sends unrecognized command | "I didn't understand that. Type HELP for available commands." | Log for intent improvement | Low |
| Photo storage failure | (Silent to user) | Retry upload 3x, store locally as fallback, alert ops | High |
| Email delivery failure (bounce) | (Admin) "📧 DO report email to [addr] bounced. Please check the address." | Log bounce, notify admin | Medium |
| Signature page token expired | (Site manager) "This link has expired." | Show expiry message, admin can resend | Medium |
| Signature verification failed 3x | (Site manager) "Link locked." / (Admin) "Signature verification failed for [site]." | Lock token, alert admin | High |
| Concurrent modification (race condition) | — | Optimistic locking on job status transitions | Medium |
| Duplicate check-in attempt | "You've already checked in for this job." | Reject duplicate, keep original | Low |
| Officer sends checkout before checkin | "You need to check in first before checking out." | Reject checkout | Low |
| Database connection failure | (Admin) "⚠️ System temporarily unavailable." | Retry with backoff, alert ops | Critical |
| Rate limit hit (GreenAPI) | — | Queue messages, backoff, process in order | High |

## 12. Dependencies & Risks

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|-----------|--------|------------|-------|
| GreenAPI rate limits during peak hours (morning assignments) | Medium | High | Message queue with priority (alerts > notifications), batch where possible | NexStack BE |
| GPS accuracy in buildings / underground | High | Medium | Configurable radius per site, admin manual override for edge cases | NexStack BE |
| LLM parsing errors on ambiguous input | Medium | Medium | Admin confirmation step, fallback LLM, logging for prompt improvement | NexStack BE |
| Site manager ignores signature link | Medium | High | 1hr timeout, auto-escalation, admin can mark unsigned | NexStack BE |
| GreenAPI service disruption | Low | Critical | Message queue persists, auto-retry, ops monitoring, manual fallback procedures | NexStack BE |
| Officer smartphone limitations (old device, no GPS) | Low | Medium | Graceful error messages, admin manual entry fallback | NexStack BE |
| WhatsApp policy changes affecting business messaging | Low | High | Monitor WhatsApp policy updates, abstract messaging layer for future provider switch | Ken |
| Photo storage costs at scale | Low | Medium | Image compression, retention policy (auto-delete after 1 year) | NexStack BE |

## 13. Release Criteria / Definition of Done

- [ ] All Must-have features (FR-001 through FR-019, FR-023) implemented and tested
- [ ] All acceptance criteria passing for Must-have features
- [ ] Should-have features (FR-020, FR-021, FR-022) implemented if time permits
- [ ] End-to-end flow tested: job creation → assignment → check-in → photo proof → check-out → DO report → signature → email
- [ ] Load test: 100 concurrent jobs processing without degradation
- [ ] GreenAPI integration tested with real WhatsApp numbers
- [ ] LLM parsing tested with 50+ real-world job description samples
- [ ] GPS validation tested at 3+ real sites
- [ ] Digital signature page tested on iOS Safari and Android Chrome
- [ ] DO report PDF reviewed for completeness and formatting
- [ ] Error handling verified for all scenarios in error matrix
- [ ] Monitoring and alerting configured for critical failures
- [ ] UAT sign-off from Ken (Product Owner)
- [ ] Deployment to DigitalOcean production environment

## 14. Appendix

- [Discovery Brief](01-discovery-brief.md)
- [Scope v0.1](02-scope-v01.md)
- GreenAPI Documentation: https://green-api.com/en/docs/
- Tech stack: Hono.js (backend), PostgreSQL (database), DigitalOcean (hosting + Spaces)
- LLM providers: Google Gemini, OpenAI
- Budget: 50K SGD | Timeline: 8 weeks (4 × 2-week sprints)
- Pilot scale: 1,000 officers / jobs per day
