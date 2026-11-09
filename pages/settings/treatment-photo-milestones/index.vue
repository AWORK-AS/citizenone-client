<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('treatmentPhotosSettings.milestones.title') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('treatmentPhotosSettings.milestones.title') }}</template>

            <div class="mt-8 space-y-5">
                <Alert type="danger" :text="state.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />
                <Alert type="info" :text="$t('treatmentPhotosSettings.milestones.featureOff')"
                    v-if="!isTreatmentPhotosEnabled" />

                <div class="flex flex-wrap items-start justify-between gap-3">
                    <p class="max-w-2xl text-sm text-gray-500">{{ tt('treatmentPhotosSettings.milestones.description') }}</p>
                    <FormButton v-if="isAtLeast('Admin')" type="button" buttonStyle="action" @click="openNew"
                        data-testid="milestone-add">
                        <Icon name="ph:plus" class="size-4" />
                        {{ $t('treatmentPhotosSettings.milestones.add') }}
                    </FormButton>
                </div>

                <div class="rounded-lg border border-gray-200 bg-white">
                    <p v-if="!state.milestones.length && !state.isLoading" class="px-4 py-5 text-sm text-gray-400">
                        {{ $t('treatmentPhotosSettings.milestones.empty') }}
                    </p>

                    <div v-for="(milestone, index) in state.milestones" :key="milestone.uuid"
                        class="flex flex-wrap items-center gap-3 border-b border-gray-50 px-4 py-2.5 last:border-b-0"
                        data-testid="milestone-row">
                        <div class="min-w-0 flex-1">
                            <p class="text-sm font-medium text-gray-900">{{ milestone.name }}</p>
                            <p class="text-xs text-gray-500">
                                {{ $t('treatmentPhotosSettings.milestones.offsetValue', { days: milestone.offset_days }) }}
                            </p>
                        </div>
                        <div v-if="isAtLeast('Admin')" class="flex items-center gap-2">
                            <Tooltip :text="$t('treatmentPhotosSettings.milestones.moveUp')">
                                <FormButton type="button" buttonStyle="action" :disabled="index === 0 || state.isSaving"
                                    :aria-label="$t('treatmentPhotosSettings.milestones.moveUp')" @click="move(index, -1)">
                                    <Icon name="ph:arrow-up" class="size-4" />
                                </FormButton>
                            </Tooltip>
                            <Tooltip :text="$t('treatmentPhotosSettings.milestones.moveDown')">
                                <FormButton type="button" buttonStyle="action"
                                    :disabled="index === state.milestones.length - 1 || state.isSaving"
                                    :aria-label="$t('treatmentPhotosSettings.milestones.moveDown')" @click="move(index, 1)">
                                    <Icon name="ph:arrow-down" class="size-4" />
                                </FormButton>
                            </Tooltip>
                            <Tooltip :text="$t('treatmentPhotosSettings.milestones.edit')">
                                <FormButton type="button" buttonStyle="action"
                                    :aria-label="$t('treatmentPhotosSettings.milestones.edit')" @click="openEdit(milestone)">
                                    <Icon name="ph:pencil-simple" class="size-4" />
                                </FormButton>
                            </Tooltip>
                            <Tooltip :text="$t('treatmentPhotosSettings.milestones.delete')">
                                <FormButton type="button" buttonStyle="danger"
                                    :aria-label="$t('treatmentPhotosSettings.milestones.delete')"
                                    @click="confirmDelete(milestone)">
                                    <Icon name="ph:trash" class="size-4" />
                                </FormButton>
                            </Tooltip>
                        </div>
                    </div>
                </div>
            </div>

            <Modal size="xs" :show="state.isFormOpen"
                :title="state.editingUuid ? $t('treatmentPhotosSettings.milestones.edit') : $t('treatmentPhotosSettings.milestones.add')"
                @close="state.isFormOpen = false">
                <template #modal-body>
                    <form class="space-y-4" @submit.prevent="save">
                        <Alert type="danger" :text="state.formError"
                            v-if="state.formError && state.formError.length > 0" />
                        <div>
                            <FormLabel for="milestone-name" :label="$t('treatmentPhotosSettings.milestones.name')" />
                            <FormTextField id="milestone-name" name="milestone-name" v-model="state.form.name"
                                :placeholder="$t('treatmentPhotosSettings.milestones.namePlaceholder')" :maxLength="120" />
                        </div>
                        <div>
                            <FormLabel for="milestone-offset" :label="$t('treatmentPhotosSettings.milestones.offsetDays')" />
                            <FormNumberField name="milestone-offset" v-model="state.form.offset_days"
                                :placeholder="$t('treatmentPhotosSettings.milestones.offsetPlaceholder')" :min="0" />
                            <p class="mt-1 text-xs text-gray-500">{{ $t('treatmentPhotosSettings.milestones.offsetHint') }}</p>
                        </div>
                        <div class="flex gap-x-3">
                            <FormButton type="button" buttonStyle="cancel" class="w-full" @click="state.isFormOpen = false">
                                {{ $t('cancel') }}
                            </FormButton>
                            <FormButton type="submit" buttonStyle="primary" class="w-full"
                                :disabled="!state.form.name.trim() || state.form.offset_days === '' || state.isSaving">
                                {{ $t('save') }}
                            </FormButton>
                        </div>
                    </form>
                </template>
            </Modal>

            <DialogConfirmation :isModalOpen="state.isDeleteOpen"
                :message="$t('treatmentPhotosSettings.milestones.deleteConfirm', { name: state.deleting?.name ?? '' })"
                @close="state.isDeleteOpen = false" @confirm="remove" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'require-admin' })

import { treatmentPhotoMilestoneService } from '@/components/api/user/TreatmentPhotoMilestoneService'
import { useAlert } from '@/composables/alert'
import { usePermissions } from '@/composables/usePermissions'
import { useTerminology } from '@/composables/useTerminology'
import { useTreatmentPhotos } from '@/composables/useTreatmentPhotos'
import { useI18n } from 'vue-i18n'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert, errorAlert } = useAlert()
const { t } = useI18n()
const { tt } = useTerminology()
const { isAtLeast } = usePermissions()
const { isEnabled: isTreatmentPhotosEnabled } = useTreatmentPhotos()

const breadcrumbLinks = [
    { name: 'treatmentPhotosSettings.milestones.title', translate: true, href: '/settings/treatment-photo-milestones' },
]

const state = reactive({
    error: {} as Error,
    formError: '',
    isLoading: false,
    isSaving: false,
    milestones: [] as any[],
    isFormOpen: false,
    editingUuid: '',
    form: { name: '', offset_days: '' as string },
    isDeleteOpen: false,
    deleting: null as any,
})

onMounted(fetchMilestones)

async function fetchMilestones() {
    state.error = {}
    state.isLoading = true
    try {
        const response = await treatmentPhotoMilestoneService.getMilestones()
        state.milestones = response?.data ?? []
    } catch (error: any) {
        state.error = error
    }
    state.isLoading = false
}

function openNew() {
    state.editingUuid = ''
    state.form = { name: '', offset_days: '' }
    state.formError = ''
    state.isFormOpen = true
}

function openEdit(milestone: any) {
    state.editingUuid = milestone.uuid
    state.form = { name: milestone.name, offset_days: String(milestone.offset_days ?? '') }
    state.formError = ''
    state.isFormOpen = true
}

async function save() {
    const payload = { name: state.form.name.trim(), offset_days: Number(state.form.offset_days) }
    state.formError = ''
    state.isSaving = true
    try {
        if (state.editingUuid) {
            await treatmentPhotoMilestoneService.updateMilestone(state.editingUuid, payload)
        } else {
            await treatmentPhotoMilestoneService.saveMilestone(payload)
        }
        state.isFormOpen = false
        successAlert(`${t('alert.success')}!`, `${t('treatmentPhotosSettings.milestones.saved')}.`)
        await fetchMilestones()
    } catch (error: any) {
        state.formError = error?.errors?.name?.[0] ?? error?.errors?.offset_days?.[0] ?? error?.message
            ?? t('treatmentPhotosSettings.milestones.saveFailed')
    }
    state.isSaving = false
}

function confirmDelete(milestone: any) {
    state.deleting = milestone
    state.isDeleteOpen = true
}

async function remove() {
    if (!state.deleting) return
    try {
        await treatmentPhotoMilestoneService.deleteMilestone(state.deleting.uuid)
        successAlert(`${t('alert.success')}!`, `${t('treatmentPhotosSettings.milestones.deleted')}.`)
        await fetchMilestones()
    } catch (error: any) {
        errorAlert(t('alert.warning'), error?.message ?? t('treatmentPhotosSettings.milestones.deleteFailed'))
    }
}

// No drag-and-drop library is in use in the repo; the other settings lists
// reorder with up and down buttons, so this one does too.
async function move(index: number, direction: number) {
    const target = index + direction
    if (target < 0 || target >= state.milestones.length) return

    const reordered = [...state.milestones]
    const [moved] = reordered.splice(index, 1)
    reordered.splice(target, 0, moved)
    state.milestones = reordered

    state.isSaving = true
    try {
        const response = await treatmentPhotoMilestoneService.reorderMilestones(reordered.map((m: any) => m.uuid))
        state.milestones = response?.data ?? reordered
    } catch (error: any) {
        state.error = error
        fetchMilestones()
    }
    state.isSaving = false
}
</script>
