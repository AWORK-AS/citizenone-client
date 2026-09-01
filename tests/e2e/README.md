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

### `journal-note-notification-scope` — needs two admin tokens with different department opt-ins

Covers the journal notification spam fix: an admin with the generic "Enable system notifications"
profile toggle on used to receive a bell notification for every journal note written anywhere in
the company, not just their own department/house. Needs `CO_TOKEN` (author, used to create the
note and for API teardown), `CO_CITIZEN_UUID` (must belong to a known department - reuse an
existing test citizen and note its department), `CO_OFFDEPT_TOKEN` (an Admin in a *different*
department, with system notifications enabled, not opted into the citizen's department) and
`CO_SAMEDEPT_TOKEN` (an Admin opted into the citizen's department via the notification-department
picker). These two admin fixtures are `firstOrCreate`-idempotent - mint once, reuse across runs:

```bash
php artisan tinker --execute='
  $admin = App\Models\User::where("email","dev@awork.dk")->first();
  $citizen = App\Models\Citizen::where("uuid","<CO_CITIZEN_UUID>")->firstOrFail();
  $citizenDeptId = $citizen->departments()->first()->id;
  $otherDept = App\Models\Department::where("company_id", $admin->company_id)
    ->where("id", "!=", $citizenDeptId)->first()
    ?? App\Models\Department::create(["company_id" => $admin->company_id, "name" => "E2E Off Dept"]);

  $off = App\Models\User::firstOrCreate(
    ["email" => "e2e-notif-offdept@test.com"],
    ["firstname" => "E2E", "lastname" => "OffDept", "phone" => "+4500000097",
     "company_id" => $admin->company_id, "language_id" => $admin->language_id,
     "password" => bcrypt("password"), "is_bot" => false, "is_archived" => false, "is_active" => true,
     "is_email_verified" => true, "system_notifications_enabled" => true]
  );
  if (! $off->hasRole("Admin")) $off->assignRole("Admin");
  $off->departments()->syncWithoutDetaching([$otherDept->id]);

  $same = App\Models\User::firstOrCreate(
    ["email" => "e2e-notif-samedept@test.com"],
    ["firstname" => "E2E", "lastname" => "SameDept", "phone" => "+4500000096",
     "company_id" => $admin->company_id, "language_id" => $admin->language_id,
     "password" => bcrypt("password"), "is_bot" => false, "is_archived" => false, "is_active" => true,
     "is_email_verified" => true, "system_notifications_enabled" => false]
  );
  if (! $same->hasRole("Admin")) $same->assignRole("Admin");
  $same->department_notifications()->syncWithoutDetaching([$citizenDeptId]);

  echo "off: " . $off->createToken("e2e-offdept")->plainTextToken . "\n";
  echo "same: " . $same->createToken("e2e-samedept")->plainTextToken . "\n";
'
```

```bash
CO_TOKEN='<author-token>' CO_CITIZEN_UUID='<uuid>' \
  CO_OFFDEPT_TOKEN='<off-token>' CO_SAMEDEPT_TOKEN='<same-token>' \
  npm run test:journal-note-notification-scope
```

Only the journal note created during the run is deleted by the script (via its own uuid, in a
`finally` block); the two admin fixtures are left in place for reuse on the next run.
