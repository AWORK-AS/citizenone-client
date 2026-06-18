<template>
    <div class="min-h-screen bg-[#F5F6F8]">

        <Head>
            <Title>{{ $t('attendance.checkIn') }} – {{ state.protocol?.name ?? '' }}</Title>
        </Head>

        <!-- Top bar -->
        <div class="bg-white border-b border-[#EAECF0] px-4 py-3 flex items-center justify-between sticky top-0 z-10">
            <div class="flex items-center gap-3">
                <button @click="router.back()"
                    class="p-2 rounded-lg text-[#5C6478] hover:bg-[#F5F6F8] transition-colors">
                    <Icon name="ph:arrow-left" class="w-5 h-5" />
                </button>
                <div>
                    <h1 class="text-[15px] font-semibold text-[#1F2533]">
                        {{ state.protocol?.name ?? $t('attendance.checkIn') }}
                    </h1>
                    <p class="text-[12px] text-[#8891A4]">{{ todayLabel }}</p>
                    <p v-if="state.protocol?.start_date" class="text-[11px] text-[#8891A4]">
                        {{ formatDateToReadable(state.protocol.start_date) }} – {{
                            formatDateToReadable(state.protocol.end_date) }}
                    </p>
                </div>
            </div>
            <div class="flex items-center gap-2">
                <span class="co-badge co-badge-green text-[11px]">
                    <span class="w-1.5 h-1.5 rounded-full bg-[#2E9E33]"></span>
                    {{ attendedCount }} {{ $t('protocols.table.status.attended') }}
                </span>
                <span class="co-badge co-badge-red text-[11px]">
                    <span class="w-1.5 h-1.5 rounded-full bg-[#CC3B2D]"></span>
                    {{ absentCount }} {{ $t('protocols.table.status.absent') }}
                </span>
                <span class="co-badge co-badge-gray text-[11px]">
                    {{ pendingCount }} {{ $t('attendance.pending') }}
                </span>
            </div>
        </div>

        <div class="max-w-2xl mx-auto px-4 py-6">
            <Alert type="danger" :text="state.error?.message"
                v-if="state.error?.message && state.error.message.length > 0" />

            <LoadingSpinner :isActive="state.isLoading">
                <!-- Empty -->
                <div v-if="!state.participants.length"
                    class="bg-white rounded-2xl border border-[#EAECF0] p-10 text-center shadow-sm">
                    <Icon name="ph:users" class="w-12 h-12 text-[#8891A4] opacity-30 mx-auto mb-3" />
                    <p class="text-[#8891A4] text-sm">{{ $t('attendance.noParticipantsToday') }}</p>
                </div>

                <!-- Participant cards -->
                <div v-else class="space-y-3">
                    <div v-for="participant in state.participants" :key="participant.uuid"
                        class="bg-white rounded-2xl border border-[#EAECF0] shadow-sm overflow-hidden transition-all"
                        :class="{
                            'border-[#2E9E33] bg-[#F6FBF6]': participant.status === 'attended',
                            'border-[#CC3B2D] bg-[#FFF8F8]': participant.status === 'absent',
                        }">
                        <div class="flex items-center gap-4 p-4">
                            <!-- Avatar -->
                            <div class="w-12 h-12 rounded-full flex items-center justify-center text-[14px] font-bold text-white flex-shrink-0"
                                :style="`background:${avatarColor(participantName(participant))}`">
                                {{ initials(participantName(participant)) }}
                            </div>

                            <!-- Name + status -->
                            <div class="flex-1 min-w-0">
                                <p class="text-[15px] font-semibold text-[#1F2533] truncate">
                                    {{ participantName(participant) }}
                                </p>
                                <p v-if="participant.date" class="text-[11px] text-[#8891A4]">
                                    {{ formatDateToReadable(participant.date) }}
                                </p>
                                <p class="text-[12px] mt-0.5">
                                    <span v-if="participant.status === 'attended'" class="text-[#2E9E33] font-medium">
                                        ✓ {{ $t('protocols.table.status.attended') }}
                                    </span>
                                    <span v-else-if="participant.status === 'absent'"
                                        class="text-[#CC3B2D] font-medium">
                                        ✗ {{ $t('protocols.table.status.absent') }}
                                        <span v-if="participant.absence?.name"> — {{ participant.absence.name }}</span>
                                    </span>
                                    <span v-else class="text-[#8891A4]">{{ $t('attendance.notRegistered') }}</span>
                                </p>
                            </div>

                            <!-- Action buttons -->
                            <div class="flex items-center gap-2 flex-shrink-0">
                                <button
                                    class="w-14 h-14 rounded-xl flex items-center justify-center transition-all text-[11px] font-semibold flex-col gap-0.5"
                                    :class="participant.status === 'attended'
                                        ? 'bg-[#2E9E33] text-white shadow-md'
                                        : 'bg-[#F5F6F8] text-[#5C6478] hover:bg-[#EDF7EE] hover:text-[#2E9E33]'"
                                    @click="markAttended(participant)"
                                    :disabled="state.loadingUuid === participant.uuid">
                                    <Icon name="ph:check-bold" class="w-5 h-5" />
                                    <span>{{ $t('attendance.in') }}</span>
                                </button>
                                <button
                                    class="w-14 h-14 rounded-xl flex items-center justify-center transition-all text-[11px] font-semibold flex-col gap-0.5"
                                    :class="participant.status === 'absent'
                                        ? 'bg-[#CC3B2D] text-white shadow-md'
                                        : 'bg-[#F5F6F8] text-[#5C6478] hover:bg-[#FFF0F0] hover:text-[#CC3B2D]'"
                                    @click="openAbsentModal(participant)"
                                    :disabled="state.loadingUuid === participant.uuid">
                                    <Icon name="ph:x-bold" class="w-5 h-5" />
                                    <span>{{ $t('attendance.out') }}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </LoadingSpinner>
        </div>

        <!-- Absent modal -->
        <ModulesUserAbsenceModalAbsent :isModalOpen="state.modal.isAbsentOpen" @close="state.modal.isAbsentOpen = false"
            @markAsAbsent="confirmAbsent" />
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import { protocolService } from '@/components/api/user/ProtocolService'
import { citizenProtocolService } from '@/components/api/user/CitizenProtocolService'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { useI18n } from 'vue-i18n'
import type { Error } from '@/types'

definePageMeta({ layout: false })

const router = useRouter()
const route = useRoute()
const { t } = useI18n()
const { formatDateToReadable } = useDatetimeFormatter()
const protocolUuid = route.params.uuid as string

const todayLabel = moment().format('dddd, D. MMMM YYYY')

const COLORS = ['#205E77', '#2E9E33', '#368F8B', '#1A4D99', '#D4900A', '#9B4D9B']
const avatarColor = (name: string) => COLORS[(name?.charCodeAt(0) ?? 0) % COLORS.length]
const initials = (name: string) =>
    (name || '?').split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)
const participantName = (p: any) =>
    `${p?.citizen?.firstname ?? p?.firstname ?? ''} ${p?.citizen?.lastname ?? p?.lastname ?? ''}`.trim() || '—'

const state = reactive({
    error: {} as Error,
    isLoading: false,
    loadingUuid: null as string | null,
    modal: { isAbsentOpen: false },
    participants: [] as any[],
    protocol: null as any,
    selectedParticipant: null as any,
})

const attendedCount = computed(() => state.participants.filter(p => p.status === 'attended').length)
const absentCount = computed(() => state.participants.filter(p => p.status === 'absent').length)
const pendingCount = computed(() => state.participants.filter(p => !p.status).length)

onMounted(() => {
    fetchProtocol()
    fetchParticipants()
})

async function fetchProtocol() {
    state.isLoading = true
    state.error = {} as Error
    try {
        const response = await protocolService.getProtocol(protocolUuid)
        state.protocol = response?.data ?? response
    } catch (error: any) {
        state.error = error
    }
    state.isLoading = false
}

async function fetchParticipants() {
    state.isLoading = true
    state.error = {} as Error
    try {
        const response = await protocolService.getCitizenProtocols(protocolUuid, {
            date: moment().format('YYYY-MM-DD'),
            page_limit: 'all',
        })
        state.participants = response?.data ?? response ?? []
    } catch (error: any) {
        state.error = error
    }
    state.isLoading = false
}

async function markAttended(participant: any) {
    state.loadingUuid = participant.uuid
    try {
        const params = {
            status: 'attended'
        }
        await citizenProtocolService.checkInCitizen(participant.uuid, params)
        const idx = state.participants.findIndex(p => p.uuid === participant.uuid)
        if (idx !== -1) {
            state.participants[idx] = { ...state.participants[idx], status: 'attended', absence: null }
        }
    } catch (error: any) {
        state.error = error
    }
    state.loadingUuid = null
}

function openAbsentModal(participant: any) {
    state.selectedParticipant = participant
    state.modal.isAbsentOpen = true
}

async function confirmAbsent(formData: any) {
    state.modal.isAbsentOpen = false
    if (!state.selectedParticipant) return
    state.loadingUuid = state.selectedParticipant.uuid
    try {
        const params = {
            status: 'absent'
        } as any
        if (formData?.absence) params.absence_uuid = formData.absence
        await citizenProtocolService.checkOutCitizen(state.selectedParticipant.uuid, params)
        await fetchParticipants()
    } catch (error: any) {
        state.error = error
    }
    state.loadingUuid = null
    state.selectedParticipant = null
}
</script>
