export function useNumberFormatter() {
    function formatNumber(language: string, amount: any) {
        if (amount === null || amount === undefined || isNaN(Number(amount))) {
            return language === "dk" ? "0,00" : "0.00";
        }

        const numberStr = Number(amount).toFixed(2);
        const [integerPart, decimalPart] = numberStr.split(".");

        if (language === "dk") {
            const formattedIntegerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
            return `${formattedIntegerPart},${decimalPart}`; // always 2 decimals
        } else {
            const formattedIntegerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            return `${formattedIntegerPart}.${decimalPart}`; // always 2 decimals
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