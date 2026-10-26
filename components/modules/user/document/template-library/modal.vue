<template>
    <!--
        "Skabeloner" (task #94): the templates a document can be made from, in the citizen's and the
        company's documents. A questionnaire is handed to the "create report" flow; a KRAP worksheet
        opens in the PDF editor. Either way it is saved as a new PDF in a folder of the user's choice -
        the template itself never changes.
    -->
    <Modal size="lg" :title="$t('templateLibrary.title')" titleIcon="ph:files" titleIconColor="42AED9"
        :show="props.isModalOpen" @close="emit('close')">
        <template #modal-body>
            <LoadingSpinner :isActive="state.isLoading">
                <div class="space-y-6" data-testid="template-library">
                    <p class="text-sm text-gray-600">{{ $t('templateLibrary.intro') }}</p>

                    <Alert type="danger" :text="state.error" v-if="state.error" />

                    <section>
                        <h3 class="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                            {{ $t('templateLibrary.standardTitle') }}
                        </h3>
                        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <button v-for="template in state.standard" :key="template.key" type="button"
                                :data-testid="`template-library-standard-${template.key}`" :disabled="!!state.opening"
                                class="group flex h-full flex-col rounded-xl border border-gray-200 bg-white p-4 text-left transition hover:border-[#42AED9] hover:shadow-sm disabled:opacity-60"
                                @click="useStandard(template.key)">
                                <span class="flex items-start gap-3">
                                    <span class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#42AED9]/10 text-[#42AED9]">
                                        <Icon :name="state.opening === template.key ? 'ph:spinner-gap' : 'ph:clipboard-text'"
                                            class="size-5" :class="{ 'animate-spin': state.opening === template.key }" />
                                    </span>
                                    <span class="min-w-0">
                                        <span class="block font-semibold text-gray-900">{{ template.title }}</span>
                                        <span class="mt-0.5 block text-sm text-gray-600">{{ template.summary }}</span>
                                    </span>
                                </span>
                                <span class="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500">
                                    <span>{{ $t('templateLibrary.questions', { count: template.question_count }) }}</span>
                                    <span class="inline-flex items-center gap-1 font-medium text-[#174560] group-hover:text-[#42AED9]">
                                        {{ $t('templateLibrary.fillIn') }}
                                        <Icon name="ph:arrow-right" class="size-3.5" />
                                    </span>
                                </span>
                            </button>
                        </div>
                    </section>

                    <section>
                        <div class="mb-2 flex flex-wrap items-center justify-between gap-2">
                            <h3 class="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                {{ $t('templateLibrary.pdfTitle') }}
                            </h3>
                            <input v-if="state.pdf.length > 6" v-model="state.pdfSearch" type="search"
                                :placeholder="$t('templateLibrary.search')" data-testid="template-library-pdf-search"
                                class="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-sm outline-none focus:border-[#42AED9] sm:w-56" />
                        </div>
                        <ul v-if="pdfTemplates.length"
                            class="max-h-80 divide-y divide-gray-100 overflow-y-auto rounded-xl border border-gray-200 bg-white">
                            <li v-for="template in pdfTemplates" :key="template.key">
                                <button type="button" :data-testid="`template-library-pdf-${template.key}`"
                                    class="flex w-full items-center gap-3 px-4 py-2.5 text-left transition hover:bg-gray-50"
                                    @click="emit('pickPdf', template)">
                                    <span class="flex h-7 min-w-9 shrink-0 items-center justify-center rounded-md bg-[#42AED9]/10 px-1.5 text-xs font-semibold text-[#174560]">
                                        {{ template.number }}
                                    </span>
                                    <span class="min-w-0 flex-1 truncate text-sm font-medium text-gray-900">{{ template.title }}</span>
                                    <span class="hidden text-xs text-gray-400 sm:inline">{{ template.source }}</span>
                                    <Icon name="ph:caret-right" class="size-4 shrink-0 text-gray-400" />
                                </button>
                            </li>
                        </ul>
                        <p v-else-if="!state.isLoading" class="rounded-xl border border-dashed border-gray-200 px-4 py-5 text-center text-sm text-gray-500">
                            {{ $t('templateLibrary.noMatches') }}
                        </p>
                        <p class="mt-2 text-xs text-gray-500">{{ $t('templateLibrary.pdfNote') }}</p>
                    </section>

                    <section>
                        <div class="mb-2 flex flex-wrap items-center justify-between gap-2">
                            <h3 class="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                {{ $t('templateLibrary.ownTitle') }}
                            </h3>
                            <input v-if="state.own.length > 6" v-model="state.search" type="search"
                                :placeholder="$t('templateLibrary.search')" data-testid="template-library-search"
                                class="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-sm outline-none focus:border-[#42AED9] sm:w-56" />
                        </div>
                        <ul v-if="ownForms.length"
                            class="max-h-80 divide-y divide-gray-100 overflow-y-auto rounded-xl border border-gray-200 bg-white">
                            <li v-for="form in ownForms" :key="form.uuid">
                                <button type="button" :data-testid="`template-library-own-${form.uuid}`"
                                    class="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-gray-50"
                                    @click="emit('pick', form.uuid)">
                                    <Icon name="ph:file-text" class="size-5 shrink-0 text-gray-400" />
                                    <span class="min-w-0 flex-1">
                                        <span class="block truncate text-sm font-medium text-gray-900">{{ form.title }}</span>
                                        <span v-if="form.description" class="block truncate text-xs text-gray-500">{{ form.description }}</span>
                                    </span>
                                    <Icon name="ph:caret-right" class="size-4 shrink-0 text-gray-400" />
                                </button>
                            </li>
                        </ul>
                        <p v-else-if="!state.isLoading" class="rounded-xl border border-dashed border-gray-200 px-4 py-5 text-center text-sm text-gray-500"
                            data-testid="template-library-own-empty">
                            {{ state.search ? $t('templateLibrary.noMatches') : $t('templateLibrary.ownEmpty') }}
                            <NuxtLink v-if="!state.search && canManageForms" to="/forms" class="ml-1 font-medium text-[#174560] underline">
                                {{ $t('templateLibrary.createOwn') }}
                            </NuxtLink>
                        </p>
                    </section>
                </div>
            </LoadingSpinner>
        </template>
    </Modal>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { formService } from '@/components/api/user/FormService'

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
    // Which documents area the library is opened from: it decides who may use it.
    area: {
        type: String as () => 'citizen' | 'company',
        required: true,
    },
})

// pick: a form (uuid) for the report flow; pickPdf: a KRAP worksheet for the PDF editor.
const emit = defineEmits(['close', 'pick', 'pickPdf'])
const { t } = useI18n()
const { isAtLeast, can } = usePermissions()

const canManageForms = computed(() => isAtLeast('Admin') || can('manage_status_reports'))

const state = reactive({
    standard: [] as any[],
    pdf: [] as any[],
    own: [] as any[],
    search: '',
    pdfSearch: '',
    opening: '' as string,
    isLoading: false,
    error: '',
})

const pdfTemplates = computed(() => {
    const term = state.pdfSearch.trim().toLowerCase()
    if (!term) return state.pdf
    return state.pdf.filter((template: any) => `${template.number} ${template.title}`.toLowerCase().includes(term))
})

const ownForms = computed(() => {
    const term = state.search.trim().toLowerCase()
    if (!term) return state.own
    return state.own.filter((form: any) => `${form.title} ${form.description ?? ''}`.toLowerCase().includes(term))
})

async function load() {
    state.isLoading = true
    state.error = ''
    state.search = ''
    state.pdfSearch = ''
    try {
        const response = await formService.getTemplateLibrary(props.area)
        state.standard = response?.data?.standard ?? []
        state.pdf = response?.data?.pdf ?? []
        state.own = response?.data?.own ?? []
    } catch (error: any) {
        state.error = error?.message || t('templateLibrary.loadFailed')
    }
    state.isLoading = false
}

// A standard template is filled in on the company's own copy, made the first time it is used.
async function useStandard(key: string) {
    if (state.opening) return
    state.opening = key
    state.error = ''
    try {
        const response = await formService.useStandardTemplate(key, props.area)
        const uuid = response?.data?.uuid
        if (uuid) {
            emit('pick', uuid)
        } else {
            state.error = t('templateLibrary.loadFailed')
        }
    } catch (error: any) {
        state.error = error?.message || t('templateLibrary.loadFailed')
    }
    state.opening = ''
}

watch(() => props.isModalOpen, (isOpen) => {
    if (isOpen) load()
}, { immediate: true })
</script>
