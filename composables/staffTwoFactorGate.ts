import { ref } from 'vue'

/**
 * Set when the API answers 403 `two_factor_setup_required` with `scope: 'staff'`
 * (EnsureStaffTwoFactor): a colleague without 2FA while the panel requires it. The
 * superadmin layout opens the setup it cannot close; confirming clears it.
 */
export const staffTwoFactorSetupRequired = ref(false)
