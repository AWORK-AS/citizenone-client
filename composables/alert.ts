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

    return { errorAlert, successAlert }
}