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

### `medicine-pn-dose-validation` — no extra setup beyond `CO_TOKEN`/`CO_CITIZEN_UUID`

Covers AW-2026-3581: the PN (as-needed) dose confirmation used to fire on
effectively every save regardless of the dose entered, because it compared
the wrong field. Creates its own PN `citizen_medicine` (`max_dose_per_administration: 2`,
`max_daily_dose: 6`) and proves a normal dose (1) saves with no dialog at all,
an over-limit dose (5) raises a dialog naming the real numbers, a non-numeric
dose ("en halv") is rejected inline, and "select all" leaves the PN row
unchecked. Self-restoring.

```bash
CO_TOKEN='<token>' CO_CITIZEN_UUID='<uuid>' npm run test:medicine-pn-dose-validation
```

### `create-report-permission` — also needs a restricted staff token

Covers AW-2026-4255: a staff member without save-and-download rights must
still be able to create a report. Besides `CO_TOKEN` (Admin, used for API
setup/teardown) and `CO_CITIZEN_UUID`, this test needs `CO_STAFF_TOKEN`: a
token for a `User`-role staff member in the same company who has
`create_citizen_document`/`create_citizen_plan` but explicitly **not**
`save_and_download_citizen_document`/`save_and_download_citizen_plan` (the
Birketoften ApS shape from the ticket). Mint it the same way as the superadmin
token above:

```bash
php artisan tinker --execute='
  $admin = App\Models\User::where("email","superadmin@test.com")->first();
  $u = App\Models\User::firstOrCreate(
    ["email" => "e2e-staff@test.com"],
    ["firstname" => "E2E", "lastname" => "Staff", "phone" => "+4500000099",
     "company_id" => $admin->company_id, "language_id" => $admin->language_id,
     "password" => bcrypt("password"), "is_bot" => false, "is_archived" => false]
  );
  if (! $u->hasRole("User")) $u->assignRole("User");
  $u->syncPermissions(["create_citizen_document", "create_citizen_plan"]);
  echo $u->createToken("e2e-staff")->plainTextToken;
'
```

```bash
CO_TOKEN='<admin-token>' CO_STAFF_TOKEN='<staff-token>' CO_CITIZEN_UUID='<uuid>' \
  npm run test:create-report-permission
```

### `task-boards-permission-and-editor` — needs a Manager token, an assignee token, and a tasks-workflow grant

Covers two Task Boards changes: `updateTask` now allows the task's current assignee (not just
its creator or a Manager) to edit it, and boards gained a Deactivate/Reactivate action. Needs
`CO_TOKEN` (a Manager or Admin) and `CO_ASSIGNEE_TOKEN`: a plain `User`-role employee in the same
company, not a Manager, who will be assigned a task they didn't create.

```bash
php artisan tinker --execute='
  $admin = App\Models\User::where("email","dev@awork.dk")->first();
  $u = App\Models\User::firstOrCreate(
    ["email" => "e2e-task-assignee@test.com"],
    ["firstname" => "E2E", "lastname" => "Assignee", "phone" => "+4500000098",
     "company_id" => $admin->company_id, "language_id" => $admin->language_id,
     "password" => bcrypt("password"), "is_bot" => false, "is_archived" => false]
  );
  if (! $u->hasRole("User")) $u->assignRole("User");
  echo $u->createToken("e2e-assignee")->plainTextToken;
'
```

The `/tasks` page is gated by `definePageMeta({ requiredApplication: 'tasks_workflow_enabled' })`
- there's no public API to grant that entitlement, so give the company an active subscription to
the `tasks-workflow` app directly (idempotent - check for an existing active one first):

```bash
php artisan tinker --execute='
  $app = App\Models\Application::where("generic_name","tasks-workflow")->first();
  App\Models\UserSubscription::create([
    "user_id" => null, "company_id" => 1, "invoice_id" => null,
    "license" => "E2E-".Illuminate\Support\Str::upper(Illuminate\Support\Str::random(12)),
    "deal_type" => App\Models\Application::class, "deal_id" => $app->id,
    "type" => "included", "is_active" => 1, "is_taken" => 0,
  ]);
'
```

```bash
CO_TOKEN='<manager-token>' CO_ASSIGNEE_TOKEN='<assignee-token>' \
  npm run test:task-boards-permission-and-editor
```

Note: `/tasks` is a cold-boot SPA route gated on the user's company data, which isn't populated
until the `/api/user` fetch completes. A plain `domcontentloaded` navigation resolves before that
fetch finishes, so the middleware sees a null user and Nuxt renders a misleading client-side
"Page Not Found" instead of the real redirect. The script waits for the specific `/api/user`
response (not `networkidle`, which can hang on the app's persistent Pusher websocket) before
treating any navigation to `/tasks` as safe to continue from.

### `import-employees` — needs a queue worker running and a spare employee license

Covers the "Import employees" bug where imported employees never got a `company_users` row.
Only needs `CO_TOKEN` (an Admin/Manager who can manage employees). The .xlsx fixture it uploads
is built on the fly by shelling out to the backend's own PHP/PhpSpreadsheet (via `php -r`), so it
assumes a sibling `citizenone-backend` checkout next to this repo; override the path with
`CO_BACKEND_PATH` if yours lives elsewhere.

The import (`UserEmployeeImport`) is queued (`QUEUE_CONNECTION=database` in dev) - this script
does not start a queue worker itself, since doing that against the shared dev database is a call
the user should make, not something a test script does silently. Start one in another terminal
before running this test:

```bash
php artisan queue:work --stop-when-empty
```

`UserEmployeeImport` also refuses to create anyone once the company has no unused employee seat
left (`findCompanyEmployeeLicense` in `app/Imports/UserEmployeeImport.php`) - it fails the row
silently (an `ImportReport` marked `failed`, no exception, no employee created) rather than
erroring the request, so a company with 0 spare seats makes this test hang at the "employee
appears in the list" step with no visible error. Give the company an extra spare seat once
(idempotent to check for - see `findCompanyEmployeeLicense`'s join, which requires the
subscription's `user_id` to belong to a user in that company, not just its own `company_id`
column):

```bash
php artisan tinker --execute='
  $admin = App\Models\User::where("email","dev@awork.dk")->first();
  $deal = App\Models\AddOnDeal::where("type","user")->first();
  App\Models\UserSubscription::create([
    "uuid" => (string) Illuminate\Support\Str::uuid(), "user_id" => $admin->id,
    "company_id" => $admin->company_id, "license" => "E2E-".Illuminate\Support\Str::upper(Illuminate\Support\Str::random(12)),
    "deal_type" => App\Models\AddOnDeal::class, "deal_id" => $deal->id,
    "type" => "included", "is_active" => 1, "is_taken" => 0,
  ]);
'
```

```bash
CO_TOKEN='<admin-or-manager-token>' npm run test:import-employees
```
