<template>
    <form @submit.prevent="submitForm()" class="space-y-5">

        <Alert type="danger" :text="props?.error?.message"
            v-if="props.error?.message && props.error.message.length > 0" />

        <!-- Poll information -->
        <div class="bg-white border border-[#EAECF0] rounded-xl p-6 shadow-sm">
            <h2 class="text-[15px] font-semibold text-[#1F2533] mb-5">
                {{ $t('superadmin.polls.form.pollInformation') }}
            </h2>

            <div>
                <SuperadminFormLabel :label="$t('superadmin.polls.form.title')" :required="true" />
                <SuperadminFormTextField id="title" v-model="state.formPoll.title"
                    :placeholder="$t('superadmin.polls.form.title')" :hasError="v$?.formPoll?.title?.$error" />
                <SuperadminFormError :error="v$?.formPoll?.title?.$errors[0]?.$message.toString()" />
                <SuperadminFormError :error="props?.error?.errors?.title?.[0]" />
            </div>
        </div>

        <!-- Settings -->
        <div class="bg-white border border-[#EAECF0] rounded-xl p-6 shadow-sm">
            <h2 class="text-[15px] font-semibold text-[#1F2533] mb-4">
                {{ $t('superadmin.companies.form.settings') }}
            </h2>

            <div class="flex items-center justify-between py-3">
                <div>
                    <p class="text-[13px] font-medium text-[#1F2533]">
                        {{ $t('superadmin.polls.form.active') }}
                    </p>
                </div>
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
            <button type="button" @click="navigateTo('/superadmin/polls')"
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
import { useVuelidate } from "@vuelidate/core"
import { required, helpers } from '@vuelidate/validators'
import { useI18n } from "vue-i18n"
import type { PollForm, Error } from '@/types'

const props = defineProps({
    error: {
        type: Object,
        required: false,
    },
    formType: {
        type: String,
        required: true,
    },
    selectedPoll: {
        type: Object,
        required: false,
    },
})
const emit = defineEmits(['isPageLoading', 'submitForm'])

const { t } = useI18n()

const state = reactive({
    formPoll: {
        title: '',
        is_active: true,
    } as PollForm,
})

watch(() => props.selectedPoll, (newValue: any) => {
    if (newValue != null) {
        state.formPoll = {
            title: newValue.title,
            is_active: newValue.is_active,
        }
    }
})

const rules = computed(() => ({
    formPoll: {
        title: {
            required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
        },
    },
}))

const v$ = useVuelidate(rules, state)

function submitForm() {
    v$.value.$validate()
    if (!v$.value.$error) {
        emit('submitForm', state.formPoll)
    }
}
</script>
