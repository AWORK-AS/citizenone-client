<template>
    <div>
        <Modal size="xs" :title="$t('events.invitees')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <div v-for="(invitee, index) in sortedInvitees" :key="index" class="mb-2">
                    <span class="text-sm">{{ index + 1 }}.</span>
                    <span class="bg-secondary text-xxs px-1.5 py-1 text-white rounded-md ml-2">
                        {{ invitee?.user?.firstname }} {{ invitee?.user?.lastname }}
                    </span>
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
    invitees: {
        type: Object,
        required: true,
    }
})
const emit = defineEmits(['close'])

function closeModal() {
    emit('close')
}

const sortedInvitees = computed(() => {
    return props.invitees.sort((a: any, b: any) => {
        const firstnameA = a?.user?.firstname?.toLowerCase() || '';
        const firstnameB = b?.user?.firstname?.toLowerCase() || '';
        if (firstnameA < firstnameB) return -1;
        if (firstnameA > firstnameB) return 1;
        return 0;
    });
})
</script>