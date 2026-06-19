import { useI18n } from 'vue-i18n'

export function useAmountFormatter() {
    const { locale } = useI18n()

    // #153: show EUR in the English version, DKK otherwise. (Currency label only —
    // amounts are not FX-converted.)
    function currencyCode() {
        return locale.value === 'en' ? 'EUR' : 'DKK'
    }

    function formatAmount(amount: any) {
        if (amount === null || amount === undefined) {
            return currencyCode() + ' 0'
        }

        const cleaned = parseFloat(String(amount).replace(/,/g, ''))
        if (isNaN(cleaned)) {
            return currencyCode() + ' 0'
        }

        const isEn = locale.value === 'en'
        const thousandsSep = isEn ? ',' : '.'
        const decimalSep = isEn ? '.' : ','

        const parts = cleaned.toFixed(2).split('.')
        const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSep)

        return currencyCode() + ' ' + integerPart + decimalSep + parts[1]
    }

    return { formatAmount }
}