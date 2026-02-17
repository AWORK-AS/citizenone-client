import BaseAPIService from "./BaseAPIService";

interface CreatePaymentIntentResponse {
    client_secret: string;
}

class stripeApi extends BaseAPIService {

    async createPaymentIntent(amount: number, citizenId: string): Promise<CreatePaymentIntentResponse> {
        return await this.request("/stripe/payment-intent", 'POST', {
            amount: amount,
            currency: "dkk",
            citizen_id: citizenId
        });
    }

    async getStripeInvoice(invoiceId: string): Promise<any> {
        return await this.request(`/stripe/invoices/${invoiceId}`, 'GET');
    }
}

export default new stripeApi();