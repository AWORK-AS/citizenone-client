<template>
    <form @submit.prevent="submitForm()" class="space-y-5">

        <Alert type="danger" :text="props?.error?.message"
            v-if="props.error?.message && props.error.message.length > 0" />

        <!-- Poll item information -->
        <div class="bg-white border border-[#EAECF0] rounded-xl p-6 shadow-sm">
            <h2 class="text-[15px] font-semibold text-[#1F2533] mb-5">
                {{ $t('superadmin.polls.form.pollItemInformation') }}
            </h2>

            <!-- Title -->
            <div class="mb-4">
                <SuperadminFormLabel :label="$t('superadmin.polls.form.title')" :required="true" />
                <SuperadminFormTextField id="title" v-model="state.formPoll.title"
                    :placeholder="$t('superadmin.polls.form.title')" :hasError="v$?.formPoll?.title?.$error" />
                <SuperadminFormError :error="v$?.formPoll?.title?.$errors[0]?.$message.toString()" />
                <SuperadminFormError :error="props?.error?.errors?.title?.[0]" />
            </div>

            <!-- Description -->
            <div class="mb-4">
                <SuperadminFormLabel :label="$t('superadmin.polls.form.description')" :required="true" />
                <textarea v-model="state.formPoll.description" rows="4"
                    :placeholder="$t('superadmin.polls.form.description')" class="co-textarea resize-none"
                    :class="{ 'border-red-400': v$?.formPoll?.description?.$error }"></textarea>
                <SuperadminFormError :error="v$?.formPoll?.description?.$errors[0]?.$message.toString()" />
                <SuperadminFormError :error="props?.error?.errors?.description?.[0]" />
            </div>

            <!-- Sender -->
            <div class="mb-4">
                <SuperadminFormLabel :label="$t('superadmin.polls.form.sender')" :required="true" />
                <SuperadminFormTextField id="sender" v-model="state.formPoll.sender"
                    :placeholder="$t('superadmin.polls.form.sender')" :hasError="v$?.formPoll?.sender?.$error" />
                <SuperadminFormError :error="v$?.formPoll?.sender?.$errors[0]?.$message.toString()" />
                <SuperadminFormError :error="props?.error?.errors?.sender?.[0]" />
            </div>

            <!-- Region -->
            <div>
                <SuperadminFormLabel :label="$t('superadmin.polls.form.region')" :required="true" />
                <SuperadminFormSelectField v-model="state.formPoll.region" :hasError="v$?.formPoll?.region?.$error">
                    <option value="" disabled>— {{ $t('superadmin.polls.form.region') }} —</option>
                    <option v-for="opt in state.options.regions" :key="opt.value" :value="opt.value">
                        {{ opt.label }}
                    </option>
                </SuperadminFormSelectField>
                <SuperadminFormError :error="v$?.formPoll?.region?.$errors[0]?.$message.toString()" />
                <SuperadminFormError :error="props?.error?.errors?.region_uuid?.[0]" />
            </div>
        </div>

        <!-- Settings -->
        <div class="bg-white border border-[#EAECF0] rounded-xl p-6 shadow-sm">
            <h2 class="text-[15px] font-semibold text-[#1F2533] mb-4">
                {{ $t('superadmin.companies.form.settings') }}
            </h2>

            <div class="flex items-center justify-between py-3">
                <p class="text-[13px] font-medium text-[#1F2533]">
                    {{ $t('superadmin.polls.form.active') }}
                </p>
                <button type="button" @click="state.formPoll.is_active = !state.formPoll.is_active"
                    class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0"
                    :style="state.formPoll.is_active ? 'background:#42AED9' : 'background:#D5D9E2'">
                    <span class="inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform"
                        :class="state.formPoll.is_active ? 'translate-x-6' : 'translate-x-1'"></span>
                </button>
            </div>
        </div>

        <!-- Action buttons -->
        <div class="flex items-center justify-end gap-3 pb-6">
            <button type="button" @click="navigateTo(`/superadmin/polls/${pollUuid}`)"
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
import { regionService } from '@/components/api/superadmin/RegionService'
import { useVuelidate } from "@vuelidate/core"
import { required, helpers } from '@vuelidate/validators'
import { useI18n } from "vue-i18n"
import type { PollItemForm, Error } from '@/types'

const props = defineProps({
    error: {
        type: Object,
        required: false,
    },
    formType: {
        type: String,
        required: true,
    },
    selectedPollItem: {
        type: Object,
        required: false,
    },
})
const emit = defineEmits(['isPageLoading', 'submitForm'])

const router = useRouter()
const pollUuid = router?.currentRoute?.value?.params?.pollUuid
const { t } = useI18n()

const state = reactive({
    error: {} as Error,
    formPoll: {
        title: '',
        description: '',
        sender: '',
        region: '',
        is_active: true,
    } as PollItemForm,
    options: {
        regions: [] as { value: string; label: string }[]
    }
})

watch(() => props.selectedPollItem, (newValue: any) => {
    if (newValue != null) {
        state.formPoll = {
            title: newValue.title,
            description: newValue.description,
            sender: newValue.sender,
            region: newValue.region,
            is_active: newValue.is_active,
        }
    }
})

onMounted(() => {
    fetchRegions()
})

const rules = computed(() => ({
    formPoll: {
        title: {
            required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
        },
        description: {
            required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
        },
        sender: {
            required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
        },
        region: {
            required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
        },
    },
}))

const v$ = useVuelidate(rules, state)

async function fetchRegions() {
    emit('isPageLoading', true)
    try {
        const response = await regionService.getAllRegions()
        if (response.data) {
            state.options.regions = response.data.map((item: any) => ({
                value: item.uuid,
                label: item.name,
            }))
        }
    } catch (error: any) {
        state.error = error
    }
    emit('isPageLoading', false)
}

function submitForm() {
    v$.value.$validate()
    if (!v$.value.$error) {
        emit('submitForm', state.formPoll)
    }
}
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

.co-textarea.border-red-400 {
    border-color: #f87171;
}
</style>
