import { loadStripe, type Stripe } from '@stripe/stripe-js';
import stripeApi from '../components/api/stripeApi';

let stripePromise: Promise<Stripe | null>;

export function getStripe(){
    if (!stripePromise) {
        stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
}
    return stripePromise;
}

export async function payWithStripe(amount: number, citizenId: string, cardElement: any) {
    try {
        const { clientSecret } = await stripeApi.createPaymentIntent(amount, citizenId);
        const stripe = await stripePromise;
        const { error } = await stripe!.confirmCardPayment(clientSecret);

        if (error) {
            console.error("Payment failed:", error);
            return { success: false, error: error.message };
        } else {
            console.log("Payment successful!");
            return { success: true };
        }   
    } catch (error) {
        console.error("Error processing payment:", error);
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }   
}