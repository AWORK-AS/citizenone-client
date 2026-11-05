<template>
    <div>
        <Modal size="xs" :title="`${$t('wish.form.describeTheFeature')}?`" :show="props.isModalOpen"
            @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <div v-if="state.view === 'form'">
                        <!-- Paste anywhere in the form (also while typing the message) adds a screenshot. -->
                        <form @submit.prevent="sendMessage()" @paste="onPaste">
                            <Alert type="danger" :text="state?.error?.message"
                                v-if="state.error?.message && state.error.message.length > 0" />
                            <div class="gap-y-3">
                                <div class="space-y-1">
                                    <FormLabel for="message" :label="`${$t('wish.form.pleaseDescribeTheFeature')}.`" />
                                    <FormTextArea id="message" name="message"
                                        :placeholder="`${$t('wish.form.pleaseWriteHere')}...`"
                                        v-model="state.formContactUs.message" />
                                    <FormError
                                        :error="vContactUsWishList$?.formContactUs?.message?.$errors[0]?.$message.toString()" />
                                    <FormError :error="state?.error?.errors?.message?.[0]" />
                                </div>
                                <div class="space-y-2 mt-4">
                                    <FormLabel for="wish-images" :label="$t('wish.form.attachImages')" />
                                    <p class="text-xs text-gray-500">{{ $t('wish.form.attachImagesHelp', { max: MAX_IMAGES }) }}</p>
                                    <div v-if="state.images.length" class="grid grid-cols-3 sm:grid-cols-5 gap-2"
                                        data-testid="wish-image-previews">
                                        <div v-for="(image, index) in state.images" :key="image.previewUrl"
                                            class="relative aspect-square overflow-hidden rounded-md border border-gray-200 bg-gray-50">
                                            <img :src="image.previewUrl" :alt="image.file.name" class="h-full w-full object-cover" />
                                            <button type="button" @click="removeImage(index)"
                                                :aria-label="$t('wish.form.removeImage')" :title="$t('wish.form.removeImage')"
                                                class="absolute right-1 top-1 rounded-full bg-white/90 p-0.5 text-gray-600 shadow hover:text-red-600">
                                                <Icon name="ph:x" class="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                    <input ref="fileInput" id="wish-images" type="file" class="hidden" multiple
                                        accept="image/png,image/jpeg,image/gif,image/webp" @change="onFilesSelected" />
                                    <FormButton v-if="state.images.length < MAX_IMAGES" type="button" buttonStyle="secondary"
                                        buttonSize="sm" @click="fileInput?.click()">
                                        <Icon name="ph:image" class="h-4 w-4" /> {{ $t('wish.form.addImages') }}
                                    </FormButton>
                                    <FormError :error="state.imageError" />
                                    <FormError :error="imageServerError" />
                                </div>
                            </div>
                            <div class="mt-6">
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <FormButton type="button" buttonStyle="cancel" @click="closeModal">
                                        {{ $t('cancel') }}
                                    </FormButton>
                                    <FormButton type="submit" buttonStyle="primary" class="w-full">
                                        {{ $t('wish.form.sendMessage') }}
                                    </FormButton>
                                </div>
                            </div>
                        </form>
                    </div>
                    <div v-else-if="state.view === 'confirmation'" class="space-y-5">
                        <div class="flex flex-col items-center text-center space-y-2 py-2">
                            <div class="rounded-full bg-green-100 p-3">
                                <Icon name="ph:check-circle" class="h-8 w-8 text-green-600" />
                            </div>
                            <p class="text-base font-semibold">{{ $t('wish.confirmation.requestSent') }}</p>
                            <p class="text-sm text-gray-500">{{ $t('wish.confirmation.thankYou') }}</p>
                        </div>
                        <div>
                            <p class="text-sm font-medium text-gray-700 mb-2">{{ $t('wish.previousRequests.title') }}</p>
                            <LoadingSpinner :isActive="state.isWishesLoading">
                                <div v-if="state.wishes.length === 0" class="text-sm text-gray-400 py-2">
                                    {{ $t('wish.previousRequests.empty') }}
                                </div>
                                <ul v-else class="space-y-2 max-h-56 overflow-y-auto">
                                    <li v-for="(wish, index) in state.wishes" :key="index"
                                        class="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-sm text-gray-700">
                                        {{ wish.message }}
                                        <div v-if="wish.images?.length" class="mt-2 flex flex-wrap gap-2">
                                            <a v-for="image in wish.images" :key="image.uuid" :href="image.url"
                                                target="_blank" rel="noopener">
                                                <img :src="image.url" :alt="image.file_name"
                                                    class="h-12 w-12 rounded border border-gray-200 object-cover" />
                                            </a>
                                        </div>
                                    </li>
                                </ul>
                            </LoadingSpinner>
                        </div>
                        <FormButton type="button" buttonStyle="cancel" class="w-full" @click="closeModal">
                            {{ $t('close') }}
                        </FormButton>
                    </div>
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { contactUsService } from '@/components/api/user/ContactUsService'
import { useVuelidate } from "@vuelidate/core"
import { required, helpers } from '@vuelidate/validators'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const { t } = useI18n()
const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
})

const emit = defineEmits(['close'])

// Must match ContactUsWish::MAX_IMAGES and the 10 MB rule in WishRequest on the backend.
const MAX_IMAGES = 5
const MAX_IMAGE_BYTES = 10 * 1024 * 1024
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/gif', 'image/webp']

const fileInput = ref<HTMLInputElement | null>(null)

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    isWishesLoading: false,
    view: 'form' as 'form' | 'confirmation',
    wishes: [] as any[],
    images: [] as { file: File, previewUrl: string }[],
    imageError: '',
    formContactUs: {
        message: '',
    },
})

function closeModal() {
    emit('close')
}

// The server reports a rejected file as images.0, images.1 ... - show the first one.
const imageServerError = computed(() => {
    const errors = state.error?.errors ?? {}
    const key = Object.keys(errors).find((k) => k === 'images' || k.startsWith('images.'))
    return key ? errors[key]?.[0] : ''
})

function addImages(files: File[]) {
    state.imageError = ''
    for (const file of files) {
        if (state.images.length >= MAX_IMAGES) {
            state.imageError = t('wish.form.tooManyImages', { max: MAX_IMAGES })
            break
        }
        if (!ALLOWED_TYPES.includes(file.type)) {
            state.imageError = t('wish.form.notAnImage')
            continue
        }
        if (file.size > MAX_IMAGE_BYTES) {
            state.imageError = t('wish.form.imageTooLarge')
            continue
        }
        state.images.push({ file, previewUrl: URL.createObjectURL(file) })
    }
}

function onFilesSelected(event: Event) {
    const input = event.target as HTMLInputElement
    addImages(Array.from(input.files ?? []))
    // Reset so picking the same file again (after removing it) still fires change.
    input.value = ''
}

// Lets the user paste a screenshot straight from the clipboard.
function onPaste(event: ClipboardEvent) {
    const files = Array.from(event.clipboardData?.items ?? [])
        .filter((item) => item.kind === 'file' && item.type.startsWith('image/'))
        .map((item) => item.getAsFile())
        .filter((file): file is File => !!file)
    if (files.length) {
        event.preventDefault()
        addImages(files.map((file, i) => file.name && file.name !== 'image.png'
            ? file
            : new File([file], `screenshot-${Date.now()}-${i + 1}.${file.type.split('/')[1] || 'png'}`, { type: file.type })))
    }
}

function removeImage(index: number) {
    URL.revokeObjectURL(state.images[index].previewUrl)
    state.images.splice(index, 1)
    state.imageError = ''
}

onBeforeUnmount(() => state.images.forEach((image) => URL.revokeObjectURL(image.previewUrl)))

const rulesContactUsWishList = computed(() => {
    return {
        formContactUs: {
            message: {
                required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
            },
        },
    }
})

const vContactUsWishList$ = useVuelidate(rulesContactUsWishList, state)

async function fetchWishes() {
    state.isWishesLoading = true
    try {
        const response = await contactUsService.getWishes()
        if (response) {
            state.wishes = Array.isArray(response) ? response : (response.data ?? [])
        }
    } catch {
        state.wishes = []
    }
    state.isWishesLoading = false
}

async function sendMessage() {
    state.isPageLoading = true
    state.error = {}
    vContactUsWishList$.value.$validate()
    if (!vContactUsWishList$.value.$error) {
        try {
            const formData = new FormData()
            formData.append('message', state.formContactUs.message)
            state.images.forEach((image) => formData.append('images[]', image.file, image.file.name))
            const response = await contactUsService.sendWishMessage(formData)
            if (response) {
                state.view = 'confirmation'
                fetchWishes()
            }
        } catch (error: any) {
            state.error = error
        }
    }
    state.isPageLoading = false
}
</script>
