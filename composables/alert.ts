import { notify } from "@kyvg/vue3-notification"

export function useAlert() {
    function errorAlert(title: string, message: string) {
        notify({
            title: title,
            text: message || 'An unknown error occurred.',
            type: 'error',
        })
    }

    function successAlert(title: string, message: string) {
        notify({
            title: title,
            text: message,
            type: 'success',
        })
    }

    return { errorAlert, successAlert }
}