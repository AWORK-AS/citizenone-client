<script setup lang="ts">
import { computed, reactive, shallowRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import type { FmkAddressee, FmkDrugMedication } from '@/types/fmk'
import { fmkAddresseeSuggestions } from '@/utils/fmk'
import { fMKService } from '@/components/api/user/FMKService'

/**
 * GK 16.1: ask for a new prescription for one drug medication. Staff choose
 * who receives it (suggested from the card, or any doctor, hospital or
 * municipality by its number), and either let the doctor choose the package
 * or ask for the same package as last time, with quantity and, if wanted,
 * several dispensings.
 */
const props = defineProps<{ show: boolean, citizenUuid: string, medication: FmkDrugMedication | null, cardVersion?: string | null }>()
const emit = defineEmits<{ close: [], sent: [], cardChanged: [] }>()

const { t } = useI18n()

const suggestions = computed(() => (props.medication ? fmkAddresseeSuggestions(props.medication) : []))
/** The package of the latest prescription, if any: "same as last time". */
const lastPackage = computed(() => props.medication?.prescription_list?.find(p => p.package_number)?.package_number ?? null)

const form = reactive({
    receiver: 'other' as string,
    other: { name: '', type: 'Yder', id_source: 'Yder', id: '' } as FmkAddressee,
    packageChoice: 'doctor' as 'doctor' | 'same',
    quantity: 1,
    reiterate: false,
    reiteration: { number: 2, interval: 4, unit: 'uger' },
})
const sending = shallowRef(false)
const error = shallowRef<string | null>(null)
const fieldErrors = shallowRef<Record<string, string[]>>({})

watch(() => props.show, (open) => {
    if (!open) return
    form.receiver = suggestions.value.length ? '0' : 'other'
    form.other = { name: '', type: 'Yder', id_source: 'Yder', id: '' }
    form.packageChoice = lastPackage.value ? 'same' : 'doctor'
    form.quantity = 1
    form.reiterate = false
    error.value = null
    fieldErrors.value = {}
})

const addressee = computed<FmkAddressee | null>(() => (form.receiver === 'other' ? form.other : suggestions.value[Number(form.receiver)] ?? null))
const canSend = computed(() => Boolean(addressee.value?.name && addressee.value?.id) && !sending.value)

async function send() {
    if (!props.medication || !addressee.value) return
    sending.value = true
    error.value = null
    fieldErrors.value = {}
    try {
        await fMKService.requestPrescription(props.citizenUuid, {
            fmk_drug_medication_id: props.medication.identifier,
            card_version: props.cardVersion ?? undefined,
            organisation: addressee.value,
            dispensing: form.packageChoice === 'same' && lastPackage.value
                ? { package_number: lastPackage.value, package_quantity: form.quantity, reiteration: form.reiterate ? form.reiteration : null }
                : null,
        })
        emit('sent')
    } catch (cause: any) {
        if (cause?.code === 'fmk_card_changed') {
            emit('cardChanged')
            return
        }
        fieldErrors.value = cause?.errors ?? {}
        error.value = cause?.message ?? String(cause)
    } finally {
        sending.value = false
    }
}

const title = computed(() => [props.medication?.drug_name, props.medication?.strength].filter(Boolean).join(' '))
const inputClass = 'w-full rounded-lg border border-[#e2e8f0] px-3 py-2 text-sm focus:border-[#0f4c75] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2dbab2]'
</script>

<template>
    <Modal :show="show" :title="$t('fmk.request.title', { drug: title })" size="lg" @close="emit('close')">
        <template #modal-body>
            <form class="space-y-5" @submit.prevent="send">
                <p class="text-sm text-[#64748b]">{{ $t('fmk.request.intro') }}</p>

                <fieldset class="space-y-2">
                    <legend class="mb-1 text-sm font-semibold text-[#1a2332]">{{ $t('fmk.request.receiver') }}</legend>
                    <label v-for="(s, i) in suggestions" :key="`${s.id_source}-${s.id}`"
                        class="flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 text-sm"
                        :class="form.receiver === String(i) ? 'border-[#0f4c75] bg-[#f0faf9]' : 'border-[#e2e8f0]'">
                        <input v-model="form.receiver" type="radio" name="fmk-receiver" :value="String(i)" class="size-4 accent-[#0f4c75]" />
                        <span><span class="font-semibold text-[#1a2332]">{{ s.name }}</span> <span class="text-[#64748b]">({{ s.id_source }} {{ s.id }})</span></span>
                    </label>
                    <label class="flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 text-sm"
                        :class="form.receiver === 'other' ? 'border-[#0f4c75] bg-[#f0faf9]' : 'border-[#e2e8f0]'">
                        <input v-model="form.receiver" type="radio" name="fmk-receiver" value="other" class="size-4 accent-[#0f4c75]" />
                        <span class="font-semibold text-[#1a2332]">{{ $t('fmk.request.otherReceiver') }}</span>
                    </label>
                    <div v-if="form.receiver === 'other'" class="grid gap-3 rounded-xl border border-[#e2e8f0] p-3 sm:grid-cols-2">
                        <label class="sm:col-span-2 text-sm">
                            <span class="mb-1 block text-[#64748b]">{{ $t('fmk.request.name') }}</span>
                            <input v-model="form.other.name" :class="inputClass" maxlength="200" :placeholder="$t('fmk.request.namePlaceholder')" />
                        </label>
                        <label class="text-sm">
                            <span class="mb-1 block text-[#64748b]">{{ $t('fmk.request.idType') }}</span>
                            <select v-model="form.other.id_source" :class="inputClass" @change="form.other.type = form.other.id_source === 'SKS' ? 'Sygehus' : 'Yder'">
                                <option value="Yder">{{ $t('fmk.request.idTypes.Yder') }}</option>
                                <option value="SOR">{{ $t('fmk.request.idTypes.SOR') }}</option>
                                <option value="SKS">{{ $t('fmk.request.idTypes.SKS') }}</option>
                            </select>
                        </label>
                        <label class="text-sm">
                            <span class="mb-1 block text-[#64748b]">{{ $t('fmk.request.number') }}</span>
                            <input v-model="form.other.id" :class="inputClass" inputmode="numeric" maxlength="20" />
                        </label>
                        <p v-if="fieldErrors['organisation.id'] || fieldErrors['organisation.name']" class="sm:col-span-2 text-xs text-[#b91c1c]">{{ (fieldErrors['organisation.id'] ?? fieldErrors['organisation.name'])[0] }}</p>
                    </div>
                </fieldset>

                <fieldset class="space-y-2">
                    <legend class="mb-1 text-sm font-semibold text-[#1a2332]">{{ $t('fmk.request.package') }}</legend>
                    <label class="flex cursor-pointer items-center gap-3 text-sm">
                        <input v-model="form.packageChoice" type="radio" value="doctor" class="size-4 accent-[#0f4c75]" />
                        {{ $t('fmk.request.doctorChooses') }}
                    </label>
                    <label v-if="lastPackage" class="flex cursor-pointer items-center gap-3 text-sm">
                        <input v-model="form.packageChoice" type="radio" value="same" class="size-4 accent-[#0f4c75]" />
                        {{ $t('fmk.request.samePackage', { number: lastPackage }) }}
                    </label>
                    <div v-if="form.packageChoice === 'same' && lastPackage" class="ml-7 space-y-3 rounded-xl border border-[#e2e8f0] p-3 text-sm">
                        <label class="flex items-center gap-2">
                            <span class="text-[#64748b]">{{ $t('fmk.request.quantity') }}</span>
                            <input v-model.number="form.quantity" type="number" min="1" max="99" class="w-20 rounded-lg border border-[#e2e8f0] px-2 py-1" />
                        </label>
                        <label class="flex items-center gap-2">
                            <input v-model="form.reiterate" type="checkbox" class="size-4 accent-[#0f4c75]" />
                            {{ $t('fmk.request.reiterate') }}
                        </label>
                        <div v-if="form.reiterate" class="flex flex-wrap items-center gap-2">
                            <input v-model.number="form.reiteration.number" type="number" min="1" max="12" class="w-16 rounded-lg border border-[#e2e8f0] px-2 py-1" :aria-label="$t('fmk.request.reiterations')" />
                            <span>{{ $t('fmk.request.reiterationsEvery') }}</span>
                            <input v-model.number="form.reiteration.interval" type="number" min="1" max="52" class="w-16 rounded-lg border border-[#e2e8f0] px-2 py-1" :aria-label="$t('fmk.request.interval')" />
                            <select v-model="form.reiteration.unit" class="rounded-lg border border-[#e2e8f0] px-2 py-1" :aria-label="$t('fmk.request.intervalUnit')">
                                <option value="dage">{{ $t('fmk.request.units.dage') }}</option>
                                <option value="uger">{{ $t('fmk.request.units.uger') }}</option>
                                <option value="måneder">{{ $t('fmk.request.units.måneder') }}</option>
                            </select>
                        </div>
                    </div>
                </fieldset>

                <p v-if="error" role="alert" class="rounded-lg border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-sm text-[#991b1b]">{{ error }}</p>

                <div class="flex flex-wrap justify-end gap-2">
                    <button type="button" class="rounded-lg border border-[#e2e8f0] bg-white px-4 py-2 text-sm font-semibold text-[#0f4c75] hover:border-[#0f4c75] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2dbab2]" @click="emit('close')">{{ $t('fmk.consent.cancel') }}</button>
                    <button type="submit" :disabled="!canSend"
                        class="inline-flex items-center gap-2 rounded-lg bg-[#2dbab2] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1b6d8a] disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2dbab2] focus-visible:ring-offset-2">
                        <Icon :name="sending ? 'ph:spinner' : 'ph:paper-plane-tilt'" :class="['size-4', sending && 'motion-safe:animate-spin']" aria-hidden="true" />
                        {{ $t('fmk.request.send') }}
                    </button>
                </div>
            </form>
        </template>
    </Modal>
</template>
