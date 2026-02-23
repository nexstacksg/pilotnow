# PilotNow – Data Model

> TODO: Finalize schema after tech stack decision

## Table of Contents

1. [Entity Relationships](#entity-relationships)
2. [Core Entities](#core-entities)

---

## Entity Relationships

```
Customer ──sends──▶ Job Request
Admin ──creates──▶ Job ──has many──▶ JobAssignment
                    │                    │
                    │                    └──▶ Officer (1 officer = 1 active job)
                    │
                    ├──has many──▶ CheckIn (GPS + photo + timestamp)
                    ├──has one───▶ DOReport (PDF)
                    │                └──▶ Signature (site manager)
                    └──recurs────▶ RecurringSchedule (optional)

Site ──has many──▶ Job
Site ──has config──▶ GPS radius (default 100m)
```

## Core Entities

### Job
| Field | Type | Notes |
|---|---|---|
| id | UUID | |
| site_id | FK → Site | |
| customer_id | FK → Customer | |
| status | enum | draft, active, in_progress, completed, cancelled |
| description | text | Original natural language input |
| parsed_details | jsonb | LLM-parsed structured data |
| shift_count | int | Max 3 |
| start_time | timestamp | |
| end_time | timestamp | |
| photo_reminder_interval | interval | Per job type |
| recurring_schedule_id | FK → RecurringSchedule | nullable |
| created_at | timestamp | |

### JobAssignment
| Field | Type | Notes |
|---|---|---|
| id | UUID | |
| job_id | FK → Job | |
| officer_id | FK → Officer | |
| status | enum | assigned, acknowledged, no_show, completed |
| assigned_at | timestamp | |
| acknowledged_at | timestamp | nullable |

### Officer
| Field | Type | Notes |
|---|---|---|
| id | UUID | |
| name | text | |
| phone | text | WhatsApp number |
| active_job_id | FK → Job | nullable, enforces single-job constraint |
| status | enum | available, on_duty, off_duty |

### CheckIn
| Field | Type | Notes |
|---|---|---|
| id | UUID | |
| job_id | FK → Job | |
| officer_id | FK → Officer | |
| type | enum | check_in, check_out, periodic |
| latitude | decimal | |
| longitude | decimal | |
| gps_accuracy | decimal | meters |
| photo_url | text | |
| timestamp | timestamp | auto |
| validated | boolean | GPS within site radius |

### Site
| Field | Type | Notes |
|---|---|---|
| id | UUID | |
| name | text | |
| address | text | |
| latitude | decimal | |
| longitude | decimal | |
| gps_radius_m | int | default 100 |
| site_manager_name | text | |
| site_manager_phone | text | |

### DOReport
| Field | Type | Notes |
|---|---|---|
| id | UUID | |
| job_id | FK → Job | |
| pdf_url | text | |
| signature_status | enum | pending, signed, expired |
| signature_link | text | one-time URL |
| signature_link_expires_at | timestamp | created_at + 1 hour |
| signed_at | timestamp | nullable |
| signer_mobile | text | verification |
| signer_ic_last4 | text | verification |
| emailed_to | text | finance email |
| emailed_at | timestamp | nullable |
| created_at | timestamp | |

### RecurringSchedule
| Field | Type | Notes |
|---|---|---|
| id | UUID | |
| site_id | FK → Site | |
| day_of_week | int[] | 0=Sun, 1=Mon, etc. |
| start_time | time | |
| end_time | time | |
| shift_count | int | |
| active | boolean | |

### Customer
| Field | Type | Notes |
|---|---|---|
| id | UUID | |
| name | text | Company name |
| contact_name | text | |
| phone | text | |
| email | text | |
| finance_email | text | For DO report delivery |
