import BaseAPIService from "./BaseAPIService";

class stripeApi extends BaseAPIService {

    async createPaymentIntent(amount: number, citzenId: string) {
        return await this.request("/stripe/create-payment-intent", 'POST', {
            amount: amount,
            currency: "dkk",
            citizenId: citzenId
        });
    }
}

export default new stripeApi();