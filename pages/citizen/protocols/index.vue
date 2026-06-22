<template>
    <div>
        <NuxtLayout name="citizen">

            <Head>
                <Title>{{ $t('protocols.myProtocols') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('protocols.myProtocols') }}</template>

            <div class="mt-6 space-y-8">
                <Alert type="danger" :text="state.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />

                <LoadingSpinner :isActive="state.isLoading">
                    <div v-if="state.protocols.length === 0 && !state.isLoading">
                        <Alert type="info" :text="$t('theListIsEmpty')" />
                    </div>

                    <div v-else class="space-y-8">
                        <!-- Today's entries -->
                        <section>
                            <p class="mb-3 text-xs font-bold text-primary uppercase tracking-widest">{{ $t('protocols.today') }}</p>
                            <div v-if="todayProtocols.length === 0"
                                class="bg-white rounded-2xl border border-gray-200 px-5 py-4 text-sm text-gray-400 italic">
                                {{ $t('protocols.noTodayEntries') }}
                            </div>
                            <div v-else class="space-y-3">
                                <div v-for="protocol in todayProtocols" :key="protocol.uuid"
                                    class="bg-white rounded-2xl border border-primary/30 px-5 py-4 flex items-center justify-between gap-4 shadow-sm">
                                    <div class="space-y-1.5">
                                        <p class="font-semibold text-gray-900">{{ protocol.protocol?.name }}</p>
                                        <p class="text-sm text-gray-500">{{ formatDateToReadable(protocol.date) }}</p>
                                        <span :class="statusClass(protocol.status)"
                                            class="inline-block text-xs font-medium px-2.5 py-0.5 rounded-full">
                                            {{ statusLabel(protocol.status) }}
                                        </span>
                                    </div>
                                    <div class="flex gap-2 shrink-0">
                                        <FormButton v-if="protocol.status === null" type="button" buttonStyle="action"
                                            :disabled="state.loadingUuid === protocol.uuid"
                                            @click="checkIn(protocol.uuid)">
                                            {{ $t('protocols.checkIn') }}
                                        </FormButton>
                                        <FormButton v-else-if="protocol.status === 'attended'" type="button"
                                            buttonStyle="cancel"
                                            :disabled="state.loadingUuid === protocol.uuid"
                                            @click="checkOut(protocol.uuid)">
                                            {{ $t('protocols.checkOut') }}
                                        </FormButton>
                                        <span v-else class="text-sm text-gray-400 italic self-center">
                                            {{ $t('protocols.table.status.absent') }}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <!-- Other entries (paginated) -->
                        <section v-if="otherProtocols.length > 0">
                            <p class="mb-3 text-xs font-bold text-gray-400 uppercase tracking-widest">{{ $t('protocols.other') }}</p>
                            <div class="space-y-3">
                                <div v-for="protocol in paginatedOthers" :key="protocol.uuid"
                                    class="bg-white rounded-2xl border border-gray-200 px-5 py-4 flex items-center justify-between gap-4">
                                    <div class="space-y-1.5">
                                        <p class="font-semibold text-gray-900">{{ protocol.protocol?.name }}</p>
                                        <p class="text-sm text-gray-500">{{ formatDateToReadable(protocol.date) }}</p>
                                        <span :class="statusClass(protocol.status)"
                                            class="inline-block text-xs font-medium px-2.5 py-0.5 rounded-full">
                                            {{ statusLabel(protocol.status) }}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div class="flex items-center justify-between mt-4" v-if="otherProtocols.length > perPage">
                                <FormButton type="button" buttonStyle="cancel" :disabled="state.currentPage === 1"
                                    @click="state.currentPage--">
                                    {{ $t('pagination.previous') }}
                                </FormButton>
                                <span class="text-sm text-gray-500">{{ state.currentPage }} / {{ totalPages }}</span>
                                <FormButton type="button" buttonStyle="cancel" :disabled="state.currentPage === totalPages"
                                    @click="state.currentPage++">
                                    {{ $t('pagination.next') }}
                                </FormButton>
                            </div>
                        </section>
                    </div>
                </LoadingSpinner>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { citizenProtocolService } from '@/components/api/citizen/ProtocolService'
import { useAlert } from '@/composables/alert'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { useI18n } from 'vue-i18n'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert, errorAlert } = useAlert()
const { formatDateToReadable } = useDatetimeFormatter()
const { t } = useI18n()

const perPage = 10

const state = reactive({
    protocols: [] as any[],
    isLoading: false,
    loadingUuid: null as string | null,
    error: {} as Error,
    currentPage: 1,
})

const todayProtocols = computed(() => state.protocols.filter((p: any) => p.date === today))
const otherProtocols = computed(() => state.protocols.filter((p: any) => p.date !== today))
const totalPages = computed(() => Math.max(1, Math.ceil(otherProtocols.value.length / perPage)))
const paginatedOthers = computed(() => {
    const start = (state.currentPage - 1) * perPage
    return otherProtocols.value.slice(start, start + perPage)
})

onMounted(() => {
    fetchProtocols()
})

const today = new Date().toISOString().slice(0, 10)

async function fetchProtocols() {
    state.error = {}
    state.isLoading = true
    try {
        const response = await citizenProtocolService.getProtocols({})
        if (response?.data) {
            state.protocols = [...response.data].sort((a: any, b: any) => a.date < b.date ? -1 : 1)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isLoading = false
}

async function checkIn(uuid: string) {
    state.loadingUuid = uuid
    try {
        const response = await citizenProtocolService.checkIn(uuid)
        if (response?.data) {
            const entry = state.protocols.find((p) => p.uuid === uuid)
            if (entry) entry.status = 'attended'
            successAlert(`${t('alert.success')}!`, `${t('protocols.form.alert.checkInSuccess')}.`)
        }
    } catch (error: any) {
        errorAlert(`${t('alert.error')}!`, error?.message ?? '')
    }
    state.loadingUuid = null
}

async function checkOut(uuid: string) {
    state.loadingUuid = uuid
    try {
        const response = await citizenProtocolService.checkOut(uuid)
        if (response?.data) {
            const entry = state.protocols.find((p) => p.uuid === uuid)
            if (entry) entry.status = 'absent'
            successAlert(`${t('alert.success')}!`, `${t('protocols.form.alert.checkOutSuccess')}.`)
        }
    } catch (error: any) {
        errorAlert(`${t('alert.error')}!`, error?.message ?? '')
    }
    state.loadingUuid = null
}

function statusLabel(status: string | null): string {
    if (status === 'attended') return t('protocols.table.status.attended')
    if (status === 'absent') return t('protocols.table.status.absent')
    return t('protocols.table.status.notRecorded')
}

function statusClass(status: string | null): string {
    if (status === 'attended') return 'bg-green-100 text-green-700'
    if (status === 'absent') return 'bg-red-100 text-red-700'
    return 'bg-gray-100 text-gray-600'
}
</script>
