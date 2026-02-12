import BaseAPIService from "./BaseAPIService";

interface CreatePaymentIntentResponse {
    clientSecret: string;
}

class stripeApi extends BaseAPIService {

    async createPaymentIntent(amount: number, citzenId: string): Promise<CreatePaymentIntentResponse> {
        return await this.request("/stripe/create-payment-intent", 'POST', {
            amount: amount,
            currency: "dkk",
            citizenId: citzenId
        });
    }
}

export default new stripeApi();