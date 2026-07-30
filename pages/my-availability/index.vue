<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('employeeAvailability.title') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('employeeAvailability.title') }}</template>

            <div class="mt-8 max-w-2xl">
                <Alert type="danger" :text="state.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />

                <p class="text-sm text-gray-500 mb-4">
                    {{ $t('employeeAvailability.explanation') }}
                </p>

                <div class="border border-gray-200 rounded-xl p-4 space-y-3 mb-6">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div class="space-y-1">
                            <FormLabel :label="$t('employeeAvailability.form.date')" />
                            <FormDateField id="availability_date" name="availability_date"
                                :placeholder="$t('employeeAvailability.form.date')" v-model="state.form.date" />
                        </div>
                        <div class="space-y-1">
                            <FormLabel :label="$t('employeeAvailability.form.status')" />
                            <div class="flex gap-2 pt-2">
                                <button type="button" @click="state.form.is_available = true" :class="[
                                    'flex-1 px-3 py-2 text-sm rounded-lg border transition-colors',
                                    state.form.is_available
                                        ? 'bg-green-50 text-green-700 border-green-300'
                                        : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
                                ]">
                                    {{ $t('employeeAvailability.form.available') }}
                                </button>
                                <button type="button" @click="state.form.is_available = false" :class="[
                                    'flex-1 px-3 py-2 text-sm rounded-lg border transition-colors',
                                    !state.form.is_available
                                        ? 'bg-red-50 text-red-700 border-red-300'
                                        : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
                                ]">
                                    {{ $t('employeeAvailability.form.notAvailable') }}
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="space-y-1">
                        <FormLabel :label="$t('employeeAvailability.form.comment')" />
                        <FormTextArea id="availability_comment" name="availability_comment"
                            :placeholder="$t('employeeAvailability.form.commentPlaceholder')"
                            v-model="state.form.comment" />
                    </div>
                    <div class="flex justify-end">
                        <FormButton type="button" buttonStyle="primary" :disabled="state.isSaving || !state.form.date"
                            @click="saveAvailability">
                            {{ $t('save') }}
                        </FormButton>
                    </div>
                </div>

                <LoadingSpinner :isActive="state.isLoading">
                    <p v-if="!state.isLoading && state.availabilities.length === 0" class="text-sm text-gray-400">
                        {{ $t('employeeAvailability.empty') }}
                    </p>
                    <div class="space-y-2">
                        <div v-for="availability in state.availabilities" :key="availability.uuid"
                            class="flex items-center justify-between border border-gray-200 rounded-lg px-4 py-3">
                            <div>
                                <div class="flex items-center gap-2">
                                    <span class="font-medium">{{ availability.date }}</span>
                                    <Badge :type="availability.is_available ? 'success' : 'danger'">
                                        {{ availability.is_available
                                            ? $t('employeeAvailability.form.available')
                                            : $t('employeeAvailability.form.notAvailable') }}
                                    </Badge>
                                </div>
                                <p v-if="availability.comment" class="text-sm text-gray-500 mt-1">
                                    {{ availability.comment }}
                                </p>
                            </div>
                            <button type="button" @click="removeAvailability(availability)"
                                class="text-red-500 hover:text-red-700">
                                <Icon name="ph:trash" size="18" />
                            </button>
                        </div>
                    </div>
                </LoadingSpinner>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import { employeeAvailabilityService } from '@/components/api/user/EmployeeAvailabilityService'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()

const breadcrumbLinks = [
    {
        name: 'employeeAvailability.title',
        translate: true,
        href: '/my-availability',
    },
]

const state = reactive({
    error: {} as Error,
    isLoading: false,
    isSaving: false,
    availabilities: [] as any[],
    form: {
        date: moment().format('YYYY-MM-DD'),
        is_available: false,
        comment: '',
    },
})

onMounted(() => {
    fetchAvailabilities()
})

async function fetchAvailabilities() {
    state.error = {}
    state.isLoading = true
    try {
        const response = await employeeAvailabilityService.getMine({
            date_start: moment().format('YYYY-MM-DD'),
            date_end: moment().add(90, 'days').format('YYYY-MM-DD'),
        })
        state.availabilities = response?.data ?? []
    } catch (error: any) {
        state.error = error
    }
    state.isLoading = false
}

async function saveAvailability() {
    state.error = {}
    state.isSaving = true
    try {
        const params = {
            date: state.form.date,
            is_available: state.form.is_available,
            comment: state.form.comment || null,
        }
        const response = await employeeAvailabilityService.saveAvailability(params)
        if (response?.data) {
            successAlert(`${t('alert.success')}!`, `${t('employeeAvailability.alert.savedSuccessfully')}.`)
            state.form.comment = ''
            fetchAvailabilities()
        }
    } catch (error: any) {
        state.error = error
    }
    state.isSaving = false
}

async function removeAvailability(availability: any) {
    try {
        await employeeAvailabilityService.deleteAvailability(availability.uuid)
        fetchAvailabilities()
        successAlert(`${t('alert.success')}!`, `${t('employeeAvailability.alert.deletedSuccessfully')}.`)
    } catch (error: any) {
        state.error = error
    }
}
</script>
