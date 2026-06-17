declare namespace Dibs {
    interface CheckoutOptions {
        checkoutKey: string
        paymentId: string
        containerId: string
        language?: string
        theme?: Record<string, string>
    }

    class Checkout {
        constructor(options: CheckoutOptions)
        on(event: string, callback: (response: any) => void): void
        cleanup(): void
    }
}
