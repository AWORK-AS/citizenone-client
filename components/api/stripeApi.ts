import BaseAPIService from "./BaseAPIService";

interface CreatePaymentIntentResponse {
    client_secret: string;
}

interface StripeReceiptRedirectResponse {
    success?: boolean;
    is_stripe_receipt_url: boolean;
    redirect_url?: string;
    receipt_url?: string;
    payment_intent_id?: string;
    message?: string;
}

interface StripeConnectStatusResponse {
    connected: boolean;
    onboarded: boolean;
    details_submitted: boolean;
    charges_enabled: boolean;
    payouts_enabled: boolean;
    account_id?: string | null;
}

class stripeApi extends BaseAPIService {

    private requireStripeInvoiceResourceId(id: string): string {
        const value = String(id || '').trim()
        if (!/^(in_|pi_|cs_)/.test(value)) {
            throw new Error('Invalid Stripe invoice identifier. Expected Stripe id (in_/pi_/cs_).')
        }

        return value
    }

    async getConnectStatus(): Promise<StripeConnectStatusResponse> {
        return await this.request('/stripe/connect/status', 'GET');
    }

    async createConnectOnboardingLink(): Promise<{ url: string; expires_at: number; account_id: string }> {
        return await this.request('/stripe/connect/onboarding-link', 'POST', {});
    }

    async createConnectDashboardLink(): Promise<{ url: string }> {
        return await this.request('/stripe/connect/dashboard-link', 'POST', {});
    }

    async createPaymentIntent(
        amount: number,
        citizenId: string,
        dealUuid?: string,
        paymentType?: string,
        metadata?: Record<string, string | number | boolean | null>
    ): Promise<CreatePaymentIntentResponse> {
        return await this.request("/stripe/payment-intent", 'POST', {
            amount: amount,
            currency: "dkk",
            citizen_id: citizenId,
            deal_uuid: dealUuid ?? null,
            payment_type: paymentType ?? 'one_time',
            metadata: metadata ?? null
        });
    }

    async getStripeInvoice(invoiceId: string, connectedAccountId?: string | null): Promise<any> {
        const stripeInvoiceId = this.requireStripeInvoiceResourceId(invoiceId)
        let url = `/stripe/invoices/${stripeInvoiceId}`

        if (connectedAccountId && /^acct_/.test(connectedAccountId)) {
            url += `?accountId=${encodeURIComponent(connectedAccountId)}`
        }

        return await this.request(url, 'GET');
    }

    async createStripeInvoice(params: {
        customer_email: string;
        customer_name: string;
        items: Array<{
            description: string;
            quantity: number;
            unit_amount: number;
        }>;
        metadata?: Record<string, string | number | boolean | null>;
    }): Promise<any> {
        return await this.request('/stripe/create-invoice', 'POST', params);
    }

    async downloadStripeInvoicePdf(invoiceId: string, connectedAccountId?: string | null): Promise<Blob | StripeReceiptRedirectResponse> {
        try {
            const stripeInvoiceId = this.requireStripeInvoiceResourceId(invoiceId)
            const runtimeConfig = useRuntimeConfig()
            const apiBaseURL = runtimeConfig.public.apiBaseURL
            const query = new URLSearchParams({ invoiceId: stripeInvoiceId })

            if (connectedAccountId && /^acct_/.test(connectedAccountId)) {
                query.set('accountId', connectedAccountId)
            }

            const fullUrl = `${apiBaseURL}/stripe/download-pdf?${query.toString()}`

            const response = await fetch(fullUrl, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('_token')}`,
                    'Accept': '*/*',
                }
            })

            if (!response.ok) {
                // Try to parse error details from response
                let errorMessage = `Failed to download PDF (${response.status} ${response.statusText})`
                
                try {
                    const contentType = response.headers.get('content-type')
                    if (contentType?.includes('application/json')) {
                        const errorData = await response.json()
                        if (errorData.message) {
                            errorMessage = errorData.message
                        }
                    } else {
                        const errorText = await response.text()
                        if (errorText && errorText.length > 0) {
                            errorMessage = errorText.substring(0, 200)
                        }
                    }
                } catch (parseError) {
                    console.debug('Could not parse error response:', parseError)
                }

                console.error('PDF download error details:', {
                    status: response.status,
                    statusText: response.statusText,
                    message: errorMessage,
                    invoiceId: stripeInvoiceId
                })
                
                throw new Error(errorMessage)
            }

            // Check if response is JSON (e.g., Stripe receipt URL response)
            const contentType = response.headers.get('content-type')
            if (contentType?.includes('application/json')) {
                return await response.json()
            }

            // Otherwise treat as a file blob
            const blob = await response.blob()
            if (!blob || blob.size === 0) {
                throw new Error('Downloaded file is empty. Please verify the invoice exists and has a receipt available.')
            }
            
            return blob
        } catch (error) {
            // Log detailed error for debugging
            console.error('Error in downloadStripeInvoicePdf:', error)
            
            // Re-throw with context
            if (error instanceof Error) {
                throw error
            } else {
                throw new Error(`Failed to download receipt: ${String(error)}`)
            }
        }
    }

    async sendStripeInvoice(invoiceId: string, params: { recipient_email: string }): Promise<any> {
        const stripeInvoiceId = this.requireStripeInvoiceResourceId(invoiceId)
        return await this.request(`/stripe/invoices/${stripeInvoiceId}/send`, 'POST', params);
    }

    async createCheckoutSession(invoiceId: string): Promise<any> {
        const stripeInvoiceId = this.requireStripeInvoiceResourceId(invoiceId)
        return await this.request(`/stripe/invoices/${stripeInvoiceId}/checkout-session`, 'POST', {});
    }

    async getStripeInvoices(params?: object): Promise<any> {
        return await this.request('/stripe/invoices', 'GET', params);
    }

    async getStripeCustomers(): Promise<any> {
        return await this.request('/stripe/customers', 'GET');
    }
}

export default new stripeApi();