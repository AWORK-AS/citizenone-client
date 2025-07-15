<template>
    <div>
        <Modal size="xs" :title="$t('citizens.citizenJournals.downloadJournals.downloadJournals')"
            :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <div id="formDownload">
                        <div class="space-y-3">
                            <Alert type="danger" :text="state?.error?.message"
                                v-if="state.error?.message && state.error.message.length > 0" />
                            <div class="space-y-1">
                                <FormDateRangeField name="date_range" v-model="state.filter.date_range"
                                    :placeholder="$t('citizens.citizenJournals.filter.filterDate')" />
                                <FormError :error="v$?.filter.date_range?.$errors[0]?.$message.toString()" />
                            </div>
                            <div class="space-y-1">
                                <p class="text-sm text-gray-600">
                                    {{ $t('journalNoteTags.journalNoteTags') }}
                                </p>
                                <FormSelectMultiple id="tags" :options="state.options.tags"
                                    v-model="state.downloadForm.tags" />
                            </div>
                            <div class="w-fit flex items-center cursor-pointer"
                                @click="state.downloadForm.include_risk_assessment = !state.downloadForm.include_risk_assessment">
                                <FormCheckbox :value="state.downloadForm.include_risk_assessment" />
                                {{ $t('citizens.citizenJournals.downloadJournals.include') }}
                                <span class="lowercase ml-1">
                                    {{ customPagesStore.getCustomPagesName?.riskAssessment }}
                                </span>
                            </div>
                        </div>
                        <div class="mt-6">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <FormButton type="button" buttonStyle="cancel" class="rounded-md" @click="closeModal">
                                    {{ $t('cancel') }}
                                </FormButton>
                                <FormButton type="submit" buttonStyle="primary" class="rounded-md w-full"
                                    @click="downloadJournals">
                                    {{ $t('citizens.citizenJournals.download') }}
                                </FormButton>
                            </div>
                        </div>
                    </div>
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>


<script setup lang="ts">
import moment from 'moment'
import { journalNoteTagService } from '@/components/api/user/JournalNoteTagService'
import { journalService } from '@/components/api/user/JournalService'
import { useVuelidate } from "@vuelidate/core"
import { required, helpers } from '@vuelidate/validators'
import { useCustomPagesStore } from '@/store/custom-pages'
import type { Error } from '@/types'
import { saveAs } from 'file-saver'
import { useI18n } from "vue-i18n"

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
})
const emit = defineEmits(['close'])

const { t } = useI18n()
const customPagesStore = useCustomPagesStore() as any
const router = useRouter()
const citizenUuid = router?.currentRoute?.value?.params?.uuid

const state = reactive({
    downloadForm: {
        start_date: '',
        end_date: '',
        include_risk_assessment: false,
        tags: [],
    },
    error: {} as Error,
    filter: {
        date_range: [],
    },
    isPageLoading: false,
    options: {
        tags: [],
    },
})

const rules = computed(() => {
    return {
        filter: {
            date_range: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
        }
    }
})

const v$ = useVuelidate(rules, state)

function closeModal() {
    emit('close')
}

watch(() => state.filter.date_range, (dates: any) => {
    state.downloadForm.start_date = dates?.[0]
    state.downloadForm.end_date = dates?.[1]
})

onMounted(() => {
    fetchAllJournalNoteTags()
})

async function fetchAllJournalNoteTags() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await journalNoteTagService.getAllJournalNoteTags()
        if (response.data) {
            let options: any = []
            response.data.forEach(
                (tag: any) => options.push({
                    value: tag?.uuid,
                    label: tag?.name,
                })
            )
            state.options.tags = options
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function downloadJournals() {
    state.error = {}
    state.isPageLoading = true
    v$.value.$validate()
    if (!v$.value.$error) {
        try {
            const params = {
                citizen_uuid: citizenUuid,
                start_date: state.downloadForm.start_date,
                end_date: state.downloadForm.end_date,
                include_risk_assessment: state.downloadForm.include_risk_assessment,
                journal_tags_uuid: Array(state.downloadForm.tags),
            }
            const response = await journalService.downloadJournals(params)
            if (response) {
                saveAs(response, 'Journals' + '-' + moment(state.downloadForm.start_date).format('MMMM-D-YYYY') + '-' + moment(state.downloadForm.end_date).format('MMMM-D-YYYY'))
            }
        } catch (error: any) {
            state.error = error
        }
    }
    state.isPageLoading = false
}
</script>

<style>
#formDownload .multiselect-dropdown {
    max-height: 4.8rem !important;
}
</style>