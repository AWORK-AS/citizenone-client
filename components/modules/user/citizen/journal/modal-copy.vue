<template>
    <div>
        <Modal size="xs" :title="$t('citizens.citizenJournals.copy.copyJournal')" :show="props.isModalOpen"
            @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <form @submit.prevent="copyJournal" id="formCopy">
                        <div class="space-y-3">
                            <Alert type="danger" :text="state?.error?.message"
                                v-if="state.error?.message && state.error.message.length > 0" />
                            <div class="space-y-1">
                                <FormLabel for="citizen_uuid" :label="$t('citizens.citizenJournals.copy.citizen')" />
                                <FormSelect id="citizen_uuid" :options="state.options.citizens"
                                    v-model="state.formCopy.citizen_uuid" />
                                <FormError :error="v$?.formCopy?.citizen_uuid?.$errors[0]?.$message.toString()" />
                                <FormError :error="state?.error?.errors?.citizen_uuid?.[0]" />
                            </div>
                        </div>
                        <div class="mt-6">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <FormButton type="button" buttonStyle="cancel" class="rounded-md" @click="closeModal">
                                    {{ $t('cancel') }}
                                </FormButton>
                                <FormButton type="submit" buttonStyle="primary" class="rounded-md w-full">
                                    {{ $t('citizens.citizenJournals.copy.copy') }}
                                </FormButton>
                            </div>
                        </div>
                    </form>
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>


<script setup lang="ts">
import { citizenService } from '@/components/api/user/CitizenService'
import { journalService } from '@/components/api/user/JournalService'
import { useVuelidate } from "@vuelidate/core"
import { required, helpers } from '@vuelidate/validators'
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'
import { useI18n } from "vue-i18n"

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
    selectedJournal: {
        type: Object,
        required: true,
    },
})
const emit = defineEmits(['close', 'refreshJournal'])

const { t } = useI18n()
const { successAlert } = useAlert()

const state = reactive({
    formCopy: {
        citizen_uuid: '',
    },
    error: {} as Error,
    isPageLoading: false,
    options: {
        citizens: [],
    },
})

const rules = computed(() => {
    return {
        formCopy: {
            citizen_uuid: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
        }
    }
})

const v$ = useVuelidate(rules, state)

function closeModal() {
    emit('close')
}

function refreshJournal() {
    emit('refreshJournal')
}

onMounted(() => {
    fetchAllCitizens()
})

async function fetchAllCitizens() {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {}
        const response = await citizenService.getAllCitizens(params)
        if (response.data) {
            let options: any = []
            response.data.forEach(
                (citizen: any) => options.push({
                    value: citizen?.uuid,
                    label: citizen?.firstname + " " + (citizen?.lastname ?? ''),
                    green: citizen?.green,
                    yellow: citizen?.yellow,
                    red: citizen?.red,
                })
            )
            options.shift()
            state.options.citizens = options
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function copyJournal() {
    state.error = {}
    state.isPageLoading = true
    v$.value.$validate()
    if (!v$.value.$error) {
        try {
            const journalUuid = props.selectedJournal?.uuid
            const params = {
                citizen_uuid: state.formCopy.citizen_uuid,
            }
            const response = await journalService.copyJournal(journalUuid, params)
            if (response?.data) {
                refreshJournal()
                closeModal()
                successAlert(`${t('alert.success')}!`, `${t('citizens.citizenJournals.alert.successfullyCopied')}.`)
            }
        } catch (error: any) {
            state.error = error
        }
    }
    state.isPageLoading = false
}
</script>

<style>
#formCopy .multiselect-dropdown {
    max-height: 4.8rem !important;
}
</style>