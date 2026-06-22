<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('forms.predefinedEvents.predefinedEvents') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('forms.editForm') }}</template>

            <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer" to="/forms">
                <Icon name="ph:arrow-left" size="20" class="text-black" />
                <span>{{ $t('back') }}</span>
            </NuxtLink>

            <Tabs :tabs="tabs" />

            <div class="mt-6">
                <ModulesUserFormPredefinedEventsList :formUuid="formUuid" />
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { useUserStore } from '@/store/user'

const runtimeConfig = useRuntimeConfig()
const router = useRouter()
const formUuid = router?.currentRoute?.value?.params?.form_uuid as string
const userStore = useUserStore()

const isEmploymentServices = computed(() =>
    userStore.getUser?.company?.industry?.system_name === 'employment_services'
)

onMounted(() => {
    if (!isEmploymentServices.value) {
        navigateTo(`/forms/${formUuid}/edit`)
    }
})

watch(isEmploymentServices, (value) => {
    if (!value) navigateTo(`/forms/${formUuid}/edit`)
})

const breadcrumbLinks = [
    {
        name: 'forms.forms',
        translate: true,
        href: '/forms',
    },
    {
        name: 'forms.predefinedEvents.predefinedEvents',
        translate: true,
        href: `/forms/${formUuid}/predefined-events`,
    },
]

const tabs = computed(() => [
    {
        name: 'forms.tabs.formBuilder',
        isTranslateName: true,
        href: `/forms/${formUuid}/edit`,
        routeNames: ['forms-form_uuid-edit'],
    },
    {
        name: 'forms.tabs.predefinedEvents',
        isTranslateName: true,
        href: `/forms/${formUuid}/predefined-events`,
        routeNames: ['forms-form_uuid-predefined-events'],
    },
])
</script>
