<template>
    <div>
        <NuxtLayout name="patient">

            <Head>
                <Title>{{ $t('patient.nav.photos') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('patient.nav.photos') }}</template>

            <div class="mt-2 space-y-5">
                <Alert type="danger" :text="state.error" v-if="state.error" />

                <!-- The clinic has not switched photos on (or the profile is still loading). -->
                <div v-if="profileLoaded && !isEnabled"
                    class="rounded-2xl border border-gray-200 bg-white px-6 py-8 text-center">
                    <Icon name="ph:camera-slash" class="mx-auto size-10 text-gray-300" aria-hidden="true" />
                    <p class="mt-2 text-sm text-gray-500">{{ $t('treatmentPhotos.patient.notAvailable') }}</p>
                    <FormButton class="mx-auto mt-4" buttonStyle="action" @click="navigateTo('/patient/overview')">
                        {{ $t('treatmentPhotos.patient.backToOverview') }}
                    </FormButton>
                </div>

                <LoadingSpinner :isActive="state.isLoading || !profileLoaded" v-else>
                    <div class="space-y-5">
                        <div
                            class="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white px-6 py-5">
                            <p class="max-w-xl text-sm text-gray-500">{{ $t('treatmentPhotos.patient.intro') }}</p>

                            <div class="flex flex-wrap items-center gap-2">
                                <template v-if="state.selectMode">
                                    <span class="text-xs text-gray-500">
                                        {{ $t('treatmentPhotos.selectedCount', { count: state.selected.length }) }}
                                    </span>
                                    <FormButton buttonStyle="primary" :disabled="state.selected.length !== 2"
                                        @click="openCompare">
                                        <Icon name="ph:columns" class="size-4" />
                                        {{ $t('treatmentPhotos.compare.button') }}
                                    </FormButton>
                                    <FormButton buttonStyle="cancel" @click="stopSelecting">
                                        {{ $t('cancel') }}
                                    </FormButton>
                                </template>
                                <template v-else>
                                    <FormButton buttonStyle="action" v-if="state.photos.length >= 2"
                                        @click="state.selectMode = true">
                                        <Icon name="ph:columns" class="size-4" />
                                        {{ $t('treatmentPhotos.compare.start') }}
                                    </FormButton>
                                    <FormButton buttonStyle="primary" @click="state.modal.isUploadOpen = true">
                                        <Icon name="ph:camera" class="size-4" />
                                        {{ $t('treatmentPhotos.upload.button') }}
                                    </FormButton>
                                </template>
                            </div>
                        </div>

                        <Alert type="default" :text="$t('treatmentPhotos.compare.selectHint')"
                            v-if="state.selectMode" />

                        <div v-if="!state.isLoading && state.photos.length === 0"
                            class="rounded-2xl border border-gray-200 bg-white px-6 py-10 text-center">
                            <Icon name="ph:camera" class="mx-auto size-10 text-gray-300" aria-hidden="true" />
                            <p class="mt-2 text-sm text-gray-500">{{ $t('treatmentPhotos.patient.empty') }}</p>
                        </div>

                        <div class="rounded-2xl border border-gray-200 bg-white px-4 py-5 sm:px-6"
                            v-else-if="state.photos.length > 0">
                            <ModulesUserCitizenTreatmentPhotosGroupGrid :groups="groups" :loadImage="loadImage"
                                viewer="patient" :allowEdit="false" :allowDelete="true" :selectMode="state.selectMode"
                                :selected="state.selected" @toggle="toggleSelected" @delete="askDelete" />
                            <p class="mt-6 text-xs text-gray-400">{{ $t('treatmentPhotos.patient.deleteHint') }}</p>
                        </div>
                    </div>
                </LoadingSpinner>

                <ModulesUserCitizenTreatmentPhotosModalUpload :isModalOpen="state.modal.isUploadOpen"
                    :milestones="state.milestones" :isPatient="true" :upload="uploadPhotos"
                    @close="state.modal.isUploadOpen = false" @uploaded="onUploaded" />
                <ModulesUserCitizenTreatmentPhotosModalCompare :isModalOpen="state.modal.isCompareOpen"
                    :photos="comparePhotos" :loadImage="loadImage" @close="state.modal.isCompareOpen = false" />
                <DialogConfirmation :isModalOpen="state.modal.isDeleteOpen"
                    :message="$t('treatmentPhotos.confirmDelete') + '?'" @close="state.modal.isDeleteOpen = false"
                    @confirm="deletePhoto" />
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { treatmentPhotoService } from '@/components/api/user/TreatmentPhotoService'
import { groupPhotosByMilestone, useTreatmentPhotoImages } from '@/composables/treatmentPhotoHelpers'
import { isTreatmentPhotosOn } from '@/composables/useTreatmentPhotos'
import { useAlert } from '@/composables/alert'
import { useUserStore } from '@/store/user'
import { useI18n } from 'vue-i18n'

const runtimeConfig = useRuntimeConfig()
const userStore = useUserStore() as any
const { successAlert } = useAlert()
const { t } = useI18n()

const state = reactive({
    error: '' as string,
    isLoading: false,
    photos: [] as any[],
    milestones: [] as any[],
    selectMode: false,
    selected: [] as string[],
    selectedPhoto: null as any,
    modal: {
        isUploadOpen: false,
        isDeleteOpen: false,
        isCompareOpen: false,
    },
})

// The layout fetches the patient profile; the flag is read from it once it is there.
const profileLoaded = computed(() => !!userStore.getUser?.company)
const isEnabled = computed(() => isTreatmentPhotosOn(userStore.getUser?.company))

const { loadImage, release } = useTreatmentPhotoImages((photo: any) =>
    treatmentPhotoService.getPatientPhotoFile(photo.uuid),
)

const groups = computed(() => groupPhotosByMilestone(state.photos, state.milestones))

const comparePhotos = computed(() =>
    state.photos
        .filter((photo: any) => state.selected.includes(photo.uuid))
        .sort((a: any, b: any) => String(a.taken_at).localeCompare(String(b.taken_at))),
)

watch(isEnabled, (enabled: boolean) => {
    if (enabled) {
        fetchPhotos()
        fetchMilestones()
    }
}, { immediate: true })

async function fetchPhotos() {
    state.error = ''
    state.isLoading = true
    try {
        const response = await treatmentPhotoService.getPatientPhotos()
        state.photos = response?.data ?? []
        if (!state.milestones.length) state.milestones = response?.meta?.milestones ?? []
        state.selected = state.selected.filter((uuid) => state.photos.some((photo: any) => photo.uuid === uuid))
    } catch (error: any) {
        state.error = error?.message ?? t('alert.somethingWentWrong')
    }
    state.isLoading = false
}

async function fetchMilestones() {
    try {
        const response = await treatmentPhotoService.getPatientMilestones()
        if (response?.data) state.milestones = response.data
    } catch {
        // The list response carries the same milestones.
    }
}

function uploadPhotos(formData: FormData) {
    return treatmentPhotoService.uploadPatientPhotos(formData)
}

function onUploaded() {
    successAlert(`${t('alert.success')}!`, t('treatmentPhotos.alert.uploaded'))
    fetchPhotos()
}

function askDelete(photo: any) {
    state.selectedPhoto = photo
    state.modal.isDeleteOpen = true
}

async function deletePhoto() {
    const photo = state.selectedPhoto
    if (!photo) return

    state.error = ''
    try {
        await treatmentPhotoService.deletePatientPhoto(photo.uuid)
        release(photo.uuid)
        state.selected = state.selected.filter((uuid) => uuid !== photo.uuid)
        state.photos = state.photos.filter((item: any) => item.uuid !== photo.uuid)
        successAlert(`${t('alert.success')}!`, t('treatmentPhotos.alert.deleted'))
    } catch (error: any) {
        state.error = error?.message ?? t('alert.somethingWentWrong')
        // The 24 hours may have run out since the page was loaded.
        if (error?.status === 403) fetchPhotos()
    }
}

function toggleSelected(photo: any) {
    if (state.selected.includes(photo.uuid)) {
        state.selected = state.selected.filter((uuid) => uuid !== photo.uuid)
    } else if (state.selected.length < 2) {
        state.selected = [...state.selected, photo.uuid]
    }
}

function stopSelecting() {
    state.selectMode = false
    state.selected = []
}

function openCompare() {
    if (state.selected.length !== 2) return
    state.modal.isCompareOpen = true
}
</script>
