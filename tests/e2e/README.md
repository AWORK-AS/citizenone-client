# Browser E2E tests

Standalone Playwright tests that drive the real SPA in headless Chrome. Isolated
from the app's dependencies (own `package.json`) and uses the **system Chrome**
(`channel: 'chrome'`), so no browser binaries are downloaded.

## Prerequisites

- The local dev stack running (client on `:3001`, API on `:8001`).
- Google Chrome installed on the host.
- Node 18+ (for global `fetch`).

## Install (once)

```bash
cd tests/e2e
PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 npm install
```

## Authenticate

The tests skip the login form by injecting a Sanctum token into `localStorage`.
Mint one for a superadmin from the backend container:

```bash
docker exec citizenone-backend php artisan tinker --execute='
  $u = App\Models\User::where("email","superadmin@test.com")->first();
  echo $u->createToken("e2e")->plainTextToken;
'
```

## Run

```bash
cd tests/e2e
CO_TOKEN='<paste-token>' npm run test:email-templates
```

Optional env: `CO_BASE_URL` (default `http://localhost:3001`),
`CO_API_URL` (default `http://localhost:8001`).

Screenshots are written to `tests/e2e/screenshots/`. The email-templates test is
self-restoring (the one template it edits is reset via the API at the end).

### `compensatory-time-toggle` — needs an Employee token and an existing future shift

Covers task-478: the compensatory-time request feature was changed from a purchasable
"app" entitlement to a plain on/off toggle under Settings > Company > "Vagtplan &
arbejdstid". Needs `CO_TOKEN` (Admin, to flip the company toggle and approve requests)
plus two more required env vars:

- `CO_EMPLOYEE_TOKEN`: a plain `User`-role employee in the same company, with **exactly
  one** compensatory-time account assigned (so the request modal auto-selects it instead
  of requiring a dropdown pick).
- `CO_SCHEDULE_UUID`: an existing **future**, non-leave shift belonging to that employee,
  with no pending compensatory-time request already on it. Mint both in one pass:

```bash
php artisan tinker --execute='
  $admin = App\Models\User::where("email","dev@awork.dk")->first();
  $employee = App\Models\User::firstOrCreate(
    ["email" => "e2e-comp-time@test.com"],
    ["firstname" => "E2E", "lastname" => "CompTime", "phone" => "+4500000096",
     "company_id" => $admin->company_id, "language_id" => $admin->language_id,
     "password" => bcrypt("password"), "is_bot" => false, "is_archived" => false]
  );
  if (! $employee->hasRole("User")) $employee->assignRole("User");

  $account = App\Models\TimeAccount::where("company_id", $admin->company_id)->first();
  $account->targetUsers()->syncWithoutDetaching([$employee->id]);

  $shiftType = App\Models\ShiftType::firstWhere(["company_id" => $admin->company_id, "system_name" => "regular-shift"])
      ?? App\Models\ShiftType::where("company_id", $admin->company_id)->where("is_leave_shift_type", false)->first();

  $start = now()->addWeek()->setTime(5, 5);
  $schedule = new App\Models\Schedule;
  $schedule->user_id = $employee->id;
  $schedule->shift_type_id = $shiftType->id;
  $schedule->date = $start->toDateString();
  $schedule->date_time_start = $start;
  $schedule->date_time_end = $start->copy()->addHours(8);
  $schedule->save();

  echo "CO_EMPLOYEE_TOKEN=".$employee->createToken("e2e-comp-time")->plainTextToken."\n";
  echo "CO_SCHEDULE_UUID=".$schedule->uuid."\n";
'
```

The `05:05` start time is deliberately distinctive - the script locates the shift block
on `/schedules` by matching that exact "HH:mm" text within the employee's row, so picking
an off-hours time avoids colliding with a normal 08:00-17:00 shift elsewhere in the same
row/week.

```bash
CO_TOKEN='<admin-token>' CO_EMPLOYEE_TOKEN='<employee-token>' CO_SCHEDULE_UUID='<schedule-uuid>' \
  npm run test:compensatory-time-toggle
```

The script is self-restoring: it reverses the compensatory-time request it creates and
restores the company's toggle to whatever value it found at the start, so it can be
re-run against the same fixture shift repeatedly.
