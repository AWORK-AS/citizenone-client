# Stripe Integration Guide

## Table of Contents
1. [Overview](#overview)
2. [What This Integration Does (At a Glance)](#what-this-integration-does-at-a-glance)
3. [When Each Stripe Action Happens](#when-each-stripe-action-happens)
4. [Architecture](#architecture)
5. [Configuration](#configuration)
6. [Components](#components)
7. [API Services](#api-services)
8. [Payment Flows](#payment-flows)
9. [Testing Guide](#testing-guide)
10. [Troubleshooting](#troubleshooting)

---

## Overview

The CitizenOne application integrates Stripe for payment processing in two primary ways:
- **Payment Intents**: Direct card payments with customizable forms
- **Checkout Sessions**: Hosted Stripe checkout pages for invoices

### What Stripe Handles
- Payment processing for subscriptions
- Storage upgrade payments
- Invoice creation and management
- Invoice download/receipt flow (PDF when applicable)
- Payment confirmation and webhooks

### Key Features
✅ Direct card payments with custom UI  
✅ Hosted checkout sessions  
✅ Invoice generation and management  
✅ Invoice PDF/receipt downloads  
✅ Email invoice delivery  
✅ Payment success/failure handling  
✅ Automatic invoice deduplication

---

## What This Integration Does (At a Glance)

Use this section if you only need the high-level picture.

| Area | What Stripe does | Where it happens in app |
|------|-------------------|--------------------------|
| Direct card payment | Creates and confirms Payment Intents using Stripe Elements | Stripe card form components and payment modal |
| Hosted payment page | Creates Checkout Session and redirects user to Stripe-hosted page | Invoice payment button and invoice pages |
| Invoice handling | Creates Stripe invoices, lists invoices, downloads PDFs, sends invoice emails | Invoice pages and invoice actions |
| Payment confirmation | Returns payment status and session outcomes | Payment success page and backend webhooks |
| Security and compliance | Handles sensitive card processing on Stripe side | Stripe SDK + Checkout + backend webhook verification |

---

## When Each Stripe Action Happens

This section explains timing and triggers so colleagues can quickly understand the behavior.

| Trigger in UI | Stripe action | Backend endpoint | Result in app |
|---------------|--------------|------------------|---------------|
| User opens payment form with card input | Prepare Stripe client and mount card element | N/A (client SDK load) | Card form becomes usable |
| User clicks Pay in direct card form | Create Payment Intent | POST /api/stripe/payment-intent (or /api/user/stripe/payment-intent) | Receives client_secret for confirmation |
| User submits valid card details | Confirm Payment Intent | Stripe API via stripe.confirmCardPayment | Success/error event shown to user |
| User clicks Pay with Stripe on invoice | Create Checkout Session | POST /api/stripe/invoices/{invoiceId}/checkout-session (or /api/user/stripe/invoices/{invoiceId}/checkout-session) | Redirect to Stripe hosted checkout |
| Stripe checkout completes | Redirect back with session id | N/A (redirect from Stripe) | payment-success page shown, then redirect |
| User opens invoice details | Fetch Stripe invoice data | GET /api/stripe/invoices/{invoiceId} (or /api/user/stripe/invoices/{invoiceId}) | Invoice info displayed |
| User clicks Download PDF | Fetch invoice download/receipt flow | GET /api/stripe/invoices/{invoiceId}/pdf (or /api/user/stripe/invoices/{invoiceId}/pdf) | Unpaid invoices download as PDF; paid invoices may return receipt-first flow/fallback |
| User clicks Send Invoice | Send invoice email | POST /api/stripe/invoices/{invoiceId}/send (or /api/user/stripe/invoices/{invoiceId}/send) | Confirmation message shown |
| Invoice list page loads | Fetch Stripe invoice/payment list | GET /api/stripe/invoices (or /api/user/stripe/invoices) | Merged Stripe invoices + succeeded PaymentIntents; supports pagination and optional dedupe |

Note: If your frontend HTTP client already uses `/api` as base URL, calling `/stripe/...` still resolves correctly.

### Typical User Journeys

1. Subscription or storage purchase (direct card payment)
   - Starts when user chooses a paid plan.
   - Runs Payment Intent flow with Stripe Elements.
   - Ends with paymentSuccess or paymentError event.

2. Invoice payment (hosted checkout)
   - Starts when user clicks Pay with Stripe on an unpaid invoice.
   - Runs Checkout Session flow and redirects to Stripe.
   - Ends on payment-success page after Stripe redirect.

3. Invoice operations (non-card actions)
   - Starts when user opens invoice list/details.
   - Fetches invoice data from backend Stripe endpoints.
   - Optional actions: download PDF, send invoice email.

---

## Architecture

### Tech Stack
- **Frontend**: Nuxt 3 + Vue 3 (Composition API)
- **Stripe SDK**: `@stripe/stripe-js`
- **Payment UI**: Stripe Elements (Card Element)
- **API Communication**: RESTful API through `stripeApi.ts`

### File Structure
```
components/
├── api/
│   └── stripeApi.ts                    # API service for Stripe endpoints
├── stripe/
│   ├── StripeCardElement.vue           # Card payment form
│   ├── StripePaymentModal.vue          # Payment/invoice modal
│   ├── InvoiceStripe.vue               # Invoice display & payment
│   └── StripeCheckoutButton.vue        # Checkout trigger button

services/
└── stripePaymentService.ts             # Stripe initialization

pages/
├── payment-success.vue                 # Payment success page
├── invoices/index.vue                  # Invoice management
├── subscription/subscribe.vue          # Subscription payments
└── storage/upgrade.vue                 # Storage upgrade payments

lang/
├── en.json                             # English translations (stripeInvoices)
└── dk.json                             # Danish translations (stripeInvoices)
```

---

## Configuration

### Environment Variables

Add to your `.env` file:

```env
# Stripe Publishable Key (starts with pk_test_ or pk_live_)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxx
```

⚠️ **Important**:
- Use **test keys** (`pk_test_...`) for development
- Use **live keys** (`pk_live_...`) for production
- Never commit keys to version control
- Backend needs corresponding secret key (`sk_test_...` or `sk_live_...`)

### Checking if Stripe is Enabled

Multiple components check if Stripe is configured:

```typescript
const isStripeEnabled = computed(() => !!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
```

Found in:
- `components/modules/user/app/modal-TAC-confirmation.vue`
- `pages/storage/upgrade.vue`
- `pages/subscription/subscribe.vue`

---

## Components

### 1. StripeCardElement.vue

**Purpose**: Renders a card payment form using Stripe Elements.

**Props**:
```typescript
{
  amount: number           // Amount in smallest currency unit (øre for DKK)
  citizenId: string        // Customer/citizen identifier
  invoiceId?: string       // Optional invoice ID
  metadata?: Record        // Additional metadata for payment
  dealUuid?: string        // Deal/subscription identifier
  paymentType?: string     // 'one_time' (default) or 'recurring'
}
```

**Events**:
- `paymentSuccess`: Emitted with `{ paymentIntentId, invoiceId }`
- `paymentError`: Emitted with error message string

**Usage Example**:
```vue
<StripeCardElement
  :amount="50000"
  citizenId="citizen_123"
  :metadata="{ orderNumber: '12345' }"
  @payment-success="handleSuccess"
  @payment-error="handleError"
/>
```

**What it does**:
1. Creates payment intent via API
2. Initializes Stripe Elements
3. Mounts card input field
4. Validates card details
5. Confirms payment on submit
6. Handles success/error states

---

### 2. StripePaymentModal.vue

**Purpose**: Modal wrapper for payment or invoice viewing.

**Props**:
```typescript
{
  isOpen: boolean
  amount: number
  citizenId: string
  invoiceStripeId?: string
  isInvoiceView?: boolean  // If true, shows invoice instead of payment form
  metadata?: Record
  dealUuid?: string
  paymentType?: string
  itemDescription?: string
  clientSecret?: string
}
```

**Events**:
- `close`: Modal close request
- `paymentSuccess`: Payment completed
- `paymentError`: Payment failed

**Two Modes**:
1. **Payment Mode** (`isInvoiceView: false`): Shows StripeCardElement
2. **Invoice View Mode** (`isInvoiceView: true`): Shows invoice details and download

**Usage Example**:
```vue
<StripePaymentModal
  :isOpen="showModal"
  :amount="25000"
  citizenId="citizen_456"
  invoiceStripeId="in_xxxxx"
  @close="showModal = false"
  @payment-success="onPaymentComplete"
/>
```

---

### 3. InvoiceStripe.vue

**Purpose**: Full-page invoice display with payment and download options.

**Features**:
- Displays invoice details (items, amounts, customer info)
- "Pay with Stripe" button (creates checkout session)
- "Download PDF" button
- Status formatting
- Loading/error states

**Route Integration**:
```typescript
// Reads invoice ID from route params
const invoiceId = computed(() => route.params.id as string)
```

**Payment Flow**:
1. User clicks "Pay with Stripe"
2. Creates Stripe Checkout Session via API
3. Redirects to hosted Stripe checkout page
4. User completes payment on Stripe
5. Redirects back to `/payment-success?session_id=xxx`

---

### 4. StripeCheckoutButton.vue

**Purpose**: Reusable button component to trigger payment modals.

**Props**:
```typescript
{
  amount: number
  invoiceId: string
  citizenId: string
  disabled?: boolean
  variant?: 'primary' | 'secondary' | 'danger'
  buttonText?: string
}
```

**Events**:
- `paymentInitiated`
- `paymentSuccess`
- `paymentError`
- `closeModal`

**Usage**:
```vue
<StripeCheckoutButton
  :amount="10000"
  invoiceId="inv_123"
  citizenId="citizen_789"
  buttonText="Pay Now"
  variant="primary"
  @paymentSuccess="handleSuccess"
/>
```

---

## API Services

### stripePaymentService.ts

**Purpose**: Initialize Stripe SDK.

```typescript
import { loadStripe } from '@stripe/stripe-js';

// Singleton pattern - only loads once
export function getStripe(): Promise<Stripe | null> {
  if (!stripePromise) {
    stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
  }
  return stripePromise;
}
```

**Usage**:
```typescript
const stripe = await getStripe();
if (!stripe) {
  throw new Error('Stripe not initialized');
}
```

---

### stripeApi.ts

**Purpose**: All backend API calls for Stripe operations.

#### Available Methods

##### 1. Create Payment Intent
```typescript
createPaymentIntent(
   dealUuid: string,
   paymentType: 'monthly' | 'yearly' | 'one_time',
   citizenId?: string
): Promise<{ client_secret: string }>
```

**Endpoint**: `POST /api/stripe/payment-intent` (or `/api/user/stripe/payment-intent`)  
**Purpose**: Create a payment intent for deal/app payments. Backend computes amount/currency from `deal_uuid` + `payment_type`.  
**Returns**: Client secret for confirming payment

**Example**:
```typescript
const { client_secret } = await stripeApi.createPaymentIntent(
  'deal_uuid_456',
  'one_time',
   'citizen_123'
);
```

---

##### 2. Get Stripe Invoice
```typescript
getStripeInvoice(invoiceId: string): Promise<any>
```

**Endpoint**: `GET /api/stripe/invoices/{invoiceId}` (or `/api/user/stripe/invoices/{invoiceId}`)  
**Purpose**: Retrieve invoice details from Stripe  
**Returns**: Full invoice object with items, customer, amounts

**Example**:
```typescript
const invoice = await stripeApi.getStripeInvoice('in_xxxxxxxxx');
console.log(invoice.amount, invoice.status, invoice.items);
```

---

##### 3. Create Stripe Invoice
```typescript
createStripeInvoice(params: {
  customer_email: string;
  customer_name: string;
  items: Array<{
    description: string;
    quantity: number;
    unit_amount: number;
  }>;
  metadata?: Record;
}): Promise<any>
```

**Endpoint**: `POST /api/stripe/create-invoice` (or `/api/user/stripe/create-invoice`)  
**Purpose**: Create a new Stripe invoice

**Example**:
```typescript
const invoice = await stripeApi.createStripeInvoice({
  customer_email: 'customer@example.com',
  customer_name: 'John Doe',
  items: [
    {
      description: 'Storage upgrade to 10GB',
      quantity: 1,
      unit_amount: 50000  // 500.00 DKK
    }
  ],
  metadata: { planType: 'storage' }
});
```

---

##### 4. Download Invoice PDF
```typescript
downloadStripeInvoicePdf(invoiceId: string): Promise<any>
```

**Endpoint**: `GET /api/stripe/invoices/{invoiceId}/pdf` (or `/api/user/stripe/invoices/{invoiceId}/pdf`)  
**Purpose**: Invoice download/receipt flow  
**Returns**: Unpaid invoice PDF stream, or paid-invoice receipt-first response/fallback behavior (not always a direct PDF blob)

**Example**:
```typescript
const result = await stripeApi.downloadStripeInvoicePdf('in_xxxxxx');
// Handle either binary PDF download or receipt-style response depending on invoice state.
```

---

##### 5. Send Invoice Email
```typescript
sendStripeInvoice(
  invoiceId: string,
  params: { recipient_email: string }
): Promise<any>
```

**Endpoint**: `POST /api/stripe/invoices/{invoiceId}/send` (or `/api/user/stripe/invoices/{invoiceId}/send`)  
**Purpose**: Email invoice to customer

**Example**:
```typescript
await stripeApi.sendStripeInvoice('in_xxxxxx', {
  recipient_email: 'customer@example.com'
});
```

---

##### 6. Create Checkout Session
```typescript
createCheckoutSession(invoiceId: string): Promise<{ url: string }>
```

**Endpoint**: `POST /api/stripe/invoices/{invoiceId}/checkout-session` (or `/api/user/stripe/invoices/{invoiceId}/checkout-session`)  
**Purpose**: Create hosted checkout session for invoice payment  
**Returns**: Checkout URL to redirect user

**Example**:
```typescript
const { url } = await stripeApi.createCheckoutSession('in_xxxxxx');
window.location.href = url; // Redirect to Stripe checkout
```

---

##### 7. Get Receipt URL (PaymentIntent)
```typescript
getReceiptUrl(paymentIntentId: string): Promise<{ receipt_url: string | null }>
```

**Endpoint**: `GET /api/stripe/receipt/{paymentIntentId}` (or `/api/user/stripe/receipt/{paymentIntentId}`)  
**Purpose**: Retrieve Stripe hosted receipt URL for `pi_` IDs  
**Returns**: JSON with `receipt_url` (not a PDF file stream)

**Example**:
```typescript
const { receipt_url } = await stripeApi.getReceiptUrl('pi_xxxxxx');
if (receipt_url) window.open(receipt_url, '_blank');
```

---

##### 8. Get All Stripe Invoices
```typescript
getStripeInvoices(params?: object): Promise<any>
```

**Endpoint**: `GET /api/stripe/invoices` (or `/api/user/stripe/invoices`)  
**Purpose**: Return merged list of Stripe invoices + succeeded PaymentIntents  
**Returns**: Paginated invoice list

**Example**:
```typescript
const invoices = await stripeApi.getStripeInvoices({
   per_page: 25,
   page: 1,
   dedupe: true
});
```

---

## Payment Flows

Use this section for implementation details. For quick timing and trigger overview, see "When Each Stripe Action Happens" above.

### Flow 1: Direct Card Payment (Payment Intent)

**Used in**: StripeCardElement.vue

```
1. User enters/selects deal and payment type
2. Component calls stripeApi.createPaymentIntent()
   ↓
3. Backend validates deal UUID/payment_type, computes amount, creates PaymentIntent, returns client_secret
   ↓
4. Frontend initializes Stripe Elements with client_secret
   ↓
5. User enters card details
   ↓
6. User clicks "Pay"
7. Frontend calls stripe.confirmCardPayment(client_secret, { card })
   ↓
8. Stripe processes payment
   ↓
9. Success: emit paymentSuccess event
   Failure: emit paymentError event
```

**Currency/Amount Note**: Stripe boundaries use minor units, but for this endpoint backend computes amount/currency from deal context. Frontend should not send raw `amount`/`currency` for PaymentIntent creation.

---

### Flow 2: Hosted Checkout (Checkout Sessions)

**Used in**: InvoiceStripe.vue, subscription flows

```
1. User clicks "Pay with Stripe" button
2. Component calls stripeApi.createCheckoutSession(invoiceId)
   ↓
3. Backend creates Checkout Session, returns URL
   ↓
4. Frontend redirects: window.location.href = checkoutUrl
   ↓
5. User completes payment on Stripe-hosted page
   ↓
6. Stripe redirects back to: /payment-success?session_id=xxx
   ↓
7. payment-success.vue displays confirmation
8. Auto-redirect to /invoices after 3 seconds
```

**Advantages**:
- No PCI compliance needed (Stripe handles card data)
- Mobile-optimized checkout
- Supports multiple payment methods
- Built-in fraud prevention

---

### Flow 3: Invoice Management

**Used in**: pages/invoices/index.vue

```
1. Page loads, fetches both regular and Stripe invoices
   ↓
2. Combines and deduplicates invoices
   ↓
3. User can:
   - View invoice details
   - Download PDF
   - Send invoice via email
   - Pay invoice (if unpaid)
   ↓
4. Payment triggers Flow 2 (Checkout Session)
```

**Invoice Deduplication Logic**:
```typescript
// Matches invoices by:
- Same amount (with tolerance for minor/major unit differences)
- Same date (within 10 minutes)
- Same customer (name or email)
```

---

## Testing Guide

### Prerequisites

1. **Stripe Test Account**
   - Sign up at [stripe.com](https://stripe.com)
   - Get test API keys from Dashboard → Developers → API Keys

2. **Environment Setup**
   ```env
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
   ```

3. **Backend Configuration**
   - Backend must have `STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx`
   - Webhook endpoint configured (if using webhooks)

---

### Test Credit Cards

Stripe provides test cards that simulate different scenarios:

#### Successful Payments
```
Card Number: 4242 4242 4242 4242
Expiry: Any future date (e.g., 12/34)
CVC: Any 3 digits (e.g., 123)
ZIP: Any 5 digits
```

#### Payment Requires Authentication (3D Secure)
```
Card Number: 4000 0027 6000 3184
Expiry: Any future date
CVC: Any 3 digits
```

#### Declined Payment
```
Card Number: 4000 0000 0000 0002
Expiry: Any future date
CVC: Any 3 digits
```

#### Insufficient Funds
```
Card Number: 4000 0000 0000 9995
Expiry: Any future date
CVC: Any 3 digits
```

**More test cards**: [Stripe Testing Documentation](https://stripe.com/docs/testing)

---

### Testing Scenarios

#### Scenario 1: Direct Payment (StripeCardElement)

**Steps**:
1. Navigate to subscription or storage upgrade page
2. Select a plan
3. Fill in payment form with test card `4242 4242 4242 4242`
4. Submit payment
5. **Expected**: Payment success, redirect or confirmation

**Verify**:
- ✅ Payment intent created in Stripe Dashboard
- ✅ Payment status shows "succeeded"
- ✅ Amount matches selection
- ✅ Metadata included (citizenId, dealUuid, etc.)

**Test Edge Cases**:
- ❌ Use declined card `4000 0000 0000 0002` → Should show error
- ⚠️  Use 3DS card `4000 0027 6000 3184` → Should prompt authentication

---

#### Scenario 2: Checkout Session (Hosted Payment)

**Steps**:
1. Navigate to `/invoices`
2. Create or select an unpaid invoice
3. Click "Pay with Stripe"
4. **Expected**: Redirect to Stripe Checkout page
5. Enter test card details
6. Complete payment
7. **Expected**: Redirect to `/payment-success`
8. Verify invoice shows as paid

**Verify**:
- ✅ Checkout session created in Stripe Dashboard
- ✅ Payment successful
- ✅ Invoice status updated to "paid"
- ✅ Success page displays correctly
- ✅ Auto-redirect works after 3 seconds

---

#### Scenario 3: Invoice Creation

**Steps**:
1. Navigate to `/invoices/new`
2. Fill in customer details and line items
3. Create invoice
4. **Expected**: Invoice appears in list
5. Verify invoice exists in Stripe Dashboard

**Test Data**:
```json
{
  "customer_email": "test@example.com",
  "customer_name": "Test Customer",
  "items": [
    {
      "description": "Test Item",
      "quantity": 2,
      "unit_amount": 50000
    },
     {
      "description": "Test Item 2",
      "quantity": 1,
      "unit_amount": 420000
    }
  ]
}
```

**Verify**:
- ✅ Invoice created in Stripe
- ✅ Invoice appears in app invoice list
- ✅ Customer details correct
- ✅ Line items match
- ✅ Total calculated correctly

---

#### Scenario 4: Invoice PDF Download

**Steps**:
1. Navigate to `/invoices`
2. Test one unpaid invoice and one paid invoice
3. Click "Download PDF"
4. **Expected**:
   - Unpaid invoice: PDF downloads automatically
   - Paid invoice: backend may return receipt-first flow (Stripe receipt URL/PDF fallback) instead of a direct invoice PDF blob

**Verify**:
- ✅ Unpaid invoice download works and is readable
- ✅ Paid invoice resolves to receipt/download fallback flow without frontend crash
- ✅ If file is returned, filename is reasonable (e.g., `invoice-{id}.pdf`)

---

#### Scenario 5: Send Invoice via Email

**Steps**:
1. Navigate to `/invoices`
2. Select an invoice
3. Click "Send Invoice"
4. Enter recipient email
5. Submit
6. **Expected**: Success message displayed
7. Check email inbox

**Verify**:
- ✅ Email sent successfully
- ✅ Email contains invoice link
- ✅ Invoice link opens correctly
- ✅ No errors in console

---

#### Scenario 6: Payment Success Flow

**Steps**:
1. Complete a checkout session payment
2. Get redirected to `/payment-success?session_id=xxx`
3. Observe success page

**Verify**:
- ✅ Green checkmark displayed
- ✅ Success message shows
- ✅ "Go to Dashboard" button works
- ✅ "View Invoices" button works
- ✅ Auto-redirect happens after 3 seconds
- ✅ No console errors

---

#### Scenario 7: Error Handling

**Test Cases**:

**A. Invalid Card**
- Use card `4000 0000 0000 0002`
- **Expected**: Error message displays
- **Verify**: User can retry with different card

**B. Network Error**
- Disconnect internet during payment
- **Expected**: Error message: "Network error"
- **Verify**: Form doesn't submit, error is clear

**C. Missing Configuration**
- Remove `VITE_STRIPE_PUBLISHABLE_KEY`
- Restart dev server
- **Expected**: Payment options hidden or disabled
- **Verify**: `isStripeEnabled` computed property works

**D. Invalid Invoice ID**
- Try to load `/invoices/invalid_id`
- **Expected**: Error message displays
- **Verify**: "Try Again" button works

---

### Testing Checklist

Use this checklist for comprehensive testing:

#### Functionality
- [ ] Direct payment with test card succeeds
- [ ] Checkout session redirects correctly
- [ ] Payment success page displays
- [ ] Invoice creation works
- [ ] Invoice listing shows both types
- [ ] PDF download works
- [ ] Email sending works
- [ ] Payment failure shows error
- [ ] 3D Secure authentication works

#### UI/UX
- [ ] Loading states show during API calls
- [ ] Error messages are user-friendly
- [ ] Forms validate input
- [ ] Currency formatting is correct (DKK)
- [ ] Amounts display with 2 decimals
- [ ] Buttons disable during processing
- [ ] Success confirmations are clear

#### Data Integrity
- [ ] Invoice amounts match minor/major units
- [ ] Customer details preserved
- [ ] Metadata attached to payments
- [ ] Invoice deduplication works
- [ ] Stripe Dashboard matches app state

#### Error Scenarios
- [ ] Declined cards handled gracefully
- [ ] Network errors don't crash app
- [ ] Missing config disables features
- [ ] Invalid IDs show helpful errors
- [ ] Timeout errors are caught

#### Responsive Design
- [ ] Mobile layout works
- [ ] Tablet layout works
- [ ] Desktop layout works
- [ ] Stripe Elements responsive

#### Localization
- [ ] English translations complete
- [ ] Danish translations complete
- [ ] Currency symbols correct
- [ ] Date formats localized

---

## Troubleshooting

### Problem: "Stripe not initialized" Error

**Symptoms**:
```
Error: Failed to initialize Stripe. Please check your Stripe publishable key.
```

**Solutions**:
1. Verify `.env` file has `VITE_STRIPE_PUBLISHABLE_KEY`
2. Restart dev server after adding env var
3. Check key starts with `pk_test_` or `pk_live_`
4. Ensure no trailing spaces in key

**Test**:
```typescript
console.log('Stripe Key:', import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
// Should print: pk_test_xxxxxxxxx
```

---

### Problem: Payment Intent Creation Fails

**Symptoms**:
```
Failed to retrieve client secret from server
```

**Causes**:
1. Backend not running
2. Backend missing Stripe secret key
3. API endpoint incorrect
4. Network error

**Solutions**:
1. Check backend console for errors
2. Verify backend has `STRIPE_SECRET_KEY` env var
3. Test endpoint manually:
   ```bash
   curl -X POST http://localhost:3000/api/stripe/payment-intent \
     -H "Content-Type: application/json" \
       -d '{"deal_uuid":"deal_uuid_456","payment_type":"one_time","citizen_id":"test_123"}'
   ```
4. Check browser Network tab for API call details

---

### Problem: Card Element Not Rendering

**Symptoms**:
- Empty card input area
- Console error about mounting

**Solutions**:
1. Ensure element ID exists in template:
   ```vue
   <div id="card-element"></div>
   ```
2. Check if Stripe SDK loaded:
   ```typescript
   console.log('Stripe SDK:', stripe)
   ```
3. Verify `onMounted()` hook executes
4. Check for CSS issues hiding the element

---

### Problem: Amount Mismatch

**Symptoms**:
- Payment shows wrong amount
- Invoice total incorrect

**Root Cause**: DKK uses øre (1 DKK = 100 øre)

**Solutions**:
1. Convert major/minor units for endpoints that expect explicit amounts (e.g., invoice item `unit_amount`):
   ```typescript
   const displayAmount = 500.00  // DKK
   const apiAmount = displayAmount * 100  // 50000 øre
   ```
2. For `POST /api/stripe/payment-intent`, send `deal_uuid` + `payment_type` (and optional `citizen_id`) and let backend compute amount/currency.
3. Use helper function:
   ```typescript
   function formatAmount(amount: number): string {
     return new Intl.NumberFormat('da-DK', {
       minimumFractionDigits: 2,
       maximumFractionDigits: 2,
     }).format(amount / 100);
   }
   ```

---

### Problem: Checkout Redirect Loop

**Symptoms**:
- Redirects to Stripe, then back, then to Stripe again

**Causes**:
1. Success URL not configured correctly
2. Webhook not handling `checkout.session.completed`

**Solutions**:
1. Check Stripe Dashboard → Webhooks
2. Ensure success URL is absolute:
   ```
   https://yourdomain.com/payment-success
   ```
3. Add session_id to URL params:
   ```
   https://yourdomain.com/payment-success?session_id={CHECKOUT_SESSION_ID}
   ```

---

### Problem: Invoice Duplication

**Symptoms**:
- Same invoice appears twice in list
- Regular + Stripe invoice shown for one payment

**Cause**: Deduplication logic failing

**Solutions**:
1. Check invoice comparison logic in `pages/invoices/index.vue`
2. Verify amount tolerance:
   ```typescript
   function isEquivalentAmount(a: number, b: number): boolean {
     const tolerance = 0.01
     return Math.abs(a - b) < tolerance
   }
   ```
3. Check date comparison:
   ```typescript
   function isNearInTime(date1: string, date2: string, minutes: number): boolean {
     const diff = Math.abs(new Date(date1) - new Date(date2))
     return diff < minutes * 60 * 1000
   }
   ```

---

### Problem: PDF Download Fails

**Symptoms**:
- 404 error when downloading PDF
- Blank PDF downloaded

**Solutions**:
1. Verify invoice ID is correct
2. Check backend PDF generation
3. Test endpoint manually:
   ```bash
   curl -o test.pdf http://localhost:3000/api/stripe/invoices/{id}/pdf
   ```
4. Verify invoice is finalized in Stripe (only finalized invoices have PDFs)

---

### Problem: Webhook Not Receiving Events

**Symptoms**:
- Payment completes but app doesn't update
- Invoice status doesn't change

**Solutions**:
1. Check Stripe Dashboard → Webhooks for delivery status
2. Verify webhook endpoint URL is correct
3. For local testing, use Stripe CLI:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```
4. Check webhook signature verification in backend
5. Ensure webhook handles these events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `checkout.session.completed`
   - `invoice.paid`
   - `payment_method.attached`

---

### Problem: 3D Secure Not Working

**Symptoms**:
- Authentication popup doesn't appear
- Payment fails with authentication error

**Solutions**:
1. Use correct test card: `4000 0027 6000 3184`
2. Ensure popup blockers disabled
3. Check if running in iframe (3DS may be blocked)
4. Verify return URL configured

---

### Common Console Errors

#### Error: "CardElement is not mounted"
**Fix**: Ensure element exists before mounting:
```typescript
onMounted(async () => {
  await nextTick()  // Wait for DOM
  cardElement.mount('#card-element')
})
```

#### Error: "Invalid API Key"
**Fix**: Check publishable key format and validity

#### Error: "Amount must be at least 50 øre"
**Fix**: Ensure amount >= 50 (0.50 DKK minimum)

#### Error: "CORS policy blocked"
**Fix**: Backend needs CORS headers for Stripe API domain

---

## Best Practices

### Security
- ✅ Never log or store card details
- ✅ Use HTTPS in production
- ✅ Validate amounts on backend
- ✅ Implement webhook signature verification
- ✅ Use environment variables for keys
- ✅ Enable Stripe Radar for fraud detection

### Performance
- ✅ Load Stripe SDK asynchronously
- ✅ Cache Stripe instance (singleton pattern)
- ✅ Lazy load payment components
- ✅ Debounce card validation
- ✅ Optimize bundle size

### User Experience
- ✅ Show loading states during payment
- ✅ Provide clear error messages
- ✅ Format currency correctly (DKK)
- ✅ Auto-focus card input
- ✅ Disable submit during processing
- ✅ Confirm before redirects

### Error Handling
- ✅ Catch all API errors
- ✅ Log errors for debugging
- ✅ Show user-friendly messages
- ✅ Provide retry mechanisms
- ✅ Handle network failures gracefully

### Testing
- ✅ Test all card types
- ✅ Test error scenarios
- ✅ Test on multiple devices
- ✅ Test with slow network
- ✅ Test localization

---

## Additional Resources

### Stripe Documentation
- [Stripe Docs](https://stripe.com/docs)
- [Payment Intents Guide](https://stripe.com/docs/payments/payment-intents)
- [Checkout Sessions](https://stripe.com/docs/payments/checkout)
- [Testing Cards](https://stripe.com/docs/testing)
- [Webhooks Guide](https://stripe.com/docs/webhooks)

### Internal Resources
- Backend API documentation (if available)
- Team Stripe account credentials (secure location)
- Production deployment checklist

### Support
- **Stripe Support**: https://support.stripe.com
- **Team Lead**: [Add contact info]
- **Developer Slack**: [Add channel]

---

## Changelog

| Date | Version | Changes |
|------|---------|---------|
| 2026-03-12 | 1.1 | Added clear colleague-focused sections: what the Stripe integration does and when each Stripe action is triggered |
| 2026-03-05 | 1.0 | Initial documentation created |

---

**Document Owner**: Development Team  
**Last Updated**: March 12, 2026  
**Next Review**: Quarterly or when major changes occur
