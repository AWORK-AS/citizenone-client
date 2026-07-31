<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('shiftEvaluations.title') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('shiftEvaluations.title') }}</template>

            <div class="mt-8 max-w-2xl">
                <Alert type="danger" :text="state.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />

                <p class="text-sm text-gray-500 mb-4">
                    {{ $t('shiftEvaluations.explanation') }}
                </p>

                <LoadingSpinner :isActive="state.isLoading">
                    <div v-if="state.pendingSchedules.length > 0" class="mb-8">
                        <h3 class="text-sm font-semibold text-gray-700 mb-3">
                            {{ $t('shiftEvaluations.pendingHeading') }}
                        </h3>
                        <div class="space-y-3">
                            <div v-for="schedule in state.pendingSchedules" :key="schedule.uuid"
                                class="border border-gray-200 rounded-xl p-4 space-y-3">
                                <div class="flex items-center justify-between">
                                    <span class="font-medium">{{ schedule.date }}</span>
                                    <span class="text-sm text-gray-500">
                                        {{ formatTime(schedule.time_in) }} → {{ formatTime(schedule.time_out) }}
                                    </span>
                                </div>
                                <div class="flex items-center gap-1">
                                    <button v-for="star in 5" :key="star" type="button"
                                        @click="state.ratings[schedule.uuid] = star"
                                        class="text-2xl leading-none"
                                        :class="(state.ratings[schedule.uuid] ?? 0) >= star ? 'text-yellow-400' : 'text-gray-300'">
                                        <Icon :name="(state.ratings[schedule.uuid] ?? 0) >= star ? 'ph:star-fill' : 'ph:star'"
                                            size="24" />
                                    </button>
                                </div>
                                <FormTextArea :id="`comment_${schedule.uuid}`" :name="`comment_${schedule.uuid}`"
                                    :placeholder="$t('shiftEvaluations.form.commentPlaceholder')"
                                    v-model="state.comments[schedule.uuid]" />
                                <div class="flex justify-end">
                                    <FormButton type="button" buttonStyle="primary"
                                        :disabled="state.isSaving || !state.ratings[schedule.uuid]"
                                        @click="saveEvaluation(schedule)">
                                        {{ $t('save') }}
                                    </FormButton>
                                </div>
                            </div>
                        </div>
                    </div>

                    <h3 class="text-sm font-semibold text-gray-700 mb-3">
                        {{ $t('shiftEvaluations.submittedHeading') }}
                    </h3>
                    <p v-if="state.evaluations.length === 0" class="text-sm text-gray-400">
                        {{ $t('shiftEvaluations.empty') }}
                    </p>
                    <div class="space-y-2">
                        <div v-for="evaluation in state.evaluations" :key="evaluation.uuid"
                            class="flex items-center justify-between border border-gray-200 rounded-lg px-4 py-3">
                            <div>
                                <div class="flex items-center gap-2">
                                    <span class="font-medium">{{ evaluation.schedule?.date }}</span>
                                    <span class="flex items-center text-yellow-400">
                                        <Icon v-for="star in 5" :key="star"
                                            :name="evaluation.rating >= star ? 'ph:star-fill' : 'ph:star'" size="16" />
                                    </span>
                                </div>
                                <p v-if="evaluation.comment" class="text-sm text-gray-500 mt-1">
                                    {{ evaluation.comment }}
                                </p>
                            </div>
                            <button type="button" @click="removeEvaluation(evaluation)"
                                class="text-red-500 hover:text-red-700">
                                <Icon name="ph:trash" size="18" />
                            </button>
                        </div>
                    </div>
                </LoadingSpinner>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import { shiftEvaluationService } from '@/components/api/user/ShiftEvaluationService'
import { useUserStore } from '@/store/user'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()
const userStore = useUserStore() as any

watch(() => userStore.getUser, (user: any) => {
    if (user?.uuid && user?.is_extended_duty_schedule_active === false) navigateTo('/apps')
}, { immediate: true })

const breadcrumbLinks = [
    {
        name: 'shiftEvaluations.title',
        translate: true,
        href: '/my-shift-evaluations',
    },
]

const state = reactive({
    error: {} as Error,
    isLoading: false,
    isSaving: false,
    pendingSchedules: [] as any[],
    evaluations: [] as any[],
    ratings: {} as Record<string, number>,
    comments: {} as Record<string, string>,
})

onMounted(() => {
    fetchAll()
})

function formatTime(time: any) {
    if (!time) return ''
    return moment(time, 'HH:mm:ss').format('HH:mm')
}

async function fetchAll() {
    state.error = {}
    state.isLoading = true
    try {
        const [pendingResponse, evaluationsResponse] = await Promise.all([
            shiftEvaluationService.getPending(),
            shiftEvaluationService.getMine(),
        ])
        state.pendingSchedules = pendingResponse?.data ?? []
        state.evaluations = evaluationsResponse?.data ?? []
    } catch (error: any) {
        state.error = error
    }
    state.isLoading = false
}

async function saveEvaluation(schedule: any) {
    state.error = {}
    state.isSaving = true
    try {
        const params = {
            schedule_uuid: schedule.uuid,
            rating: state.ratings[schedule.uuid],
            comment: state.comments[schedule.uuid] || null,
        }
        const response = await shiftEvaluationService.saveEvaluation(params)
        if (response?.data) {
            successAlert(`${t('alert.success')}!`, `${t('shiftEvaluations.alert.savedSuccessfully')}.`)
            fetchAll()
        }
    } catch (error: any) {
        state.error = error
    }
    state.isSaving = false
}

async function removeEvaluation(evaluation: any) {
    try {
        await shiftEvaluationService.deleteEvaluation(evaluation.uuid)
        fetchAll()
        successAlert(`${t('alert.success')}!`, `${t('shiftEvaluations.alert.deletedSuccessfully')}.`)
    } catch (error: any) {
        state.error = error
    }
}
</script>
