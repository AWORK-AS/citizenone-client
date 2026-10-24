<template>
    <div v-if="offered">
        <FormButton type="button" :buttonStyle="buttonStyle ?? 'cancel'" class="w-full justify-center" @click="open()">
            {{ buttonLabel || $t('managerSuggestion.button') }}
        </FormButton>

        <Modal size="xs" :title="$t('managerSuggestion.title')" :show="isOpen" @close="isOpen = false">
            <template #modal-body>
                <form class="space-y-4 pb-6" @submit.prevent="send()">
                    <div class="rounded-lg border border-gray-200 bg-gray-50 p-3">
                        <p class="text-sm font-semibold text-muted-800">{{ appName }}</p>
                        <p v-if="priceText" class="text-xs text-gray-600">{{ priceText }}</p>
                    </div>

                    <fieldset class="space-y-1">
                        <legend class="text-sm font-medium text-gray-700">{{ $t('managerSuggestion.to') }}</legend>
                        <label v-for="r in status?.recipients ?? []" :key="r.uuid"
                            class="flex items-center gap-2 text-sm text-gray-700">
                            <input type="checkbox" :checked="selected.includes(r.uuid)"
                                class="h-4 w-4 rounded border-gray-300" @change="selected = toggleRecipient(selected, r.uuid)" />
                            {{ r.name }}
                        </label>
                    </fieldset>

                    <div class="space-y-1">
                        <FormLabel for="suggest_message" :label="$t('managerSuggestion.message')" />
                        <FormTextArea id="suggest_message" name="suggest_message" :rows="4"
                            :placeholder="$t('managerSuggestion.message')" v-model="message" />
                        <p class="text-xs text-gray-500">{{ $t('managerSuggestion.noPersonalData') }}</p>
                        <p v-if="problem === 'personal_number'" class="text-xs text-red-600" role="alert">
                            {{ $t('managerSuggestion.personalNumber') }}
                        </p>
                        <p v-else-if="problem === 'too_long'" class="text-xs text-red-600" role="alert">
                            {{ $t('managerSuggestion.tooLong', { max: SUGGESTION_MESSAGE_MAX }) }}
                        </p>
                    </div>

                    <p class="text-xs text-gray-500">{{ $t('managerSuggestion.calm') }}</p>
                    <p v-if="errorText" class="text-sm text-red-600" role="alert">{{ errorText }}</p>

                    <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <FormButton type="button" buttonStyle="cancel" @click="isOpen = false">{{ $t('cancel') }}</FormButton>
                        <FormButton type="submit" buttonStyle="primary"
                            :disabled="sending || !selected.length || !!problem || !message.trim()">
                            {{ $t('managerSuggestion.send') }}
                        </FormButton>
                    </div>
                </form>
            </template>
        </Modal>

        <p v-if="confirmed" class="mt-2 text-xs text-gray-600" role="status">{{ confirmed }}</p>
    </div>
    <p v-else-if="confirmed" class="text-xs text-gray-600" role="status">{{ confirmed }}</p>
    <!-- Where the button cannot be offered, the Cody preview still says why instead of going quiet. -->
    <p v-else-if="showStates && stateText" class="text-sm text-gray-600" role="status">{{ stateText }}</p>
</template>

<script setup lang="ts">
import { managerSuggestionService } from '@/components/api/user/ManagerSuggestionService'
import {
    SUGGESTION_MESSAGE_MAX, initialSelection, messageProblem, shouldOfferSuggestion, staffAskState, suggestionOutcome, toggleRecipient,
    type SuggestionStatus,
} from '@/composables/managerSuggestion'
import { useI18n } from 'vue-i18n'

// Shown on an app page (Cody's included) to staff who cannot buy. Opened by the person
// themselves, so it does not go through the prompt coordinator. The backend decides who may
// send and who can receive; this only reflects its answer.
const props = defineProps<{
    appUuid: string
    appName: string
    priceText?: string
    isBuyer: boolean
    appActivated: boolean
    /** Overrides for the Cody preview, which reuses this flow as its main action. */
    buttonLabel?: string
    buttonStyle?: string
    /** Say why there is no button (already asked, nobody to ask) instead of rendering nothing. */
    showStates?: boolean
    /** Called after a successful send. */
    onSent?: () => void
}>()

const { t, locale } = useI18n()

const status = ref<SuggestionStatus | null>(null)
const isOpen = ref(false)
const sending = ref(false)
const message = ref('')
const selected = ref<string[]>([])
const errorText = ref('')
const confirmed = ref('')

const offered = computed(() => shouldOfferSuggestion({ isBuyer: props.isBuyer, appActivated: props.appActivated, status: status.value }))
const problem = computed(() => messageProblem(message.value))
const stateText = computed(() => {
    if (props.isBuyer || props.appActivated) return ''
    switch (staffAskState(status.value)) {
        case 'already': {
            const at = status.value?.last_suggested_at ? new Date(status.value.last_suggested_at) : null
            if (!at || isNaN(at.getTime())) return t('cody.preview.alreadyAsked')
            const date = at.toLocaleDateString(locale.value === 'en' ? 'en-GB' : locale.value === 'sv' ? 'sv-SE' : locale.value === 'no' ? 'nb-NO' : 'da-DK', { day: 'numeric', month: 'long', year: 'numeric' })
            return t('cody.preview.askedOn', { date })
        }
        case 'no_recipient': return t('cody.preview.noRecipient')
        case 'company_has': return t('cody.preview.companyHasCody')
        default: return ''
    }
})

async function load() {
    status.value = null
    if (props.isBuyer || props.appActivated || !props.appUuid) return
    try {
        status.value = await managerSuggestionService.getStatus(props.appUuid)
    } catch (_) {
        // A missing answer only keeps the button away.
        status.value = null
    }
}

function open() {
    errorText.value = ''
    selected.value = initialSelection(status.value?.recipients ?? [])
    if (!message.value) message.value = t('managerSuggestion.defaultMessage', { app: props.appName })
    isOpen.value = true
}

async function send() {
    if (sending.value || problem.value || !selected.value.length) return
    sending.value = true
    errorText.value = ''
    try {
        const result = await managerSuggestionService.send(props.appUuid, selected.value, message.value.trim())
        const outcome = suggestionOutcome(result)
        if (outcome === 'sent') {
            isOpen.value = false
            confirmed.value = t('managerSuggestion.sent')
            props.onSent?.()
            await load()
        } else if (outcome === 'already') errorText.value = t('managerSuggestion.already')
        else if (outcome === 'limit') errorText.value = t('managerSuggestion.limit')
        else errorText.value = t('managerSuggestion.failed')
    } catch (error: any) {
        errorText.value = typeof error?.message === 'string' && error.message ? error.message : t('managerSuggestion.failed')
    }
    sending.value = false
}

watch(() => [props.appUuid, props.isBuyer, props.appActivated], load, { immediate: true })
</script>
