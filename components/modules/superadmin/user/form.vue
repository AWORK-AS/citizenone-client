<template>
    <form @submit.prevent="submit" class="space-y-5">

        <Alert type="danger" :text="props?.error?.message"
            v-if="props.error?.message && props.error.message.length > 0" />

        <!-- Attach to company -->
        <div v-if="showExtendedFields">
            <p class="text-[10px] font-bold text-[#8891A4] uppercase tracking-[0.08em] mb-2">
                {{ $t('superadmin.users.slider.attachToCompany') }}
            </p>
            <div class="relative">
                <Icon name="ph:magnifying-glass"
                    class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8891A4]" />
                <SuperadminFormTextField v-model="state.companySearch"
                    :placeholder="$t('superadmin.users.slider.searchCompany')" class="!pl-8" @input="searchCompanies" />
            </div>
            <div v-if="state.companyResults.length"
                class="mt-1 border border-[#EAECF0] rounded-lg bg-white shadow-lg max-h-40 overflow-y-auto">
                <button v-for="c in state.companyResults" :key="c.uuid" type="button"
                    class="w-full text-left px-3 py-2.5 hover:bg-[#F5F6F8] transition-colors flex items-center gap-2.5"
                    @click="selectCompany(c)">
                    <div class="w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                        style="background:#42AED9">
                        {{ (c.name || '?').charAt(0).toUpperCase() }}
                    </div>
                    <span class="text-[13px] text-[#1F2533]">{{ c.name }}</span>
                </button>
            </div>
            <div v-if="state.selectedCompany"
                class="mt-2 flex items-center gap-2 px-3 py-2 bg-[#E4F1F6] rounded-lg border border-[#42AED9]/20">
                <div class="w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                    style="background:#205E77">
                    {{ (state.selectedCompany.name || '?').charAt(0).toUpperCase() }}
                </div>
                <span class="text-[13px] font-medium text-[#205E77] flex-1">{{ state.selectedCompany.name }}</span>
                <button type="button" @click="state.selectedCompany = null; state.companySearch = ''"
                    class="text-[#205E77]/50 hover:text-[#205E77] transition-colors">
                    <Icon name="ph:x" class="w-3.5 h-3.5" />
                </button>
            </div>
            <p v-else class="text-[11px] text-[#8891A4] mt-1.5">
                {{ $t('superadmin.users.slider.searchToAttach') }}
            </p>
        </div>

        <!-- User info -->
        <div>
            <p v-if="showExtendedFields" class="text-[10px] font-bold text-[#8891A4] uppercase tracking-[0.08em] mb-3">
                {{ $t('superadmin.users.slider.userInfo') }}
            </p>

            <!-- First name + Last name -->
            <div class="grid grid-cols-2 gap-3 mb-3">
                <div>
                    <SuperadminFormLabel :label="$t('superadmin.users.form.firstname')" :required="true" />
                    <SuperadminFormTextField v-model="state.formUser.firstname" placeholder="Jesper"
                        :hasError="v$?.formUser?.firstname?.$error" />
                    <SuperadminFormError :error="v$?.formUser?.firstname?.$errors[0]?.$message.toString()" />
                    <SuperadminFormError :error="props.error?.errors?.firstname?.[0]" />
                </div>
                <div>
                    <SuperadminFormLabel :label="$t('superadmin.users.form.lastname')" :required="true" />
                    <SuperadminFormTextField v-model="state.formUser.lastname" placeholder="Enger"
                        :hasError="v$?.formUser?.lastname?.$error" />
                    <SuperadminFormError :error="v$?.formUser?.lastname?.$errors[0]?.$message.toString()" />
                    <SuperadminFormError :error="props.error?.errors?.lastname?.[0]" />
                </div>
            </div>

            <!-- Email -->
            <div class="mb-3">
                <SuperadminFormLabel :label="$t('superadmin.users.form.emailAddress')" :required="true" />
                <SuperadminFormTextField v-model="state.formUser.email" type="email" placeholder="bruger@virksomhed.dk"
                    :hasError="v$?.formUser?.email?.$error" />
                <SuperadminFormError :error="v$?.formUser?.email?.$errors[0]?.$message.toString()" />
                <SuperadminFormError :error="props.error?.errors?.email?.[0]" />
            </div>

            <!-- Phone -->
            <div class="mb-3">
                <SuperadminFormLabel :label="$t('superadmin.users.form.phone')" />
                <SuperadminFormTextField v-model="state.formUser.phone" placeholder="+45 12 34 56 78" />
                <SuperadminFormError :error="v$?.formUser?.phone?.$errors[0]?.$message.toString()" />
                <SuperadminFormError :error="props.error?.errors?.phone?.[0]" />
            </div>

            <!-- Birthday -->
            <div class="mb-3">
                <SuperadminFormLabel :label="$t('superadmin.users.form.birthday')" />
                <SuperadminFormTextField v-model="state.formUser.birthday" type="date" />
                <SuperadminFormError :error="v$?.formUser?.birthday?.$errors[0]?.$message.toString()" />
                <SuperadminFormError :error="props.error?.errors?.birthday?.[0]" />
            </div>

            <!-- Password -->
            <div v-if="showExtendedFields" class="mb-1">
                <SuperadminFormLabel :label="$t('superadmin.users.slider.password')" />
                <SuperadminFormPasswordField v-model="state.formUser.password"
                    :placeholder="$t('superadmin.users.slider.minChars')" :hasError="v$?.formUser?.password?.$error" />
                <p class="text-[11px] text-[#8891A4] mt-1">
                    {{ $t('superadmin.users.slider.leaveEmptyForWelcomeEmail') }}
                </p>
                <SuperadminFormError :error="v$?.formUser?.password?.$errors[0]?.$message.toString()" />
                <SuperadminFormError :error="props.error?.errors?.password?.[0]" />
            </div>
        </div>

        <!-- Active toggle -->
        <div v-if="showExtendedFields"
            class="flex items-center justify-between py-3 border border-[#EAECF0] rounded-xl px-4">
            <div>
                <p class="text-[13px] font-medium text-[#1F2533]">
                    {{ $t('superadmin.companies.table.active') }}
                </p>
                <p class="text-[11px] text-[#8891A4]">{{ $t('superadmin.users.slider.userCanLogin') }}</p>
            </div>
            <button type="button" @click="state.formUser.is_active = !state.formUser.is_active"
                class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0"
                :style="state.formUser.is_active ? 'background:#42AED9' : 'background:#D5D9E2'">
                <span class="inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform"
                    :class="state.formUser.is_active ? 'translate-x-6' : 'translate-x-1'"></span>
            </button>
        </div>

        <!-- Action buttons (page context) -->
        <div v-if="showActions" class="flex items-center justify-end gap-3 pt-2">
            <button type="button" @click="navigateTo('/superadmin/users')"
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
import { companyService } from '@/components/api/superadmin/CompanyService'
import { useVuelidate } from '@vuelidate/core'
import { required, minLength, helpers } from '@vuelidate/validators'
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
    selectedUser: {
        type: Object,
        required: false,
    },
    showActions: {
        type: Boolean,
        default: true,
    },
    showExtendedFields: {
        type: Boolean,
        default: false,
    },
})

const emit = defineEmits(['isPageLoading', 'submitForm'])

const { t } = useI18n()

let companySearchTimeout: any = null

const state = reactive({
    companyResults: [] as any[],
    companySearch: '',
    formUser: {
        birthday: '',
        email: '',
        firstname: '',
        is_active: true,
        lastname: '',
        password: '',
        phone: '',
        role: 'superadmin',
    },
    selectedCompany: null as any,
})

watch(() => props.selectedUser, (newValue: any) => {
    if (newValue) {
        state.formUser = {
            ...state.formUser,
            birthday: newValue.birthday ?? '',
            email: newValue.email ?? '',
            firstname: newValue.firstname ?? '',
            is_active: newValue.is_active !== false,
            lastname: newValue.lastname ?? '',
            password: '',
            phone: newValue.phone ?? '',
        }
    }
})

const rules = computed(() => ({
    formUser: {
        firstname: {
            required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
        },
        lastname: {
            required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
        },
        email: {
            required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
        },
        ...(props.showExtendedFields ? {
            password: {
                minLength: helpers.withMessage(() => `${t('superadmin.users.slider.minChars')}.`, minLength(8)),
            },
        } : {}),
    },
}))

const v$ = useVuelidate(rules, state)

function searchCompanies() {
    clearTimeout(companySearchTimeout)
    if (!state.companySearch.trim()) { state.companyResults = []; return }
    companySearchTimeout = setTimeout(async () => {
        try {
            const response = await companyService.getCompanies({ search: state.companySearch, page: 1 })
            state.companyResults = response?.data?.slice(0, 8) ?? []
        } catch (_) { }
    }, 300)
}

function selectCompany(company: any) {
    state.selectedCompany = company
    state.companySearch = company.name
    state.companyResults = []
}

async function submit() {
    await v$.value.$validate()
    if (!v$.value.$error) {
        const payload: Record<string, any> = {
            birthday: state.formUser.birthday || null,
            email: state.formUser.email,
            firstname: state.formUser.firstname,
            lastname: state.formUser.lastname,
            phone: state.formUser.phone || null,
        }
        if (props.showExtendedFields) {
            payload.is_active = state.formUser.is_active
            payload.role = state.formUser.role
            if (state.formUser.password) payload.password = state.formUser.password
            if (state.selectedCompany) payload.company_uuid = state.selectedCompany.uuid
        }
        emit('submitForm', payload)
    }
}

defineExpose({ submit })
</script>
