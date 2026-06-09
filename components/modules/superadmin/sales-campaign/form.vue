<template>
    <form @submit.prevent="submit()" class="space-y-4">

        <Alert type="danger" :text="props.error?.message"
            v-if="props.error?.message && props.error.message.length > 0" />

        <!-- Image -->
        <div>
            <SuperadminFormLabel :label="$t('superadmin.salesCampaign.labelImage')" />
            <input type="file" ref="imageInputRef" @change="onImageChange" class="hidden" accept="image/*" />
            <div class="w-full h-36 rounded-xl border-2 border-dashed border-[#D5D9E2] overflow-hidden flex items-center justify-center bg-[#F9FAFB] hover:border-[#42AED9] transition-colors cursor-pointer"
                @click="imageInputRef?.click()">
                <img v-if="state.imagePreview" :src="state.imagePreview" class="w-full h-full object-cover" />
                <div v-else class="flex flex-col items-center gap-1.5 text-[#B0B8C4]">
                    <Icon name="ph:image" class="w-7 h-7" />
                    <span class="text-[12px]">{{ $t('superadmin.salesCampaign.labelImage') }}</span>
                </div>
            </div>
            <SuperadminFormError :error="props.error?.errors?.image?.[0]" />
        </div>

        <!-- Name -->
        <div>
            <SuperadminFormLabel :label="$t('superadmin.salesCampaign.labelCampaignName')" :required="true" />
            <SuperadminFormTextField v-model="state.form.name"
                :placeholder="$t('superadmin.salesCampaign.phCampaignName')" :hasError="!!state.errors.name" />
            <SuperadminFormError :error="state.errors.name" />
            <SuperadminFormError :error="props.error?.errors?.name?.[0]" />
        </div>

        <!-- Description -->
        <div>
            <SuperadminFormLabel :label="$t('superadmin.salesCampaign.labelDescription')" />
            <textarea v-model="state.form.description" rows="2"
                :placeholder="$t('superadmin.salesCampaign.phDescription')" class="co-textarea resize-none"></textarea>
        </div>

        <!-- Campaign type -->
        <div>
            <SuperadminFormLabel :label="$t('superadmin.salesCampaign.labelCampaignType')" />
            <div class="grid grid-cols-3 gap-2">
                <button v-for="ct in campaignTypes" :key="ct.value" type="button"
                    class="py-2.5 px-2 rounded-xl border-2 text-[12px] font-semibold transition-colors flex items-center justify-center gap-1.5"
                    :style="state.form.type === ct.value ? 'border-color:#42AED9;background:#F0FAFD;color:#205E77' : 'border-color:#EAECF0;color:#5C6478'"
                    @click="state.form.type = ct.value">
                    <Icon :name="ct.icon" class="w-3.5 h-3.5" />
                    {{ ct.label }}
                </button>
            </div>
        </div>

        <!-- Discount type + value -->
        <div class="grid grid-cols-2 gap-3">
            <div>
                <SuperadminFormLabel :label="$t('superadmin.salesCampaign.labelDiscountType')" />
                <SuperadminFormSelectField v-model="state.form.discount_type">
                    <option value="percent">{{ $t('superadmin.salesCampaign.discountPercent') }}</option>
                    <option value="fixed">{{ $t('superadmin.salesCampaign.discountFixed') }}</option>
                    <option value="free_months">{{ $t('superadmin.salesCampaign.discountFreeMonths') }}</option>
                </SuperadminFormSelectField>
            </div>
            <div>
                <SuperadminFormLabel :label="$t('superadmin.salesCampaign.labelDiscountValue')" />
                <div class="relative">
                    <SuperadminFormTextField v-model="state.form.discount_value" type="number" placeholder="0"
                        class="pr-8" />
                    <span class="absolute right-3 top-1/2 -translate-y-1/2 text-[#8891A4] text-[12px]">
                        {{
                            state.form.discount_type === 'percent' ? '%' :
                                state.form.discount_type === 'fixed' ? 'kr' : 'mdr'
                        }}
                    </span>
                </div>
            </div>
        </div>

        <!-- Target plan -->
        <div>
            <SuperadminFormLabel :label="$t('superadmin.salesCampaign.labelTargetPlan')" />
            <SuperadminFormSelectField v-model="state.form.target_plan">
                <option value="all">{{ $t('superadmin.salesCampaign.allPlans') }}</option>
                <option value="free">{{ $t('superadmin.salesCampaign.planFree') }}</option>
                <option value="basis">{{ $t('superadmin.salesCampaign.planBasis') }}</option>
                <option value="pro">{{ $t('superadmin.salesCampaign.planPro') }}</option>
            </SuperadminFormSelectField>
        </div>

        <!-- Start + End dates -->
        <div class="grid grid-cols-2 gap-3">
            <div>
                <SuperadminFormLabel :label="$t('superadmin.salesCampaign.labelStartDate')" />
                <SuperadminFormTextField v-model="state.form.start_date" type="date" />
            </div>
            <div>
                <SuperadminFormLabel :label="$t('superadmin.salesCampaign.labelEndDate')" />
                <SuperadminFormTextField v-model="state.form.end_date" type="date" />
            </div>
        </div>

        <!-- Active toggle -->
        <div class="flex items-center justify-between py-3 px-4 border border-[#EAECF0] rounded-xl">
            <div>
                <p class="text-[13px] font-medium text-[#1F2533]">
                    {{ $t('superadmin.salesCampaign.labelActive') }}
                </p>
                <p class="text-[11px] text-[#8891A4] mt-0.5">
                    {{ $t('superadmin.salesCampaign.activeHint') }}
                </p>
            </div>
            <button type="button" @click="state.form.is_active = !state.form.is_active"
                class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0"
                :style="state.form.is_active ? 'background:#42AED9' : 'background:#D5D9E2'">
                <span class="inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform"
                    :class="state.form.is_active ? 'translate-x-6' : 'translate-x-1'"></span>
            </button>
        </div>

        <!-- Action buttons (page context only) -->
        <div v-if="showActions" class="flex items-center justify-end gap-3 pt-2">
            <button type="button" @click="navigateTo('/superadmin/sales-campaign')"
                class="px-5 py-2.5 rounded-lg text-sm font-medium text-[#5C6478] bg-white border border-[#EAECF0] hover:bg-[#F5F6F8] transition-colors">
                {{ $t('cancel') }}
            </button>
            <button type="submit"
                class="px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors shadow-sm"
                style="background:#205E77">
                {{ props.formType === 'create' ? $t('save') : $t('update') }}
            </button>
        </div>

    </form>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { Error } from '@/types'

const props = defineProps({
    error: {
        type: Object as () => Error,
        required: false,
    },
    formType: {
        type: String as () => 'create' | 'update',
        required: true,
    },
    selectedCampaign: {
        type: Object,
        required: false,
    },
    showActions: {
        type: Boolean,
        default: true,
    },
})

const emit = defineEmits(['submitForm'])
const { t } = useI18n()

const imageInputRef = ref<HTMLInputElement | null>(null)

const emptyForm = () => ({
    name: '',
    description: '',
    type: 'discount',
    discount_type: 'percent',
    discount_value: '0',
    target_plan: '',
    start_date: '',
    end_date: '',
    is_active: true,
})

const state = reactive({
    errors: { name: '' },
    form: emptyForm(),
    imageFile: null as File | null,
    imagePreview: '' as string,
})

const campaignTypes = computed(() => [
    { value: 'discount', label: t('superadmin.salesCampaign.typeDiscount'), icon: 'ph:tag' },
    { value: 'trial', label: t('superadmin.salesCampaign.typeTrial'), icon: 'ph:clock' },
    { value: 'bundle', label: t('superadmin.salesCampaign.typeBundle'), icon: 'ph:package' },
    { value: 'flash', label: t('superadmin.salesCampaign.typeFlash'), icon: 'ph:lightning' },
    { value: 'loyalty', label: t('superadmin.salesCampaign.typeLoyalty'), icon: 'ph:heart' },
    { value: 'winback', label: t('superadmin.salesCampaign.typeWinback'), icon: 'ph:arrow-counter-clockwise' },
])

watch(() => props.selectedCampaign, (c: any) => {
    if (c) {
        state.form = {
            name: c.name ?? '',
            description: c.description ?? '',
            type: c.type ?? 'discount',
            discount_type: c.discount_type ?? 'percent',
            discount_value: String(c.discount_value ?? 0),
            target_plan: c.target_plan ?? '',
            start_date: c.start_date?.split('T')[0] ?? '',
            end_date: c.end_date?.split('T')[0] ?? '',
            is_active: c.is_active !== false,
        }
        state.imagePreview = c.image ?? ''
        state.imageFile = null
    }
})

function onImageChange(event: any) {
    const file = event.target.files[0]
    if (!file) return
    state.imageFile = file
    const reader = new FileReader()
    reader.onload = (e: any) => { state.imagePreview = e.target.result }
    reader.readAsDataURL(file)
}

function reset() {
    state.form = emptyForm()
    state.errors = { name: '' }
    state.imageFile = null
    state.imagePreview = ''
}

function submit() {
    state.errors.name = ''
    if (!state.form.name) {
        state.errors.name = t('superadmin.salesCampaign.errorCampaignNameRequired')
        return
    }
    emit('submitForm', { ...state.form, image: state.imageFile })
}

defineExpose({ submit, reset })
</script>

<style scoped>
.co-textarea {
    width: 100%;
    padding: 9px 13px;
    font-size: 14px;
    color: #1F2533;
    background: white;
    border: 1px solid #D5D9E2;
    border-radius: 10px;
    outline: none;
    transition: border-color 0.15s, box-shadow 0.15s;
}

.co-textarea:focus {
    border-color: #42AED9;
    box-shadow: 0 0 0 3px rgba(66, 174, 217, 0.12);
}

.co-textarea::placeholder {
    color: #B0B8C4;
}
</style>
