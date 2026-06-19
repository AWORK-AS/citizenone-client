<template>
    <div>
        <Modal size="4xl" :title="$t('citizens.developmentGraph.title')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <ModulesUserCitizenDevelopmentGraphChart :citizenUuid="citizenUuid" />
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
const router = useRouter()
const citizenUuid = router?.currentRoute?.value?.params?.uuid as string

function closeModal() {
    emit('close')
}
</script>
