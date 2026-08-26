<template>
    <div>
        <Modal size="lg" :title="$t('inquiryPipeline.unassignedConverted.title')" :show="props.isModalOpen"
            @close="closeModal">
            <template #modal-body>
                <Alert type="danger" :text="state.error?.message" v-if="state.error?.message" />

                <p v-if="!state.items.length && !state.isLoading" class="text-sm text-gray-400 py-5">
                    {{ $t('inquiryPipeline.unassignedConverted.empty') }}
                </p>

                <div v-else class="space-y-4">
                    <div class="flex flex-wrap items-center justify-between gap-3">
                        <p class="text-[13px] text-slate-500">
                            {{ $t('inquiryPipeline.unassignedConverted.selectedOfTotal', { selected: selectedCount, total: state.items.length }) }}
                        </p>
                        <FormButton buttonStyle="primary" :disabled="selectedCount === 0 || state.isClaiming"
                            @click="claimSelected">
                            {{ $t('inquiryPipeline.unassignedConverted.claimSelected') }}
                        </FormButton>
                    </div>

                    <div class="overflow-x-auto">
                        <table class="w-full">
                            <thead class="bg-white border-b border-surface-200">
                                <tr>
                                    <th class="co-th w-10">
                                        <input type="checkbox" class="h-4 w-4 rounded border-gray-300 text-primary"
                                            :checked="allSelected" :title="$t('inquiryPipeline.unassignedConverted.selectAll')"
                                            @change="toggleAll(($event.target as HTMLInputElement).checked)" />
                                    </th>
                                    <th class="co-th">{{ $t('inquiries.table.firstname') }}</th>
                                    <th class="co-th">{{ $t('inquiries.table.lastname') }}</th>
                                    <th class="co-th">{{ $t('inquiries.table.inquirerName') }}</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="item in state.items" :key="item.uuid" class="border-b border-surface-200">
                                    <td class="co-td">
                                        <input type="checkbox" class="h-4 w-4 rounded border-gray-300 text-primary"
                                            :checked="item.is_selected"
                                            @change="item.is_selected = ($event.target as HTMLInputElement).checked" />
                                    </td>
                                    <td class="co-td">{{ item.citizen?.firstname ?? '-' }}</td>
                                    <td class="co-td">{{ item.citizen?.lastname ?? '-' }}</td>
                                    <td class="co-td">{{ item.inquirer_name ?? '-' }}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { citizenInquiryService } from '@/components/api/user/CitizenInquiryService'
import { useAlert } from '@/composables/alert'
import { useI18n } from 'vue-i18n'
import type { Error } from '@/types'

const { t } = useI18n()
const { successAlert } = useAlert()

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
})

const emit = defineEmits(['close', 'claimed'])

const state = reactive({
    items: [] as any[],
    isLoading: false,
    isClaiming: false,
    error: {} as Error,
})

watch(() => props.isModalOpen, (isOpen) => {
    if (isOpen) fetchItems()
})

const selectedCount = computed(() => state.items.filter((item) => item.is_selected).length)
const allSelected = computed(() => state.items.length > 0 && state.items.every((item) => item.is_selected))

function toggleAll(checked: boolean) {
    state.items.forEach((item) => { item.is_selected = checked })
}

async function fetchItems() {
    state.isLoading = true
    state.error = {}
    try {
        const response = await citizenInquiryService.getUnassignedConverted()
        state.items = (response?.data ?? []).map((item: any) => ({ ...item, is_selected: false }))
    } catch (error: any) {
        state.error = error
    }
    state.isLoading = false
}

async function claimSelected() {
    const uuids = state.items.filter((item) => item.is_selected).map((item) => item.uuid)
    if (!uuids.length) return

    state.isClaiming = true
    state.error = {}
    try {
        await citizenInquiryService.assignSelf(uuids)
        successAlert(`${t('alert.success')}!`, t('inquiryPipeline.unassignedConverted.claimed', { count: uuids.length }))
        await fetchItems()
        emit('claimed')
    } catch (error: any) {
        state.error = error
    }
    state.isClaiming = false
}

function closeModal() {
    emit('close')
}
</script>
