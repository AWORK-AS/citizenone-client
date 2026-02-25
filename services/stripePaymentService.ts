import { loadStripe, type Stripe } from '@stripe/stripe-js';
import stripeApi from '../components/api/stripeApi';

let stripePromise: Promise<Stripe | null>;

export function getStripe(){
    if (!stripePromise) {
        stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
}
    return stripePromise;
}

export async function payWithStripe(
    amount: number,
    citizenId: string,
    cardElement: any,
    metadata?: Record<string, string | number | boolean | null>
) {
    try {
        const { client_secret } = await stripeApi.createPaymentIntent(amount, citizenId, metadata);

        const stripe = await getStripe();
        if (!stripe) {
            throw new Error("Stripe not initialized");
        }

        const { error } = await stripe!.confirmCardPayment(client_secret, {
        payment_method: {
        card: cardElement
        }
    });

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