<template>
    <div>
        <Modal size="xs" :title="`${$t('wish.form.describeTheFeature')}?`" :show="props.isModalOpen"
            @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <div v-if="state.view === 'form'">
                        <form @submit.prevent="sendMessage()">
                            <Alert type="danger" :text="state?.error?.message"
                                v-if="state.error?.message && state.error.message.length > 0" />
                            <div class="gap-y-3">
                                <div class="space-y-1">
                                    <FormLabel for="message" :label="`${$t('wish.form.pleaseDescribeTheFeature')}.`" />
                                    <FormTextArea id="message" name="message"
                                        :placeholder="`${$t('wish.form.pleaseWriteHere')}...`"
                                        v-model="state.formContactUs.message" />
                                    <FormError
                                        :error="vContactUsWishList$?.formContactUs?.message?.$errors[0]?.$message.toString()" />
                                    <FormError :error="state?.error?.errors?.message?.[0]" />
                                </div>
                            </div>
                            <div class="mt-6">
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <FormButton type="button" buttonStyle="cancel" @click="closeModal">
                                        {{ $t('cancel') }}
                                    </FormButton>
                                    <FormButton type="submit" buttonStyle="primary" class="w-full">
                                        {{ $t('wish.form.sendMessage') }}
                                    </FormButton>
                                </div>
                            </div>
                        </form>
                    </div>
                    <div v-else-if="state.view === 'confirmation'" class="space-y-5">
                        <div class="flex flex-col items-center text-center space-y-2 py-2">
                            <div class="rounded-full bg-green-100 p-3">
                                <Icon name="ph:check-circle" class="h-8 w-8 text-green-600" />
                            </div>
                            <p class="text-base font-semibold">{{ $t('wish.confirmation.requestSent') }}</p>
                            <p class="text-sm text-gray-500">{{ $t('wish.confirmation.thankYou') }}</p>
                        </div>
                        <div>
                            <p class="text-sm font-medium text-gray-700 mb-2">{{ $t('wish.previousRequests.title') }}</p>
                            <LoadingSpinner :isActive="state.isWishesLoading">
                                <div v-if="state.wishes.length === 0" class="text-sm text-gray-400 py-2">
                                    {{ $t('wish.previousRequests.empty') }}
                                </div>
                                <ul v-else class="space-y-2 max-h-56 overflow-y-auto">
                                    <li v-for="(wish, index) in state.wishes" :key="index"
                                        class="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-sm text-gray-700">
                                        {{ wish.message }}
                                    </li>
                                </ul>
                            </LoadingSpinner>
                        </div>
                        <FormButton type="button" buttonStyle="cancel" class="w-full" @click="closeModal">
                            {{ $t('close') }}
                        </FormButton>
                    </div>
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { contactUsService } from '@/components/api/user/ContactUsService'
import { useVuelidate } from "@vuelidate/core"
import { required, helpers } from '@vuelidate/validators'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const { t } = useI18n()
const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
})

const emit = defineEmits(['close'])

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    isWishesLoading: false,
    view: 'form' as 'form' | 'confirmation',
    wishes: [] as any[],
    formContactUs: {
        message: '',
    },
})

function closeModal() {
    emit('close')
}

const rulesContactUsWishList = computed(() => {
    return {
        formContactUs: {
            message: {
                required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
            },
        },
    }
})

const vContactUsWishList$ = useVuelidate(rulesContactUsWishList, state)

async function fetchWishes() {
    state.isWishesLoading = true
    try {
        const response = await contactUsService.getWishes()
        if (response) {
            state.wishes = Array.isArray(response) ? response : (response.data ?? [])
        }
    } catch {
        state.wishes = []
    }
    state.isWishesLoading = false
}

async function sendMessage() {
    state.isPageLoading = true
    state.error = {}
    vContactUsWishList$.value.$validate()
    if (!vContactUsWishList$.value.$error) {
        try {
            const params = {
                message: state.formContactUs.message,
            }
            const response = await contactUsService.sendWishMessage(params)
            if (response) {
                state.view = 'confirmation'
                fetchWishes()
            }
        } catch (error: any) {
            state.error = error
        }
    }
    state.isPageLoading = false
}
</script>
