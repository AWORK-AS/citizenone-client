import { useI18n } from 'vue-i18n'

export function useAmountFormatter() {
    const { locale } = useI18n()

    // #153: show EUR in the English version, DKK otherwise. (Currency label only —
    // amounts are not FX-converted.)
    function currencyCode() {
        return locale.value === 'en' ? 'EUR' : 'DKK'
    }

    function parseAmount(amount: any): number {
        if (amount === null || amount === undefined) return NaN
        const str = String(amount).trim()
        // European format: "5.000,00" — comma is the decimal separator
        if (/,\d{1,2}$/.test(str)) {
            return parseFloat(str.replace(/\./g, '').replace(',', '.'))
        }
        // English format: "4,440.00" — period is the decimal separator
        return parseFloat(str.replace(/,/g, ''))
    }

    function formatAmount(amount: any) {
        const value = parseAmount(amount)
        if (isNaN(value)) {
            return currencyCode() + ' 0'
        }

        const isEn = locale.value === 'en'
        const thousandsSep = isEn ? ',' : '.'
        const decimalSep = isEn ? '.' : ','

        const parts = value.toFixed(2).split('.')
        const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSep)

        return currencyCode() + ' ' + integerPart + decimalSep + parts[1]
    }

    return { formatAmount }
}