<template>
    <div>
        <Modal size="md" :title="props.selectedNews?.title" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <div class="relative">
                    <div class="bg-no-repeat w-full h-52 bg-cover rounded-t-md"
                        :style="`background-image: url(${props.selectedNews?.image});`"
                        v-if="props.selectedNews?.image">
                    </div>
                    <div class="absolute top-3 right-0 bg-secondary px-3 py-1 rounded-tl-md rounded-bl-md"
                        v-if="props.selectedNews?.is_featured">
                        <p class="text-sm text-white">
                            {{ $t('bulletBoard.featured') }}
                        </p>
                    </div>
                    <div :class="[
                        !props.selectedNews?.image ? 'pt-5' : 'mt-3',
                        'text-left'
                    ]">
                        <h3 class="font-semibold text-lg cursor-pointer">
                            {{ props.selectedNews?.title }}
                        </h3>
                        <p class="text-xs text-gray-400 mt-1"
                            v-html="props.selectedNews?.content?.replace(/\n/g, '<br>')" />
                        <div class="mt-4" v-if="props.selectedNews?.link">
                            <FormButton buttonStyle="primary" @click="navigateToExternalLink(props.selectedNews?.link)"
                                class="w-full">
                                {{ $t('overview.openLink') }}
                            </FormButton>
                        </div>
                    </div>
                    <div class="mt-5 flex gap-x-3 justify-end">
                        <FormButton buttonStyle="cancel" @click="closeModal">
                            {{ $t('close') }}
                        </FormButton>
                    </div>
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
    selectedNews: {
        type: Object,
        required: true,
    },
})
const emit = defineEmits(['close'])

function closeModal() {
    emit('close')
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