# Mileage log — manual distance correction (backend)

**Apply to `C:\dev\co\backend`. Branch from `main`: `feat/mileage-manual-distance-correction`.**
Not from `feat/mileage-osrm-routing` — that branch is pushed-but-unmerged and ships
independently. When both reach `main`, `recalculateDistance()` conflicts: OSRM changes
what the calculator returns, this change adds an early return above it. Small, one
method, by design. Do not pre-solve it.

The frontend side is on the matching branch in `C:\dev\co\frontend`.

---

## Why

KRAM Consulting reported the mileage log under-reporting distance. Road routing (OSRM)
recovers the road distance for the route **as logged**; it cannot recover route the
employee never logged. Trip 23297 as entered is a two-point A→B worth 10.56 km by OSRM
against 21.3 km actually driven. The missing ~11 km is unrecoverable by any server-side
calculation. A human has to be able to say what was really driven.

`kilometers` is server-authoritative by deliberate design, defended in four code comments
and signed off by Jesper, because it is a **reimbursement record**. This change preserves
that intent: it does not unlock the field. The ordinary save path still ignores any client
`kilometers`. A correction is a separate, deliberate, audited action on its own route,
restricted to Manager/Admin, requiring a written reason, attributed and activity-logged.

### Design decisions, stated once

| Decision | Choice |
|---|---|
| Storage | The override is written **into `kilometers`**; the machine value is snapshotted into a new `kilometers_calculated` column. |
| Audit | `kilometers_override_reason` (**required**, max 255), `kilometers_overridden_by`, `kilometers_overridden_at`, plus a Spatie `activity()` entry. |
| Who | **Manager/Admin only**, any trip in the company, any age. |
| Guard | One early return in `recalculateDistance()`, keyed on `distance_source === MANUAL`. |
| Tenant toggle | **None.** On for everyone. The audit trail is the control, not hiding the button. |
| Backfill | None. Existing rows keep `kilometers_calculated = null`, which correctly means "never overridden". |

**Why the override goes into `kilometers` and not a separate column.** A separate
`kilometers_override` would need `COALESCE` in eight independent readers —
`mileageSummary()`'s two `SUM(citizen_care_hours.kilometers)` raw selects, `PdfService`'s
two `sum('kilometers')` calls, `MileageLogCsvExport`, `CitizenCareHourResource`, plus the
frontend. Miss one and a report's total silently disagrees with the rows printed directly
above it. Writing the human figure into `kilometers` makes every existing reader correct
with **zero changes**. The audit story is preserved by keeping both numbers on the row.

```
kilometers                = 21.30    <- effective; what every reader already reads
kilometers_calculated     = 10.56    <- last server value, frozen at override time
distance_source           = 'manual'
kilometers_override_reason / _by / _at
```

This argument holds because a manager's correction is authoritative and belongs in the
totals immediately. It would **not** hold for an unapproved driver-proposed figure, which
would have to be excluded from totals.

**Why Manager/Admin only.** There is no approval workflow in the mileage log today, and
how mileage reaches payroll varies by customer — we cannot assume a human reads each row
before reimbursing. Restricting corrections to Manager/Admin resolves that without
building one: every override is approved by construction, because a manager made it. A
driver who knows they drove 21.3 km reports it the way the KRAM complaint already arrived
(Slack/verbally) and a manager applies it.

Loosening it later is cheap **because the permission gate is the only thing that changes** —
storage, the guard, the resource, both exports, the PDF and every read path are independent
of who may press the button:

- *Drivers correct their own trips, no approval:* widen one condition in
  `setMileageDistance()` and one `isAtLeast('Manager')` in the frontend. Nothing else.
- *Drivers correct, flagged until a manager confirms (soft approval):* add a
  `REVIEW_REASON_MANUAL_CORRECTION_UNAPPROVED` constant + four translation lines, and set
  `needs_review = true` instead of `false` when the actor is not a manager. It then appears
  in the flagged pill, the summary's "N flagged for review", the CSV review column and the
  PDF flagged count — all of which already exist — and a manager confirming clears the
  flag. This is the natural next step and is genuinely a few hours' work.
- *Hard approval* (a driver's figure does not count until approved) is the one that is
  **not** cheap later: it needs a pending column deliberately excluded from all totals,
  plus an approve/reject flow and a manager queue. Still additive — it would not disturb
  anything built here — but plan it as its own ticket, not a tweak.

**Known gap, not solved here:** a driver has no in-app way to request a correction. If that
becomes the friction point, soft approval above is the answer.

**No plausibility guard, decided deliberately — do not add one later without asking.** A
manual override bypasses every ceiling in `config/mileage.php` (`max_plausible_speed_kmh`,
`max_possible_leg_km`, …) by design: those ceilings exist to discard a *machine* guess, and
this value is a human assertion, which is the higher authority. The column limit is the only
bound. The accepted cost is that a fat-fingered `211.3` for `21.3` reaches the total with
only the audit trail and the manager's own reason behind it. Rejected alternatives: a UI
confirm on a large delta, and a server-side cap relative to the calculated figure — the
latter would have refused the originating KRAM case, where the true distance was ~2× the
calculated one.

**Intervention hours are not touched.** Standing instruction, verbatim: *"the intervention
hours where transport and regular work can be registered, both manually and via check-in
should just stay the same and not be tampered with."* No registration path, form, request
or calculation on that side changes, and the service-layer `is_transportation` gate keeps
the correction endpoint off non-transport rows.

---

## 1. Migration

New file:
`database/migrations/2026_09_14_090000_add_manual_distance_correction_to_citizen_care_hours_table.php`

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('citizen_care_hours', function (Blueprint $table): void {
            // What the server last computed, frozen at the moment a human
            // overrode it. The override itself goes into `kilometers` so every
            // existing reader (two SUM() raw selects in mileageSummary(), two
            // sum('kilometers') calls in PdfService, the CSV export, the API
            // resource, the frontend) stays correct with no COALESCE anywhere -
            // a total that silently disagrees with the rows printed above it is
            // the failure mode this shape exists to prevent.
            //
            // Same decimal(8,2) as `kilometers` itself (see
            // 2026_02_25_071706_update_citizen_care_hours_add_transport_fields).
            // NULL means "never overridden", which is why there is no backfill
            // and no default.
            $table->decimal('kilometers_calculated', 8, 2)->nullable()->after('kilometers');

            // Required at the request layer, not here: existing rows have no
            // reason and must stay valid.
            $table->string('kilometers_override_reason', 255)->nullable()->after('review_reason');

            // nullOnDelete, not cascade: deleting a user must never delete the
            // reimbursement row they corrected. The attribution degrades to
            // "unknown"; the activity() entry still names them.
            $table->foreignId('kilometers_overridden_by')
                ->nullable()
                ->after('kilometers_override_reason')
                ->constrained('users')
                ->nullOnDelete();

            $table->timestamp('kilometers_overridden_at')->nullable()->after('kilometers_overridden_by');
        });
    }

    public function down(): void
    {
        Schema::table('citizen_care_hours', function (Blueprint $table): void {
            // FK first - dropColumn on a constrained column fails otherwise.
            $table->dropForeign(['kilometers_overridden_by']);
            $table->dropColumn([
                'kilometers_calculated',
                'kilometers_override_reason',
                'kilometers_overridden_by',
                'kilometers_overridden_at',
            ]);
        });
    }
};
```

---

## 2. Model — `app/Models/CitizenCareHour.php`

**2a.** Extend the `DISTANCE_SOURCE_MANUAL` docblock (currently at `:17-21`):

```diff
     /**
      * How a trip's kilometers was computed. Written only by
-     * TripDistanceCalculator, except for MANUAL, which is reserved for the
-     * manual-correction feature and is never emitted by the calculator.
+     * TripDistanceCalculator, except for MANUAL, which is never emitted by any
+     * calculator - it is written only by
+     * CitizenCareHourRepository::setManualDistance(), and it is the flag
+     * recalculateDistance() checks to leave a human's figure alone.
      */
```

**2b.** Add the four columns to `$fillable`, after `'review_reason'`:

```diff
         'distance_source',
         'needs_review',
         'review_reason',
+        // Load-bearing, not cosmetic: CompensatoryTimeRequestService:403
+        // restores care hours via restoreFromSnapshot() -> Model::create(), so
+        // a non-fillable column is silently dropped on a comp-time reversal
+        // and an override would simply vanish.
+        'kilometers_calculated',
+        'kilometers_override_reason',
+        'kilometers_overridden_by',
+        'kilometers_overridden_at',
         'start_address',
         'end_address',
     ];
```

**2c.** Casts — add to the `casts()` array:

```diff
             'kilometers' => 'float',
+            'kilometers_calculated' => 'float',
+            'kilometers_overridden_at' => 'datetime',
             'needs_review' => 'boolean',
```

**2d.** Relation + helper — add after `user()`:

```php
    public function overriddenBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'kilometers_overridden_by');
    }

    /**
     * The single question every recompute site asks. Keyed on distance_source
     * rather than on kilometers_calculated being set, so clearing an override
     * (which nulls that snapshot) genuinely reopens the row to recalculation.
     */
    public function hasManualDistance(): bool
    {
        return $this->distance_source === self::DISTANCE_SOURCE_MANUAL;
    }
```

---

## 3. The guard — `CitizenCareHourRepository::recalculateDistance()` (`:238`)

Replace the "Future hook" comment with the real thing, as the **first statement** of the
method:

```diff
     public function recalculateDistance(CitizenCareHour $careHour): void
     {
-        // Future hook for manual correction: a row whose distance_source is
-        // DISTANCE_SOURCE_MANUAL must return here untouched, so a human's
-        // resolution survives every later save. Not implemented yet - nothing
-        // writes that value.
+        // A human's resolution outranks every calculator, present and future.
+        // This is the single exemption point for all five recompute sites
+        // (create, update, checkOut, stopTrip, FinalizeAbandonedMileageTrips)
+        // and it is deliberately keyed on distance_source rather than on which
+        // calculator is configured, so road routing cannot quietly overwrite an
+        // override the first time someone edits the trip.
+        if ($careHour->hasManualDistance()) {
+            return;
+        }
+
         $result = $this->distanceCalculator->calculateForCareHourWithProvenance(
             $careHour->fresh(['stops', 'locationLogs'])
         );
```

Nothing else in the method changes. Because `update()` calls `recalculateDistance()` and
nothing else writes `kilometers`, an overridden row now survives address edits, stop edits,
checkout, trip stop, and the abandoned-trip finalizer.

---

## 4. New repository methods

Add `use App\Models\User;` to the imports at the top of
`app/Repository/CitizenCareHourRepository.php`, then add both methods immediately after
`recalculateDistance()`:

```php
    /**
     * Record a human's assertion of what was actually driven.
     *
     * The figure lands in `kilometers` itself, not in a parallel column: every
     * reader of this row (mileageSummary()'s two raw SUM() selects, PdfService's
     * two sum('kilometers') calls, MileageLogCsvExport, CitizenCareHourResource,
     * the frontend) then stays correct with no COALESCE and no coordination.
     * What the machine computed is not lost - it is frozen into
     * kilometers_calculated, and distance_source = MANUAL is what stops every
     * recompute site from overwriting the correction (see recalculateDistance()).
     */
    public function setManualDistance(string $uuid, float $kilometers, string $reason, User $actor): ?CitizenCareHour
    {
        $careHour = CitizenCareHour::where('uuid', $uuid)->first();

        if (! $careHour) {
            return null;
        }

        $kilometersBefore = $careHour->kilometers !== null ? (float) $careHour->kilometers : null;
        $sourceBefore = $careHour->distance_source;

        // Only on the FIRST override. A second correction must not overwrite the
        // original machine figure with the first correction - that snapshot is
        // the whole audit story, and after two edits it would otherwise read as
        // though the calculator had produced a human's number.
        if ($careHour->kilometers_calculated === null) {
            $careHour->kilometers_calculated = $careHour->kilometers;
        }

        $careHour->kilometers = $kilometers;
        $careHour->distance_source = CitizenCareHour::DISTANCE_SOURCE_MANUAL;
        $careHour->kilometers_override_reason = $reason;
        $careHour->kilometers_overridden_by = $actor->id;
        $careHour->kilometers_overridden_at = Carbon::now();

        // A human resolved it, so the row correctly drops out of flagged_trips
        // in the summary and the PDF. review_reason is deliberately left
        // untouched as the historical record of why it was flagged in the first
        // place - both the list page and the view modal gate that block on
        // needs_review, so the stale reason is invisible but preserved.
        $careHour->needs_review = false;

        $careHour->save();

        activity('mileage_distance_override')
            ->causedBy($actor)
            ->performedOn($careHour)
            ->withProperties([
                'care_hour_id' => $careHour->id,
                'care_hour_uuid' => $careHour->uuid,
                // activity_log has no company column of its own.
                'company_id' => $careHour->company_id,
                'trip_user_id' => $careHour->user_id,
                'kilometers_before' => $kilometersBefore,
                'kilometers_after' => (float) $careHour->kilometers,
                'kilometers_calculated' => $careHour->kilometers_calculated !== null
                    ? (float) $careHour->kilometers_calculated
                    : null,
                'distance_source_before' => $sourceBefore,
                'reason' => $reason,
            ])
            ->log('Manager manually corrected a mileage trip distance');

        return $careHour->fresh(['stops', 'overriddenBy']);
    }

    /**
     * Undo an override and hand the row back to the calculator.
     *
     * kilometers_calculated is nulled along with the audit fields rather than
     * kept: it means "the machine value frozen at override time", and once the
     * row is recalculated there is no override for it to be the counterpart of.
     * Clearing distance_source BEFORE calling recalculateDistance() is what lets
     * that call past the manual guard.
     */
    public function clearManualDistance(string $uuid, User $actor): ?CitizenCareHour
    {
        $careHour = CitizenCareHour::where('uuid', $uuid)->first();

        if (! $careHour) {
            return null;
        }

        $kilometersBefore = $careHour->kilometers !== null ? (float) $careHour->kilometers : null;
        $reasonBefore = $careHour->kilometers_override_reason;

        $careHour->kilometers_calculated = null;
        $careHour->kilometers_override_reason = null;
        $careHour->kilometers_overridden_by = null;
        $careHour->kilometers_overridden_at = null;
        $careHour->distance_source = null;
        $careHour->save();

        // Now passes the guard, and rewrites kilometers, distance_source,
        // needs_review and review_reason from the currently configured
        // calculator - whichever that is by then.
        $this->recalculateDistance($careHour);

        $careHour->refresh();

        activity('mileage_distance_override')
            ->causedBy($actor)
            ->performedOn($careHour)
            ->withProperties([
                'care_hour_id' => $careHour->id,
                'care_hour_uuid' => $careHour->uuid,
                'company_id' => $careHour->company_id,
                'trip_user_id' => $careHour->user_id,
                'kilometers_before' => $kilometersBefore,
                'kilometers_after' => (float) $careHour->kilometers,
                'distance_source_before' => CitizenCareHour::DISTANCE_SOURCE_MANUAL,
                'distance_source_after' => $careHour->distance_source,
                'reason' => $reasonBefore,
            ])
            ->log('Manager reverted a mileage trip to the calculated distance');

        return $careHour->fresh(['stops']);
    }
```

### Interface — `app/Interface/Repository/CitizenCareHourRepositoryInterface.php`

Add below the existing `recalculateDistance` declaration (`:61`):

```php
    /**
     * Write a human's asserted distance into kilometers, snapshot the machine
     * value into kilometers_calculated, and flag the row DISTANCE_SOURCE_MANUAL
     * so recalculateDistance() leaves it alone from then on.
     */
    public function setManualDistance(string $uuid, float $kilometers, string $reason, \App\Models\User $actor): ?\App\Models\CitizenCareHour;

    /**
     * Drop an override and recalculate from the currently configured calculator.
     */
    public function clearManualDistance(string $uuid, \App\Models\User $actor): ?\App\Models\CitizenCareHour;
```

---

## 5. Request — new file `app/Http/Requests/MileageLogDistanceRequest.php`

```php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * The deliberate exception to "kilometers is never read from a client payload".
 *
 * MileageLogStoreRequest and MileageLogUpdateRequest keep that rule verbatim -
 * the ordinary save path still ignores any kilometers a client sends. A
 * correction is a separate, audited action on its own route, which is what keeps
 * the original design intent (kilometers is a reimbursement record, not a free
 * text field) intact while still letting a manager record what was really driven.
 */
class MileageLogDistanceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            // max:9999.99 is the decimal(8,2) column limit, and it is the ONLY
            // bound. A manual override deliberately bypasses every ceiling in
            // config/mileage.php: those exist to discard a machine guess, and
            // this is a human assertion. min:0 allows correcting to zero.
            'kilometers' => ['required', 'numeric', 'min:0', 'max:9999.99'],
            // Required. An unexplained change to a reimbursement figure is
            // exactly what this feature must not make possible.
            'reason' => ['required', 'string', 'max:255'],
        ];
    }
}
```

**`MileageLogStoreRequest` and `MileageLogUpdateRequest` are NOT modified.** Their
"'kilometers' is deliberately NOT a validated field" comments stay verbatim and unchanged.

---

## 6. Routes — `routes/user/authenticated.php`

Inside the existing `mileage-logs` group (~`:865`), after the `PUT /{uuid}` line:

```diff
             Route::put('/{uuid}', [MileageLogController::class, 'update']);
+            // Deliberately not part of the generic update: correcting a
+            // reimbursement figure is its own audited action, with its own
+            // permission gate and its own required reason.
+            Route::put('/{uuid}/distance', [MileageLogController::class, 'setDistance']);
+            Route::delete('/{uuid}/distance', [MileageLogController::class, 'clearDistance']);
             Route::post('/{uuid}/stop', [MileageLogController::class, 'stop']);
```

These do not need to precede `DELETE /{uuid}` the way `/active` and `/start` precede
`GET /{uuid}` — those collide on segment count, these do not. Keeping the two distance
routes together is the readable placement.

---

## 7. Controller — `app/Http/Controllers/Api/User/MileageLogController.php`

Add the import:

```diff
 use App\Http\Controllers\Controller;
+use App\Http\Requests\MileageLogDistanceRequest;
 use App\Http\Requests\MileageLogStartRequest;
```

and the two actions, after `update()`:

```php
    public function setDistance(MileageLogDistanceRequest $request, string $uuid)
    {
        return $this->citizenCareHourService->setMileageDistance($request, $uuid);
    }

    public function clearDistance(string $uuid)
    {
        return $this->citizenCareHourService->clearMileageDistance($uuid);
    }
```

---

## 8. Service — `app/Service/CitizenCareHourService.php`

Add both methods after `updateCitizenCareHour()`:

```php
    public function setMileageDistance(object $payload, string $uuid)
    {
        $user = auth()->user();

        app()->setLocale($user->language->code);

        if (! $user->isAtLeast('Admin') && ! $user->can('update')) {
            return response()->json([
                'message' => trans('exception.invalid_permission.message'),
            ], Response::HTTP_BAD_REQUEST);
        }

        // v1: correcting a reimbursement figure is a manager act, so every
        // override is approved by construction. Widening this is the whole of
        // "let drivers correct their own trips" - nothing else in this feature
        // depends on who is allowed to press the button.
        //
        // Enforced here and not left to the UI: applyEditableFlags() only
        // decorates the response and enforces nothing, and
        // updateCitizenCareHour() has no ownership check at all - so without
        // this line any employee could correct any trip by calling the route
        // directly. Company scoping comes free from the BelongsToCompany global
        // scope.
        if (! $user->isAtLeast('Manager')) {
            return response()->json([
                'message' => trans('exception.invalid_permission.message'),
            ], Response::HTTP_BAD_REQUEST);
        }

        $careHour = $this->citizenCareHourRepository->findByUuid($uuid);

        if (! $careHour) {
            return response()->json([
                'message' => trans('exception.care_hour_not_found.message'),
            ], Response::HTTP_BAD_REQUEST);
        }

        // Mileage only. Intervention hours are under a standing do-not-tamper
        // instruction and this endpoint must never reach a non-transport row.
        if (! $careHour->is_transportation) {
            return response()->json([
                'message' => trans('exception.invalid_permission.message'),
            ], Response::HTTP_BAD_REQUEST);
        }

        // A trip still running has no final distance to correct yet - stopping
        // it would recompute over the override a moment later anyway.
        if ($careHour->trip_started_at !== null) {
            return response()->json([
                'message' => trans('exception.mileage_trip_in_progress.message'),
            ], Response::HTTP_BAD_REQUEST);
        }

        // No 24h is_editable window here: managers were never subject to it, so
        // a historical - possibly already reimbursed - trip can be corrected,
        // which is the originating KRAM case.
        $hour = $this->citizenCareHourRepository->setManualDistance(
            $uuid,
            (float) $payload->kilometers,
            (string) $payload->reason,
            $user
        );

        if ($hour) {
            $this->applyEditableFlags($hour, $user);
        }

        return new CitizenCareHourResource($hour);
    }

    public function clearMileageDistance(string $uuid)
    {
        $user = auth()->user();

        app()->setLocale($user->language->code);

        if (! $user->isAtLeast('Admin') && ! $user->can('update')) {
            return response()->json([
                'message' => trans('exception.invalid_permission.message'),
            ], Response::HTTP_BAD_REQUEST);
        }

        // Same gate as setMileageDistance() - reverting a correction is as much
        // a reimbursement decision as making one.
        if (! $user->isAtLeast('Manager')) {
            return response()->json([
                'message' => trans('exception.invalid_permission.message'),
            ], Response::HTTP_BAD_REQUEST);
        }

        $careHour = $this->citizenCareHourRepository->findByUuid($uuid);

        if (! $careHour) {
            return response()->json([
                'message' => trans('exception.care_hour_not_found.message'),
            ], Response::HTTP_BAD_REQUEST);
        }

        if (! $careHour->is_transportation) {
            return response()->json([
                'message' => trans('exception.invalid_permission.message'),
            ], Response::HTTP_BAD_REQUEST);
        }

        $hour = $this->citizenCareHourRepository->clearManualDistance($uuid, $user);

        if ($hour) {
            $this->applyEditableFlags($hour, $user);
        }

        return new CitizenCareHourResource($hour);
    }
```

### Service interface — `app/Interface/Service/CitizenCareHourServiceInterface.php`

```diff
     public function updateCitizenCareHour(object $payload, string $uuid);

+    public function setMileageDistance(object $payload, string $uuid);
+
+    public function clearMileageDistance(string $uuid);
+
     public function deleteCitizenCareHour(string $uuid);
```

### New translation key — `exception.mileage_trip_in_progress`

Add one entry to `resources/lang/{en,dk,no,sv}/exception.php`, alongside the existing
`mileage_trip_not_active` / `mileage_trip_already_active` entries and **matching whatever
array shape those neighbours use** (nested `['message' => …]` vs. flat
`'…​.message' => …`):

```php
// en
'mileage_trip_in_progress' => ['message' => 'This trip is still in progress - stop it before correcting the distance.'],
// dk
'mileage_trip_in_progress' => ['message' => 'Turen er stadig i gang - stop den, før afstanden rettes.'],
// no
'mileage_trip_in_progress' => ['message' => 'Turen pågår fortsatt - stopp den før avstanden rettes.'],
// sv
'mileage_trip_in_progress' => ['message' => 'Resan pågår fortfarande - stoppa den innan avståndet rättas.'],
```

---

## 9. Resource — `app/Http/Resources/CitizenCareHourResource.php`

Add the import `use App\Models\CitizenCareHour;` and this block immediately after the
existing `review_reason_label` entry:

```php
            // The manual-correction counterpart to the provenance block above.
            // `kilometers` is already the effective (corrected) figure - this is
            // what the machine last computed, kept so a corrected number is
            // never shown without the one it replaced.
            'kilometers_calculated' => $this->kilometers_calculated !== null ? (float) $this->kilometers_calculated : null,
            'is_distance_overridden' => $this->distance_source === CitizenCareHour::DISTANCE_SOURCE_MANUAL,
            'kilometers_override_reason' => $this->kilometers_override_reason,
            'kilometers_overridden_at' => $this->kilometers_overridden_at,
            'kilometers_overridden_by' => new UserResource($this->whenLoaded('overriddenBy')),
```

**Eager-load `overriddenBy` on the single-record path only.** The list endpoints
deliberately avoid extra eager loads (see
`backend/dev-mileage-log-locationlogs-whenloaded-bug.md` in the frontend repo); the list
renders only `is_distance_overridden` and `distance_source_label`, both of which come off
the row itself. So in `CitizenCareHourRepository::findByUuid()`, add `'overriddenBy'` to
the `with([...])` list — and nowhere else.

---

## 10. CSV export — `app/Exports/MileageLogCsvExport.php`

The Source column already prints "Manually corrected" via `distance_source`, so nothing is
needed for correctness. Add the calculated figure and the reason after it.

In `collection()`, after the `distance_source` element and **before** the review marker:

```diff
                 $careHour->distance_source
                     ? trans('mileage.distance_source.'.$careHour->distance_source, [], $language)
                     : '',
+                // Blank rather than 0,00 when the trip was never corrected - a
+                // printed zero reads as "the server computed nothing", which is
+                // a different and false claim.
+                $careHour->kilometers_calculated !== null
+                    ? $this->formatKilometers($careHour->kilometers_calculated, $language)
+                    : '',
+                $careHour->kilometers_override_reason ?? '',
                 $careHour->needs_review ? trans('mileage.export.review_marker', [], $language) : '',
```

In `headings()`:

```diff
         $source = trans('mileage.export.distance_source', [], $language);
         $review = trans('mileage.export.needs_review', [], $language);
+        $calculated = trans('mileage.export.kilometers_calculated', [], $language);
+        $reason = trans('mileage.export.override_reason', [], $language);

         if ($language === 'en') {
-            return ['Employee', 'Citizen', 'Date Time Start', 'Date Time End', 'Start Address', 'End Address', 'Kilometers', $source, $review, 'Note'];
+            return ['Employee', 'Citizen', 'Date Time Start', 'Date Time End', 'Start Address', 'End Address', 'Kilometers', $source, $calculated, $reason, $review, 'Note'];
         }

-        return ['Medarbejder', 'Borger', 'Start dato og tid', 'Slut dato og tid', 'Startadresse', 'Slutadresse', 'Kilometer', $source, $review, 'Bemærkning'];
+        return ['Medarbejder', 'Borger', 'Start dato og tid', 'Slut dato og tid', 'Startadresse', 'Slutadresse', 'Kilometer', $source, $calculated, $reason, $review, 'Bemærkning'];
```

`formatKilometers()` is `private` and already takes `($value, string $language)` — callable
from `collection()` as-is, no signature change.

---

## 11. Translations — `resources/lang/{en,dk,no,sv}/mileage.php`

Two new keys under `export` in each file:

```php
// en
'kilometers_calculated' => 'Calculated km',
'override_reason' => 'Correction reason',

// dk
'kilometers_calculated' => 'Beregnet km',
'override_reason' => 'Årsag til rettelse',

// no
'kilometers_calculated' => 'Beregnet km',
'override_reason' => 'Årsak til retting',

// sv
'kilometers_calculated' => 'Beräknad km',
'override_reason' => 'Orsak till rättelse',
```

`distance_source.manual` already exists in all four locales ("Manually corrected" /
"Manuelt rettet" / "Manuelt rettet" / "Manuellt rättad") — unchanged.

---

## 12. PDF — `resources/views/pdf/care-hours-report.blade.php`

The Source column already prints the manual label in both branches. Add the calculated
figure as small muted text under the Kilometers cell, in **both** the `en` block (`:173`)
and the `da` block (`:335`).

English branch:

```diff
                                     <td style="padding: 6px 4px; text-align: left; color: #374151; font-size: 8px;">
                                         {{ $careHour->kilometers }}
+                                        {{-- The figure a human replaced, kept beside the one that
+                                             counts. $total_kilometers and $employee_totals sum
+                                             `kilometers`, which is already the effective value -
+                                             they need no change. --}}
+                                        @if (!is_null($careHour->kilometers_calculated))
+                                            <div style="color: #9ca3af; font-size: 7px;">
+                                                {{ trans('mileage.export.kilometers_calculated', [], $language) }}: {{ $careHour->kilometers_calculated }}
+                                            </div>
+                                        @endif
                                     </td>
```

Danish branch (note the existing comma-decimal treatment on this side):

```diff
                                     <td style="padding: 6px 4px; text-align: left; color: #374151; font-size: 8px;">
                                         {{ str_replace('.', ',', $careHour->kilometers) }}
+                                        {{-- Se den engelske gren: den beregnede værdi ved siden af
+                                             den, der tæller. Totalerne summerer `kilometers` og
+                                             skal derfor ikke ændres. --}}
+                                        @if (!is_null($careHour->kilometers_calculated))
+                                            <div style="color: #9ca3af; font-size: 7px;">
+                                                {{ trans('mileage.export.kilometers_calculated', [], $language) }}: {{ str_replace('.', ',', $careHour->kilometers_calculated) }}
+                                            </div>
+                                        @endif
                                     </td>
```

`$total_kilometers`, `$employee_totals` and `$flagged_trips` need no change — they sum
`kilometers`, which is the effective value, and an overridden row correctly leaves the
flagged count.

---

## 13. Tests — `tests/Feature/MileageLog/MileageLogTest.php`

Append. These use the file's existing `makeUser()` / `seedTrip()` / `makeCitizen()` helpers
and its existing `Activity` import.

```php
    // ---------------------------------------------------------------------
    // Manual distance correction
    // ---------------------------------------------------------------------

    /**
     * The single behaviour the whole feature rests on: an override must survive
     * every later save, including one that moves the coordinates the calculator
     * would otherwise rescore.
     */
    public function test_manual_override_survives_a_later_update_that_moves_the_route(): void
    {
        $manager = $this->makeUser('Manager', 50);

        $created = $this->actingAs($manager)->postJson('/api/user/mileage-logs', [
            'date_time_start' => now()->toDateTimeString(),
            'geo_start_lat' => 55.6761,
            'geo_start_lng' => 12.5683,
            'geo_end_lat' => 55.6867,
            'geo_end_lng' => 12.5700,
        ])->assertOk();

        $uuid = $created->json('data.uuid');
        $calculated = (float) $created->json('data.kilometers');

        $this->actingAs($manager)->putJson("/api/user/mileage-logs/{$uuid}/distance", [
            'kilometers' => 21.3,
            'reason' => 'Driver reported the odometer reading',
        ])->assertOk();

        $this->actingAs($manager)->putJson("/api/user/mileage-logs/{$uuid}", [
            'geo_end_lat' => 56.1629,
            'geo_end_lng' => 10.2039, // Aarhus - would score far higher
        ])->assertOk();

        $row = CitizenCareHour::where('uuid', $uuid)->first();

        $this->assertEqualsWithDelta(21.3, (float) $row->kilometers, 0.01);
        $this->assertSame(CitizenCareHour::DISTANCE_SOURCE_MANUAL, $row->distance_source);
        $this->assertEqualsWithDelta($calculated, (float) $row->kilometers_calculated, 0.01);
    }

    public function test_manual_override_survives_the_abandoned_trip_finalizer(): void
    {
        $manager = $this->makeUser('Manager', 50);

        $trip = $this->seedTrip([
            'user_id' => $manager->id,
            'trip_started_at' => null,
            'kilometers' => 10,
            'distance_source' => CitizenCareHour::DISTANCE_SOURCE_STRAIGHT_LINE,
            'date_time_start' => now()->subHours(13)->format('Y-m-d H:i:s'),
            'date_time_end' => now()->subHours(13)->format('Y-m-d H:i:s'),
        ]);

        $this->actingAs($manager)->putJson("/api/user/mileage-logs/{$trip->uuid}/distance", [
            'kilometers' => 42.5,
            'reason' => 'Detour via the workshop',
        ])->assertOk();

        // Put it back into the abandoned state the finalizer looks for.
        $trip->refresh();
        $trip->trip_started_at = now()->subHours(13);
        $trip->save();

        CitizenCareHourLocationLog::create([
            'citizen_care_hour_id' => $trip->id,
            'latitude' => 55.6800,
            'longitude' => 12.5690,
            'recorded_at' => now()->subHours(12)->subMinutes(30),
        ]);

        $this->artisan('mileage:finalize-abandoned')->assertSuccessful();

        $trip->refresh();
        $this->assertEqualsWithDelta(42.5, (float) $trip->kilometers, 0.01);
        $this->assertSame(CitizenCareHour::DISTANCE_SOURCE_MANUAL, $trip->distance_source);
    }

    /**
     * A second correction must not overwrite the original machine figure with
     * the first correction - that snapshot is the audit story.
     */
    public function test_a_second_override_keeps_the_original_calculated_value(): void
    {
        $manager = $this->makeUser('Manager', 50);

        $trip = $this->seedTrip([
            'user_id' => $manager->id,
            'kilometers' => 10.56,
            'distance_source' => CitizenCareHour::DISTANCE_SOURCE_STRAIGHT_LINE,
            'date_time_start' => now()->format('Y-m-d H:i:s'),
        ]);

        $this->actingAs($manager)->putJson("/api/user/mileage-logs/{$trip->uuid}/distance", [
            'kilometers' => 21.3,
            'reason' => 'First correction',
        ])->assertOk();

        $this->actingAs($manager)->putJson("/api/user/mileage-logs/{$trip->uuid}/distance", [
            'kilometers' => 23.1,
            'reason' => 'Odometer, not the estimate',
        ])->assertOk();

        $trip->refresh();
        $this->assertEqualsWithDelta(23.1, (float) $trip->kilometers, 0.01);
        $this->assertEqualsWithDelta(10.56, (float) $trip->kilometers_calculated, 0.01);
        $this->assertSame('Odometer, not the estimate', $trip->kilometers_override_reason);
    }

    public function test_clearing_an_override_recalculates_and_nulls_the_audit_fields(): void
    {
        $manager = $this->makeUser('Manager', 50);

        $created = $this->actingAs($manager)->postJson('/api/user/mileage-logs', [
            'date_time_start' => now()->toDateTimeString(),
            'geo_start_lat' => 55.6761,
            'geo_start_lng' => 12.5683,
            'geo_end_lat' => 55.6867,
            'geo_end_lng' => 12.5700,
        ])->assertOk();

        $uuid = $created->json('data.uuid');
        $calculated = (float) $created->json('data.kilometers');

        $this->actingAs($manager)->putJson("/api/user/mileage-logs/{$uuid}/distance", [
            'kilometers' => 21.3,
            'reason' => 'Driver reported the odometer reading',
        ])->assertOk();

        $this->actingAs($manager)->deleteJson("/api/user/mileage-logs/{$uuid}/distance")->assertOk();

        $row = CitizenCareHour::where('uuid', $uuid)->first();

        $this->assertEqualsWithDelta($calculated, (float) $row->kilometers, 0.01);
        $this->assertNotSame(CitizenCareHour::DISTANCE_SOURCE_MANUAL, $row->distance_source);
        $this->assertNull($row->kilometers_calculated);
        $this->assertNull($row->kilometers_override_reason);
        $this->assertNull($row->kilometers_overridden_by);
        $this->assertNull($row->kilometers_overridden_at);
    }

    /**
     * The case most likely to regress when someone later widens the gate without
     * updating the test: the driver's OWN trip, created minutes ago, still
     * inside the 24h is_editable window. v1 rejects it - every override is
     * approved by construction because a manager made it.
     */
    public function test_a_non_manager_cannot_correct_their_own_fresh_trip(): void
    {
        $employee = $this->makeUser('Medarbejder', 20);

        $created = $this->actingAs($employee)->postJson('/api/user/mileage-logs', [
            'date_time_start' => now()->toDateTimeString(),
            'geo_start_lat' => 55.6761,
            'geo_start_lng' => 12.5683,
            'geo_end_lat' => 55.6867,
            'geo_end_lng' => 12.5700,
        ])->assertOk();

        $uuid = $created->json('data.uuid');
        $before = (float) $created->json('data.kilometers');

        $this->actingAs($employee)->putJson("/api/user/mileage-logs/{$uuid}/distance", [
            'kilometers' => 21.3,
            'reason' => 'I know what I drove',
        ])->assertStatus(400);

        $row = CitizenCareHour::where('uuid', $uuid)->first();
        $this->assertEqualsWithDelta($before, (float) $row->kilometers, 0.01);
        $this->assertNotSame(CitizenCareHour::DISTANCE_SOURCE_MANUAL, $row->distance_source);
    }

    public function test_a_non_manager_cannot_correct_someone_elses_trip(): void
    {
        $employee = $this->makeUser('Medarbejder', 20);
        $other = $this->makeUser('Kollega', 20);

        $trip = $this->seedTrip([
            'user_id' => $other->id,
            'kilometers' => 10,
            'date_time_start' => now()->format('Y-m-d H:i:s'),
        ]);

        $this->actingAs($employee)->putJson("/api/user/mileage-logs/{$trip->uuid}/distance", [
            'kilometers' => 21.3,
            'reason' => 'Looks wrong to me',
        ])->assertStatus(400);
    }

    /**
     * Retroactive by design: managers correct historical, possibly already
     * reimbursed trips - that is the originating KRAM case. The 24h is_editable
     * window never applied to managers.
     */
    public function test_a_manager_can_correct_another_employees_three_month_old_trip(): void
    {
        $manager = $this->makeUser('Manager', 50);
        $employee = $this->makeUser('Medarbejder', 20);

        $trip = $this->seedTrip([
            'user_id' => $employee->id,
            'kilometers' => 9.24,
            'distance_source' => CitizenCareHour::DISTANCE_SOURCE_STRAIGHT_LINE,
            'date_time_start' => now()->subMonths(3)->format('Y-m-d H:i:s'),
            'date_time_end' => now()->subMonths(3)->format('Y-m-d H:i:s'),
        ]);
        $trip->created_at = now()->subMonths(3);
        $trip->save();

        $response = $this->actingAs($manager)->putJson("/api/user/mileage-logs/{$trip->uuid}/distance", [
            'kilometers' => 21.3,
            'reason' => 'Odometer 23.1 - 1.8 before the trip started',
        ])->assertOk();

        $this->assertTrue($response->json('data.is_distance_overridden'));
        $this->assertEqualsWithDelta(21.3, (float) $response->json('data.kilometers'), 0.01);
        $this->assertEqualsWithDelta(9.24, (float) $response->json('data.kilometers_calculated'), 0.01);

        $trip->refresh();
        $this->assertSame($manager->id, (int) $trip->kilometers_overridden_by);
        $this->assertNotNull($trip->kilometers_overridden_at);

        $this->assertTrue(
            Activity::where('log_name', 'mileage_distance_override')
                ->where('subject_id', $trip->id)
                ->exists()
        );
    }

    public function test_a_non_transport_care_hour_cannot_be_corrected(): void
    {
        $manager = $this->makeUser('Manager', 50);
        $citizen = $this->makeCitizen();

        $this->actingAs($manager)->postJson("/api/user/citizen-care-hours/{$citizen->uuid}/time-in", [
            'is_transportation' => false,
        ])->assertOk();

        $careHour = CitizenCareHour::where('citizen_id', $citizen->id)->latest('id')->first();

        $this->actingAs($manager)->putJson("/api/user/mileage-logs/{$careHour->uuid}/distance", [
            'kilometers' => 21.3,
            'reason' => 'Should not be possible',
        ])->assertStatus(400);
    }

    public function test_a_correction_without_a_reason_is_rejected(): void
    {
        $manager = $this->makeUser('Manager', 50);

        $trip = $this->seedTrip([
            'user_id' => $manager->id,
            'kilometers' => 10,
            'date_time_start' => now()->format('Y-m-d H:i:s'),
        ]);

        $this->actingAs($manager)->putJson("/api/user/mileage-logs/{$trip->uuid}/distance", [
            'kilometers' => 21.3,
        ])->assertStatus(422);
    }

    /**
     * A human resolved it, so the row leaves flagged_trips - while the corrected
     * figure is what total_kilometers reflects.
     */
    public function test_correcting_a_flagged_row_clears_the_flag_and_moves_the_total(): void
    {
        $manager = $this->makeUser('Manager', 50);

        $trip = $this->seedTrip([
            'user_id' => $manager->id,
            'kilometers' => 5,
            'date_time_start' => now()->format('Y-m-d H:i:s'),
            'distance_source' => CitizenCareHour::DISTANCE_SOURCE_STRAIGHT_LINE,
            'needs_review' => true,
            'review_reason' => CitizenCareHour::REVIEW_REASON_IMPLAUSIBLE_END,
        ]);

        $before = $this->actingAs($manager)->getJson('/api/user/mileage-logs/summary')->assertOk();
        $this->assertEquals(1, $before->json('data.flagged_trips'));

        $this->actingAs($manager)->putJson("/api/user/mileage-logs/{$trip->uuid}/distance", [
            'kilometers' => 21.3,
            'reason' => 'Driver reported the odometer reading',
        ])->assertOk();

        $after = $this->actingAs($manager)->getJson('/api/user/mileage-logs/summary')->assertOk();
        $this->assertEquals(0, $after->json('data.flagged_trips'));
        $this->assertEquals(21.3, $after->json('data.total_kilometers'));

        // review_reason is preserved as the historical record of why it was
        // flagged - invisible behind needs_review, not erased.
        $trip->refresh();
        $this->assertFalse((bool) $trip->needs_review);
        $this->assertSame(CitizenCareHour::REVIEW_REASON_IMPLAUSIBLE_END, $trip->review_reason);
    }
```

---

## Verification after applying

1. `php artisan migrate` — confirm `kilometers_calculated`, `kilometers_override_reason`,
   `kilometers_overridden_by`, `kilometers_overridden_at` exist on `citizen_care_hours`.
2. `php artisan test --filter=MileageLog` — all new and existing cases pass.
3. **The core guard, manually:** create a trip in the UI, note the calculated km and its
   source, correct it to a different figure with a reason, then reopen Edit, change the end
   address to a different city, and save. The distance must still be the corrected figure
   and the source still "Manually corrected". This is the single behaviour the whole
   feature rests on.
4. **Permissions:** as a plain employee, `PUT /api/user/mileage-logs/{uuid}/distance` must
   be rejected when called directly — including on the employee's **own** trip created
   moments ago. Verify with curl or the devtools network tab, not by looking at the button.
5. **Aggregates:** with one corrected trip in the filter range, the summary card's Total km
   must equal the sum of the per-row figures shown beneath it; likewise per-employee totals.
6. **Reports:** CSV and PDF for the same range show "Manually corrected", the calculated
   figure and the reason; totals match the UI.
7. **Flag resolution:** correct a `needs_review` row — the red pill disappears and the
   "N flagged for review" count drops by one, while total km reflects the correction.
8. **The OSRM interaction:** locally merge `feat/mileage-osrm-routing` into a throwaway
   branch on top of this work, reconcile `recalculateDistance()`, and repeat step 3. The
   corrected figure must survive the OSRM recompute. Throw the branch away — this is a
   rehearsal of the eventual merge, not the merge.
