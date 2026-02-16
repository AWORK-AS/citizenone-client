import BaseAPIService from "./BaseAPIService";

interface CreatePaymentIntentResponse {
    client_secret: string;
}

class stripeApi extends BaseAPIService {

    async createPaymentIntent(amount: number, citizenId: string): Promise<CreatePaymentIntentResponse> {
        return await this.request("/stripe/create-payment-intent", 'POST', {
            amount: amount,
            currency: "dkk",
            citizen_id: citizenId
        });
    }
}

export default new stripeApi();