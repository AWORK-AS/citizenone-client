# Stripe Integration Guide — Frontend (CitizenOne)

This guide explains the full Stripe frontend integration: how payment flows work, which components and services are involved, how the invoice overview works, and how to set everything up correctly.

---

## Table of Contents

1. [Account Architecture — Platform vs Connect](#1-account-architecture--platform-vs-connect)
2. [Before You Start](#2-before-you-start)
3. [Environment Variables](#3-environment-variables)
4. [Test Mode vs Live Mode](#4-test-mode-vs-live-mode)
5. [Payment Routing — How It Works](#5-payment-routing--how-it-works)
6. [Payment Flows](#6-payment-flows)
7. [Invoice Overview (Fakturaer)](#7-invoice-overview-fakturaer)
8. [Opret Faktura — Create Invoice Modal](#8-opret-faktura--create-invoice-modal)
9. [Stripe Connect Panel](#9-stripe-connect-panel)
10. [File Structure](#10-file-structure)
11. [API Service (stripeApi.ts)](#11-api-service-stripeapits)
12. [Components](#12-components)
13. [Sending Invoices and Receipts via Email](#13-sending-invoices-and-receipts-via-email)
14. [Typical User Journeys](#14-typical-user-journeys)
15. [Troubleshooting](#15-troubleshooting)
16. [Where Stripe Appears in the App](#16-where-stripe-appears-in-the-app)

---

## 1. Account Architecture — Platform vs Connect

CitizenOne uses two types of Stripe accounts:

### CitizenOne (Platform Account)
- The main CitizenOne Stripe account, configured via the backend `STRIPE_SECRET_KEY`.
- CitizenOne admin users have **no** Stripe Connect account connected to their company.
- All invoices from CitizenOne and all app purchases always go to this account.

### Connected Companies (Express Accounts)
- CitizenOne's customers who want to receive payments from their own customers.
- They connect a Stripe Express account via the "Connect Stripe-konto" button.
- Their `stripe_connect_account_id` is stored on their company in the backend database.
- All invoices they create go to their own Stripe Express account.

**CitizenOne admin must never have a Stripe Connect account linked to their company record.** If Test Firma or another account is accidentally linked, it must be cleared from the database. See the backend guide for the SQL command.

---

## 2. Before You Start

1. Get `VITE_STRIPE_PUBLISHABLE_KEY` from the CitizenOne Stripe Dashboard.
2. Add it to the frontend `.env` file (see Section 3).
3. Ensure the backend is set up with matching keys and the webhook is configured (see backend guide).
4. The frontend key and backend key must always be in the same mode (both test or both live).

---

## 3. Environment Variables

Add to your frontend `.env`:

```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

- Use `pk_test_...` for development and staging.
- Use `pk_live_...` for production.
- Never commit keys to version control.

### Checking if Stripe is enabled

Several components guard Stripe UI behind:

```typescript
const isStripeEnabled = computed(() => !!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
```

Found in `modal-TAC-confirmation.vue`, `pages/storage/upgrade.vue`, and `pages/subscription/subscribe.vue`.

---

## 4. Test Mode vs Live Mode

- Test keys: `pk_test_...` (frontend) + `sk_test_...` (backend). Use Stripe test cards (e.g. `4242 4242 4242 4242`).
- Live keys: `pk_live_...` + `sk_live_...`. Real payments.
- Never mix keys between environments.

**Stripe Connect test mode:** When a connected Express account user clicks "Åben Stripe Dashboard", Stripe prompts for phone verification. In test mode the phone ends in `0000` and the code is `000000`. This is Stripe's built-in test behaviour — not a bug.

---

## 5. Payment Routing — How It Works

The backend determines where money goes based on the logged-in user's company record. The frontend does not control routing directly — it simply calls the correct endpoints and the backend handles everything.

| Who is logged in | Where payments go |
|---|---|
| CitizenOne admin (no Connect account on company) | CitizenOne's Stripe account |
| Connected company user (has `stripe_connect_account_id`) | Their own Stripe Express account |

App/deal purchases always go to CitizenOne regardless of who is logged in.

---

## 6. Payment Flows

### Flow A — CitizenOne sends an invoice to a customer
1. CitizenOne admin opens "Opret faktura" on `/invoices`.
2. The customer dropdown is populated from CitizenOne's Stripe customers (`GET /stripe/customers`).
3. Admin fills in details and submits.
4. Invoice is created on CitizenOne's Stripe account. Payment goes to CitizenOne.

### Flow B — App/deal purchase
1. User opens a deal and initiates payment.
2. Frontend calls `POST /stripe/payment-intent` with `deal_uuid` and `payment_type`.
3. Backend creates a PaymentIntent on CitizenOne's platform account.
4. Payment always goes to CitizenOne, regardless of the logged-in user's company.

### Flow C — Connected company sends an invoice
1. Connected company user (role Admin or Superadmin) opens "Opret faktura".
2. The Stripe Connect panel shows their connected account name/email.
3. The customer dropdown is populated from their own Stripe Express account's customers.
4. They fill in details and submit.
5. Invoice is created on their Stripe Express account. Payment goes to them, not CitizenOne.

### Flow D — Customer pays an invoice via Stripe Checkout
1. Customer opens an invoice link.
2. Clicks "Pay with Stripe".
3. Frontend calls `POST /stripe/invoices/{id}/checkout-session`.
4. Backend returns a Stripe Checkout URL.
5. Customer is redirected to Stripe, completes payment, and is returned to `/payment-success`.

---

## 7. Invoice Overview (Fakturaer)

**Route:** `/invoices` — file: `pages/invoices/index.vue`

### Access control
Only users with the role `Admin` or `Superadmin` can load invoices. The backend enforces this with a `403` response for other roles. The check in the frontend:

```typescript
const isSuperadmin = computed(() =>
  userStore.getUser?.roles?.some((r: any) => ['Superadmin', 'Admin'].includes(r.name))
)
```

### What each user sees
- **CitizenOne admin** (no Connect account): sees all platform invoices and app purchases. Does not see connected company invoices.
- **Connected company user** (has Connect account): sees only their own connected account's invoices.

This filtering is enforced by the backend — not just the frontend.

### Customer list in "Opret faktura"
- **CitizenOne admin / Admin role**: the customer dropdown is populated from `GET /stripe/customers` — Stripe customers on CitizenOne's platform account.
- **Other users**: the dropdown is populated from `/user/citizens` — the company's citizen list.

---

## 8. Opret Faktura — Create Invoice Modal

**Component:** `components/modules/user/citizen/modal-stripe-invoice.vue`

### How the customer list is populated

The `invoices/index.vue` page detects the user's role on mount:

```typescript
onMounted(() => {
  fetchInvoices()
  if (isSuperadmin.value) {
    fetchCompaniesAsCustomers()  // Fetches from GET /stripe/customers
  } else {
    fetchCitizens()              // Fetches from /user/citizens
  }
})
```

`fetchCompaniesAsCustomers()` maps each Stripe customer to the citizen shape the modal expects:
```typescript
{
  uuid: customer.id,          // Stripe customer ID
  firstname: customer.name || customer.email,
  lastname: '',
  email: customer.email,
}
```

Selecting a customer pre-fills the name and email fields in the form. The user can always edit them manually.

### Form fields
- **Vælg kunde** — customer dropdown (pre-fills name and email)
- **Kundenavn** — customer name
- **E-mail** — customer email (invoice is sent here)
- **Beskrivelse** — invoice description
- **Varebeskrivelse / Antal / Enhedspris** — line items (add multiple)
- **Send faktura via e-mail** — toggle to send invoice email after creation

---

## 9. Stripe Connect Panel

The Stripe Connect panel appears at the top of the "Opret faktura" modal.

### States

| State | What the user sees |
|---|---|
| Loading | "Tjekker din Stripe Connect status..." |
| Not connected | "Tilslut din Stripe-konto så dine kunder kan betale dig direkte." + "Connect Stripe-konto" button |
| Connected and onboarded | "Forbundet og klar. Betalinger modtages på **[business name or email]**." + "Åben Stripe Dashboard" button |

### Connected account display
When onboarded, the panel shows the account's **business name** (or email if no name is set). This comes from `GET /stripe/connect/status` which now returns `business_name` and `email` from the connected Stripe Express account.

### Buttons
- **Opdater status** — refreshes Connect status from the backend.
- **Connect Stripe-konto** — starts Stripe Express onboarding (redirects to Stripe).
- **Åben Stripe Dashboard** — opens the connected account's Stripe Express dashboard in a new tab (requires phone verification in test mode: phone `0000`, code `000000`).

### Important
If CitizenOne admin sees a connected account in this panel (e.g. "Test Firma"), it means their company record accidentally has a `stripe_connect_account_id` set. This must be cleared from the database — see the backend guide.

---

## 10. File Structure

```
pages/
├── invoices/
│   ├── index.vue               # Invoice overview, opret faktura trigger, customer list logic
│   └── [id].vue                # Invoice detail page

components/
├── api/
│   └── stripeApi.ts            # All Stripe API calls
├── stripe/
│   ├── StripeCardElement.vue   # Card payment form (Stripe Elements)
│   ├── StripePaymentModal.vue  # Payment/invoice modal wrapper
│   ├── InvoiceStripe.vue       # Full invoice display with payment and download
│   └── StripeCheckoutButton.vue
├── modules/user/citizen/
│   └── modal-stripe-invoice.vue  # Opret faktura modal (invoice creation + Connect panel)

services/
└── stripePaymentService.ts     # Stripe.js initialisation

store/
└── user.js                     # User store — getUser.roles used for role checks
```

---

## 11. API Service (stripeApi.ts)

Located at `components/api/stripeApi.ts`. All methods use `BaseAPIService.request()` which attaches the bearer token automatically.

| Method | Endpoint | Purpose |
|---|---|---|
| `getConnectStatus()` | `GET /stripe/connect/status` | Returns `connected`, `onboarded`, `charges_enabled`, `payouts_enabled`, `account_id`, `email`, `business_name` |
| `createConnectOnboardingLink()` | `POST /stripe/connect/onboarding-link` | Returns onboarding URL for Stripe Express |
| `createConnectDashboardLink()` | `POST /stripe/connect/dashboard-link` | Returns one-time Express dashboard login URL |
| `getStripeCustomers()` | `GET /stripe/customers` | Lists Stripe customers on the platform account (used for CitizenOne admin's customer dropdown) |
| `createStripeInvoice(params)` | `POST /stripe/create-invoice` | Creates an invoice (routed to platform or Connect account automatically) |
| `getStripeInvoices(params?)` | `GET /stripe/invoices` | Lists invoices + PaymentIntents for the current user |
| `getStripeInvoice(id, accountId?)` | `GET /stripe/invoices/{id}` | Gets invoice detail. Pass `accountId` for Connect invoices. |
| `downloadStripeInvoicePdf(id, accountId?)` | `GET /stripe/invoices/{id}/pdf` | Downloads invoice PDF or receipt. Pass `accountId` for Connect invoices. |
| `sendStripeInvoice(id, params)` | `POST /stripe/invoices/{id}/send` | Sends invoice or receipt to `recipient_email`. Open invoices use Stripe's own email. Paid invoices send a receipt link via Laravel mail. See Section 13. |
| `createCheckoutSession(id)` | `POST /stripe/invoices/{id}/checkout-session` | Creates hosted Stripe Checkout payment URL |
| `createPaymentIntent(...)` | `POST /stripe/payment-intent` | Creates PaymentIntent for app/deal purchase |

---

## 12. Components

### StripeCardElement.vue
Renders a card payment form using Stripe Elements. Used for direct deal/subscription payments.

**Props:**
```typescript
{
  amount: number        // In smallest currency unit (øre for DKK)
  citizenId: string
  invoiceId?: string
  metadata?: Record<string, any>
  dealUuid?: string
  paymentType?: string  // 'one_time' | 'monthly' | 'yearly'
}
```

**Events:** `paymentSuccess`, `paymentError`

### StripePaymentModal.vue
Modal wrapper — shows either `StripeCardElement` (payment mode) or invoice details (invoice view mode).

**Props:**
```typescript
{
  isOpen: boolean
  amount: number
  citizenId: string
  invoiceStripeId?: string
  isInvoiceView?: boolean
  metadata?: Record<string, any>
  dealUuid?: string
  paymentType?: string
}
```

### InvoiceStripe.vue
Full-page invoice display with "Send faktura", "Download PDF", and (where applicable) "Pay with Stripe" buttons. Used at `/invoices/[id]`. Reads `accountId` from the URL query string for Connect invoices.

**Fakturalinjer (invoice line items):** the component maps `lines[]` from the API response, where each entry has `description`, `quantity`, `unit_amount`, and `amount` in minor currency (øre). The `unitPrice` and `amount` columns in the table are divided by 100 for display. Tax (25% Moms) is calculated and shown separately in the totals summary — it is not a separate line in the `lines[]` array.

**"App purchase" fallback:** the component has a `looksLikeTestInvoice()` guard that replaces line items only when every description matches the literal pattern `"test 1"`, `"test 2"` etc. Real invoice line items (e.g. "one", "two", "three") are always displayed as-is and are never replaced.

### modal-stripe-invoice.vue
The "Opret faktura" modal. Handles:
- Stripe Connect status display (with business name/email)
- Connect onboarding and dashboard links
- Customer selection (from Stripe customers or citizens depending on role)
- Invoice form (line items, description, email toggle)
- Invoice creation and sending

---

## 13. Sending Invoices and Receipts via Email

The "Send faktura" button in `InvoiceStripe.vue` calls `stripeApi.sendStripeInvoice(id, { recipient_email })` where `recipient_email` is the customer's email address stored on the invoice. The backend handles the two cases differently:

### Open invoices (unpaid)

The backend uses Stripe's own email system, which sends a professional branded email with a **"Pay now"** button directly to the customer. If the `recipient_email` passed differs from the email Stripe has on file for the customer, the backend temporarily updates it, sends, then restores the original — so the email always reaches the right address.

### Paid invoices / receipts

Stripe's send API is not available for paid invoices. The backend instead sends a **receipt email** via Laravel Mail to `recipient_email`. The email contains:
- Invoice/receipt number
- Amount paid
- Company name
- A **"Se kvittering"** button that links to the Stripe-hosted receipt page — the same page the customer would land on from the "Download PDF" button.

The receipt email is **queued** on the backend (`QUEUE_CONNECTION=database` in production).

**Local development / testing:** set `QUEUE_CONNECTION=sync` in the backend `.env` so receipt emails send immediately with no worker needed:
```env
QUEUE_CONNECTION=sync
```
Then run `php artisan config:clear` on the backend.

**Production:** keep `QUEUE_CONNECTION=database` and ensure the queue worker is running as a persistent process (Supervisor or your platform's built-in queue worker toggle). Without it, receipt emails will sit in the queue and never deliver.

### Frontend behaviour

- The "Send faktura" button shows a spinner while sending (`loadingSend`).
- On success: a green success alert shows "Faktura sendt til {email}".
- On error: an alert dialog is shown.
- There is no separate "Send kvittering" button — the same button handles both states based on the invoice's current status.

---

## 14. Typical User Journeys

### CitizenOne admin creates an invoice
1. Go to `/invoices`.
2. Click "Opret faktura".
3. The Stripe Connect panel shows "Tilslut din Stripe-konto" (correct — CitizenOne admin should never have a Connect account).
4. Select a customer from the dropdown (populated from CitizenOne's Stripe customers), or type a new name and email manually.
5. Fill in details and submit.
6. **If the email matches an existing Stripe customer** on CitizenOne's account, that customer is reused automatically.
7. **If the email is new**, a new Stripe customer is created on CitizenOne's Stripe account and will appear in the customer dropdown next time.
8. Invoice appears in the list. Payment goes to CitizenOne's Stripe account.

### Connected company user creates an invoice
1. Go to `/invoices`.
2. Click "Opret faktura".
3. The Stripe Connect panel shows "Forbundet og klar. Betalinger modtages på **[their business name]**."
4. Select a customer from the dropdown (populated from their Stripe Express account's customers), or type a new name and email manually.
5. Fill in details and submit.
6. **If the email matches an existing Stripe customer** on their Express account, that customer is reused automatically.
7. **If the email is new**, a new Stripe customer is created on their Express account and will appear in their customer dropdown next time.
8. Invoice appears in their list only. Payment goes to their Stripe Express account.

### Customer pays an invoice
1. Customer opens the invoice link.
2. Clicks "Pay with Stripe".
3. Redirected to Stripe Checkout.
4. Completes payment.
5. Redirected to `/payment-success`.
6. Invoice status updates to "Betalt".

### Downloading a paid invoice
- **Paid invoice** → downloads a **receipt** (Stripe receipt or backend-generated fallback).
- **Unpaid invoice** → downloads the **invoice PDF**.

This is handled automatically by the backend — the frontend always calls the same PDF endpoint.

---

## 15. Troubleshooting

| Problem | Likely cause | Fix |
|---|---|---|
| "Vælg kunde" list is empty for admin | Role check failing (user has multiple roles, `Citizen` comes first) | The check uses `.some()` — verify `userStore.getUser.roles` contains `Admin` or `Superadmin` |
| Stripe Connect panel shows wrong account (e.g. Test Firma) for CitizenOne admin | Company record has `stripe_connect_account_id` set accidentally | Clear it from the database — see backend guide |
| Invoice shows status "Open" after payment | Stale local DB record; status not refreshed | Stale status is refreshed automatically on next list load using the stored `connected_account_id`. Check backend logs for Stripe API errors. |
| 400 error when opening a Connect invoice | Invoice was created on a Connect account; `?accountId=acct_xxx` may be missing from the URL | The `connected_account_id` should be passed when navigating to the invoice detail page |
| Stripe Connect test phone verification | Expected behaviour in test mode | Use phone `0000` and code `000000` |
| Customer list shows Stripe customers but they are from the wrong account | `getStripeCustomers()` fetches from the platform account | CitizenOne admin should see platform customers. Connected company users see their own Stripe customers via a different path. |
| Fakturalinjer shows "App purchase" instead of real line items | `looksLikeTestInvoice()` was previously replacing items when their subtotal didn't match the total including VAT | Fixed — the amount comparison has been removed. The guard now only replaces items when all descriptions literally match the `test 1`, `test 2` pattern. |
| Receipt email not received after clicking "Send faktura" on a paid invoice | Queue worker not running on the backend | **Local dev:** set `QUEUE_CONNECTION=sync` in the backend `.env` and run `php artisan config:clear` — emails send instantly. **Production:** ensure a persistent queue worker is running (Supervisor or platform queue toggle). |
| Invoice creation fails with a tax rate error on a Connect account | The connected account does not have a `Moms 25%` tax rate configured in their Stripe account | The account holder must create a tax rate in their own Stripe Express account — the platform `txr_` ID cannot be used across accounts. See the backend guide Section 12. |

---

## 16. Where Stripe Appears in the App

Stripe is integrated in two distinct areas of the CitizenOne frontend.

### Apps page (`/apps`)

- Accessible from the **top navbar** for all logged-in company users.
- Users can browse available apps and deals and purchase them by card via Stripe Checkout.
- All app/deal payments always go to the CitizenOne **platform** Stripe account — regardless of which company the user belongs to.
- After a successful payment the user is redirected to `/payment-success`.
- The Stripe Checkout session is created by the backend and the frontend redirects the user to the Stripe-hosted payment page.

### Citizens page — Fakturaer button (`/citizens`)

- A **Fakturaer** button appears in the citizens page header, visible to all authenticated users on that page (no role restriction on the button itself).
- Clicking it opens the **Opret faktura** modal (`modal-stripe-invoice.vue`) where a user can:
  - Select a customer from a merged, deduplicated list of Stripe customers and platform citizens.
  - Add line items, set a due date, and create a Stripe invoice.
  - Click **Gå til alle fakturaer** inside the modal to navigate directly to the invoice overview.
- Invoices are created on the Stripe account belonging to the logged-in user's company (CitizenOne platform account for admins, Express account for connected companies).

### Invoice overview (`/invoices`)

- The **Fakturaer** link in the top navbar is only shown if the logged-in user has `has_invoice_app = true` on their user record.
- Users who reach `/invoices` via the citizens modal or a direct link can view it regardless of the flag.
- **What each role sees on the overview:**

| Role | What they see |
|---|---|
| Superadmin / Admin | All invoices (Stripe + regular), Stripe Connect button, customer list from Stripe API |
| Regular company user | Their own invoices only, no Stripe Connect button |

- The role check: `roles.some(r => ['Superadmin', 'Admin'].includes(r.name))`.
- Admin/Superadmin users trigger `fetchCompaniesAsCustomers()` (loads Stripe customers for the "Vælg kunde" dropdown) and `fetchConnectStatus()` (shows/hides the Connect Stripe button). Regular users fetch platform citizens instead.
- The **Opdater** button re-fetches all invoices from scratch and resets the view to page 1.
- The search field supports inline suggestions — typing suggests customer names or invoice numbers and pressing **Tab** accepts the suggestion.
