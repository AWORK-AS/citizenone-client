# AW-2026-3581 follow-up: PN dose check-off — backend work not covered by the frontend fix

Frontend branch fixed the false-positive confirmation dialog on PN (as-needed)
dose check-off — see the PR for the full writeup. This file lists what's left
that needs a backend change and was explicitly out of scope there. No backend
code was touched to produce this list.

**Update:** items 1 and 2 are now implemented on the backend (verified by
reading the diff — `CitizenMedicineResource` exposes `last_given_at` /
`given_today_total` / `pn_minimum_interval_minutes` via a new
`BuildsPnDosingContext` trait, and `CitizenMedicineHistoryStoreRequest` now
validates `dosage` with `regex:/^\d+(?:[.,]\d+)?$/`, covered by
`tests/Feature/Medicine/PnMedicineDosingContextTest.php`). The frontend has
been updated to consume both: the dead PN badge (item 3) now uses
`last_given_at`/`pn_minimum_interval_minutes` via the new
`composables/medicinePnStatus.ts`, and the confirmation dialog in
`history/form.vue` now appends "given today: X of Y, last given HH:MM" when
those fields are present. Item 4 remains open (frontend-only, a future
ticket).

## 1. Expose PN dosing context on `CitizenMedicineResource`

The new confirmation dialog can now say "the entered dose (5) exceeds the
maximum dose per administration (2)" — but it still can't show the two things
that would make it fully informative for staff: how much of this medicine has
already been given today, and when it was last given. Both are unavailable to
the frontend for PN medicine specifically:

- `CitizenMedicineRepository.php:76-78` and `CitizenMedicineService.php:94`
  both explicitly skip building `dosage_status_by_date` for PN
  (`if ($medicine->is_pn_medicine) { ... }` short-circuits before the
  date-bucketing logic scheduled medicine gets).
- There is no equivalent field at all — no `last_given_at`, no
  `given_today_total`, no effective-interval-remaining value — anywhere on
  the citizen-medicine payload for PN.

Suggested shape: add `last_given_at` (timestamp) and `given_today_total`
(sum of today's registered PN doses) to `CitizenMedicineResource` for PN
medicine, computed the same way `dosage_status_by_date` already aggregates
scheduled doses. That unlocks a fuller dialog message on the frontend
("given today: 3 of 6, last given 14:20") and also fixes item 3 below.

## 2. Server-side numeric validation on the PN dosage field

The frontend now rejects a non-numeric PN dose (`"en halv"`) with an inline
Vuelidate rule before it ever reaches the API. That closes the UI path only —
the API itself still accepts it:

- `CitizenMedicineHistoryStoreRequest.php` has no validation rule for
  `dosage` at all.
- `CitizenMedicineHistoryService.php:392` explicitly skips numeric validation
  for PN: `if (! $isPn && ! is_numeric($payload->dosage))`.
- The repository then casts whatever arrives with
  `(float) str_replace(',', '.', $payload->quantity)`, so a non-numeric value
  silently becomes `0.0` rather than failing — a `curl`/Postman/future-client
  call, or a race with an older cached frontend build, can still write a
  meaningless `0.0` history row.

Suggested fix: add a `numeric` (or a decimal-string regex, to allow comma
decimals) validation rule to `dosage` in
`CitizenMedicineHistoryStoreRequest.php`, and drop the `! $isPn` exemption in
`CitizenMedicineHistoryService.php:392` now that PN dosage is meant to always
be a real number.

## 3. The dead "last given N hours ago, wait N more" PN badge

`pages/citizens/[uuid]/medicine-journals.vue:620-634` (and the mirrored block
in the child-citizen page) reads `medicine?.last_given_minutes_ago` to render
an amber "wait N more hours" warning next to the PN row. That field does not
exist anywhere in the API response today, so this badge has never rendered —
it's dead code, not a working feature that regressed. It also hardcodes the
4-hour window (`240`) three times in the same block instead of reading it
from `PN_MINIMUM_INTERVAL_MINUTES`.

This depends on item 1: once `last_given_at` (or an equivalent
minutes-since-last-dose value) is exposed, the frontend can compute this
badge for real instead of leaving it permanently blank. Worth exposing the
4-hour constant itself in the payload too, rather than the frontend
hardcoding a number that must be kept in sync with the backend's.

## 4. Noted, not requested — the scheduled (non-PN) dose-limit check has the same class of bug

Left untouched on this branch since it was explicitly out of scope, but
flagging so it isn't lost: `validateForm()`'s scheduled branch in
`components/modules/user/citizen/medicine/history/form.vue` sums entered
doses with a bare `parseFloat()` (so `"2,5"` on a comma-decimal locale reads
as `2`, and any blank slot poisons the whole sum to `NaN`), and compares with
`!==` instead of `>` (so entering *less* than the daily max also triggers the
"are you sure?" dialog). No backend change needed for this one — it's a
frontend-only fix for a future ticket — noted here only so the PN fix in this
branch doesn't make it look like the whole confirmation flow was already
audited.
