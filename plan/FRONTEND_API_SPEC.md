# NetPracticeCareer Backend — Frontend Integration Spec

**Audience:** frontend developer wiring the existing HTML screens to the live API.
**Live contract:** the running server's OpenAPI schema at **`/api/docs`** (Swagger UI) and `/api/schema` (YAML) is the exact source of truth. This document explains the flows, shapes, and rules around it.

---

## 1. Conventions

- **Base path:** everything is under `/api/v1` (e.g. `POST /api/v1/auth/otp/request`). Paths below omit the prefix.
- **Auth:** JWT in `Authorization: Bearer <token>`, obtained from `/auth/otp/verify`. Token lives ~30 days; there is no refresh flow. **Any `401` → clear the token and route to Login.**
- **Format:** JSON in/out. Timestamps are ISO 8601 UTC (`2026-06-10T10:00:00Z`). Money is integer rupees. All IDs are UUID strings.
- **Errors:** every error body is

  ```json
  { "error": { "code": "stable_code", "message": "Human-readable text" } }
  ```

  Branch on `code`, show `message` (or your own copy). Validation errors include a `fields` object.

### Error codes you must handle

| code | HTTP | meaning / what the UI should do |
|---|---|---|
| `otp_invalid` | 400 | wrong/expired-attempts OTP — show inline error |
| `otp_expired` | 400 | OTP too old — offer resend |
| `unauthorized` | 401 | missing/expired token — go to Login |
| `forbidden` | 403 | not your resource / not staff |
| `not_found` | 404 | bad id, or "no active attempt" / "not in pool yet" (see endpoint notes) |
| `validation_error` | 400/429 | bad input; 429 = OTP rate limit ("try again later") |
| `gate_incomplete` | 403 | profile sections 1+2 not done — route to Profile Intake |
| `attempt_in_progress` | 409 | a graded attempt is already active — route to `/assessment/current` |
| `conversation_ended` | 409 | turn window lapsed — switch to the build phase (response includes the deadlines) |
| `already_submitted` | 409 | attempt is past that action |
| `path_locked` | 403 | paid-path endpoint without payment — route to Paywall |
| `not_payable` | 409 | tried to pay for a `ready` grade |
| `already_paid` | 409 | path already unlocked |
| `no_unseen_brief` | 409 | re-assessment: brief library exhausted — show "no new scenarios right now" |
| `already_responded` | 409 | company accept/pass already actioned (or an interview is already booked) |
| `module_locked` | 409 | build-path module attempted out of order |

### Business constants (server-owned; returned in responses where relevant)

Pass mark **90** · scholarship floor **70** · scholarship **50% → ₹2500** · full price **₹5000** · delivery soft/hard **48h / 72h** · conversation turn **90s** (+30s hidden network grace, server-enforced).

---

## 2. Auth — Login screen

**POST `/auth/otp/request`** `{ "phone": "+919876543210" }` → `{ "sent": true }`
Real SMS via MSG91. Rate-limited per phone and per IP (429 on excess). Resend = call again.

**POST `/auth/otp/verify`** `{ "phone": "...", "otp": "123456" }` →

```json
{ "token": "jwt...", "is_new": true, "profile_gate_complete": false }
```

Store `token`. Route: `profile_gate_complete=false` → Profile Intake; `true` → Home.

---

## 3. Profile — Profile Intake screen

**GET `/profile`** → all fields for edit mode:

```json
{
  "name": "...", "email": "...", "college": "...", "graduation_year": 2026, "stream": "CS",
  "start_date": "2026-06-20", "duration": "2mo", "current_city": "Bhilai",
  "internship_city": "Raipur", "internship_field": "AI Web Development",
  "ready_to_relocate": true,
  "resume_url": null, "github_url": null, "linkedin_url": null, "project_links": [],
  "section3_complete": false, "completeness_pct": 80, "is_available": true
}
```

**PUT `/profile/section1`** `{ name, email, college, graduation_year, stream }` → `{ "section1_complete": true }`

**PUT `/profile/section2`** `{ start_date, duration, current_city, ready_to_relocate }` →
`{ "section2_complete": true, "is_available": true, "gate_complete": true }`
`duration` must be one of `45d | 2mo | 3mo | 4mo | 5mo | 6mo` (map your display labels to these codes). `internship_city`/`internship_field` are server-set; don't send them. `is_available:true` drives the "you're now available" toast; `gate_complete:true` → proceed to Home.

**POST `/profile/resume`** — multipart, file field name **`file`** (≤10 MB) → `{ "resume_url": "https://..." }`. Then include that URL in section 3.

**PUT `/profile/section3`** `{ resume_url?, github_url?, linkedin_url?, project_links? (≤3 URLs) }` → `{ "section3_complete": true }`
"Skip for now" = simply don't call this.

**`completeness_pct` is weighted 40 / 40 / 20** by section (gate-complete student = 80%, section 3 done = 100%) — matches the template's bar.

---

## 4. Home screen

**GET `/home`** — drives the whole hub:

```json
{
  "stage": "assessment_pending",
  "next_action": { "label": "Take your assessment", "route": "assessment_intro" },
  "is_available": true,
  "section3_complete": false,
  "completeness_pct": 80,
  "path_state": { "current": "assessment", "passed": false, "in_paid_path": false }
}
```

- `stage` ∈ `gate_incomplete | assessment_pending | in_paid_path | ready_pending_profile | pool | matched | interview_scheduled | confirmed`.
- `next_action.route` ∈ `profile_gate | assessment_intro | assessment_current | build_submission | grading_in_progress | paywall | buildpath | profile_section3 | status_tracker | companies`. Map each to your screen.
- `path_state.current` ∈ `assessment | paid_path | placement`.

**PUT `/availability`** `{ "is_available": false }` → `{ "is_available": false }` (the header pill toggle).

---

## 5. Assessment flow

### Assessment Intro → start

**POST `/assessment/start`** (body `{}` or `{ "is_reassessment": true }` from the paid path) →

```json
{
  "attempt_id": "uuid",
  "brief": { "persona_name": "Dr. Mehta", "persona_role": "Dental clinic owner",
             "opening_message": "...", "deadline_hours": 48 },
  "turn_seconds": 90
}
```

Render `opening_message` as the client's first chat bubble. Use `turn_seconds` for the countdown — don't hardcode 90.
Errors: `attempt_in_progress` (route to current attempt), `gate_incomplete`, `path_locked`/`no_unseen_brief` (re-assessment only).

### Client Conversation screen

**POST `/assessment/{attempt_id}/message`** `{ "text": "...", "response_seconds": 22, "paste_attempts": 0 }` → `{ "reply": "..." }`
`response_seconds`/`paste_attempts` are telemetry — send them, nothing gates on them.

**The one-sitting rule is server-enforced.** If a message arrives too late (per-turn window measured server-side), you get **409 `conversation_ended`** and the error object also carries `build_clock_start`, `deadline_soft`, `deadline_hard` — transition to the build phase with "The client had to go — build with what you've learned." The client-side timer is a UX mirror; the server decides.

**POST `/assessment/{attempt_id}/finish`** ("I'm done — go build") →

```json
{ "build_clock_start": "...Z", "deadline_soft": "...Z", "deadline_hard": "...Z" }
```

Drive the delivery countdown from these (48h soft / 72h hard).

### Resume support

**GET `/assessment/current`** → the active attempt, or 404 if none.

```json
{ "attempt_id": "uuid", "status": "building", "is_reassessment": false,
  "brief": { ... }, "build_clock_start": "...Z", "deadline_soft": "...Z", "deadline_hard": "...Z",
  "turn_seconds": 90,          // only while in_conversation
  "submission_id": "uuid"      // only when status = submitted
}
```

`status` ∈ `in_conversation | building | submitted`. A lapsed conversation auto-finishes into `building` here. Route: `in_conversation` → chat, `building` → Build Submission, `submitted` → Grading In Progress.

### Build Submission screen

**POST `/assessment/{attempt_id}/submit`** `{ "repo_url": "...", "deploy_url": "...", "notes": "" }` → **202** `{ "submission_id": "uuid", "status": "grading" }`

**Late submission is allowed — there is no cutoff.** Past 48h it's "grace"; past 72h it grades in the `refused` zone (can never be Ready, regardless of score) but is still accepted and scored. Your three deadline states (on time / late-grace / past) are all submittable. Double-submit safely returns the same `submission_id`.

### Grading In Progress screen

**GET `/grade/{submission_id}`** — poll every 2–3s.
While grading: `200 { "status": "grading" }` (no other fields). Real grading takes ~30–90s. When done, the full object arrives (no `status` field) → go to Gap Report.

### Gap Report screen

Full grade object:

```json
{
  "grade_id": "uuid", "submission_id": "uuid",
  "brief_title": "General-store stock register",
  "persona_name": "Suresh", "persona_role": "General store owner",
  "score": 78,
  "outcome": "scholarship",            // ready | scholarship | full_price
  "capped_by_late": false,             // true = scored 90+ but delivered past 72h
  "verdict": "Almost there",           // "Ready for the pool" | "Built well, but late" | "Almost there" | "Not yet"
  "delivery_zone": "grace",            // on_time | grace | refused
  "hours_late": 6.2, "on_time": true,  // on_time is false ONLY for refused
  "requirements_met": 5, "requirements_partial": 1, "requirements_missing": 2,
  "items": [
    { "requirement_id": "low_stock", "status": "missing", "reason": "..." }
    // status ∈ met | partial | missing | unverifiable  ← note the 4th value
  ],
  "biggest_gap": { "requirement_id": "low_stock", "reason": "..." },
  "extraction":    { "score": "Needs work", "notes": ["...", "..."] },
  "communication": { "score": "Good",       "notes": ["..."] },
  "scholarship_pct": 50, "price": 2500, "full_price": 5000,
  "summary": "..."
}
```

- Dimension `score` labels: `Excellent | Good | Needs work | Weak`.
- `items[].status` includes **`unverifiable`** (grader couldn't confirm, e.g. email sending) — render it distinctly (e.g. grey "couldn't verify"); don't lump into missing.
- CTA routing: `outcome=ready` → pool flow (section 3 if `section3_complete=false`); otherwise → Paywall. Use `capped_by_late` for the "built well, but late" framing.

---

## 6. Payment — Paywall screen

Price comes from the grade object (`price`, `full_price`, `scholarship_pct`) — never compute it client-side.

1. **POST `/payment/order`** `{ "grade_id": "uuid" }` → `{ "razorpay_order_id": "order_xxx", "amount": 2500, "currency": "INR" }`
   Errors: `not_payable` (ready grade), `already_paid`.
2. Open Razorpay Checkout with that `order_id`/`amount`.
3. On checkout success: **POST `/payment/verify`** `{ razorpay_order_id, razorpay_payment_id, razorpay_signature }` → `{ "status": "paid", "paid_path_unlocked": true }` → unlock Guided Build Path.

The server also receives Razorpay's webhook independently, so a lost callback still unlocks the path — if `verify` fails due to a network blip, re-check `/home` (`path_state.in_paid_path`). Unlock is per-student and permanent; re-assessments are free.

---

## 7. Paid path

All of §7 requires an unlocked path; otherwise **403 `path_locked`** → Paywall.

### Guided Build Path screen

**GET `/buildpath`** →

```json
{
  "completeness_pct": 38, "steps_done": 3, "steps_total": 8,
  "modules": [
    { "id": "uuid", "order": 1, "title": "Gather requirements", "description": "...",
      "est_minutes": 18, "type": "read", "resource_url": null,
      "status": "done", "locked": false }
  ]
}
```

- `type` ∈ `read | video_task | project | checklist`.
- `status` ∈ `not_started | in_progress | done` (the student's own progress).
- **`locked`** — modules unlock sequentially; render locked state and don't allow updates. **PUT on a locked module returns 409 `module_locked`.**

**PUT `/buildpath/{module_id}`** `{ "status": "done" }` → `{ "id": "uuid", "status": "done" }`

### Coaching Practice screen

**POST `/coaching/start`** → `{ "attempt_id": "uuid", "persona_name": "Sunil Kumar", "persona_role": "Hardware store owner", "opening_message": "..." }`
"New scenario" = call it again (unlimited, ungraded).

**POST `/coaching/{attempt_id}/message`** `{ "text": "..." }` →

```json
{ "reply": "Mostly hardware and paint.",
  "coaching_feedback": { "good": "Clear opener.", "miss": "Didn't ask how he tracks stock.", "tip": "Try: how do you know when to reorder?" } }
```

Keys are **`good` / `miss` / `tip`** (any may be null; `coaching_feedback` itself can occasionally be null — hide the panel then). No turn timer in practice mode.
Coaching attempt ids only work on `/coaching/*`, graded ids only on `/assessment/*` — crossed calls 404.

### Re-assessment Intro screen

**POST `/assessment/start`** with `{ "is_reassessment": true }` → same flow as §5, always a brief the student hasn't seen. `no_unseen_brief` → graceful "no new scenarios right now".

---

## 8. Placement

### Status Tracker screen

**GET `/status`** → 404 (`not_found`) until the student reaches the pool.

```json
{
  "stage": "interview_scheduled",      // pool | matched | interview_scheduled | confirmed
  "interview_at": null,                 // null until the admin sets the time → show "interview being scheduled"
  "interview_with": {                   // null unless an interview is booked/confirmed
    "id": "uuid", "company_name": "Sharda Tech Solutions", "role": "Junior Web Developer",
    "mode": "Hybrid", "stipend": "₹15k / mo", "duration": "6 months", "area": "Pandri"
  },
  "history": [ { "stage": "pool", "at": "...Z" }, { "stage": "matched", "at": "...Z" } ]
}
```

### Companies Want You screen

**GET `/companies`** →

```json
{
  "interests": [
    { "id": "uuid", "company_name": "Raipur Tiffin Co.", "role": "Frontend intern",
      "mode": "Remote", "stipend": "₹15k / mo", "duration": "6 months",
      "description": "Local meal-delivery startup", "pitch": "Saw your meal-ordering build",
      "area": "Telibandha", "picked": "yesterday", "picked_at": "...Z",
      "lat": 21.25, "lng": 81.63 }
  ],
  "more_count": 2
}
```

Max 3 cards at a time; `more_count` is the backlog. Only not-yet-actioned companies appear here (the accepted one moves to `/status.interview_with`).

**POST `/companies/{id}/accept`** → `{ "state": "interview_booked", "interview_at": null }`
Also re-confirms the student's availability server-side. `already_responded` if this card was actioned or another interview is already booked.

**POST `/companies/{id}/pass`** `{ "reason": "stipend" }` (optional, free text) → `{ "state": "student_passed" }` — student stays in the pool.

### Map View

Frontend-only for now. If you plot anything, use the `lat`/`lng` in `/companies` (the student's own interests) — there is **no** browse-all-openings endpoint.

---

## 9. Frontend-fired events

**POST `/events`** `{ "type": "paywall_shown", "payload": {} }` → `{ "logged": true }`
Only `paywall_shown` (fire on Paywall view) and `company_interest_shown` (fire on Companies Want You view) are accepted; anything else is rejected. All other metrics are logged server-side.

---

## 10. Admin screens (staff only)

Admin endpoints use Django **session auth** (log in at `/django-admin/` first) and require a staff account — student JWTs get 403.

**GET `/admin/review-queue`** (optionally `?status=all`; default = pending only) → `{ "queue": [ ... ] }`, each row carrying everything the review screen renders:
`grade_id, student_id, student_name, brief_title, is_reassessment, score, outcome, capped_by_late, delivery_zone, hours_late, on_time, deploy_check (ok|failed|unreachable|skipped), needs_review, is_available, submitted_at, decided_at, summary, build { requirements_met/partial/missing, items[] }, extraction { score, notes }, communication { score, notes }, biggest_gap, source, reviewer, human_override`.

**POST `/admin/grade/{id}/confirm`** `{ "override": null }` or `{ "override": { "outcome": "ready" | "scholarship" | "full_price", "note": "..." } }`
(Template's pass/border/fail map to ready/scholarship/full_price.) The override becomes the final outcome everywhere (routing, price, gap report).

**POST `/admin/company-interest`** `{ student_id, company_name, role, mode (onsite|remote|hybrid), stipend?, duration?, description?, pitch?, area?, lat?, lng? }` → moves the student to `matched`.

---

## 11. Differences from the original spec (already decided — build to THIS doc)

1. `completeness_pct` is **40/40/20**, not thirds.
2. Coaching feedback keys are **`good`/`miss`/`tip`** (was `good`/`missed`/`better`).
3. Build-path modules are **sequentially locked** (`locked` flag, `module_locked` error) and include a `read` type.
4. **Late submission is allowed past 72h** — graded in the `refused` zone, never Ready; no "expired, cannot submit" state in the submit UI.
5. Grade items have a 4th status, **`unverifiable`** — needs a rendering.
6. `/status` includes `interview_with`; `/grade` includes `brief_title`/persona; company cards include `description`/`pitch`/`area`.
7. Map View ships frontend-only (no openings endpoint).
