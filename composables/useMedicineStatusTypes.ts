import { ref } from 'vue'
import { formFieldConfigService } from '@/components/api/user/FormFieldConfigService'
import { medicineStatusTypes, type MedicineStatusType, type StatusTypeFields } from '@/composables/medicineStatusTypes'

// Roadmap #317: the one way a dose dialog reads the company's status-type
// switches. The rules live in composables/medicineStatusTypes.ts.
//
// Until the settings have loaded (or if loading fails) every type counts as
// on, so a failed request never blocks logging a dose; the backend still
// refuses a switched-off type on a new dose.
export function useMedicineStatusTypes() {
    const statusTypeFields = ref<Record<string, boolean> | null>(null)
    const { isStatusTypeEnabled, offeredStatusTypes } = medicineStatusTypes()

    async function loadStatusTypeFields(): Promise<StatusTypeFields> {
        try {
            const response = await formFieldConfigService.getFormConfigs({ entity_type: 'citizen_medicine_history' })
            statusTypeFields.value = response?.data?.find((c: any) => c.form_type === 'status_types')?.form_fields ?? null
        } catch {
            statusTypeFields.value = null
        }
        return statusTypeFields.value
    }

    return {
        statusTypeFields,
        loadStatusTypeFields,
        isStatusTypeEnabled: (type: string) => isStatusTypeEnabled(statusTypeFields.value, type),
        offeredStatusTypes: (currentType?: string | null | Array<string | null | undefined>): MedicineStatusType[] =>
            offeredStatusTypes(statusTypeFields.value, currentType),
    }
}
