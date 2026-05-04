<template>
    <div>
        <Modal size="lg" :title="$t('addressBook.assignFromAddressBook')" :show="props.isModalOpen"
            @close="emit('close')">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isLoading">
                    <div class="space-y-4 pb-5">
                        <Alert type="danger" :text="state.error?.message"
                            v-if="state.error?.message && state.error.message.length > 0" />

                        <FormSelect :options="state.contactOptions" v-model="state.selectedUuid" />

                        <div class="grid grid-cols-2 gap-3">
                            <FormButton buttonStyle="cancel" type="button" @click="emit('close')">
                                {{ $t('cancel') }}
                            </FormButton>
                            <FormButton buttonStyle="primary" type="button" @click="confirmSelection">
                                {{ $t('select') }}
                            </FormButton>
                        </div>
                    </div>
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { companyContactService } from '@/components/api/user/CompanyContactService'
import { citizenContactService } from '@/components/api/user/CitizenContactService'
import type { Error } from '@/types'

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
    citizenUuid: {
        type: String,
        required: true,
    },
})

const emit = defineEmits(['close', 'prefillContact'])

const state = reactive({
    contacts: [] as any[],
    contactOptions: [] as any[],
    selectedUuid: null,
    isLoading: false,
    error: {} as Error,
})

watch(() => props.isModalOpen, (val) => {
    if (val) fetchAddressBook()
})

async function fetchAddressBook() {
    state.isLoading = true
    try {
        const [addressBookRes, citizenContactsRes] = await Promise.all([
            companyContactService.getContactList(),
            citizenContactService.getContacts({ citizen_uuid: props.citizenUuid, per_page: 1000 }),
        ])

        const assignedIds = new Set(
            (citizenContactsRes?.data ?? [])
                .map((c: any) => c.company_contact_id)
                .filter(Boolean)
        )

        state.contacts = addressBookRes?.data ?? addressBookRes
        state.contactOptions = state.contacts
            .filter((c: any) => !assignedIds.has(c.id))
            .map((c: any) => ({
                value: c.uuid,
                label: `${c.firstname} ${c.lastname ?? ''}`.trim(),
            }))
    } catch (error: any) {
        state.error = error
    }
    state.isLoading = false
}

function confirmSelection() {
    const contact = state.contacts.find((c: any) => c.uuid === state.selectedUuid)
    if (!contact) return
    emit('prefillContact', contact)
    emit('close')
}
</script>
