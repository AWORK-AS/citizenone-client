import { notify } from "@kyvg/vue3-notification"

export function useAlert() {
    function errorAlert(title: string, message: string) {
        notify({
            title: title,
            text: message || 'An unknown error occurred.',
            type: 'error',
            duration: 5000, // 5 seconds
        })
    }

    function successAlert(title: string, message: string) {
        notify({
            title: title,
            text: message,
            type: 'success',
            duration: 5000, // 5 seconds
        })
    }

    function warningAlert(title: string, message: string) {
        notify({
            title: title,
            text: message,
            type: 'warn',
            duration: 5000, // 5 seconds
        })
    }

    // A warning with one button. `app.vue` renders the button for toasts that
    // carry `data.action`; it stays up longer so there is time to press it.
    function warningAlertWithAction(title: string, message: string, action: { label: string; run: () => void | Promise<void> }) {
        notify({
            title: title,
            text: message,
            type: 'warn',
            duration: 15000,
            data: { action },
        })
    }

    return { errorAlert, successAlert, warningAlert, warningAlertWithAction }
}