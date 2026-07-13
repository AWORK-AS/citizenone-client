# Task 1: "Get data from previous status" button — Testing Guide

## What changed

When creating a new status entry (Treatment, Nursing Professional Record, Use of Force, Incidents, or Plan Notes), the "New status" form now has a **"Get data from previous status"** button at the top. Clicking it fetches the most recent existing status entry for that same treatment/record/case and fills in all of that entry's fields, so staff can use the last entry as a starting point instead of writing from scratch. Nothing happens automatically — the user must click the button.

Files changed:
- `composables/statusPrefill.ts` (new) — fetches the latest `Status` for a `model_uuid` and extracts the requested fields; returns `null` if none exists.
- `composables/alert.ts` — added a `warningAlert` helper (uses the `warn` toast type).
- Each module's `form.vue` — added the button (visible only when `formType === 'create'`) and a `fetchPreviousStatus` emit.
- Each module's `modal-new.vue` — listens for `fetchPreviousStatus`; if a previous status exists, merges its data into the form state, otherwise shows a warning toast ("No previous status found").
- `lang/en.json`, `lang/dk.json`, `lang/no.json`, `lang/sv.json` — added the `getFromPreviousStatus` button label and `alert.noPreviousStatusFound` toast message.

Fields copied per module (all fields the module's form has):
- **Treatment**: `date`, `area_type`, `score`, `status`
- **Nursing Professional Record**: `date`, `area_type`, `problem_status`, `score`, `status`
- **Use of Force**: `title`, `score`, `status` (no date field exists in this form)
- **Incidents**: `title`, `score`, `status` (no date field exists in this form)
- **Plan Notes**: `title`, `score`, `status` (no date field exists in this form)

## Prerequisites

- For each module, a citizen with at least one existing status entry already created (so there's something to pull from).
- A citizen/treatment/record with **no** existing status entries, to test the empty case.

## Test cases

1. **Button appears only in create mode**
   - Open "New status" for any module — the button is visible at the top of the form.
   - Open "Edit" on an existing status — the button should NOT appear (only in create).

2. **Clicking the button pulls in the last entry's data**
   - For each module (Treatment, Nursing Professional Record, Use of Force, Incidents, Plan Notes), open "New status" on an item that already has at least one prior entry.
   - Click "Get data from previous status".
   - Expected: the relevant fields (see list above) populate with the most recent entry's values, including `date` for Treatment and Nursing Professional Record.

3. **No prior status exists**
   - Open "New status" on an item with no existing status entries.
   - Click the button.
   - Expected: a warning toast appears ("No previous status found" / "Ingen tidligere status fundet" etc.), and the form fields remain unchanged (blank).

4. **Editing after prefill**
   - After clicking the button, edit some of the prefilled fields, then save.
   - Expected: the new status saves with the edited values, not the original prefilled ones.

5. **Multiple clicks / switching items without closing the app**
   - Click the button once, edit a field, click it again.
   - Expected: fields are overwritten again with the (same) previous entry's data — this is expected since the button always re-fetches, not a one-time action.

6. **Nursing Professional Record specifically**
   - Confirm both `area_type` and `problem_status` (radio group) populate correctly, since this module has an extra classification field the others don't.

## Out of scope

- No backend changes — the existing `GET /user/statuses` endpoint is reused as-is (ordered by `date`, most recent taken client-side as `data[0]`).
- No auto-fill on modal open — this is an explicit, user-triggered action only.
