import { computed } from 'vue'
import { useUserStore } from '@/store/user'
import { usePermissions } from '@/composables/usePermissions'

/**
 * The epikrise (discharge summary) switch is a company setting, off unless an
 * Admin turned it on in Settings. A company without the field (an older
 * payload) counts as off.
 */
export function isEpikriseOn(company: any): boolean {
    return company?.epikrise_enabled === true
}

/**
 * Everything epikrise-related is hidden unless the company switched it on AND
 * the user may create or send one (Admin has everything implicitly).
 */
export function useEpikrise() {
    const userStore = useUserStore() as any
    const { isAtLeast, can } = usePermissions()

    const isEnabled = computed(() => isEpikriseOn(userStore.getUser?.company))

    const canCreate = computed(() => isEnabled.value && (isAtLeast('Admin') || can('create_epikrise')))
    const canSend = computed(() => isEnabled.value && (isAtLeast('Admin') || can('send_epikrise')))

    // The tab, list and editor are visible to anyone who may create or send.
    const canUse = computed(() => canCreate.value || canSend.value)

    const canManageTemplates = computed(() => isEnabled.value && (isAtLeast('Admin') || can('manage_report_templates')))

    return { isEnabled, canCreate, canSend, canUse, canManageTemplates }
}

/**
 * The citizen's doctor contacts as select options for the recipient. The label
 * carries the clinic and "primary GP" so the right doctor is easy to pick.
 */
export function gpOptions(doctors: any[], primaryLabel: string): { value: string; label: string; is_primary_gp: boolean }[] {
    return (doctors ?? []).map((doctor: any) => {
        const name = [doctor?.firstname, doctor?.lastname].filter(Boolean).join(' ')
        const clinic = doctor?.clinic_name || doctor?.company_name
        const parts = [name, clinic].filter(Boolean).join(', ')
        const isPrimary = doctor?.is_primary_gp === true

        return {
            value: doctor?.uuid,
            label: isPrimary ? `${parts} (${primaryLabel})` : parts,
            is_primary_gp: isPrimary,
        }
    })
}
