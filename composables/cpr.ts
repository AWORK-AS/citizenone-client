/**
 * A Danish CPR number already contains the date of birth and the gender, so
 * staff should not have to type them a second time.
 *
 * Format: DDMMYY-SSSS. The seventh digit together with the two-digit year
 * decides the century, and an even final digit means female.
 */
export function useDanishCpr() {
    function digitsOf(value?: string | null): string {
        return (value ?? '').replace(/\D/g, '')
    }

    function centuryFor(seventhDigit: number, shortYear: number): number | null {
        if (seventhDigit <= 3) return 1900
        if (seventhDigit === 4 || seventhDigit === 9) return shortYear <= 36 ? 2000 : 1900
        if (seventhDigit >= 5 && seventhDigit <= 8) return shortYear <= 57 ? 2000 : 1800
        return null
    }

    function pad(value: number): string {
        return String(value).padStart(2, '0')
    }

    /**
     * Returns the birthday and gender held in the number, or null when the
     * number is incomplete or the date does not exist.
     */
    function parse(value?: string | null): { birthday: string; gender: 'male' | 'female' } | null {
        const digits = digitsOf(value)

        if (digits.length !== 10) return null

        const day = Number(digits.slice(0, 2))
        const month = Number(digits.slice(2, 4))
        const shortYear = Number(digits.slice(4, 6))
        const century = centuryFor(Number(digits[6]), shortYear)

        if (!century) return null

        const year = century + shortYear
        const date = new Date(Date.UTC(year, month - 1, day))

        const isRealDate = date.getUTCFullYear() === year
            && date.getUTCMonth() === month - 1
            && date.getUTCDate() === day

        if (!isRealDate) return null

        return {
            birthday: `${year}-${pad(month)}-${pad(day)}`,
            gender: Number(digits[9]) % 2 === 0 ? 'female' : 'male',
        }
    }

    return { parse }
}
