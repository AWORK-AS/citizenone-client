import { helpers, maxLength, required } from '@vuelidate/validators'
import { mileageLogService } from '@/components/api/user/MileageLogService'

/**
 * Car registration number on a trip ("Registreringsnummer på bil"), required
 * by the tax authority on every mileage record and by the server on a new trip.
 *
 * The server is the source of truth for normalization (trim, uppercase,
 * collapse inner whitespace, empty -> null); the client only uppercases as the
 * user types for a nicer UX and mirrors the server's validation.
 */
export const VEHICLE_REGISTRATION_MAX_LENGTH = 20

const ALLOWED_PATTERN = /^[\p{L}\p{N} -]*$/u

/** Uppercase while typing; keeps spaces so the caret doesn't jump. */
export function formatVehicleRegistrationInput(value: string | null | undefined): string {
    return (value ?? '').toUpperCase()
}

/** Value to send: trimmed, inner whitespace collapsed, empty -> null. */
export function normalizeVehicleRegistration(value: string | null | undefined): string | null {
    const normalized = (value ?? '').trim().replace(/\s+/g, ' ').toUpperCase()
    return normalized === '' ? null : normalized
}

/** Vuelidate rules for the field; empty passes only when not required. */
export function vehicleRegistrationRules(t: (key: string) => string, isRequired = false) {
    return {
        ...(isRequired ? {
            required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
        } : {}),
        maxLength: helpers.withMessage(
            () => t('mileageLog.form.vehicleRegistrationInvalid'),
            maxLength(VEHICLE_REGISTRATION_MAX_LENGTH)
        ),
        allowedCharacters: helpers.withMessage(
            () => t('mileageLog.form.vehicleRegistrationInvalid'),
            (value: string | null | undefined) => !helpers.req(value) || ALLOWED_PATTERN.test(String(value))
        ),
    }
}

/**
 * The user's last used registration number, or null. Never throws: a failed
 * lookup must never block a trip form.
 */
export async function fetchLastVehicleRegistration(): Promise<string | null> {
    try {
        const response = await mileageLogService.getLastVehicleRegistration()
        const value = response?.data?.vehicle_registration
        return typeof value === 'string' && value.trim() !== '' ? value : null
    } catch {
        return null
    }
}
