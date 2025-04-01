<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('citizens.editCitizen') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks">
                    <template #custom-link>
                        <div class="flex items-center">
                            <Icon name="heroicons:chevron-right" class="size-3 shrink-0 text-gray-400"
                                aria-hidden="true" />
                            <button @click="navigateTo('/citizens')"
                                class="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700">
                                {{ customPagesStore.getCustomPagesName?.citizens }}
                            </button>
                        </div>
                    </template>
                </Breadcrumb>
            </template>

            <template #header>{{ $t('citizens.editCitizen') }}</template>

            <div>
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer" to="/citizens">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <div class="max-w-3xl flex justify-end">
                        <FormButton type="button" buttonStyle="warning" class="rounded-md"
                            @click="confirmCitizenArchiving">
                            {{ $t('citizens.archiveCitizen') }}
                        </FormButton>
                    </div>
                    <ModulesUserCitizenDetailsForm formType="update" :selectedCitizen="state.formCitizen"
                        :error="state.error" @isPageLoading="(value: boolean) => state.isPageLoading = value"
                        @submitForm="updateCitizen" />
                </LoadingSpinner>
            </div>
            <DialogConfirmation :isModalOpen="state.modal.isArchiveCitizenOpen"
                :message="$t('citizens.confirmation.archiveConfirmation') + '?'"
                @close="state.modal.isArchiveCitizenOpen = false" @confirm="archiveCitizen" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { citizenService } from '@/components/api/user/CitizenService'
import { useCustomPagesStore } from '@/store/custom-pages'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import type { CitizenForm, Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const customPagesStore = useCustomPagesStore() as any
const { successAlert } = useAlert()
const { t } = useI18n()
const router = useRouter()
const citizenUuid = router?.currentRoute?.value?.params?.uuid
const breadcrumbLinks = [
    {
        name: 'citizens.editCitizen',
        translate: true,
        href: `/citizens/${citizenUuid}/edit`,
    },
]

const state = reactive({
    error: {} as Error,
    formCitizen: {
        image: '',
        firstname: '',
        lastname: '',
        gender: '',
        email: '',
        social_security_number: '',
        birthday: '',
        phone: '',
        departments: [],
        street: '',
        foreign_city_uuid: '',
        region_uuid: '',
        municipality_uuid: '',
        city_uuid: '',
        post_code: '',
        origin: '',
        diagnoses: [],
        addictions: [],
        date_admitted: '',
        date_discharged: '',
        note: '',
        has_system_access: false,
        has_chat_access: false,
        has_duty_schedule_access: false,
        has_bullet_board_access: false,
    } as CitizenForm,
    isPageLoading: false,
    modal: {
        isArchiveCitizenOpen: false
    }
})

onMounted(() => {
    fetchCitizen()
})

async function fetchCitizen() {
    state.isPageLoading = true
    state.error = {}
    try {
        const response = await citizenService.getCitizen(citizenUuid)
        if (response) {
            state.formCitizen = {
                image: response?.data?.image ?? '',
                firstname: response?.data?.firstname ?? '',
                lastname: response?.data?.lastname ?? '',
                gender: response?.data?.gender ?? '',
                email: response?.data?.email ?? '',
                social_security_number: response?.data?.social_security_number ?? '',
                birthday: response?.data?.birthday ?? '',
                phone: response?.data?.phone ?? '',
                departments: [],
                street: response?.data?.address?.street ?? '',
                foreign_city_uuid: response?.data?.foreign_city?.uuid.toString() ?? '',
                region_uuid: response?.data?.address?.region?.uuid.toString() ?? '',
                municipality_uuid: response?.data?.address?.municipality?.uuid.toString() ?? '',
                city_uuid: response?.data?.address?.city?.uuid.toString() ?? '',
                post_code: response?.data?.address?.post_code ?? '',
                origin: response?.data?.origin?.uuid.toString() ?? '',
                diagnoses: [],
                addictions: [],
                date_admitted: response?.data?.date_admitted ?? '',
                date_discharged: response?.data?.date_discharged ?? '',
                note: response?.data?.note ?? '',
                has_system_access: response?.data?.has_system_access ?? '',
                has_chat_access: response?.data?.has_chat_access ?? '',
                has_duty_schedule_access: response?.data?.has_duty_schedule_access ?? '',
                has_bullet_board_access: response?.data?.has_bullet_board_access ?? '',
            }
            response?.data?.departments?.forEach((department: any) => {
                state.formCitizen.departments.push(department?.uuid)
            })
            response?.data?.diagnoses?.forEach((diagnosis: any) => {
                state.formCitizen.diagnoses.push(diagnosis?.uuid)
            })
            response?.data?.addictions?.forEach((addiction: any) => {
                state.formCitizen.addictions.push(addiction?.uuid)
            })
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function updateCitizen(citizenDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        let params = new FormData()
        params.append('image', citizenDetails.image)
        params.append('firstname', citizenDetails.firstname)
        params.append('lastname', citizenDetails.lastname)
        params.append('gender', citizenDetails.gender)
        params.append('email', citizenDetails.email)
        params.append('social_security_number', citizenDetails.social_security_number)
        params.append('birthday', citizenDetails.birthday)
        params.append('phone', citizenDetails.phone)
        params.append('departments_uuid', JSON.stringify(citizenDetails.departments))
        params.append('street', citizenDetails.street)
        if (citizenDetails.is_foreign_city) {
            params.append('foreign_city_uuid', citizenDetails.foreign_city)
        } else {
            params.append('foreign_city_uuid', '')
        }
        if (citizenDetails.region) {
            params.append('region_uuid', citizenDetails.region)
        } else {
            params.append('region_uuid', '')
        }
        if (citizenDetails.municipality) {
            params.append('municipality_uuid', citizenDetails.municipality)
        } else {
            params.append('municipality_uuid', '')
        }
        if (citizenDetails.city) {
            params.append('city_uuid', citizenDetails.city)
        } else {
            params.append('city_uuid', '')
        }
        params.append('post_code', citizenDetails.post_code)
        params.append('origin_uuid', citizenDetails.origin)
        params.append('diagnoses_uuid', JSON.stringify(citizenDetails.diagnoses))
        params.append('addictions_uuid', JSON.stringify(citizenDetails.addictions))
        params.append('date_admitted', citizenDetails.date_admitted != 'Invalid date' ? citizenDetails.date_admitted : '')
        params.append('date_discharged', citizenDetails.date_discharged != 'Invalid date' ? citizenDetails.date_discharged : '')
        params.append('note', citizenDetails.note)
        params.append('has_system_access', citizenDetails.has_system_access)
        params.append('has_chat_access', citizenDetails.has_chat_access)
        params.append('has_duty_schedule_access', citizenDetails.has_duty_schedule_access)
        params.append('has_bullet_board_access', citizenDetails.has_bullet_board_access)
        const response = await citizenService.updateCitizen(citizenUuid, params)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('citizens.form.alert.successfullyUpdate')}.`)
            navigateTo('/citizens')
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

function confirmCitizenArchiving() {
    state.modal.isArchiveCitizenOpen = true
}

async function archiveCitizen() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await citizenService.archiveUnarchiveCitizen(citizenUuid)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('citizens.alert.citizenSuccessfullyArchived')}.`)
            navigateTo('/citizens')
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>