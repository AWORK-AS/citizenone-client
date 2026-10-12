<template>
    <!-- Task 136: one card per citizen on a clip-card protocol. A clip is used
         when the citizen is present, and can be undone from the card's history. -->
    <div class="space-y-4">
        <Alert type="danger" :text="state.error?.message"
            v-if="state.error?.message && state.error.message.length > 0" />

        <div class="flex flex-wrap items-center justify-between gap-3">
            <p class="text-sm text-gray-600">
                {{ $t('protocols.clipCard.summary', {
                    clips: props.protocol?.clip_count,
                    start: formatDateToReadable(props.protocol?.start_date),
                    end: formatDateToReadable(props.protocol?.end_date),
                }) }}
            </p>
            <div class="w-full sm:w-64" v-if="state.cards.length > 5">
                <FormTextField id="clip_card_search" name="clip_card_search"
                    :placeholder="$t('protocols.clipCard.searchCitizen')" v-model="state.search" />
            </div>
        </div>

        <Alert type="warning" :text="periodNotice" v-if="periodNotice" />

        <LoadingSpinner :isActive="state.isLoading">
            <div v-if="!state.isLoading && filteredCards.length === 0"
                class="bg-white rounded-2xl border border-gray-200 p-10 text-center">
                <Icon name="ph:ticket" class="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p class="text-sm text-gray-500">{{ $t('protocols.clipCard.noCards') }}</p>
            </div>

            <ul v-else class="space-y-3">
                <li v-for="card in filteredCards" :key="card.uuid"
                    class="bg-white rounded-2xl border border-gray-200 shadow-sm">
                    <div class="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                        <div class="flex items-center gap-4 flex-1 min-w-0">
                            <div class="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                                :style="`background:${avatarColor(citizenName(card))}`" aria-hidden="true">
                                {{ initials(citizenName(card)) }}
                            </div>
                            <div class="min-w-0 space-y-1.5">
                                <p class="text-[15px] font-semibold text-gray-900 truncate">{{ citizenName(card) }}</p>
                                <!-- The card itself: a punched hole per clip used. -->
                                <div v-if="card.clip_count <= MAX_DOTS" class="flex flex-wrap gap-1"
                                    role="img" :aria-label="clipsLeftLabel(card)">
                                    <span v-for="n in card.clip_count" :key="n" class="size-3 rounded-full border"
                                        :class="n <= card.clips_used
                                            ? 'bg-gray-300 border-gray-300'
                                            : 'bg-primary/15 border-primary'" />
                                </div>
                                <div v-else class="h-2 w-48 max-w-full rounded-full bg-gray-200 overflow-hidden"
                                    role="img" :aria-label="clipsLeftLabel(card)">
                                    <div class="h-full bg-primary"
                                        :style="`width:${(card.clips_remaining / card.clip_count) * 100}%`" />
                                </div>
                                <p class="text-xs text-gray-500">
                                    <span class="font-medium tabular-nums"
                                        :class="card.clips_remaining === 0 ? 'text-gray-500' : 'text-gray-900'">
                                        {{ clipsLeftLabel(card) }}
                                    </span>
                                    <span> · </span>
                                    <span v-if="card.uses?.length">
                                        {{ $t('protocols.clipCard.lastUsed', {
                                            date: formatDateToReadable(card.uses[0].date),
                                            time: card.uses[0].time,
                                        }) }}
                                    </span>
                                    <span v-else>{{ $t('protocols.clipCard.notUsedYet') }}</span>
                                </p>
                            </div>
                        </div>

                        <div class="flex items-center gap-2 sm:flex-shrink-0">
                            <FormButton type="button" buttonStyle="action" @click="toggleHistory(card.uuid)"
                                :aria-expanded="state.openHistory.includes(card.uuid)">
                                <Icon name="ph:clock-counter-clockwise" class="size-4" />
                                {{ state.openHistory.includes(card.uuid)
                                    ? $t('protocols.clipCard.hideHistory')
                                    : $t('protocols.clipCard.history') }}
                            </FormButton>
                            <!-- Neutral, not red: a used-up card is a normal end state, not an error. -->
                            <span v-if="card.clips_remaining === 0"
                                class="px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 text-xs font-medium whitespace-nowrap">
                                {{ $t('protocols.clipCard.usedUp') }}
                            </span>
                            <FormButton v-else type="button" buttonStyle="primary" @click="useClip(card)"
                                :disabled="!card.is_in_period || state.pendingUuid === card.uuid">
                                <Icon name="ph:ticket" class="size-4" />
                                {{ $t('protocols.clipCard.useClip') }}
                            </FormButton>
                        </div>
                    </div>

                    <div v-if="state.openHistory.includes(card.uuid)" class="border-t border-gray-100 px-4 py-3">
                        <p v-if="!card.uses?.length" class="text-sm text-gray-500">{{ $t('protocols.clipCard.noUses') }}</p>
                        <ol v-else class="divide-y divide-gray-100">
                            <li v-for="(use, index) in card.uses" :key="use.uuid"
                                class="flex items-center justify-between gap-3 py-2 text-sm">
                                <span class="text-gray-700">
                                    <span class="tabular-nums text-gray-400 mr-2">#{{ card.uses.length - index }}</span>
                                    {{ $t('protocols.clipCard.usedOn', {
                                        date: formatDateToReadable(use.date),
                                        time: use.time,
                                    }) }}
                                </span>
                                <button type="button" @click="confirmUndo(card, use)"
                                    :disabled="state.pendingUuid === card.uuid"
                                    class="text-sm font-medium text-red-600 hover:underline disabled:opacity-50">
                                    {{ $t('protocols.clipCard.undo') }}
                                </button>
                            </li>
                        </ol>
                    </div>
                </li>
            </ul>
        </LoadingSpinner>

        <DialogConfirmation :isModalOpen="state.undo !== null"
            :message="$t('protocols.clipCard.undoConfirmation')"
            @close="state.undo = null" @confirm="undoClip" />
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import { protocolService } from '@/components/api/user/ProtocolService'
import { useAlert } from '@/composables/alert'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { useI18n } from 'vue-i18n'
import type { Error } from '@/types'

const props = defineProps({
    protocol: {
        type: Object,
        required: true,
    },
})

const { t } = useI18n()
const { successAlert } = useAlert()
const { formatDateToReadable } = useDatetimeFormatter()

// Up to this many clips the card is drawn clip by clip; above it, as a bar.
const MAX_DOTS = 30

const COLORS = ['#205E77', '#2E9E33', '#368F8B', '#1A4D99', '#D4900A', '#9B4D9B']
const avatarColor = (name: string) => COLORS[(name?.charCodeAt(0) ?? 0) % COLORS.length]
const initials = (name: string) =>
    (name || '?').split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)
const citizenName = (card: any) =>
    `${card?.citizen?.firstname ?? ''} ${card?.citizen?.lastname ?? ''}`.trim() || '—'
const clipsLeftLabel = (card: any) =>
    t('protocols.clipCard.clipsLeft', { remaining: card.clips_remaining, total: card.clip_count })

const state = reactive({
    cards: [] as any[],
    error: {} as Error,
    isLoading: false,
    openHistory: [] as string[],
    pendingUuid: null as string | null,
    search: '',
    undo: null as { card: any, use: any } | null,
})

const filteredCards = computed(() => {
    const term = state.search.trim().toLowerCase()
    return term ? state.cards.filter((card) => citizenName(card).toLowerCase().includes(term)) : state.cards
})

// Clips can only be used inside the protocol's period; say why the buttons are off.
const periodNotice = computed(() => {
    const today = moment().format('YYYY-MM-DD')
    if (props.protocol?.start_date && today < props.protocol.start_date) {
        return t('protocols.clipCard.notStarted', { date: formatDateToReadable(props.protocol.start_date) })
    }
    if (props.protocol?.end_date && today > props.protocol.end_date) {
        return t('protocols.clipCard.expired', { date: formatDateToReadable(props.protocol.end_date) })
    }
    return ''
})

onMounted(fetchCards)

async function fetchCards() {
    state.error = {} as Error
    state.isLoading = true
    try {
        const response = await protocolService.getClipCards(props.protocol.uuid)
        state.cards = response?.data ?? []
    } catch (error: any) {
        state.error = error
    }
    state.isLoading = false
}

function replaceCard(card: any) {
    const index = state.cards.findIndex((c) => c.uuid === card.uuid)
    if (index !== -1) state.cards[index] = card
}

async function useClip(card: any) {
    if (state.pendingUuid) return
    state.error = {} as Error
    state.pendingUuid = card.uuid
    try {
        const response = await protocolService.useClip(card.uuid)
        if (response?.data) {
            replaceCard(response.data)
            successAlert(`${t('alert.success')}!`, t('protocols.clipCard.clipUsed', {
                name: citizenName(response.data),
                remaining: response.data.clips_remaining,
            }))
        }
    } catch (error: any) {
        state.error = error
        // Someone else may have used the last clip; show the card as it is now.
        fetchCards()
    }
    state.pendingUuid = null
}

function toggleHistory(cardUuid: string) {
    const index = state.openHistory.indexOf(cardUuid)
    if (index === -1) state.openHistory.push(cardUuid)
    else state.openHistory.splice(index, 1)
}

function confirmUndo(card: any, use: any) {
    state.undo = { card, use }
}

async function undoClip() {
    if (!state.undo) return
    const { card, use } = state.undo
    state.undo = null
    state.error = {} as Error
    state.pendingUuid = card.uuid
    try {
        const response = await protocolService.undoClip(card.uuid, use.uuid)
        if (response?.data) {
            replaceCard(response.data)
            successAlert(`${t('alert.success')}!`, t('protocols.clipCard.clipUndone', {
                remaining: response.data.clips_remaining,
            }))
        }
    } catch (error: any) {
        state.error = error
        fetchCards()
    }
    state.pendingUuid = null
}
</script>
