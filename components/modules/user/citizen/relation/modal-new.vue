<template>
    <div>
        <Modal size="md" :title="$t('citizenRelations.new')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <Alert type="danger" :text="state.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <form @submit.prevent="saveRelation" class="space-y-4">
                        <div class="space-y-1">
                            <FormLabel for="related_citizen" :label="$t('citizenRelations.relatedCitizen')" />
                            <FormSelect id="related_citizen" :options="relatedCitizenOptions"
                                :placeholder="$t('citizenRelations.selectCitizen')"
                                v-model="state.form.related_citizen_uuid" />
                            <FormError :error="state.error?.errors?.related_citizen_uuid?.[0]" />
                        </div>
                        <div class="space-y-1" v-if="props.relationshipOptions.length > 0">
                            <FormLabel :label="$t('citizenRelations.relationshipType')" />
                            <div class="flex flex-wrap gap-2">
                                <button v-for="opt in props.relationshipOptions" :key="opt.value" type="button"
                                    @click="toggleRelationship(opt.value)"
                                    :class="['rounded-full border px-3 py-1.5 text-xs font-semibold transition',
                                        state.form.relationship_uuid === opt.value
                                            ? 'border-[#2dbab2] bg-[#f0faf9] text-[#1b6d8a]'
                                            : 'border-surface-200 bg-white text-slate-500 hover:border-secondary/40 hover:text-secondary']">
                                    {{ opt.label }}
                                </button>
                            </div>
                            <FormError :error="state.error?.errors?.relationship_uuid?.[0]" />
                        </div>
                        <div class="grid grid-cols-2 gap-3 mt-6">
                            <FormButton type="button" buttonStyle="cancel" @click="closeModal">
                                {{ $t('cancel') }}
                            </FormButton>
                            <FormButton type="submit" buttonStyle="primary">
                                {{ $t('save') }}
                            </FormButton>
                        </div>
                    </form>
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { citizenRelationService } from '@/components/api/user/CitizenRelationService'
import { useAlert } from '@/composables/alert'
import { useI18n } from 'vue-i18n'
import type { Error } from '@/types'

const { successAlert } = useAlert()
const { t } = useI18n()

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
    citizenUuid: {
        type: String,
        required: true,
    },
    citizenOptions: {
        type: Array as () => any[],
        default: () => [],
    },
    relationshipOptions: {
        type: Array as () => any[],
        default: () => [],
    },
})

const emit = defineEmits(['close', 'refreshRelations'])

const state = reactive({
    isPageLoading: false,
    error: {} as Error,
    form: {
        related_citizen_uuid: '',
        relationship_uuid: '',
    },
})

// Can't relate a citizen to themselves — drop the current citizen from the list.
const relatedCitizenOptions = computed(() =>
    props.citizenOptions.filter((option: any) => option.value !== props.citizenUuid)
)

watch(() => props.isModalOpen, (isOpen: boolean) => {
    if (isOpen) {
        state.error = {}
        state.form.related_citizen_uuid = ''
        state.form.relationship_uuid = ''
    }
})

async function saveRelation() {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            citizen_uuid: props.citizenUuid,
            related_citizen_uuid: state.form.related_citizen_uuid,
            relationship_uuid: state.form.relationship_uuid || null,
        }
        const response = await citizenRelationService.saveRelation(params)
        if (response?.data) {
            emit('refreshRelations')
            closeModal()
            successAlert(`${t('alert.success')}!`, `${t('citizenRelations.added')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

function toggleRelationship(value: string) {
    // Tap a selected chip again to clear it — relationship type is optional.
    state.form.relationship_uuid = state.form.relationship_uuid === value ? '' : value
}

function closeModal() {
    emit('close')
}
</script>
