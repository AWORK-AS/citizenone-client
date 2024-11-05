<template>
    <div>
        <Modal size="lg" :title="$t('forms.viewResponses')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <div>
                    {{ props.selectedFormFieldIndex + 1 }}.
                    {{ JSON.parse(props.selectedFormField.field)?.value }}
                </div>
                <div class="table-responsive mt-5">
                    <Table :columnHeaders="state.columnHeaders" :data="state.responses"
                        :isLoading="state.isTableLoading">
                        <template #body v-if="!(state.isTableLoading || (state.responses?.data?.length === 0))">
                            <tr v-for="(response, index) in state.responses?.data" :key="index">
                                <td>
                                    {{ response?.user?.firstname }}
                                    {{ response?.user?.lastname }}
                                </td>
                                <td>
                                    <div v-if="JSON.parse(response?.form_field?.field)?.type === 'datefield'">
                                        {{ formatDateToReadable(response?.response) }}
                                    </div>
                                    <div v-else-if="JSON.parse(response?.form_field?.field)?.type === 'checkbox'">
                                        {{ JSON.parse(response?.response).join(", ") }}.
                                    </div>
                                    <div v-else-if="JSON.parse(response?.form_field?.field)?.type === 'uploadfile'">
                                        <span class="text-primary cursor-pointer hover:text-primary-700"
                                            @click="navigateToExternalLink(response?.response)">
                                            {{ response?.response }}
                                        </span>
                                    </div>
                                    <div v-else>
                                        {{ response?.response }}
                                    </div>
                                </td>
                            </tr>
                        </template>
                    </Table>
                </div>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { formFieldService } from '@/components/api/FormFieldService'
import type { Error } from '@/types'

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
    selectedFormField: {
        type: Object,
        required: true,
    },
    selectedFormFieldIndex: {
        type: Number,
        required: true,
    },
})
const emit = defineEmits(['close', 'refreshJobTitle'])
const { formatDateToReadable } = useDatetimeFormatter()

const state = reactive({
    columnHeaders: [
        { name: 'forms.responses.table.name' },
        { name: 'forms.responses.table.responses' },
    ],
    error: {} as Error,
    formJobTitle: {
        title: '',
    },
    isTableLoading: false,
    responses: [] as any,
})

function closeModal() {
    emit('close')
}

watch(() => props.isModalOpen, (newValue: any) => {
    if (newValue) {
        fetchFormsResponses()
    }
})

async function fetchFormsResponses() {
    state.error = {}
    state.isTableLoading = true
    try {
        const params = {
            field_uuid: props.selectedFormField.uuid
        }
        const response = await formFieldService.getFormFieldResponses(params)
        if (response) {
            state.responses = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

async function navigateToExternalLink(link: any) {
    await navigateTo(link, {
        external: true,
        open: {
            target: '_blank',
        }
    })
}
</script>