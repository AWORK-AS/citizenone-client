<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('events.calendar') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('events.calendar') }}</template>

            <ModulesUserCalendarTabs />

            <div class="mt-8 flex justify-end items-center mb-5 gap-x-2">
                <FormButton buttonStyle="action" class="rounded-lg" @click="state.modal.isNewEventOpen = true">
                    <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                    {{ $t('bookings.newEvent') }}
                </FormButton>
                <FormButton buttonStyle="action" class="rounded-lg" @click="navigateTo('/calendar/bookings/settings')">
                    <Icon name="ph:gear" class="h-4 w-4" aria-hidden="true" />
                    {{ $t('bookingSettings.bookingSettings') }}
                </FormButton>
            </div>
            <div>
                <p>
                    It looks like you haven't set up your booking settings yet. Click the button below to configure your
                    settings so
                    you can start creating events or courses.
                </p>
                <p>
                    Det ser ud til, at du endnu ikke har opsat dine bookingindstillinger. Klik på knappen nedenfor for
                    at
                    konfigurere dine indstillinger, så du kan begynde at oprette begivenheder eller kurser.
                </p>
            </div>
            <ModulesUserCalendarBookingNewEventSelection :isModalOpen="state.modal.isNewEventOpen"
                @close="state.modal.isNewEventOpen = false" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const language = useI18n()
const { successAlert } = useAlert()
const { t } = useI18n()

const breadcrumbLinks = [
    {
        name: 'bookings.bookings',
        translate: true,
        href: '/calendar/bookings',
    },
]

const state = reactive({
    bookings: [],
    error: {} as Error,
    isPageLoading: false,
    modal: {
        isNewEventOpen: false,
    },
})

onMounted(() => {

})
</script>