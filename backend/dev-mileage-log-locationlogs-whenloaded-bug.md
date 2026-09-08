# Backend fix — `location_logs` truthy-ternary bug in CitizenCareHourResource

**Severity: medium.** Not user-facing today, but it causes an N+1 query on
every row of two list endpoints, and it will silently break the mileage-log
map's new breadcrumb rendering (frontend fix landing alongside this doc) if
applied without the sequencing note below.

---

## Problem

`app/Http/Resources/CitizenCareHourResource.php:54-60`:

```php
'location_logs' => $this->whenLoaded('locationLogs')
    ? CitizenCareHourLocationLogResource::collection($this->locationLogs)
    : null,

'stops' => $this->whenLoaded('stops')
    ? CitizenCareHourStopResource::collection($this->stops)
    : null,
```

`whenLoaded('relation')` (single-argument form) returns either the loaded
`Collection` or a `MissingValue` instance when the relation isn't loaded —
both are PHP objects, and objects are always truthy in a ternary. So
`$this->whenLoaded('locationLogs') ? A : null` **always evaluates to `A`**,
regardless of whether `locationLogs` was actually eager-loaded. The `: null`
branch is dead code.

Effect: `GET /user/mileage-logs` and `GET /user/mileage-logs/employee/{uuid}`
(`CitizenCareHourRepository::findAll`, `:67-72`, and `findByEmployee`,
`:116-121`) intentionally don't eager-load `locationLogs` — a table row
doesn't need it. But because of this bug, line 55 still accesses
`$this->locationLogs` directly, which triggers Eloquent's lazy-load: **one
extra query per row**, and the (possibly large — one local trip carries 129
breadcrumbs) collection gets serialized into every list response instead of
being omitted.

`stops` has the identical pattern at lines 58-60. It's harmless today only
because every current call site (`findAll`, `findByEmployee`, `findByUuid`,
and the create/update paths) happens to eager-load `stops` — but it has the
same latent bug if any call site ever drops it from its eager-load list.

## Fix

```php
// BEFORE
'location_logs' => $this->whenLoaded('locationLogs')
    ? CitizenCareHourLocationLogResource::collection($this->locationLogs)
    : null,

// AFTER
'location_logs' => CitizenCareHourLocationLogResource::collection($this->whenLoaded('locationLogs')),
```

Passing `whenLoaded()`'s result (a `Collection` or `MissingValue`) straight
into `::collection()` is the correct pattern — Laravel's resource-collection
machinery (`ConditionallyLoadsAttributes::removeMissingValues()`) drops the
key entirely when it receives a `MissingValue`, and serializes normally
otherwise. Apply the same change to `stops` at lines 58-60.

## ⚠️ Sequencing constraint — read before applying

**This fix removes `location_logs` from both list responses entirely.**

The mileage-log detail modal (frontend) is fed the *list row* by all three of
its consumers, with no separate detail fetch — until now. Alongside this
write-up, the frontend has added a fetch of `GET /user/mileage-logs/{uuid}`
(which already eager-loads `locationLogs`, `CitizenCareHourRepository::
findByUuid:159-169`) when the modal opens, specifically so it no longer
depends on the list response carrying breadcrumbs.

**Do not deploy this fix before that frontend change ships** (it's part of
the same PR/branch), or the modal will lose its only current source of
`location_logs` and the map will silently revert to a straight line with
nothing to indicate why.

## Also worth doing while touching this relation — ordering

`CitizenCareHour::locationLogs()` (`app/Models/CitizenCareHour.php:69-72`)
orders the relation by `created_at` alone:

```php
public function locationLogs(): HasMany
{
    return $this->hasMany(CitizenCareHourLocationLog::class)->orderBy('created_at', 'asc');
}
```

`TripDistanceCalculator::calculateForCareHour()` (`:12-19`) orders by
`COALESCE(recorded_at, created_at) asc` instead, specifically because a
batch-flushed backlog of breadcrumbs lands with near-identical `created_at`
values (confirmed locally: one trip holds 129 rows across only 5 distinct
`created_at` timestamps). The relation's default order can diverge from the
order the distance was actually computed in.

The frontend re-sorts `location_logs` client-side by
`recorded_at ?? created_at` regardless, so it's correct either way — but the
API's own ordering isn't currently authoritative for anything else that reads
this relation directly. Recommend:

```php
public function locationLogs(): HasMany
{
    return $this->hasMany(CitizenCareHourLocationLog::class)
        ->orderByRaw('COALESCE(recorded_at, created_at) asc');
}
```

Grep `locationLogs` across `app/` before changing it — it's a shared relation
default, not scoped to the mileage-log feature.

## Cross-reference

`backend/dev-mileage-breadcrumbs-recorded-at-format.md` (already in this repo,
not yet applied) documents that both breadcrumb write endpoints currently
reject the ISO 8601 timestamps both clients send, so GPS breadcrumbs are
essentially never persisted in production today. That fix and this one are
independent and can ship in either order — but until the validation fix
lands, this fix (and the frontend map change) has very little live data to
act on yet. Still correct to land now so it's ready the moment breadcrumbs
start flowing again.

## Verification

1. Apply the fix. Confirm `GET /user/mileage-logs` no longer issues one extra
   query per row for `locationLogs` (check the query log / debugbar) and that
   list rows no longer carry a `location_logs` key.
2. Confirm `GET /user/mileage-logs/{uuid}` is unaffected — `locationLogs` is
   eager-loaded there, so the key still serializes as before.
3. If the `orderByRaw` change is also applied: for a trip with a
   batch-flushed backlog (e.g. locally, care-hour `22936`), confirm
   `location_logs` in the detail response is now already in
   `recorded_at`-ascending order.
