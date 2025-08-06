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

    function formatPrice(pricing: any, locale: any) {
        const price = pricing
        if (isNaN(price)) return '0' // Ensure it's a valid number

        // Ensure two decimal places even for whole numbers
        const [whole, fraction = '00'] = Number(price).toFixed(2).split('.')

        if (locale === 'en') {
            // English: thousands separator as ',' and decimal as '.'
            const formattedWhole = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
            return `${formattedWhole}.${fraction}`
        } else if (locale === 'dk') {
            // Danish: thousands separator as '.' and decimal as ','
            const formattedWhole = whole.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
            return `${formattedWhole},${fraction}`
        } else {
            return `${whole}.${fraction}`
        }
    }

    return { formatNumber, formatPrice }
}