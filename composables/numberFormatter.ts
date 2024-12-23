export function useNumberFormatter() {
    function formatNumber(amount: any) {
        // Ensure the input is a valid number
        if (isNaN(amount) || amount === null || amount === undefined) {
            return 0
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
        return formattedIntegerPart + ',' + decimalPart
    }

    return { formatNumber }
}