<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('inquiryPipelineStages.title') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('inquiryPipelineStages.title') }}</template>

            <div class="mt-8 space-y-5">
                <Alert type="danger" :text="state.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />

                <p class="max-w-2xl text-sm text-gray-500">
                    {{ $t('inquiryPipelineStages.description') }}
                </p>

                <div class="rounded-lg border border-gray-200 bg-white divide-y divide-gray-100">
                    <div v-for="(stage, index) in state.stages" :key="stage.uuid"
                        class="flex flex-wrap items-end gap-4 p-4">
                        <div class="w-full sm:w-64">
                            <FormLabel :for="`stage-name-${stage.uuid}`"
                                :label="$t('inquiryPipelineStages.form.name')" />
                            <FormTextField :id="`stage-name-${stage.uuid}`" :name="`stage-name-${stage.uuid}`"
                                v-model="stage.name" :placeholder="$t('inquiryPipelineStages.form.namePlaceholder')"
                                :maxLength="60" @blur="saveStage(stage)" />
                        </div>

                        <div class="w-28">
                            <FormLabel :for="`stage-color-${stage.uuid}`"
                                :label="$t('inquiryPipelineStages.form.color')" />
                            <FormColorPicker :id="`stage-color-${stage.uuid}`" v-model="stage.color"
                                @update:modelValue="saveStage(stage)" />
                        </div>

                        <div class="w-full sm:w-56">
                            <FormLabel :for="`stage-role-${stage.uuid}`"
                                :label="$t('inquiryPipelineStages.form.role')" />
                            <FormSelect :id="`stage-role-${stage.uuid}`" v-model="stage.system_role"
                                :options="roleOptions" :canClear="false" :searchable="false"
                                @update:modelValue="saveStage(stage)" />
                        </div>

                        <!-- Entering this stage tells the recruitment team. -->
                        <label class="flex items-center gap-2 pb-2.5 text-sm text-slate-700 cursor-pointer">
                            <input type="checkbox" class="size-4 rounded border-slate-300 text-primary focus:ring-primary"
                                :checked="!!stage.notifies_recruitment"
                                @change="stage.notifies_recruitment = ($event.target as HTMLInputElement).checked; saveStage(stage)" />
                            {{ $t('inquiryPipelineStages.form.notifiesRecruitment') }}
                        </label>

                        <div class="flex items-center gap-2 ml-auto">
                            <Tooltip :text="$t('inquiryPipelineStages.actions.moveUp')">
                                <FormButton type="button" buttonStyle="action" :disabled="index === 0"
                                    :aria-label="$t('inquiryPipelineStages.actions.moveUp')" @click="move(index, -1)">
                                    <Icon name="ph:arrow-up" class="size-4" />
                                </FormButton>
                            </Tooltip>
                            <Tooltip :text="$t('inquiryPipelineStages.actions.moveDown')">
                                <FormButton type="button" buttonStyle="action"
                                    :disabled="index === state.stages.length - 1"
                                    :aria-label="$t('inquiryPipelineStages.actions.moveDown')" @click="move(index, 1)">
                                    <Icon name="ph:arrow-down" class="size-4" />
                                </FormButton>
                            </Tooltip>
                            <Tooltip :text="deleteTooltip(stage)">
                                <FormButton type="button" buttonStyle="danger" :disabled="isProtected(stage)"
                                    :aria-label="$t('inquiryPipelineStages.actions.delete')"
                                    @click="confirmDelete(stage)">
                                    <Icon name="ph:trash" class="size-4" />
                                </FormButton>
                            </Tooltip>
                        </div>
                    </div>

                    <p v-if="!state.isLoading && state.stages.length === 0" class="p-6 text-sm text-gray-400">
                        {{ $t('inquiryPipelineStages.empty') }}
                    </p>
                </div>

                <div class="rounded-lg border border-gray-200 bg-white p-4">
                    <p class="mb-3 text-sm font-semibold text-gray-900">
                        {{ $t('inquiryPipelineStages.addStage') }}
                    </p>
                    <div class="flex flex-wrap items-end gap-4">
                        <div class="w-full sm:w-64">
                            <FormLabel for="new-stage-name" :label="$t('inquiryPipelineStages.form.name')" />
                            <FormTextField id="new-stage-name" name="new-stage-name" v-model="state.newStage.name"
                                :placeholder="$t('inquiryPipelineStages.form.namePlaceholder')" :maxLength="60" />
                        </div>
                        <div class="w-28">
                            <FormLabel for="new-stage-color" :label="$t('inquiryPipelineStages.form.color')" />
                            <FormColorPicker id="new-stage-color" v-model="state.newStage.color" />
                        </div>
                        <FormButton type="button" buttonStyle="action" :disabled="!state.newStage.name.trim()"
                            @click="addStage">
                            <Icon name="ph:plus" class="size-4" />
                            {{ $t('inquiryPipelineStages.addStage') }}
                        </FormButton>
                    </div>
                </div>

                <ModulesUserInquirySettingsRecruitment />

                <ModulesUserInquirySettingsLostReasons />
            </div>

            <DialogConfirmation :isModalOpen="state.isDeleteOpen"
                :message="$t('inquiryPipelineStages.confirmation.delete') + '?'" @close="state.isDeleteOpen = false"
                @confirm="deleteStage" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'require-page', requiredPage: 'Inquiries', requiredCompanyFlag: 'inquiry_pipeline_enabled' })

import { inquiryPipelineStageService } from '@/components/api/user/InquiryPipelineStageService'
import { useAlert } from '@/composables/alert'
import { useI18n } from 'vue-i18n'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()

const breadcrumbLinks = [
    {
        name: 'inquiryPipelineStages.title',
        translate: true,
        href: '/settings/inquiry-pipeline-stages',
    },
]

// A stage carrying one of these roles cannot be deleted: the pipeline needs an
// entry point and a stage that converts the inquiry into an intervention.
const PROTECTED_ROLES = ['new', 'won']

const state = reactive({
    error: {} as Error,
    isDeleteOpen: false,
    isLoading: false,
    newStage: {
        name: '',
        color: '#94a3b8',
    },
    selectedStage: null as any,
    stages: [] as any[],
})

const roleOptions = computed(() => [
    { value: 'neutral', label: t('inquiryPipelineStages.roles.neutral') },
    { value: 'new', label: t('inquiryPipelineStages.roles.new') },
    { value: 'won', label: t('inquiryPipelineStages.roles.won') },
    { value: 'lost', label: t('inquiryPipelineStages.roles.lost') },
])

onMounted(() => {
    fetchStages()
})

function isProtected(stage: any) {
    return PROTECTED_ROLES.includes(stage?.system_role)
}

function deleteTooltip(stage: any) {
    return isProtected(stage)
        ? t('inquiryPipelineStages.actions.deleteProtected')
        : t('inquiryPipelineStages.actions.delete')
}

async function fetchStages() {
    state.error = {}
    state.isLoading = true
    try {
        const response = await inquiryPipelineStageService.getStages()
        state.stages = response?.data ?? []
    } catch (error: any) {
        state.error = error
    }
    state.isLoading = false
}

async function saveStage(stage: any) {
    if (!stage?.name?.trim()) return
    state.error = {}
    try {
        await inquiryPipelineStageService.updateStage(stage.uuid, {
            name: stage.name,
            color: stage.color,
            system_role: stage.system_role,
            notifies_recruitment: !!stage.notifies_recruitment,
        })
    } catch (error: any) {
        state.error = error
        // The server rejected the change, so the row must not keep showing it.
        fetchStages()
    }
}

async function addStage() {
    state.error = {}
    try {
        await inquiryPipelineStageService.saveStage({
            name: state.newStage.name.trim(),
            color: state.newStage.color,
        })
        state.newStage = { name: '', color: '#94a3b8' }
        await fetchStages()
        successAlert(`${t('alert.success')}!`, `${t('inquiryPipelineStages.alert.created')}.`)
    } catch (error: any) {
        state.error = error
    }
}

function confirmDelete(stage: any) {
    state.selectedStage = stage
    state.isDeleteOpen = true
}

async function deleteStage() {
    state.error = {}
    state.isDeleteOpen = false
    try {
        await inquiryPipelineStageService.deleteStage(state.selectedStage.uuid)
        await fetchStages()
        successAlert(`${t('alert.success')}!`, `${t('inquiryPipelineStages.alert.deleted')}.`)
    } catch (error: any) {
        state.error = error
    }
}

async function move(index: number, direction: number) {
    const target = index + direction
    if (target < 0 || target >= state.stages.length) return

    const reordered = [...state.stages]
    const [moved] = reordered.splice(index, 1)
    reordered.splice(target, 0, moved)
    state.stages = reordered

    state.error = {}
    try {
        const response = await inquiryPipelineStageService.reorderStages(reordered.map((s: any) => s.uuid))
        state.stages = response?.data ?? reordered
    } catch (error: any) {
        state.error = error
        fetchStages()
    }
}
</script>
