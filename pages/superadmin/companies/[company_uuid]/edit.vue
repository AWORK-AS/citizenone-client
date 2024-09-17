<template>
    <div>
        <NuxtLayout name="superadmin">

            <Head>
                <Title>{{ $t('superadmin.companies.editCompany') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('superadmin.companies.editCompany') }}</template>

            <div>
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer"
                    to="/superadmin/companies">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <div class="max-w-2xl">
                        <Alert type="danger" :text="state?.error?.message"
                            v-if="state.error?.message && state.error.message.length > 0" />
                        <form class="mt-5" method="POST" @submit.prevent="updateCompany">
                            <div class="grid grid-cols-1 gap-y-3">
                                <div class="space-y-1">
                                    <FormLabel for="name" :label="$t('superadmin.companies.form.companyName')" />
                                    <FormTextField id="name" name="name"
                                        :placeholder="$t('superadmin.companies.form.companyName')"
                                        v-model="state.formCompany.name" />
                                    <FormError :error="v$?.formCompany?.name?.$errors[0]?.$message.toString()" />
                                    <FormError :error="state?.error?.errors?.name?.[0]" />
                                </div>
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div class="space-y-1">
                                        <FormLabel for="website" :label="$t('superadmin.companies.form.website')" />
                                        <FormTextField id="website" name="website"
                                            :placeholder="$t('superadmin.companies.form.website')"
                                            v-model="state.formCompany.website" />
                                        <FormError :error="v$?.formCompany?.website?.$errors[0]?.$message.toString()" />
                                        <FormError :error="state?.error?.errors?.website?.[0]" />
                                    </div>
                                    <div class="space-y-1">
                                        <FormLabel for="cvr" :label="$t('superadmin.companies.form.cvr')" />
                                        <FormTextField id="cvr" name="cvr"
                                            :placeholder="$t('superadmin.companies.form.cvr')"
                                            v-model="state.formCompany.cvr" />
                                        <FormError :error="v$?.formCompany?.cvr?.$errors[0]?.$message.toString()" />
                                        <FormError :error="state?.error?.errors?.cvr?.[0]" />
                                    </div>
                                </div>
                            </div>
                            <div class="mt-6">
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <FormButton type="button" buttonStyle="cancel" class="rounded-md"
                                        @click="navigateTo(`/superadmin/companies`)">
                                        {{ $t('cancel') }}
                                    </FormButton>
                                    <FormButton type="submit" buttonStyle="primary" class="rounded-md">
                                        {{ $t('update') }}
                                    </FormButton>
                                </div>
                            </div>
                        </form>
                    </div>
                </LoadingSpinner>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { companyService } from '@/components/api/superadmin/CompanyService'
import { useAlert } from '@/composables/alert'
import { useVuelidate } from "@vuelidate/core"
import { required, helpers } from '@vuelidate/validators'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()
const router = useRouter()
const companyUuid = router?.currentRoute?.value?.params?.company_uuid

const state = reactive({
    error: {} as Error,
    formCompany: {
        name: '',
        cvr: '',
        website: '',
        is_active: '',
    } as any,
    isPageLoading: false,
})

const rules = computed(() => {
    return {
        formCompany: {
            name: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
        }
    }
})
const v$ = useVuelidate(rules, state)

onMounted(() => {
    fetchCompany()
})

async function fetchCompany() {
    state.isPageLoading = true
    state.error = {}
    try {
        const response = await companyService.getCompany(companyUuid)
        if (response) {
            state.formCompany = {
                name: response?.data?.name ?? '',
                cvr: response?.data?.cvr ?? '',
                website: response?.data?.website ?? '',
                is_active: response?.data?.is_active ?? '',
            }
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function updateCompany() {
    state.error = {}
    state.isPageLoading = true
    v$.value.$validate()
    if (!v$.value.$error) {
        try {
            const params = {
                name: state.formCompany.name,
                cvr: state.formCompany.cvr,
                website: state.formCompany.website,
                is_active: state.formCompany.is_active,
            }
            const response = await companyService.updateCompany(companyUuid, params)
            if (response.data) {
                successAlert(`${t('alert.success')}!`, `${t('superadmin.companies.form.alert.companySuccessfullyUpdated')}.`)
                navigateTo('/superadmin/companies')
            }
        } catch (error: any) {
            state.error = error
        }
    }
    state.isPageLoading = false
}
</script>