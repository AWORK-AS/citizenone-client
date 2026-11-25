import { ref } from 'vue'
import { formFieldConfigService } from '@/components/api/user/FormFieldConfigService'
import {
    isStatusTypeEnabled,
    offeredStatusTypes,
    statusTypeOptions,
    type MedicineStatusType,
    type StatusTypeFields,
} from '@/composables/medicineStatusTypes'

type CurrentType = string | null | Array<string | null | undefined>

// Roadmap #317: the one way a dose dialog reads the company's status-type
// switches. The rules live in composables/medicineStatusTypes.ts.
//
// Until the settings have loaded (or if loading fails) every type counts as
// on, so a failed request never blocks logging a dose; the backend still
// refuses a switched-off type on a new dose.
//
// Pass the dialog's own type options (a getter, read lazily) to get
// typeOptionsFor(ownType): those options narrowed to the offered types.
export function useMedicineStatusTypes<T extends { value: string }>(options?: () => readonly T[]) {
    const statusTypeFields = ref<Record<string, boolean> | null>(null)

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
        offeredStatusTypes: (currentType?: CurrentType): MedicineStatusType[] =>
            offeredStatusTypes(statusTypeFields.value, currentType),
        typeOptionsFor: (currentType?: CurrentType): T[] =>
            statusTypeOptions(statusTypeFields.value, options?.() ?? [], currentType),
    }
}
