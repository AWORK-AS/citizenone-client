<template>
    <Teleport to="body">
        <!-- Backdrop -->
        <Transition enter-active-class="transition-opacity duration-300" enter-from-class="opacity-0"
            enter-to-class="opacity-100" leave-active-class="transition-opacity duration-200"
            leave-from-class="opacity-100" leave-to-class="opacity-0">
            <div v-if="state.open" class="fixed inset-0 bg-black/30 z-40" @click="close" />
        </Transition>

        <!-- Panel -->
        <Transition enter-active-class="transition-transform duration-300 ease-out" enter-from-class="translate-x-full"
            enter-to-class="translate-x-0" leave-active-class="transition-transform duration-200 ease-in"
            leave-from-class="translate-x-0" leave-to-class="translate-x-full">
            <div v-if="state.open"
                class="fixed inset-y-0 right-0 z-50 w-full max-w-[440px] bg-white shadow-2xl flex flex-col">

                <!-- Header -->
                <div class="flex items-start justify-between px-6 py-5 border-b border-[#EAECF0]">
                    <div>
                        <h2 class="text-[16px] font-semibold text-[#1F2533]">
                            {{ $t('superadmin.users.newUser') }}
                        </h2>
                        <p class="text-[12px] text-[#8891A4] mt-0.5">
                            {{ $t('superadmin.users.slider.createAndAttach') }}
                        </p>
                    </div>
                    <button @click="close"
                        class="w-8 h-8 rounded-lg flex items-center justify-center text-[#8891A4] hover:bg-[#F5F6F8] hover:text-[#1F2533] transition-colors">
                        <Icon name="ph:x" class="w-4 h-4" />
                    </button>
                </div>

                <!-- Scrollable content -->
                <div class="flex-1 overflow-y-auto px-6 py-5 space-y-5">

                    <Alert type="danger" :text="state.error?.message" v-if="state.error?.message?.length > 0" />

                    <!-- Attach to company -->
                    <div>
                        <p class="text-[10px] font-bold text-[#8891A4] uppercase tracking-[0.08em] mb-2">
                            {{ $t('superadmin.users.slider.attachToCompany') }}
                        </p>
                        <div class="relative">
                            <Icon name="ph:magnifying-glass"
                                class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8891A4]" />
                            <input v-model="state.companySearch" type="text"
                                :placeholder="$t('superadmin.users.slider.searchCompany')" class="co-input !pl-8"
                                @input="searchCompanies" />
                        </div>
                        <!-- Company dropdown results -->
                        <div v-if="state.companyResults.length"
                            class="mt-1 border border-[#EAECF0] rounded-lg bg-white shadow-lg max-h-40 overflow-y-auto">
                            <button v-for="c in state.companyResults" :key="c.uuid"
                                class="w-full text-left px-3 py-2.5 hover:bg-[#F5F6F8] transition-colors flex items-center gap-2.5"
                                @click="selectCompany(c)">
                                <div class="w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                                    style="background:#42AED9">
                                    {{ (c.name || '?').charAt(0).toUpperCase() }}
                                </div>
                                <span class="text-[13px] text-[#1F2533]">{{ c.name }}</span>
                            </button>
                        </div>
                        <!-- Selected company chip -->
                        <div v-if="state.selectedCompany"
                            class="mt-2 flex items-center gap-2 px-3 py-2 bg-[#E4F1F6] rounded-lg border border-[#42AED9]/20">
                            <div class="w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                                style="background:#205E77">
                                {{ (state.selectedCompany.name || '?').charAt(0).toUpperCase() }}
                            </div>
                            <span class="text-[13px] font-medium text-[#205E77] flex-1">
                                {{ state.selectedCompany.name }}
                            </span>
                            <button @click="state.selectedCompany = null; state.companySearch = ''"
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
                        <p class="text-[10px] font-bold text-[#8891A4] uppercase tracking-[0.08em] mb-3">
                            {{ $t('superadmin.users.slider.userInfo') }}
                        </p>

                        <!-- First name + Last name -->
                        <div class="grid grid-cols-2 gap-3 mb-3">
                            <div>
                                <label class="co-label">
                                    {{ $t('superadmin.users.form.firstname') }}
                                    <span class="text-red-500">*</span>
                                </label>
                                <input v-model="state.formUser.firstname" type="text" placeholder="Jesper"
                                    class="co-input" :class="v$?.formUser?.firstname?.$error ? 'border-red-300' : ''" />
                                <FormError :error="v$?.formUser?.firstname?.$errors[0]?.$message.toString()" />
                                <FormError :error="state.error?.errors?.firstname?.[0]" />
                            </div>
                            <div>
                                <label class="co-label">
                                    {{ $t('superadmin.users.form.lastname') }}
                                    <span class="text-red-500">*</span>
                                </label>
                                <input v-model="state.formUser.lastname" type="text" placeholder="Enger"
                                    class="co-input" :class="v$?.formUser?.lastname?.$error ? 'border-red-300' : ''" />
                                <FormError :error="v$?.formUser?.lastname?.$errors[0]?.$message.toString()" />
                                <FormError :error="state.error?.errors?.lastname?.[0]" />
                            </div>
                        </div>

                        <!-- Email -->
                        <div class="mb-3">
                            <label class="co-label">
                                {{ $t('superadmin.users.form.emailAddress') }}
                                <span class="text-red-500">*</span>
                            </label>
                            <input v-model="state.formUser.email" type="email" placeholder="bruger@virksomhed.dk"
                                class="co-input" :class="v$?.formUser?.email?.$error ? 'border-red-300' : ''" />
                            <FormError :error="v$?.formUser?.email?.$errors[0]?.$message.toString()" />
                            <FormError :error="state.error?.errors?.email?.[0]" />
                        </div>

                        <!-- Phone -->
                        <div class="mb-3">
                            <label class="co-label">
                                {{ $t('superadmin.users.form.phone') }}
                            </label>
                            <input v-model="state.formUser.phone" type="text" placeholder="+45 12 34 56 78"
                                class="co-input" />
                            <FormError :error="v$?.formUser?.phone?.$errors[0]?.$message.toString()" />
                            <FormError :error="state.error?.errors?.password?.[0]" />
                        </div>

                        <!-- Birthday -->
                        <div class="mb-3">
                            <label class="co-label">
                                {{ $t('superadmin.users.form.birthday') }}
                            </label>
                            <input v-model="state.formUser.birthday" type="date" class="co-input" />
                            <FormError :error="v$?.formUser?.birthday?.$errors[0]?.$message.toString()" />
                            <FormError :error="state.error?.errors?.birthday?.[0]" />
                        </div>

                        <!-- Role -->
                        <!-- <div class="mb-3">
                            <label class="co-label">
                                {{ $t('superadmin.users.table.role') }}
                            </label>
                            <select v-model="state.formUser.role" class="co-input">
                                <option value="user">{{ $t('superadmin.users.slider.roleUser') }}</option>
                                <option value="superadmin">{{ $t('superadmin.users.slider.roleAdmin') }}</option>
                            </select>
                            <FormError :error="v$?.formUser?.role?.$errors[0]?.$message.toString()" />
                            <FormError :error="state.error?.errors?.role?.[0]" />
                        </div> -->

                        <!-- Password -->
                        <div class="mb-1">
                            <label class="co-label">
                                {{ $t('superadmin.users.slider.password') }}
                            </label>
                            <div class="relative">
                                <input v-model="state.formUser.password" :type="showPassword ? 'text' : 'password'"
                                    :placeholder="$t('superadmin.users.slider.minChars')" class="co-input pr-10"
                                    :class="v$?.formUser?.password?.$error ? 'border-red-300' : ''" />
                                <button type="button"
                                    class="absolute right-3 top-1/2 -translate-y-1/2 text-[#8891A4] hover:text-[#5C6478]"
                                    @click="showPassword = !showPassword">
                                    <Icon :name="showPassword ? 'ph:eye-slash' : 'ph:eye'" class="w-4 h-4" />
                                </button>
                            </div>
                            <p class="text-[11px] text-[#8891A4] mt-1">
                                {{ $t('superadmin.users.slider.leaveEmptyForWelcomeEmail') }}
                            </p>
                            <FormError :error="v$?.formUser?.password?.$errors[0]?.$message.toString()" />
                            <FormError :error="state.error?.errors?.password?.[0]" />
                        </div>
                    </div>

                    <!-- Active toggle -->
                    <div class="flex items-center justify-between py-3 border border-[#EAECF0] rounded-xl px-4">
                        <div>
                            <p class="text-[13px] font-medium text-[#1F2533]">
                                {{ $t('superadmin.companies.table.active') }}
                            </p>
                            <p class="text-[11px] text-[#8891A4]">
                                {{ $t('superadmin.users.slider.userCanLogin') }}
                            </p>
                        </div>
                        <button type="button" @click="state.formUser.is_active = !state.formUser.is_active"
                            class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0"
                            :style="state.formUser.is_active ? 'background:#42AED9' : 'background:#D5D9E2'">
                            <span
                                class="inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform"
                                :class="state.formUser.is_active ? 'translate-x-6' : 'translate-x-1'"></span>
                        </button>
                    </div>
                </div>

                <!-- Footer buttons -->
                <div class="flex items-center gap-3 px-6 py-4 border-t border-[#EAECF0] bg-white">
                    <button @click="close"
                        class="flex-1 py-2.5 rounded-lg text-sm font-medium text-[#5C6478] bg-white border border-[#EAECF0] hover:bg-[#F5F6F8] transition-colors">
                        {{ $t('cancel') }}
                    </button>
                    <button @click="saveUser"
                        class="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors shadow-sm"
                        style="background:#205E77" :disabled="state.isSaving">
                        <span v-if="state.isSaving" class="flex items-center justify-center gap-2">
                            <Icon name="ph:spinner" class="w-4 h-4 animate-spin" />
                            {{ $t('superadmin.users.slider.creating') }}
                        </span>
                        <span v-else>{{ $t('superadmin.users.createUser') }}</span>
                    </button>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<script setup lang="ts">
import { userService } from '@/components/api/superadmin/UserService'
import { companyService } from '@/components/api/superadmin/CompanyService'
import { useAlert } from '@/composables/alert'
import { useI18n } from 'vue-i18n'
import { useVuelidate } from '@vuelidate/core'
import { required, minLength, helpers } from '@vuelidate/validators'

const { successAlert } = useAlert()
const { t } = useI18n()

const emit = defineEmits<{ saved: [] }>()

const showPassword = ref(false)
let companySearchTimeout: any = null

const state = reactive({
    open: false,
    isSaving: false,
    error: {} as any,
    companySearch: '',
    companyResults: [] as any[],
    selectedCompany: null as any,
    formUser: {
        firstname: '',
        lastname: '',
        email: '',
        phone: '',
        birthday: '',
        role: 'superadmin',
        password: '',
        is_active: true,
    },
})

const rules = computed(() => ({
    formUser: {
        firstname: {
            required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required)
        },
        lastname: {
            required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required)
        },
        email: {
            required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required)
        },
        phone: {
            required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required)
        },
        birthday: {
            required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required)
        },
        password: {
            minLength: helpers.withMessage(() => `${t('superadmin.users.slider.minChars')}.`, minLength(8))
        },
    },
}))
const v$ = useVuelidate(rules, state)

function open() {
    state.formUser = {
        firstname: '',
        lastname: '',
        email: '',
        phone: '',
        birthday: '',
        role: 'superadmin',
        password: '',
        is_active: true
    }
    state.error = {}
    state.companySearch = ''
    state.companyResults = []
    state.selectedCompany = null
    showPassword.value = false
    v$.value.$reset()
    state.open = true
    document.body.style.overflow = 'hidden'
}

function close() {
    state.open = false
    document.body.style.overflow = ''
}

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

async function saveUser() {
    state.error = {}
    state.isSaving = true
    await v$.value.$validate()
    if (!v$.value.$error) {
        try {
            const params: any = {
                firstname: state.formUser.firstname,
                lastname: state.formUser.lastname,
                email: state.formUser.email,
                phone: state.formUser.phone || null,
                birthday: state.formUser.birthday || null,
                role: state.formUser.role,
                is_active: state.formUser.is_active,
            }
            if (state.formUser.password) params.password = state.formUser.password
            if (state.selectedCompany) params.company_uuid = state.selectedCompany.uuid

            const response = await userService.saveUser(params)
            if (response) {
                successAlert(`${t('alert.success')}!`, `${t('superadmin.users.form.alert.newUserSuccessfullySaved')}.`)
                close()
                emit('saved')
            }
        } catch (error: any) {
            state.error = error
        }
    }
    state.isSaving = false
}

onMounted(() => {
    window.addEventListener('keydown', (e) => { if (e.key === 'Escape' && state.open) close() })
})

defineExpose({ open })
</script>

<style scoped>
.co-label {
    display: block;
    font-size: 13px;
    font-weight: 600;
    color: #1F2533;
    margin-bottom: 5px
}

.co-input {
    width: 100%;
    padding: 9px 13px;
    font-size: 14px;
    color: #1F2533;
    background: white;
    border: 1px solid #D5D9E2;
    border-radius: 10px;
    outline: none;
    transition: border-color 0.15s, box-shadow 0.15s
}

.co-input:focus {
    border-color: #42AED9;
    box-shadow: 0 0 0 3px rgba(66, 174, 217, 0.12)
}

.co-input::placeholder {
    color: #B0B8C4
}
</style>
