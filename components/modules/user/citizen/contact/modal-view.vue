<template>
    <div>
        <Modal size="lg" :title="$t('citizens.contacts.view.title')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <div class="space-y-4" v-if="contact">
                    <div class="flex items-center gap-x-3">
                        <img :src="contact?.employee?.image ?? avatarUrl(`${(contact?.firstname || '') + ' ' + (contact?.lastname || '')}`)"
                            class="rounded-full w-14 h-14 object-cover border-2 border-tertiary/40" />
                        <div>
                            <p class="text-base font-semibold text-gray-900">
                                {{ contact?.firstname }} {{ contact?.lastname }}
                            </p>
                            <p class="text-xs text-gray-500" v-if="roleLabel">{{ roleLabel }}</p>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
                        <p v-if="contact?.company_name">
                            <span class="font-semibold">{{ $t('citizens.contacts.form.companyName') }}:</span>
                            {{ contact?.company_name }}
                        </p>
                        <p v-if="contact?.email">
                            <span class="font-semibold">{{ $t('citizens.contacts.form.email') }}:</span>
                            {{ contact?.email }}
                        </p>
                        <p v-if="contact?.phone">
                            <span class="font-semibold">{{ $t('citizens.contacts.form.phone') }}:</span>
                            {{ contact?.phone }}
                        </p>
                        <p v-if="contact?.relationship?.name">
                            <span class="font-semibold">{{ $t('citizens.contacts.form.relationship') }}:</span>
                            {{ contact?.relationship?.name }}
                        </p>
                        <p v-if="address">
                            <span class="font-semibold">{{ $t('citizens.contacts.table.address') }}:</span>
                            {{ address }}
                        </p>
                        <p>
                            <span class="font-semibold">{{ $t('citizens.contacts.form.allowSystemAccess') }}:</span>
                            {{ contact?.has_system_access ? $t('yes') : $t('no') }}
                        </p>
                    </div>

                    <div class="rounded-lg border border-gray-200 bg-gray-50 p-3">
                        <p class="text-xs font-semibold text-gray-700 mb-1">{{ $t('citizens.contacts.form.note') }}</p>
                        <p class="whitespace-pre-line break-words text-sm text-gray-800" v-if="contact?.note">
                            {{ contact?.note }}
                        </p>
                        <p class="text-sm italic text-gray-400" v-else>{{ $t('citizens.contacts.view.noNote') }}</p>
                    </div>

                    <div class="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
                        <FormButton v-if="isAtLeast('Admin') || can('update_citizen_contact')" type="button"
                            buttonStyle="primary" class="w-full" @click="onEdit">
                            {{ $t('citizens.contacts.table.action.edit') }}
                        </FormButton>
                        <FormButton type="button" buttonStyle="cancel" class="md:col-start-2" @click="closeModal">
                            {{ $t('close') }}
                        </FormButton>
                    </div>
                </div>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { usePermissions } from '@/composables/usePermissions'

const { isAtLeast, can } = usePermissions()

const props = defineProps({
    isModalOpen: { type: Boolean, default: false },
    selectedContact: { type: Object, default: () => ({}) },
})

const emit = defineEmits(['close', 'edit'])

const contact = computed(() => props.selectedContact ?? {})

const roleLabel = computed(() => {
    const c: any = contact.value
    return c?.contact_job_title?.name || c?.relationship?.name || c?.title || ''
})

const address = computed(() => {
    const c: any = contact.value
    return [c?.street, c?.region?.name, c?.municipality?.name, c?.city?.name, c?.post_code]
        .filter(Boolean)
        .join(', ')
})

function closeModal() {
    emit('close')
}

function onEdit() {
    emit('edit', props.selectedContact)
}
</script>
