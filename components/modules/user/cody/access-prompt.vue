<template>
    <Modal size="xs" :title="$t('cody.adoption.promptTitle')" :show="promptOpen" @close="promptOpen = false">
        <template #modal-body>
            <div class="pb-6">
                <p class="text-sm text-gray-600">
                    {{ isAdmin ? $t('cody.adoption.headlineBody') : $t('cody.adoption.requestBody') }}
                </p>

                <div class="mt-5 flex flex-col gap-2 sm:flex-row">
                    <template v-if="isAdmin">
                        <FormButton v-if="trialAvailable" type="button" buttonStyle="primary" class="w-full justify-center"
                            :disabled="trialBusy" @click="confirmOpen = true">
                            {{ $t('cody.adoption.tryFreeShort') }}
                        </FormButton>
                        <FormButton type="button" :buttonStyle="trialAvailable ? 'cancel' : 'primary'"
                            class="w-full justify-center" @click="goToStore()">
                            {{ $t('cody.adoption.goToStore') }}
                        </FormButton>
                    </template>
                    <template v-else>
                        <span v-if="requestState === 'sent' || requestState === 'recent'"
                            class="text-sm font-medium text-primary" role="status">
                            <Icon name="ph:check-circle" class="mr-1 inline h-4 w-4 text-[#2dbab2]" aria-hidden="true" />
                            {{ $t('cody.adoption.sent') }}
                        </span>
                        <FormButton v-else type="button" buttonStyle="primary" class="w-full justify-center"
                            :disabled="requestState === 'sending'" @click="requestFromAdmin()">
                            {{ $t('cody.adoption.askAdmin') }}
                        </FormButton>
                    </template>
                </div>
                <p v-if="requestState === 'no_admin'" class="mt-3 text-sm text-gray-600">{{ $t('cody.adoption.noAdmin') }}</p>
                <p v-if="requestState === 'error'" class="mt-3 text-sm text-red-600">{{ $t('cody.adoption.requestFailed') }}</p>
                <p v-if="trialError" class="mt-3 text-sm text-red-600">{{ $t(`cody.adoption.trialError.${trialError}`) }}</p>
            </div>

            <DialogConfirmation :isModalOpen="confirmOpen" :title="$t('cody.adoption.confirmTitle')"
                :message="$t('cody.adoption.confirmBody')" :confirmLabel="$t('cody.adoption.confirmStart')"
                @close="confirmOpen = false" @confirm="startTrial()" />
        </template>
    </Modal>
</template>

<script setup lang="ts">
const {
    isAdmin, trialAvailable, requestState, trialBusy, trialError, promptOpen,
    load, startTrial, requestFromAdmin,
} = useCodyAdoption()

const confirmOpen = ref(false)

function goToStore() {
    promptOpen.value = false
    navigateTo('/apps')
}

// Opening the prompt is the moment the answer is needed; usually the banner
// has already loaded it, in which case this is a no-op.
watch(promptOpen, (open) => { if (open) load() })
</script>
