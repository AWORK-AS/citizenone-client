<template>
    <TransitionRoot as="template" :show="isOpen">
        <Dialog as="div" class="relative z-50" @close="close">
            <TransitionChild as="template" enter="ease-out duration-200" enter-from="opacity-0" enter-to="opacity-100"
                leave="ease-in duration-150" leave-from="opacity-100" leave-to="opacity-0">
                <div class="fixed inset-0 bg-black/30" />
            </TransitionChild>

            <div class="fixed inset-0 z-50 overflow-y-auto">
                <div class="flex min-h-full items-center justify-center p-4">
                    <TransitionChild as="template" enter="ease-out duration-200"
                        enter-from="opacity-0 translate-y-2" enter-to="opacity-100 translate-y-0"
                        leave="ease-in duration-150" leave-from="opacity-100" leave-to="opacity-0">
                        <DialogPanel
                            class="w-full max-w-lg bg-white rounded-xl shadow-xl ring-1 ring-black/5 p-6">
                            <h2 class="text-[17px] font-semibold text-[#1F2533]">
                                {{ $t('superadmin.supportAccess.dialog.heading') }}
                            </h2>
                            <p class="text-sm text-[#5C6478] mt-1">
                                {{ $t('superadmin.supportAccess.dialog.intro', { name: accountName }) }}
                            </p>

                            <Alert type="danger" :text="state.error" v-if="state.error" class="mt-4" />

                            <div class="mt-4 space-y-4">
                                <div>
                                    <label class="co-label">
                                        {{ $t('superadmin.supportAccess.dialog.reason') }}
                                    </label>
                                    <textarea v-model="state.reason" rows="4" class="co-input"
                                        :placeholder="$t('superadmin.supportAccess.dialog.reasonPlaceholder')"></textarea>
                                    <!-- Kunden læser den ordret. Det er derfor der står hvad
                                         den bruges til, frem for bare "påkrævet". -->
                                    <p class="text-[11px] text-[#8891A4] mt-1">
                                        {{ $t('superadmin.supportAccess.dialog.reasonHint') }}
                                    </p>
                                </div>

                                <div>
                                    <label class="co-label">
                                        {{ $t('superadmin.supportAccess.dialog.caseReference') }}
                                    </label>
                                    <input v-model="state.caseReference" type="text" class="co-input"
                                        :placeholder="$t('superadmin.supportAccess.dialog.caseReferencePlaceholder')" />
                                </div>
                            </div>

                            <p class="text-[11px] text-[#8891A4] mt-4">
                                {{ $t('superadmin.supportAccess.dialog.terms') }}
                            </p>

                            <div class="flex justify-end gap-2 mt-5">
                                <button type="button" @click="close"
                                    class="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-[#5C6478] border border-[#EAECF0] bg-white transition-colors disabled:opacity-40">
                                    {{ $t('cancel') }}
                                </button>
                                <button type="button" @click="send" :disabled="!canSend"
                                    class="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white shadow-sm transition-colors disabled:opacity-40"
                                    style="background:#205E77">
                                    {{ $t('superadmin.supportAccess.dialog.send') }}
                                </button>
                            </div>
                        </DialogPanel>
                    </TransitionChild>
                </div>
            </div>
        </Dialog>
    </TransitionRoot>
</template>

<script setup lang="ts">
import { Dialog, DialogPanel, TransitionChild, TransitionRoot } from '@headlessui/vue'
import { supportAccessService } from '@/components/api/superadmin/SupportAccessService'
import { useAlert } from '@/composables/alert'
import { useI18n } from 'vue-i18n'

/**
 * Beder kunden om lov til at gå ind på en af deres brugeres konti.
 *
 * Åbnes af det sted der forsøgte at gå ind og fik 403 med
 * `code: support_access_required`. Det er den rigtige rækkefølge: kollegaen prøver det
 * de ville, og formularen kommer først når den er nødvendig - en formular foran hver
 * indgang ville også stå der de gange kunden allerede har sagt ja.
 *
 * Begrundelsen har et minimum på 10 tegn, det samme som backenden kræver, så afvisningen
 * sker her frem for som en valideringsfejl efter et kald.
 */
const props = defineProps<{
    isOpen: boolean
    accountUuid: string | null
    accountName: string
}>()

const emit = defineEmits<{ close: []; requested: [] }>()

const { successAlert } = useAlert()
const { t } = useI18n()

const state = reactive({
    reason: '',
    caseReference: '',
    error: '',
    isSaving: false,
})

const canSend = computed(() => state.reason.trim().length >= 10 && !state.isSaving)

watch(() => props.isOpen, (open) => {
    if (open) {
        state.reason = ''
        state.caseReference = ''
        state.error = ''
    }
})

function close() {
    emit('close')
}

async function send() {
    if (!props.accountUuid) return

    state.isSaving = true
    state.error = ''

    try {
        await supportAccessService.requestAccess({
            user_uuid: props.accountUuid,
            reason: state.reason.trim(),
            case_reference: state.caseReference.trim() || null,
        })

        successAlert(`${t('alert.success')}!`, t('superadmin.supportAccess.alert.requested'))
        emit('requested')
        close()
    } catch (error: any) {
        state.error = error?.message ?? error
    } finally {
        state.isSaving = false
    }
}
</script>
