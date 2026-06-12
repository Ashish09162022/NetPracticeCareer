# Design System Updates

_Started 2026-06-10 07:49 UTC_

---

## User

Make the following changes across four screens. These reflect backend rule changes — keep the existing styling and AA copy rules (2-4 word headings, no em dashes, no exclamations, plain founder voice).

1. CLIENT CONVERSATION — add an end-of-conversation state.
The conversation is one sitting, enforced by the server. When the reply timer reaches zero (or the server returns conversation_ended), the chat input locks and a calm end card appears: "The client had to go. Build with what you've learned." with one button: "Go to build" → the build submission screen. This is not an error — it's a natural meeting-over moment. No alarm styling, no red.

2. ASSESSMENT INTRO — add a third rule.
The rules box currently has two rules (hand-typed replies, deliver on time). Add a third in the same plain tone: "The client chat happens in one sitting. If you leave, the client moves on — you'll build with what you've learned."

3. GAP REPORT — add a "built well but late" variant.
For the case where the student scored above the pass mark but delivered past the hard deadline (capped_by_late), the verdict block changes: headline like "Great build. Late delivery." with a line: "You scored above the bar, but it came in past the deadline — the client moved on. Your path is 50% off; pass the re-assessment on time and you're in." The requirements breakdown below stays exactly the same — only the verdict block differs. It must read as a punctuality miss, not a skill miss.

4. PROFILE INTAKE — duration options.
In the Internship preference section, add "4 months" and "5 months" to the duration select. Final options: 45 days, 2 months, 3 months, 4 months, 5 months, 6 months.

## Assistant

_[tool: list_files]_

Let me explore the project to find these four screens.I'll explore the four target screens to understand the existing patterns before making changes.

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

The Client Conversation screen already has an `endstate` element but no button, and it only triggers on the voluntary "I'm done" flow. I need to add the timer-zero / `conversation_ended` end card with the calm copy + "Go to build" button, and lock the input. Let me read the other three screens in parallel.

_[tool: update_todos]_

All four files are clear. Let me lay out the plan and make the edits.

_[tool: str_replace_edit]_

Now Assessment Intro — change "Two rules" to "Three rules" and add the third rule (em dash removed per AA copy rules):

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

Now Client Conversation — first the endstate HTML, adding ids and a "Go to build" button:Now the CSS — add the neutral icon variant and the `.endcta` button:

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

Now the JS — add `showEnd`/`lockInput`, trigger on timer zero, and route the voluntary flow through it:

_[tool: str_replace_edit]_

Now the Gap Report. First the control segment and scenarios:Now thread the scenario key through `render` and add the `late` verdict branch:

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

Now the `late` action branch and pass the key through `applyScore`:

_[tool: grep]_

Let me re-read the exact current `renderAction` text:

_[tool: str_replace_edit]_

The file stores apostrophes as literal `\u2019` sequences. Let me insert the `late` branch by anchoring on the clean line, and fix `applyScore` separately:

_[tool: grep]_

Let me verify the inserted branch rendered the escapes correctly:

_[tool: update_todos]_

All four edits are in. Let me verify — Gap Report (late variant) and Client Conversation (end card) are the ones with logic worth checking:

_[tool: show_html]_

_[tool: eval_js]_

_[tool: show_html]_

_[tool: eval_js]_

_[tool: save_screenshot]_

Gap Report late variant is perfect. Now Client Conversation end card — let me trigger and screenshot it:

_[tool: save_screenshot]_

_[tool: show_html]_

_[tool: save_screenshot]_

_[tool: get_webview_logs]_

_[tool: done]_

No errors. The logic is verified sound (the timer-zero path calls `showEnd('ended')`, and the Gap Report late variant renders correctly). Let me surface the work and hand off to the verifier.

_[tool: fork_verifier_agent]_

All four backend-rule changes are in, matching the existing styling and AA copy rules (no em dashes, plain founder voice, short headings):

1. **Client Conversation** — when the reply timer hits zero (or `conversation_ended`), the input locks and a calm full-screen card appears: "Conversation ended" / "The client had to go. Build with what you've learned." with a single **Go to build** button → Build Submission. Neutral clock icon, no red. The voluntary "I'm done" path keeps its own copy and now also routes to build.

2. **Assessment Intro** — header now "Three rules"; added the one-sitting rule in the same plain tone (em dash swapped for periods).

3. **Gap Report** — new **93 · late** (`capped_by_late`) variant: verdict reads "Great build. Late delivery." with the punctuality-miss line and 50%-off re-assessment, while the requirements breakdown stays identical to the passing build. Calm warn pill, green score fill — reads as a timing miss, not a skill miss.

4. **Profile Intake** — duration options are now 45 days, 2 months, 3 months, 4 months, 5 months, 6 months.

A verifier is checking all four in the background.

## User

No issues found

## Assistant

The verifier confirmed all four screens pass. The changes are complete and working.

