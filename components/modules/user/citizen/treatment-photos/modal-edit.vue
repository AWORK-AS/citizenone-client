<template>
    <Modal size="sm" :title="$t('treatmentPhotos.edit.title')" :show="props.isModalOpen" @close="closeModal">
        <template #modal-body>
            <LoadingSpinner :isActive="state.isSaving">
                <div class="space-y-4">
                    <Alert type="danger" :text="state.error" v-if="state.error" />

                    <p class="truncate text-sm text-gray-500">{{ props.photo?.name }}</p>

                    <div>
                        <FormLabel for="edit_taken_at" :label="$t('treatmentPhotos.dateTaken')" />
                        <FormDateField id="edit_taken_at" name="edit_taken_at" v-model="state.takenAt"
                            :placeholder="$t('treatmentPhotos.dateTaken')" :maxDate="today" />
                    </div>

                    <div>
                        <FormLabel for="edit_milestone" :label="$t('treatmentPhotos.milestone')" />
                        <FormSelect id="edit_milestone" v-model="state.milestone" :options="milestoneOptions"
                            :canClear="true" :searchable="false"
                            :placeholder="$t('treatmentPhotos.noMilestone')" openDirection="top" />
                    </div>

                    <div class="flex gap-x-3 pt-2">
                        <FormButton buttonStyle="cancel" class="w-full" @click="closeModal">
                            {{ $t('cancel') }}
                        </FormButton>
                        <FormButton buttonStyle="primary" class="w-full" :disabled="state.isSaving || !state.takenAt"
                            @click="save">
                            {{ $t('save') }}
                        </FormButton>
                    </div>
                </div>
            </LoadingSpinner>
        </template>
    </Modal>
</template>

<script setup lang="ts">
import moment from 'moment'
import { treatmentPhotoService } from '@/components/api/user/TreatmentPhotoService'
import { useAlert } from '@/composables/alert'
import { useI18n } from 'vue-i18n'

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
    citizenUuid: {
        type: String,
        required: true,
    },
    photo: {
        type: Object as () => any,
        required: false,
        default: null,
    },
    milestones: {
        type: Array as () => any[],
        required: false,
        default: () => [],
    },
})

const emit = defineEmits(['close', 'saved'])
const { successAlert } = useAlert()
const { t } = useI18n()

const today = moment().format('YYYY-MM-DD')

const state = reactive({
    takenAt: '',
    milestone: null as string | null,
    error: '',
    isSaving: false,
})

const milestoneOptions = computed(() =>
    [...props.milestones]
        .sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
        .map((milestone: any) => ({ value: milestone.uuid, label: milestone.name })),
)

watch(() => [props.isModalOpen, props.photo?.uuid], () => {
    if (!props.isModalOpen || !props.photo) return
    state.takenAt = props.photo.taken_at ?? today
    state.milestone = props.photo.milestone?.uuid ?? null
    state.error = ''
}, { immediate: true })

function closeModal() {
    emit('close')
}

async function save() {
    if (!props.photo || !state.takenAt) return

    state.error = ''
    state.isSaving = true
    try {
        const response = await treatmentPhotoService.updatePhoto(props.citizenUuid, props.photo.uuid, {
            taken_at: state.takenAt,
            milestone_uuid: state.milestone || null,
        })
        if (response?.data) {
            successAlert(`${t('alert.success')}!`, t('treatmentPhotos.alert.updated'))
            emit('saved', response.data)
            closeModal()
        }
    } catch (error: any) {
        const firstFieldError = error?.errors ? (Object.values(error.errors)[0] as any)?.[0] : null
        state.error = firstFieldError ?? error?.message ?? t('alert.somethingWentWrong')
    }
    state.isSaving = false
}
</script>
