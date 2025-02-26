<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('forms.viewResponses') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('forms.viewResponses') }}</template>

            <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer" to="/forms">
                <Icon name="ph:arrow-left" size="20" class="text-black" />
                <span>{{ $t('back') }}</span>
            </NuxtLink>

            <LoadingSpinner :isActive="state.isPageLoading">
                <div class="max-w-5xl mx-auto space-y-5">
                    <div class="space-y-3 px-4 py-6 sm:p-8 bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg">
                        <Alert type="danger" :text="state?.error?.message"
                            v-if="state.error?.message && state.error.message.length > 0" />
                        <h3 class="text-lg font-semibold">
                            {{ state.form?.data?.title }}
                        </h3>
                        <p class="text-sm">
                            {{ state.form?.data?.description }}
                        </p>

                        <div class="space-y-3">
                            <div>
                                <div class="space-y-8 mt-5" v-if="state.form?.data?.form_fields?.length > 0">
                                    <div v-for="(formField, fieldIndex) in state.form?.data?.form_fields"
                                        :key="fieldIndex" class="space-y-3">
                                        <div class="bg-gray-100 rounded-md border-t-2 border-primary">
                                            <div class="grow">
                                                <div class="p-5 space-y-3">
                                                    <div class="flex gap-x-3">
                                                        <div>{{ fieldIndex + 1 }}.</div>
                                                        <div class="grow space-y-3">
                                                            <h3>
                                                                {{ JSON.parse(formField?.field)?.value }}
                                                            </h3>
                                                        </div>
                                                        <button class="text-sm text-primary hover:text-primary-700"
                                                            @click="viewResponses(fieldIndex, formField)">
                                                            {{ $t('forms.viewResponses') }}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <ModulesFormModalResponses :isModalOpen="state.modal.showResponsesOpen"
                    :selectedFormField="state.selectedFormField" :selectedFormFieldIndex="state.selectedFormFieldIndex"
                    @close="state.modal.showResponsesOpen = false" />
            </LoadingSpinner>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { formService } from '@/components/api/FormService'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const router = useRouter()
const formUuid = router?.currentRoute?.value?.params?.form_uuid
const breadcrumbLinks = [
    {
        name: 'forms.forms',
        translate: true,
        href: '/forms',
    },
    {
        name: 'forms.viewResponses',
        translate: true,
        href: `/forms/${formUuid}/responses`,
    },
]

const state = reactive({
    error: {} as Error,
    form: [] as any,
    isPageLoading: false,
    modal: {
        showResponsesOpen: false,
    },
    selectedFormField: [] as any,
    selectedFormFieldIndex: 0,
})

onMounted(() => {
    fetchForm()
})

async function fetchForm() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await formService.getForm(formUuid)
        if (response) {
            state.form = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

function viewResponses(fieldIndex: number, formField: object) {
    state.modal.showResponsesOpen = true
    state.selectedFormField = formField
    state.selectedFormFieldIndex = fieldIndex
}
</script>