<template>
    <div>
        <Alert type="danger" :text="state?.error?.message"
            v-if="state.error?.message && state.error.message.length > 0" />
        <LoadingSpinner :isActive="state.isPageLoading">
            <div class="flex justify-end md:justify-start">
                <div class="relative size-40">
                    <svg class="size-full -rotate-90" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
                        <!-- Background Circle -->
                        <circle cx="18" cy="18" r="16" fill="none" class="stroke-current text-gray-200"
                            stroke-width="2">
                        </circle>
                        <!-- Progress Circle -->
                        <circle cx="18" cy="18" r="16" fill="none" class="stroke-current text-primary" stroke-width="2"
                            stroke-dasharray="100"
                            :stroke-dashoffset="(100 - (state.proceduresProgress?.data?.total ?? 0))"
                            stroke-linecap="round" style="transition: stroke-dashoffset 1s ease;"></circle>
                    </svg>

                    <!-- Percentage Text -->
                    <div class="absolute top-1/2 start-1/2 transform -translate-y-1/2 -translate-x-1/2">
                        <span class="text-center text-2xl font-bold text-primary">
                            {{ formatPercentage(state.proceduresProgress?.data?.total) }}%
                        </span>
                    </div>
                </div>
            </div>
        </LoadingSpinner>


        <div v-for="(procedure, index) in state.procedures?.data" :key="index">
            <div class="mt-5 bg-white rounded-md ring-1 ring-inset ring-gray-200">
                <LoadingSpinner :isActive="state.isPageLoading">
                    <div class="p-7">
                        <div>
                            <p class="font-semibold">{{ procedure?.title }}</p>
                        </div>
                        <div class="mt-3 divide-y divide-gray-200 pl-5">
                            <div v-for="(task, index) in procedure?.procedure_tasks" :key="index">
                                <div class="grid grid-cols-1 lg:grid-cols-2 gap-x-10 py-5">
                                    <div class="order-last lg:order-first space-y-2">
                                        <p class="text-sm font-semibold">
                                            {{ task?.title }}
                                        </p>
                                        <p class="text-xs text-justify">
                                            <span
                                                v-html="task.isExpanded ? task?.content : task?.content.substring(0, 100) + '...'" />
                                        </p>
                                        <button class="text-primary text-xs hover:text-primary-700"
                                            @click="toggleContent(task)">
                                            {{ task.isExpanded ? $t('showLess') : $t('showMore') }}
                                        </button>
                                    </div>
                                    <div class="flex items-center gap-x-3 whitespace-nowrap">
                                        <div class="flex w-full h-2.5 bg-gray-200 rounded-full overflow-hidden"
                                            role="progressbar" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100">
                                            <div class="flex flex-col justify-center rounded-full overflow-hidden bg-primary text-xs text-white text-center whitespace-nowrap"
                                                :style="{ width: task?.progress ? task.progress + '%' : '0%', transition: 'width 0.5s ease' }">
                                            </div>
                                        </div>

                                        <div class="w-10 text-end">
                                            <span class="text-sm text-gray-800">{{ task?.progress }}%</span>
                                        </div>
                                        <div>
                                            <FormButton buttonSize="xs" buttonStyle="primary"
                                                @click="toggleTaskProgress(task)" v-if="task?.progress === 0">
                                                <Icon name="ph:check" class="w-4 h-4" aria-hidden="true" />
                                            </FormButton>
                                            <FormButton buttonSize="xs" buttonStyle="danger"
                                                class="border border-red-600 hover:border-red-700"
                                                @click="toggleTaskProgress(task)" v-else>
                                                <Icon name="ph:x" class="w-4 h-4" aria-hidden="true" />
                                            </FormButton>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </LoadingSpinner>
            </div>
        </div>
        <Pagination :data="state.procedures" @previous="previous" @next="next" />
    </div>
</template>

<script setup lang="ts">
import { procedureService } from '@/components/api/user/ProcedureService'
import { procedureTaskService } from '@/components/api/user/ProcedureTaskService'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'

const { successAlert } = useAlert()
const { t } = useI18n()
let currentTablePage = 1

const state = reactive({
    procedures: [] as any,
    proceduresProgress: [] as any,
    error: {} as Error,
    isPageLoading: false,
})

onMounted(() => {
    fetchProcedures()
    fetchProceduresProgress()
})

async function fetchProcedures() {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            page: currentTablePage,
        }
        const response = await procedureService.getProcedures(params)
        if (response) {
            state.procedures = response
            response.data.forEach((procedure: any) => {
                procedure.procedure_tasks.forEach((task: any) => {
                    task.isExpanded = false
                })
            })
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function fetchProceduresProgress() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await procedureService.getProceduresProgress()
        if (response) {
            state.proceduresProgress = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

function previous() {
    currentTablePage--
    fetchProcedures()
}

function next() {
    currentTablePage++
    fetchProcedures()
}

async function toggleTaskProgress(task: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const procedureTaskUuid = task?.uuid
        const response = await procedureTaskService.toggleProcedureTask(procedureTaskUuid)
        if (response) {
            successAlert(`${t('alert.success')}!`, `${t('tasks.form.alert.taskSuccessfullyUpdated')}.`)
            fetchProcedures()
            fetchProceduresProgress()
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

function toggleContent(task: any) {
    task.isExpanded = !task.isExpanded
}

function formatPercentage(total: any) {
    if (!Number.isInteger(Number(total))) {
        return parseFloat(total).toFixed(2).replace('.', ',')
    }
    return Number(total)
}
</script>