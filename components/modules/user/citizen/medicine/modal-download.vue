<template>
    <div>
        <Modal size="xs" :title="$t('citizens.medicineJournals.downloadOverview')" :show="props.isModalOpen"
            @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <div class="space-y-3">
                        <Alert type="danger" :text="state?.error?.message"
                            v-if="state.error?.message && state.error.message.length > 0" />
                        <form @submit.prevent="handleDownload()" id="formDownloadMedicineOverview">
                            <div class="space-y-3">
                                <div class="space-y-1">
                                    <FormLabel for="date_range" :label="$t('citizens.medicineJournals.form.date')" />
                                    <FormDateRangeField id="date_range" name="date_range"
                                        :placeholder="$t('citizens.medicineJournals.form.date')"
                                        v-model="state.filter.date_range" />
                                    <FormError :error="v$?.filter.date_range?.$errors[0]?.$message.toString()" />
                                </div>
                            </div>
                            <div class="mt-6">
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <FormButton type="button" buttonStyle="cancel"
                                        @click="closeModal">
                                        {{ $t('cancel') }}
                                    </FormButton>
                                    <FormButton type="submit" buttonStyle="primary" class="w-full">
                                        {{ $t('citizens.medicineJournals.download') }}
                                    </FormButton>
                                </div>
                            </div>
                        </form>
                    </div>
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { medicineJournalService } from '@/components/api/user/MedicineJournalService'
import { useVuelidate } from "@vuelidate/core"
import { required, helpers } from '@vuelidate/validators'
import { useI18n } from "vue-i18n"
import { saveAs } from 'file-saver'
import type { Error } from '@/types'
import { useCitizenMedicineStore } from '@/store/citizen-medicines'

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
})
const { t } = useI18n()
const emit = defineEmits(['close'])
const router = useRouter()
const citizenUuid = router?.currentRoute?.value?.params?.uuid
const citizenMedicineStore = useCitizenMedicineStore() as any

const state = reactive({
    error: {} as Error,
    filter: {
        date_range: [] as any,
    },
    isPageLoading: false,
    formDownload: {
        date_start: '',
        date_end: '',
    },
})

watch(() => props.isModalOpen, () => {
    state.error = {}
})

const rules = computed(() => {
    return {
        filter: {
            date_range: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
        },
    }
})
const v$ = useVuelidate(rules, state)

function closeModal() {
    emit('close')
}

watch(() => state.filter.date_range, (dates: any) => {
    state.formDownload.date_start = dates?.[0]
    state.formDownload.date_end = dates?.[1]
})

async function handleDownload() {
    v$.value.$validate()
    if (!v$.value.$error) {
        downloadMedicineOverview()
    }
}

async function downloadMedicineOverview() {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            citizen_uuid: citizenUuid,
            citizen_medicine_uuid: Array(citizenMedicineStore.getSelectedMedicines),
            date_start: state.formDownload.date_start,
            date_end: state.formDownload.date_end,
        }
        const response = await medicineJournalService.downloadMedicineOverview(params)
        if (response) {
            if (response) {
                saveAs(response, t('citizens.medicineJournals.downloadOverview'))
            }
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>

<style>
#formDownloadMedicineOverview .multiselect-dropdown {
    max-height: 5rem !important;
}
</style>