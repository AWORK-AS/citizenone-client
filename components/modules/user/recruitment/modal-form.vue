<template>
    <div>
        <Modal size="md" :title="props.recruitmentCase ? $t('recruitment.editTitle') : $t('recruitment.newTitle')"
            :show="props.isModalOpen" @close="emit('close')">
            <template #modal-body>
                <form class="space-y-4" @submit.prevent="save">
                    <Alert type="danger" :text="state.error?.message" v-if="state.error?.message" />

                    <div class="space-y-1">
                        <FormLabel for="recruitment-type" :label="$t('recruitment.fields.type')" />
                        <FormSelect id="recruitment-type" v-model="state.form.type" :options="typeOptions"
                            :canClear="false" />
                        <p class="text-xs text-slate-500">{{ $t('recruitment.typeHints.' + state.form.type) }}</p>
                        <FormError :error="state.error?.errors?.type?.[0]" />
                    </div>

                    <div class="space-y-1">
                        <FormLabel for="recruitment-title" :label="$t('recruitment.fields.title')" />
                        <FormTextField id="recruitment-title" name="recruitment-title" v-model="state.form.title"
                            :placeholder="$t('recruitment.placeholders.title')" />
                        <FormError :error="state.error?.errors?.title?.[0]" />
                    </div>

                    <!-- A re-match is for an indsats that is already running, so
                         the citizen is required there and optional otherwise. -->
                    <div v-if="!props.citizenUuid" class="space-y-1">
                        <FormLabel for="recruitment-citizen"
                            :label="state.form.type === 'rematch' ? $t('recruitment.fields.citizenRequired') : $t('recruitment.fields.citizen')" />
                        <FormSelect id="recruitment-citizen" v-model="state.form.citizen_uuid" :options="state.citizens"
                            :searchable="true" :placeholder="$t('recruitment.placeholders.citizen')" />
                        <FormError :error="state.error?.errors?.citizen_uuid?.[0]" />
                    </div>

                    <div class="space-y-1">
                        <FormLabel for="recruitment-responsible" :label="$t('recruitment.fields.responsible')" />
                        <FormSelect id="recruitment-responsible" v-model="state.form.responsible_user_uuid"
                            :options="state.employees" :searchable="true"
                            :placeholder="$t('recruitment.placeholders.responsible')" />
                    </div>

                    <div class="space-y-1">
                        <FormLabel for="recruitment-needs" :label="$t('recruitment.fields.needs')" />
                        <FormTextArea id="recruitment-needs" name="recruitment-needs" v-model="state.form.needs"
                            :placeholder="$t('recruitment.placeholders.needs')" :rows="3" />
                    </div>

                    <div class="space-y-1">
                        <FormLabel for="recruitment-requirements" :label="$t('recruitment.fields.requirements')" />
                        <FormTextArea id="recruitment-requirements" name="recruitment-requirements"
                            v-model="state.form.requirements" :placeholder="$t('recruitment.placeholders.requirements')"
                            :rows="3" />
                    </div>

                    <div class="grid grid-cols-1 gap-3 pt-2 md:grid-cols-2">
                        <FormButton type="button" buttonStyle="cancel" @click="emit('close')">
                            {{ $t('cancel') }}
                        </FormButton>
                        <FormButton type="submit" buttonStyle="primary" :disabled="state.isSaving">
                            {{ props.recruitmentCase ? $t('recruitment.save') : $t('recruitment.create') }}
                        </FormButton>
                    </div>
                </form>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
/**
 * Creates or edits a recruitment case. Opened from a citizen it is a re-match
 * for that citizen's indsats, and the citizen is not asked for.
 */
import { citizenService } from '@/components/api/user/CitizenService'
import { recruitmentCaseService } from '@/components/api/user/RecruitmentCaseService'
import { userService } from '@/components/api/user/UserService'
import { useI18n } from 'vue-i18n'
import type { Error } from '@/types'

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
    citizenUuid: {
        type: String,
        default: null,
    },
    defaultType: {
        type: String,
        default: 'acute',
    },
    recruitmentCase: {
        type: Object,
        default: null,
    },
})

const emit = defineEmits<{
    close: []
    saved: [recruitmentCase: any]
}>()

const { t } = useI18n()

const TYPES = ['acute', 'strategic', 'rematch']
const typeOptions = computed(() => TYPES.map(type => ({ value: type, label: t('recruitment.types.' + type) })))

function emptyForm() {
    return {
        type: props.defaultType,
        title: '',
        citizen_uuid: props.citizenUuid as string | null,
        responsible_user_uuid: null as string | null,
        needs: '',
        requirements: '',
    }
}

const state = reactive({
    error: {} as Error,
    isSaving: false,
    citizens: [] as { value: string, label: string }[],
    employees: [] as { value: string, label: string }[],
    form: emptyForm(),
})

watch(() => props.isModalOpen, (isOpen: boolean) => {
    if (!isOpen) return
    state.error = {}
    const existing = props.recruitmentCase as any
    state.form = existing
        ? {
            type: existing.type,
            title: existing.title ?? '',
            citizen_uuid: existing.citizen?.uuid ?? props.citizenUuid,
            responsible_user_uuid: existing.responsible?.uuid ?? null,
            needs: existing.needs ?? '',
            requirements: existing.requirements ?? '',
        }
        : emptyForm()
    fetchOptions()
}, { immediate: true })

function personOption(person: any) {
    return { value: person?.uuid, label: `${person?.firstname ?? ''} ${person?.lastname ?? ''}`.trim() }
}

async function fetchOptions() {
    try {
        const [employees, citizens] = await Promise.all([
            userService.getAllUsers({}),
            props.citizenUuid ? Promise.resolve(null) : citizenService.getAllCitizens({}),
        ])
        state.employees = (employees?.data ?? []).map(personOption)
        if (citizens) state.citizens = (citizens?.data ?? []).map(personOption)
    } catch (error: any) {
        state.error = error
    }
}

async function save() {
    state.error = {}
    state.isSaving = true
    try {
        const payload = {
            ...state.form,
            citizen_uuid: state.form.citizen_uuid || null,
            responsible_user_uuid: state.form.responsible_user_uuid || null,
        }
        const response = props.recruitmentCase
            ? await recruitmentCaseService.updateCase(props.recruitmentCase.uuid, payload)
            : await recruitmentCaseService.createCase(payload)
        emit('saved', response?.data)
    } catch (error: any) {
        state.error = error
    }
    state.isSaving = false
}
</script>
