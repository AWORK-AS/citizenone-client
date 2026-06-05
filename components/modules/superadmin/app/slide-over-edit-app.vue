<template>
    <TransitionRoot as="template" :show="props.isOpen">
        <Dialog class="relative z-50" @close="emit('close')">
            <div class="fixed inset-0 bg-black/30" />

            <div class="fixed inset-0 overflow-hidden">
                <div class="absolute inset-0 overflow-hidden">
                    <div class="pointer-events-none fixed inset-y-0 right-0 flex max-w-full">
                        <TransitionChild as="template" enter="transform transition ease-in-out duration-300"
                            enter-from="translate-x-full" enter-to="translate-x-0"
                            leave="transform transition ease-in-out duration-200" leave-from="translate-x-0"
                            leave-to="translate-x-full">
                            <DialogPanel class="pointer-events-auto w-screen max-w-[540px]">
                                <div class="flex h-full flex-col bg-white shadow-2xl">

                                    <!-- Header -->
                                    <div class="flex items-start justify-between px-6 py-5 border-b border-[#EAECF0]">
                                        <div>
                                            <DialogTitle class="text-[16px] font-semibold text-[#1F2533]">
                                                {{ $t('superadmin.apps.sliderEditTitle') }}
                                            </DialogTitle>
                                            <p class="text-[12px] text-[#8891A4] mt-0.5">
                                                {{ state.app?.name }}
                                            </p>
                                        </div>
                                        <button @click="emit('close')"
                                            class="w-8 h-8 rounded-lg flex items-center justify-center text-[#8891A4] hover:bg-[#F5F6F8] hover:text-[#1F2533] transition-colors">
                                            <Icon name="ph:x" class="w-4 h-4" />
                                        </button>
                                    </div>

                                    <!-- Scrollable content -->
                                    <div class="flex-1 overflow-y-auto px-6 py-5">
                                        <LoadingSpinner :isActive="state.isPageLoading">
                                            <ModulesSuperadminAppSlideOverForm ref="formRef" formType="update"
                                                :selectedApp="state.app" :error="state.error" :showActions="false"
                                                :showCompanyAttach="false" @submitForm="updateApp" />
                                        </LoadingSpinner>
                                    </div>

                                    <!-- Footer buttons -->
                                    <div class="flex items-center gap-3 px-6 py-4 border-t border-[#EAECF0] bg-white">
                                        <button @click="emit('close')"
                                            class="flex-1 py-2.5 rounded-lg text-sm font-medium text-[#5C6478] bg-white border border-[#EAECF0] hover:bg-[#F5F6F8] transition-colors">
                                            {{ $t('cancel') }}
                                        </button>
                                        <button @click="formRef?.submit()"
                                            class="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors shadow-sm"
                                            style="background:#205E77" :disabled="state.isPageLoading">
                                            {{ $t('update') }}
                                        </button>
                                    </div>

                                </div>
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </div>
            </div>
        </Dialog>
    </TransitionRoot>
</template>

<script setup lang="ts">
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'
import { appService } from '@/components/api/superadmin/AppService'
import { useAlert } from '@/composables/alert'
import { useI18n } from 'vue-i18n'
import type { Error } from '@/types'

const props = defineProps({
    appUuid: {
        type: String,
        default: null,
    },
    isOpen: {
        type: Boolean,
        required: true,
    },
})

const emit = defineEmits(['close', 'saved'])

const { successAlert } = useAlert()
const { t } = useI18n()

const formRef = ref<any>(null)

const state = reactive({
    app: null as any,
    error: {} as Error,
    isPageLoading: false,
})

watch(() => props.isOpen, (opened) => {
    if (opened && props.appUuid) {
        state.error = {}
        state.app = null
        fetchApp()
    }
})

async function fetchApp() {
    state.isPageLoading = true
    try {
        const response = await appService.getApplication(props.appUuid)
        if (response) {
            state.app = response?.data
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function updateApp(formData: any) {
    state.error = {} as Error
    state.isPageLoading = true
    try {
        const params = new FormData()
        params.append('description', formData.description ?? '')
        params.append('is_active', formData.is_active ? '1' : '0')
        params.append('is_news', formData.is_news ? '1' : '0')
        params.append('is_one_time_fee', formData.is_one_time_fee ? '1' : '0')
        params.append('is_popular', formData.is_popular ? '1' : '0')
        params.append('is_quantifiable', formData.is_quantifiable ? '1' : '0')
        params.append('is_recommended', formData.is_recommended ? '1' : '0')
        params.append('is_thirdparty', formData.is_thirdparty ? '1' : '0')
        params.append('monthly_price', String(formData.monthly_price ?? 0))
        params.append('name', formData.name)
        params.append('price', String(formData.price ?? 0))
        params.append('type', formData.type ?? '')
        params.append('url_field', formData.url_field ?? '')
        params.append('yearly_price', String(formData.yearly_price ?? 0))
        if (formData.background_image) params.append('background_image', formData.background_image)
        if (formData.image) params.append('image', formData.image)
        if (formData.logo) params.append('logo', formData.logo)
        const response = await appService.updateApp(props.appUuid, params)
        if (response) {
            successAlert(
                t('superadmin.apps.successSaved'),
                t('superadmin.apps.successUpdatedBody', { name: formData.name })
            )
            emit('close')
            emit('saved')
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>
