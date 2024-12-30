export function euDecimalValidation() {
    function validateEuropeanDecimal(input: string): string {
        // Remove invalid characters (anything that is not a digit or a comma)
        let validInput = input.replace(/[^0-9,]/g, '')

        // Ensure only one comma is present
        const commaParts = validInput.split(',')
        if (commaParts.length > 2) {
            validInput = `${commaParts[0]},${commaParts[1]}` // Keep only the first two parts
        }

        return validInput
    }

    return { validateEuropeanDecimal }
}