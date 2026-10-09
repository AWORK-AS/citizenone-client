<template>
    <Modal size="sm" :title="$t('timeRegistration.shiftEndPrompt.title')" :show="isOpen" @close="() => { }">
        <template #modal-body>
            <div class="space-y-4">
                <div class="flex flex-col items-center text-center">
                    <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                        <Icon name="ph:clock" class="w-8 h-8 text-green-600" />
                    </div>
                    <h3 class="text-lg font-semibold mb-2">
                        {{ $t('timeRegistration.shiftEndPrompt.question') }}
                    </h3>
                    <p class="text-sm text-gray-600" v-if="endTime">
                        {{ $t('timeRegistration.shiftEndPrompt.message', { time: endTime }) }}
                    </p>
                </div>
                <p class="text-sm text-red-600 text-center" v-if="hasAnswerFailed">
                    {{ $t('alert.somethingWentWrong') }}
                </p>
                <div class="grid grid-cols-2 gap-3 mt-6">
                    <FormButton buttonStyle="cancel" :disabled="isAnswering" @click="answer(false)">
                        {{ $t('timeRegistration.shiftEndPrompt.no') }}
                    </FormButton>
                    <FormButton buttonStyle="primary" :disabled="isAnswering" @click="answer(true)">
                        {{ $t('timeRegistration.shiftEndPrompt.yes') }}
                    </FormButton>
                </div>
            </div>
        </template>
    </Modal>
</template>

<script setup lang="ts">
import moment from 'moment'
import { useShiftEndPrompt } from '@/composables/shiftEndPrompt'
import { useUserStore } from '@/store/user'

const userStore = useUserStore() as any
const { isOpen, shiftEndAt, isAnswering, hasAnswerFailed, start, stop, answer } = useShiftEndPrompt()

const endTime = computed(() => shiftEndAt.value ? moment(shiftEndAt.value).format('HH:mm') : '')

onMounted(() => start())
onBeforeUnmount(() => stop())

// A timer stopped or confirmed elsewhere closes a prompt that is still showing.
watch(() => userStore.getUser?.is_checked_in, (checkedIn: boolean) => {
    if (!checkedIn) isOpen.value = false
})
watch(() => userStore.getUser?.next_prompt_at, (nextPromptAt: string | null, previous: string | null) => {
    if (isOpen.value && previous && nextPromptAt !== previous) isOpen.value = false
})
</script>
