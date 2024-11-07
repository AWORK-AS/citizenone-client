export function useAmountFormatter() {
    function formatAmount(amount: any) {
        // Convert the number to a string with two decimal places
        let numberStr = parseFloat(amount).toFixed(2)

        // Split the string into integer and decimal parts
        let parts = numberStr.split('.')
        let integerPart = parts[0]
        let decimalPart = parts[1]

        // Add the thousands separators
        let formattedIntegerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.')

        // Combine the integer part with the decimal part
        return 'DKK ' + formattedIntegerPart + ',' + decimalPart
    }

    return { formatAmount }
}