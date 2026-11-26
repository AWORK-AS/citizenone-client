<script setup lang="ts">
import { computed, reactive, shallowRef } from 'vue'
import { useI18n } from 'vue-i18n'
import type { FmkBasketItem, FmkCardSummary, FmkPharmacy } from '@/types/fmk'
import { fmkPharmacySuggestions } from '@/utils/fmk'
import { fMKService } from '@/components/api/user/FMKService'
import { useAlert } from '@/composables/alert'

/**
 * GK 16.2/16.5: the order basket. Medicines with an open prescription are
 * ordered from one pharmacy in one order; those waiting for a new
 * prescription stay in the basket (and staff are told) until the doctor
 * has issued it.
 */
const props = defineProps<{ citizenUuid: string, card: FmkCardSummary, canEdit?: boolean }>()

const { t } = useI18n()
const { successAlert, errorAlert } = useAlert()

const items = shallowRef<FmkBasketItem[] | null>(null)
const pending = shallowRef(false)
const ordering = shallowRef(false)
const error = shallowRef<string | null>(null)

const suggestions = computed(() => fmkPharmacySuggestions(props.card))
const form = reactive({
    pharmacy: '0' as string,
    other: { name: '', id_source: 'SOR', id: '' } as FmkPharmacy,
    delivery: 'pickup' as string,
    street: '', postCode: '', contact: '',
    instruction: '',
})
const ready = computed(() => (items.value ?? []).filter(i => i.state === 'ready'))
const waiting = computed(() => (items.value ?? []).filter(i => i.state === 'waiting'))
const pharmacy = computed<FmkPharmacy | null>(() => (form.pharmacy === 'other' || !suggestions.value.length ? form.other : suggestions.value[Number(form.pharmacy)] ?? null))
const canOrder = computed(() => ready.value.length > 0 && Boolean(pharmacy.value?.name && pharmacy.value?.id) && !ordering.value)
const DELIVERY = ['send til anden adresse samme dag', 'send til anden adresse pr post', 'send til patientadresse samme dag', 'send til patientadresse pr post']

async function run(call: () => Promise<any>) {
    pending.value = true
    error.value = null
    try {
        const response = await call()
        items.value = ((response?.data ?? response) ?? []) as FmkBasketItem[]
    } catch (cause: any) {
        error.value = cause?.message ?? String(cause)
    } finally {
        pending.value = false
    }
}
const load = () => run(() => fMKService.getBasket(props.citizenUuid))
const add = (identifier: string) => run(() => fMKService.addToBasket(props.citizenUuid, identifier))
const remove = (item: FmkBasketItem) => run(() => fMKService.removeFromBasket(props.citizenUuid, item.uuid))

async function order() {
    if (!pharmacy.value) return
    ordering.value = true
    try {
        const response = await fMKService.orderBasket(props.citizenUuid, {
            pharmacy: pharmacy.value,
            delivery: form.delivery === 'pickup' ? null : { priority: form.delivery, street: form.street || null, post_code: form.postCode || null, contact: form.contact || null },
            instruction: form.instruction || null,
        })
        const result = (response?.data ?? response) as { ordered: string[], waiting: string[] }
        successAlert(`${t('alert.success')}!`, t('fmk.basket.ordered', { drugs: result.ordered.join(', ') }))
        await load()
    } catch (cause: any) {
        errorAlert(`${t('alert.somethingWentWrong')}!`, cause?.message ?? '')
    } finally {
        ordering.value = false
    }
}

defineExpose({ load, add })
const inputClass = 'w-full rounded-lg border border-[#e2e8f0] px-3 py-2 text-sm focus:border-[#0f4c75] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2dbab2]'
</script>

<template>
    <section class="rounded-2xl border border-[#e2e8f0] bg-white" :aria-label="$t('fmk.basket.title')">
        <div class="flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
            <h2 class="flex items-center gap-2 text-base font-semibold text-[#1a2332]">
                <Icon name="ph:shopping-cart-simple" class="size-5 text-[#0f4c75]" aria-hidden="true" />
                {{ $t('fmk.basket.title') }}
                <span v-if="items?.length" class="rounded-full bg-[#0f4c75] px-2 py-0.5 text-[11px] font-semibold text-white">{{ items.length }}</span>
            </h2>
            <button type="button" :disabled="pending" @click="load"
                class="inline-flex items-center gap-1.5 rounded-lg border border-[#e2e8f0] bg-white px-3 py-1.5 text-xs font-semibold text-[#0f4c75] hover:border-[#0f4c75] disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2dbab2]">
                <Icon :name="pending ? 'ph:spinner' : 'ph:arrows-clockwise'" :class="['size-4', pending && 'motion-safe:animate-spin']" aria-hidden="true" />
                {{ items ? $t('fmk.header.refresh') : $t('fmk.basket.open') }}
            </button>
        </div>
        <p v-if="error" role="alert" class="mx-4 mb-3 rounded-lg border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-sm text-[#991b1b] sm:mx-6">{{ error }}</p>
        <p v-if="items && !items.length" class="px-4 pb-4 text-sm text-[#64748b] sm:px-6">{{ $t('fmk.basket.empty') }}</p>

        <template v-if="items?.length">
            <ul class="divide-y divide-[#f1f5f9] border-t border-[#f1f5f9]">
                <li v-for="item in items" :key="item.uuid" class="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 text-sm sm:px-6">
                    <span class="flex flex-wrap items-center gap-2">
                        <span class="font-semibold text-[#1a2332]">{{ item.drug_name }}</span>
                        <span class="rounded-full border px-2 py-0.5 text-[11px] font-semibold"
                            :class="item.state === 'ready' ? 'border-[#2dbab2]/40 bg-[#f0faf9] text-[#1b6d8a]' : 'border-[#fed7aa] bg-[#fff7ed] text-[#c2410c]'">
                            {{ $t(`fmk.basket.states.${item.state}`) }}
                        </span>
                    </span>
                    <button v-if="canEdit" type="button" :aria-label="$t('fmk.basket.remove', { drug: item.drug_name })" @click="remove(item)"
                        class="rounded p-1 text-[#64748b] hover:text-[#b91c1c] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2dbab2]">
                        <Icon name="ph:trash" class="size-4" aria-hidden="true" />
                    </button>
                </li>
            </ul>

            <form v-if="canEdit" class="space-y-4 border-t border-[#f1f5f9] px-4 py-4 sm:px-6" @submit.prevent="order">
                <fieldset class="space-y-2">
                    <legend class="mb-1 text-sm font-semibold text-[#1a2332]">{{ $t('fmk.basket.pharmacy') }}</legend>
                    <label v-for="(p, i) in suggestions" :key="p.id" class="flex cursor-pointer items-center gap-3 text-sm">
                        <input v-model="form.pharmacy" type="radio" name="fmk-pharmacy" :value="String(i)" class="size-4 accent-[#0f4c75]" />
                        <span>{{ p.name }} <span class="text-[#64748b]">({{ p.id_source }} {{ p.id }})</span></span>
                    </label>
                    <label v-if="suggestions.length" class="flex cursor-pointer items-center gap-3 text-sm">
                        <input v-model="form.pharmacy" type="radio" name="fmk-pharmacy" value="other" class="size-4 accent-[#0f4c75]" />
                        {{ $t('fmk.basket.otherPharmacy') }}
                    </label>
                    <div v-if="form.pharmacy === 'other' || !suggestions.length" class="grid gap-2 sm:grid-cols-3">
                        <input v-model="form.other.name" :class="inputClass" class="sm:col-span-3" maxlength="200" :placeholder="$t('fmk.basket.pharmacyName')" :aria-label="$t('fmk.basket.pharmacyName')" />
                        <select v-model="form.other.id_source" :class="inputClass" :aria-label="$t('fmk.request.idType')">
                            <option value="SOR">SOR</option>
                            <option value="EAN-Lokationsnummer">EAN</option>
                            <option value="CVR-P">CVR-P</option>
                        </select>
                        <input v-model="form.other.id" :class="inputClass" class="sm:col-span-2" inputmode="numeric" maxlength="20" :placeholder="$t('fmk.request.number')" :aria-label="$t('fmk.request.number')" />
                    </div>
                </fieldset>

                <label class="block text-sm">
                    <span class="mb-1 block font-semibold text-[#1a2332]">{{ $t('fmk.basket.delivery') }}</span>
                    <select v-model="form.delivery" :class="inputClass">
                        <option value="pickup">{{ $t('fmk.basket.pickup') }}</option>
                        <option v-for="d in DELIVERY" :key="d" :value="d">{{ $t(`fmk.basket.priorities.${DELIVERY.indexOf(d)}`) }}</option>
                    </select>
                </label>
                <div v-if="form.delivery.includes('anden adresse')" class="grid gap-2 sm:grid-cols-3">
                    <input v-model="form.street" :class="inputClass" class="sm:col-span-2" maxlength="100" :placeholder="$t('fmk.basket.street')" :aria-label="$t('fmk.basket.street')" />
                    <input v-model="form.postCode" :class="inputClass" inputmode="numeric" maxlength="4" :placeholder="$t('fmk.basket.postCode')" :aria-label="$t('fmk.basket.postCode')" />
                    <input v-model="form.contact" :class="inputClass" class="sm:col-span-3" maxlength="100" :placeholder="$t('fmk.basket.contact')" :aria-label="$t('fmk.basket.contact')" />
                </div>
                <input v-model="form.instruction" :class="inputClass" maxlength="200" :placeholder="$t('fmk.basket.instruction')" :aria-label="$t('fmk.basket.instruction')" />

                <!-- GK 16.5.4: say that waiting medicines are not in this order. -->
                <p v-if="waiting.length" role="status" class="rounded-lg border border-[#fed7aa] bg-[#fff7ed] px-3 py-2 text-xs text-[#9a3412]">
                    {{ $t('fmk.basket.waitingNote', { drugs: waiting.map(i => i.drug_name).join(', ') }) }}
                </p>
                <div class="flex justify-end">
                    <button type="submit" :disabled="!canOrder"
                        class="inline-flex items-center gap-2 rounded-lg bg-[#2dbab2] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1b6d8a] disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2dbab2] focus-visible:ring-offset-2">
                        <Icon :name="ordering ? 'ph:spinner' : 'ph:storefront'" :class="['size-4', ordering && 'motion-safe:animate-spin']" aria-hidden="true" />
                        {{ $t('fmk.basket.order', { count: ready.length }, ready.length) }}
                    </button>
                </div>
            </form>
        </template>
    </section>
</template>
