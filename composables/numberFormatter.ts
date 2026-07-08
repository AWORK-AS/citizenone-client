export function useNumberFormatter() {
    // Only 'en' uses comma-thousands/period-decimal; dk/no/sv (and anything else)
    // use the European period-thousands/comma-decimal convention.
    function formatNumber(language: string, amount: any) {
        if (amount === null || amount === undefined || isNaN(Number(amount))) {
            return language === "en" ? "0.00" : "0,00";
        }

        const numberStr = Number(amount).toFixed(2);
        const [integerPart, decimalPart] = numberStr.split(".");

        if (language === "en") {
            const formattedIntegerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            return `${formattedIntegerPart}.${decimalPart}`; // always 2 decimals
        } else {
            const formattedIntegerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
            return `${formattedIntegerPart},${decimalPart}`; // always 2 decimals
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
        } else {
            // dk/no/sv: thousands separator as '.' and decimal as ','
            const formattedWhole = whole.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
            return `${formattedWhole},${fraction}`
        }
    }

    // Inverse of formatNumber: parses a locale-formatted amount string back into a number.
    // Only 'en' treats '.' as the decimal separator; dk/no/sv (and anything else) treat ',' as decimal.
    function parseLocaleNumber(language: string, v: any): number {
        const str = String(v ?? '0');
        if (language === "en") {
            return parseFloat(str.replace(/,/g, '')) || 0;
        }
        return parseFloat(str.replace(/\./g, '').replace(',', '.')) || 0;
    }

    return { formatNumber, formatPrice, parseLocaleNumber }
}