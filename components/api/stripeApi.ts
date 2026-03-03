import BaseAPIService from "./BaseAPIService";

interface CreatePaymentIntentResponse {
    client_secret: string;
}

class stripeApi extends BaseAPIService {

    async createPaymentIntent(
        amount: number,
        citizenId: string,
        metadata?: Record<string, string | number | boolean | null>
    ): Promise<CreatePaymentIntentResponse> {
        return await this.request("/stripe/payment-intent", 'POST', {
            amount: amount,
            currency: "dkk",
            citizen_id: citizenId,
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

    async downloadStripeInvoicePdf(invoiceId: string): Promise<any> {
        return await this.request(`/stripe/invoices/${invoiceId}/pdf`, 'GET');
    }

    async sendStripeInvoice(invoiceId: string, params: { recipient_email: string }): Promise<any> {
        return await this.request(`/stripe/invoices/${invoiceId}/send`, 'POST', params);
    }
}

export default new stripeApi();