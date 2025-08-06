export function useNumberFormatter() {
    function formatNumber(language: string, amount: any) {
        if (isNaN(amount) || amount === null || amount === undefined) {
            return '0.00'
        }

        let numberStr = parseFloat(amount).toFixed(2)
        let [integerPart, decimalPart] = numberStr.split('.')

        let formattedIntegerPart: string

        if (language === 'dk') {
            // Danish: thousands = '.', decimal = ','
            formattedIntegerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
            return decimalPart === '00'
                ? formattedIntegerPart
                : `${formattedIntegerPart},${decimalPart}`
        } else {
            // Default (e.g., 'en'): thousands = ',', decimal = '.'
            formattedIntegerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
            return decimalPart === '00'
                ? formattedIntegerPart
                : `${formattedIntegerPart}.${decimalPart}`
        }
    }

    return { formatNumber }
}