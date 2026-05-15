# User Story

| Field | Value |
|-------|-------|
| **Story ID** | US-001 |
| **Epic** | Job Management |
| **Feature** | Create Job via Natural Language |
| **PRD Ref** | See PRD v2.0 |
| **Priority** | Must |
| **Size** | 8 story points |
| **Sprint** | Sprint 2 |

---

## Story

**As an** admin,
**I want** to create a job using PilotNow natural-language intake, including free-form WhatsApp input and supported admin web workflows,
**so that** I can create jobs in seconds without filling structured forms.

The same intake capability should also support a **customer-originated WhatsApp order flow** where PilotNow AI parses pasted orders into draft jobs for fulfilment.

## Acceptance Criteria

### Scenario 1: Happy path — LLM parses job successfully

- **Given** I am a registered admin using PilotNow job intake
- **When** I send a message like "Need 2 officers at Marina Bay Tower tomorrow 8am to 6pm, uniform required"
- **Then** the LLM extracts site name, date, start time, end time, officer count, and requirements
- **And** the system shows a structured summary and asks me to confirm or edit
- **And** no job is created until I confirm

### Scenario 2: Admin confirms the parsed job

- **Given** the system has shown me the parsed job summary
- **When** I reply "Confirm" or tap the confirm button
- **Then** the job is created in the system with status "Open"
- **And** I receive a confirmation message with the job ID

### Scenario 3: Admin edits before confirming

- **Given** the system has shown me the parsed job summary
- **When** I reply with a correction like "Change to 3 officers" or "Start time should be 9am"
- **Then** the LLM re-parses the correction and shows an updated summary
- **And** I can confirm or edit again

### Scenario 4: Ambiguous or incomplete input

- **Given** I send a message missing critical info (e.g., "Need officers at Marina Bay tomorrow")
- **When** the LLM cannot extract all required fields
- **Then** the system asks clarifying questions for the missing fields (time, officer count, etc.)
- **And** the conversation continues until all required fields are captured

### Scenario 5: LLM parsing failure

- **Given** I send a message that is not job-related (e.g., "What's the weather?")
- **When** the LLM cannot interpret it as a job request
- **Then** the system responds with a helpful prompt like "I didn't understand that as a job request. Try something like: '2 officers at [site] on [date] from [time] to [time]'"

### Scenario 6: Customer pastes order and AI creates draft job

- **Given** a customer sends a message like "Need 2 officers tomorrow 8am-6pm at ABC Mall, Gate 2"
- **When** the AI detects it as a valid order request
- **Then** the AI immediately acknowledges receipt
- **And** the system creates a structured draft job with parsed fields
- **And** the system either asks for clarification or proceeds according to configured confirmation mode

### Scenario 7: Customer message has high-confidence details

- **Given** the customer message contains all required fields with high confidence
- **When** auto-draft mode is enabled
- **Then** the system creates the draft job without waiting for a human admin
- **And** the job enters fulfilment processing

## UI/UX Notes

- **Input:** Admin can start from plain WhatsApp text or a supported web intake flow — no rigid template required
- **System response (parsed summary):**
  ```
  📋 New Job Summary:
  📍 Site: Marina Bay Tower
  📅 Date: 24 Feb 2026
  ⏰ Time: 08:00 – 18:00
  👥 Officers needed: 2
  📝 Requirements: Uniform required

  ✅ Confirm | ✏️ Edit | ❌ Cancel
  ```
- Confirm/Edit/Cancel can be shown in supported chat actions or equivalent web actions
- Clarifying questions should be clear and stepwise, one at a time
- System should handle typos and shorthand gracefully (e.g., "tmr" = tomorrow, "MBT" = site alias if configured)
- For customer intake, the acknowledgement should make clear that the request is being processed and staffing search is starting

## Edge Cases

- Admin sends multiple job requests in one message → parse and present each separately, or ask admin to send one at a time
- Admin sends job request while a previous confirmation is pending → queue the new request, handle sequentially
- LLM returns different results on retry for same input → always show admin for confirmation, never auto-create
- Very long message with extraneous details → LLM should extract only relevant job fields
- Date ambiguity ("next Friday" when sent on a Friday) → clarify with admin
- Past dates → reject with "This date has already passed. Did you mean [next occurrence]?"

## Dependencies

- GreenAPI WhatsApp integration configured and connected
- LLM service (Gemini/OpenAI) API keys provisioned
- Site registry (list of known sites) for fuzzy matching
- Job data model in PostgreSQL

## Test Scenarios (for QA)

| # | Scenario | Steps | Expected Result |
|---|----------|-------|-----------------|
| 1 | Valid natural language job creation | Send "2 officers at Orchard Tower tomorrow 7am-7pm" → Confirm | Job created with correct details |
| 2 | Missing fields | Send "Need officers at MBS" | System asks for date, time, count |
| 3 | Edit before confirm | Send job → system shows summary → reply "Change to 3 officers" | Updated summary with 3 officers shown |
| 4 | Cancel job creation | Send job → system shows summary → reply "Cancel" | No job created, system acknowledges cancellation |
| 5 | Non-job message | Send "Hello, how are you?" | System responds with helpful prompt |
| 6 | Past date | Send "2 officers at MBS yesterday 8am-6pm" | System rejects with suggestion |
| 7 | Concurrent requests | Send two job messages rapidly | System handles sequentially, no data corruption |
| 8 | Special characters in site name | Send job with site "Block #12-05 @ Jurong" | LLM parses site name correctly |

---

**Created by:** Aira · 2026-02-23
