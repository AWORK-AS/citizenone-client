import BaseAPIService from "./BaseAPIService";

interface CreatePaymentIntentResponse {
    client_secret: string;
}

class stripeApi extends BaseAPIService {

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

    async getStripeInvoice(invoiceId: string): Promise<any> {
        return await this.request(`/stripe/invoices/${invoiceId}`, 'GET');
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

    async downloadStripeInvoicePdf(invoiceId: string): Promise<Blob> {
        try {
            const runtimeConfig = useRuntimeConfig()
            const apiBaseURL = runtimeConfig.public.apiBaseURL
            const fullUrl = `${apiBaseURL}/stripe/download-pdf?invoiceId=${invoiceId}`

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
                    invoiceId: invoiceId
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
        return await this.request(`/stripe/invoices/${invoiceId}/send`, 'POST', params);
    }

    async createCheckoutSession(invoiceId: string): Promise<any> {
        return await this.request(`/stripe/invoices/${invoiceId}/checkout-session`, 'POST', {});
    }

    async getStripeInvoices(params?: object): Promise<any> {
        return await this.request('/stripe/invoices', 'GET', params);
    }
}

export default new stripeApi();