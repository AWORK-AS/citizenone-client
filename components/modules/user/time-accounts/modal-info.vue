<template>
    <div>
        <Modal size="md" :title="$t('timeAccounts.info.title')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <div class="space-y-4">
                    <div class="space-y-1">
                        <div class="flex items-center gap-2">
                            <p class="text-sm font-semibold text-gray-800">{{ $t('timeAccounts.info.initialHoursTitle') }}</p>
                            <span class="text-xs font-medium text-red-500 bg-red-50 px-1.5 py-0.5 rounded">{{ $t('timeAccounts.info.badgeRequired') }}</span>
                        </div>
                        <p class="text-sm text-gray-600">{{ $t('timeAccounts.info.initialHoursDesc') }}</p>
                    </div>
                    <div class="space-y-1">
                        <div class="flex items-center gap-2">
                            <p class="text-sm font-semibold text-gray-800">{{ $t('timeAccounts.info.startDateTitle') }}</p>
                            <span class="text-xs font-medium text-red-500 bg-red-50 px-1.5 py-0.5 rounded">{{ $t('timeAccounts.info.badgeRequired') }}</span>
                        </div>
                        <p class="text-sm text-gray-600">{{ $t('timeAccounts.info.startDateDesc') }}</p>
                    </div>
                    <div class="space-y-1">
                        <div class="flex items-center gap-2">
                            <p class="text-sm font-semibold text-gray-800">{{ $t('timeAccounts.info.expiryDateTitle') }}</p>
                            <span class="text-xs font-medium text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">{{ $t('timeAccounts.info.badgeOptional') }}</span>
                        </div>
                        <p class="text-sm text-gray-600">{{ $t('timeAccounts.info.expiryDateDesc') }}</p>
                    </div>
                    <div class="space-y-1">
                        <div class="flex items-center gap-2">
                            <p class="text-sm font-semibold text-gray-800">{{ $t('timeAccounts.info.ruleTypeTitle') }}</p>
                            <span class="text-xs font-medium text-red-500 bg-red-50 px-1.5 py-0.5 rounded">{{ $t('timeAccounts.info.badgeRequired') }}</span>
                        </div>
                        <p class="text-sm text-gray-600">{{ $t('timeAccounts.info.ruleTypeDesc') }}</p>
                        <ul class="mt-1 space-y-1 pl-4 list-disc">
                            <li class="text-sm text-gray-600">
                                <span class="font-medium">{{ $t('timeAccounts.info.ruleTypeAge') }}</span>
                                {{ $t('timeAccounts.info.ruleTypeAgeDesc') }}
                            </li>
                            <li class="text-sm text-gray-600">
                                <span class="font-medium">{{ $t('timeAccounts.info.ruleTypeEmploymentDate') }}</span>
                                {{ $t('timeAccounts.info.ruleTypeEmploymentDateDesc') }}
                            </li>
                            <li class="text-sm text-gray-600">
                                <span class="font-medium">{{ $t('timeAccounts.info.ruleTypeEmploymentDuration') }}</span>
                                {{ $t('timeAccounts.info.ruleTypeEmploymentDurationDesc') }}
                            </li>
                        </ul>
                    </div>
                    <div class="space-y-1">
                        <div class="flex items-center gap-2">
                            <p class="text-sm font-semibold text-gray-800">{{ $t('timeAccounts.info.grantAmountTitle') }}</p>
                            <span class="text-xs font-medium text-red-500 bg-red-50 px-1.5 py-0.5 rounded">{{ $t('timeAccounts.info.badgeRequired') }}</span>
                        </div>
                        <p class="text-sm text-gray-600">{{ $t('timeAccounts.info.grantAmountDesc') }}</p>
                    </div>
                    <div class="space-y-1">
                        <div class="flex items-center gap-2">
                            <p class="text-sm font-semibold text-gray-800">{{ $t('timeAccounts.info.grantFrequencyTitle') }}</p>
                            <span class="text-xs font-medium text-red-500 bg-red-50 px-1.5 py-0.5 rounded">{{ $t('timeAccounts.info.badgeRequired') }}</span>
                        </div>
                        <p class="text-sm text-gray-600">{{ $t('timeAccounts.info.grantFrequencyDesc') }}</p>
                    </div>
                </div>
                <div class="mt-6 flex justify-end">
                    <FormButton buttonStyle="cancel" @click="closeModal" class="rounded-md">
                        {{ $t('close') }}
                    </FormButton>
                </div>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
})

const emit = defineEmits(['close'])

function closeModal() {
    emit('close')
}
</script>
