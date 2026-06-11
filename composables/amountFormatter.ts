import { useI18n } from 'vue-i18n'

export function useAmountFormatter() {
    const { locale } = useI18n()

    // #153: show EUR in the English version, DKK otherwise. (Currency label only —
    // amounts are not FX-converted.)
    function currencyCode() {
        return locale.value === 'en' ? 'EUR' : 'DKK'
    }

    function formatAmount(amount: any) {
        // Ensure the input is a valid number
        if (isNaN(amount) || amount === null || amount === undefined) {
            return currencyCode() + ' ' + 0
        }

        // Convert the number to a string with two decimal places
        let numberStr = parseFloat(amount).toFixed(2)

        // Split the string into integer and decimal parts
        let parts = numberStr.split('.')
        let integerPart = parts[0]
        let decimalPart = parts[1]

        // Add the thousands separators
        let formattedIntegerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.')

        // Combine the integer part with the decimal part
        return currencyCode() + ' ' + formattedIntegerPart + ',' + decimalPart
    }

    return { formatAmount }
}