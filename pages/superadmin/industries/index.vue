<template>
    <div>
        <NuxtLayout name="superadmin">

            <Head>
                <Title>{{ $t('superadmin.industries.pageTitle') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>
            <template #header>{{ $t('superadmin.industries.pageTitle') }}</template>

            <div class="p-1">
                <div class="flex items-center justify-between mb-5">
                    <h1 class="text-[22px] font-semibold text-[#1F2533]">
                        {{ $t('superadmin.industries.pageTitle') }}
                    </h1>
                    <div class="text-sm text-[#5C6478]">
                        {{ $t('superadmin.industries.configuredCount', { configured: configuredCount, total: industries.length }) }}
                    </div>
                </div>

                <p class="text-sm text-[#5C6478] mb-4 max-w-3xl">
                    {{ $t('superadmin.industries.description') }}
                </p>

                <Alert type="danger" :text="state.error?.message"
                    v-if="state.error?.message && state.error?.message?.length > 0" />

                <div v-if="state.isLoading" class="flex justify-center py-16">
                    <Icon name="ph:spinner" class="w-7 h-7 text-[#42AED9] animate-spin" />
                </div>

                <div v-else class="bg-white border border-[#EAECF0] rounded-xl overflow-hidden shadow-sm">
                    <div v-if="!industries.length" class="flex flex-col items-center gap-3 py-16 text-[#8891A4]">
                        <Icon name="ph:buildings" class="w-12 h-12 opacity-30" />
                        <p class="text-sm">{{ $t('superadmin.industries.noIndustries') }}</p>
                    </div>
                    <table v-else class="w-full">
                        <thead>
                            <tr class="border-b border-[#EAECF0] bg-[#F9FAFB]">
                                <th class="co-th">{{ $t('superadmin.industries.colIndustry') }}</th>
                                <th class="co-th">{{ $t('superadmin.industries.colWord') }}</th>
                                <th class="co-th">{{ $t('superadmin.industries.colModules') }}</th>
                                <th class="co-th">{{ $t('superadmin.industries.colSource') }}</th>
                                <th class="co-th"></th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="industry in industries" :key="industry.uuid"
                                class="border-b border-[#F5F6F8] hover:bg-[#F9FAFB] transition-colors">
                                <td class="co-td text-[13px] font-semibold text-[#1F2533]">
                                    {{ industry.dk_name || industry.en_name }}
                                    <span v-if="industry.system_name"
                                        class="ml-2 text-[11px] font-normal text-[#8891A4]">{{ industry.system_name }}</span>
                                </td>
                                <td class="co-td text-[13px] text-[#5C6478]">
                                    {{ industry.effective_terms?.dk?.term_citizens || '-' }}
                                </td>
                                <td class="co-td text-[13px] text-[#5C6478]">
                                    {{ industry.all_pages
                                        ? $t('superadmin.industries.allModules')
                                        : $t('superadmin.industries.someModules', { count: industry.page_ids.length, total: pages.length }) }}
                                </td>
                                <td class="co-td">
                                    <span v-if="isConfigured(industry)" class="co-pill-set">
                                        {{ $t('superadmin.industries.sourceSaved') }}
                                    </span>
                                    <span v-else class="co-pill-default">
                                        {{ $t('superadmin.industries.sourceDefault') }}
                                    </span>
                                </td>
                                <td class="co-td">
                                    <div class="flex items-center gap-2 justify-end">
                                        <button class="co-action-btn" @click="openEdit(industry)">
                                            <Icon name="ph:pencil-simple" class="w-3.5 h-3.5" />
                                            {{ $t('superadmin.industries.edit') }}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal size="lg" :show="state.modal.isFormOpen" @close="state.modal.isFormOpen = false">
                <template #modal-body>
                    <h3 class="text-base font-semibold text-[#1F2533] mb-1">
                        {{ state.selected?.dk_name || state.selected?.en_name }}
                    </h3>
                    <p class="text-[13px] text-[#5C6478] mb-4">
                        {{ $t('superadmin.industries.modalHelp') }}
                    </p>

                    <Alert type="danger" :text="state.formError?.message"
                        v-if="state.formError?.message && state.formError?.message?.length > 0" />

                    <div class="flex gap-1 mb-4 border-b border-[#EAECF0]">
                        <button v-for="locale in LOCALES" :key="locale" class="co-tab"
                            :class="{ 'co-tab-active': state.locale === locale }" @click="state.locale = locale">
                            {{ $t('superadmin.industries.locale.' + locale) }}
                        </button>
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <div v-for="field in TERM_FIELDS" :key="field">
                            <FormLabel :for="field" :label="$t('superadmin.industries.terms.' + field)" />
                            <input :id="field" v-model="state.form.terms[state.locale][field]" type="text"
                                class="co-input" :placeholder="placeholder(field)" />
                            <FormError :error="state.formError?.errors?.['terms.' + state.locale + '.' + field]?.[0]" />
                        </div>
                    </div>

                    <p class="text-[12px] text-[#8891A4] mt-2">
                        {{ $t('superadmin.industries.termsHint') }}
                    </p>

                    <div class="mt-6">
                        <div class="flex items-center justify-between mb-2">
                            <h4 class="text-[13px] font-semibold text-[#1F2533]">
                                {{ $t('superadmin.industries.modules') }}
                            </h4>
                            <button class="text-[12px] text-[#205E77] hover:underline" @click="state.form.page_ids = []">
                                {{ $t('superadmin.industries.selectAll') }}
                            </button>
                        </div>
                        <p class="text-[12px] text-[#8891A4] mb-3">
                            {{ state.form.page_ids.length
                                ? $t('superadmin.industries.modulesNarrowed', { count: state.form.page_ids.length, total: pages.length })
                                : $t('superadmin.industries.modulesAll') }}
                        </p>
                        <div class="grid grid-cols-3 gap-2 max-h-56 overflow-y-auto pr-1">
                            <label v-for="page in pages" :key="page.id"
                                class="flex items-center gap-2 text-[13px] text-[#5C6478] cursor-pointer">
                                <input type="checkbox" :value="page.id" v-model="state.form.page_ids"
                                    class="rounded border-[#D5D9E2]" />
                                {{ page.name }}
                            </label>
                        </div>
                    </div>

                    <div class="flex justify-end gap-2 mt-6">
                        <button class="co-action-btn" @click="state.modal.isFormOpen = false">
                            {{ $t('superadmin.industries.cancel') }}
                        </button>
                        <button class="co-btn-primary" :disabled="state.isSaving" @click="save">
                            <Icon v-if="state.isSaving" name="ph:spinner" class="w-4 h-4 animate-spin" />
                            {{ $t('superadmin.industries.save') }}
                        </button>
                    </div>
                </template>
            </Modal>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { industryService } from '@/components/api/superadmin/IndustryService'
import { useAlert } from '@/composables/alert'
import { useI18n } from 'vue-i18n'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()

const LOCALES = ['dk', 'en', 'no', 'sv']

/**
 * The four citizen words first, because they are the ones every string in the app runs through
 * and the reason this screen exists. The rest follow in the order a reader would ask for them.
 */
const TERM_FIELDS = [
    'term_citizen',
    'term_citizen_definite',
    'term_citizens',
    'term_citizens_definite',
    'term_caseworker',
    'term_case',
    'term_journal',
    'term_journals',
    'term_journal_notes',
    'term_journal_note_tag',
    'term_agreement',
    'term_jobcenter',
]

const state = reactive({
    industries: [] as any[],
    pages: [] as any[],
    error: {} as Error,
    formError: {} as Error,
    isLoading: false,
    isSaving: false,
    locale: 'dk',
    selected: null as any,
    modal: { isFormOpen: false },
    form: {
        terms: {} as Record<string, Record<string, string>>,
        page_ids: [] as number[],
    },
})

const industries = computed(() => state.industries ?? [])
const pages = computed(() => state.pages ?? [])

/**
 * An industry counts as configured when a word or a page set has actually been saved for it.
 * Without the distinction the list would read as if all 59 were set up, when in fact 56 of them
 * fall through to the language file.
 */
function isConfigured(industry: any) {
    const hasWord = LOCALES.some(locale =>
        TERM_FIELDS.some(field => (industry.terms?.[locale]?.[field] ?? '') !== '')
    )

    return hasWord || (industry.page_ids?.length ?? 0) > 0
}

const configuredCount = computed(() => industries.value.filter(isConfigured).length)

// What the industry gives a company today, shown as the placeholder so an empty field reads as
// "this is what happens if you leave it" rather than as nothing at all.
function placeholder(field: string) {
    return state.selected?.effective_terms?.[state.locale]?.[field] ?? ''
}

onMounted(() => {
    fetchIndustries()
})

async function fetchIndustries() {
    state.isLoading = true
    state.error = {}
    try {
        const response = await industryService.getIndustryDefaults()
        state.industries = response?.data ?? []
        state.pages = response?.pages ?? []
    } catch (error: any) {
        state.error = error
    }
    state.isLoading = false
}

function openEdit(industry: any) {
    state.selected = industry
    state.locale = 'dk'
    state.formError = {}

    const terms: Record<string, Record<string, string>> = {}

    for (const locale of LOCALES) {
        terms[locale] = {}

        for (const field of TERM_FIELDS) {
            terms[locale][field] = industry.terms?.[locale]?.[field] ?? ''
        }
    }

    state.form = { terms, page_ids: [...(industry.page_ids ?? [])] }
    state.modal.isFormOpen = true
}

async function save() {
    state.isSaving = true
    state.formError = {}
    try {
        await industryService.updateIndustryDefaults(state.selected.uuid, {
            terms: state.form.terms,
            page_ids: state.form.page_ids,
        })
        successAlert(
            t('superadmin.industries.saved'),
            state.selected?.dk_name || state.selected?.en_name
        )
        state.modal.isFormOpen = false
        fetchIndustries()
    } catch (error: any) {
        state.formError = error
    }
    state.isSaving = false
}
</script>

<style scoped>
.co-th {
    padding: 10px 14px;
    text-align: left;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: #8891A4
}

.co-td {
    padding: 12px 14px;
    vertical-align: middle
}

.co-input {
    width: 100%;
    padding: 8px 10px;
    border: 1px solid #D5D9E2;
    border-radius: 8px;
    font-size: 13px;
    color: #1F2533
}

.co-input:focus {
    outline: none;
    border-color: #42AED9
}

.co-tab {
    padding: 8px 14px;
    font-size: 13px;
    color: #5C6478;
    border-bottom: 2px solid transparent;
    cursor: pointer
}

.co-tab-active {
    color: #205E77;
    font-weight: 600;
    border-bottom-color: #205E77
}

.co-pill-set {
    display: inline-block;
    padding: 3px 8px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 500;
    background: #E8F4F8;
    color: #205E77
}

.co-pill-default {
    display: inline-block;
    padding: 3px 8px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 500;
    background: #F5F6F8;
    color: #8891A4
}

.co-action-btn {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 5px 10px;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 500;
    background: white;
    color: #205E77;
    border: 1px solid #D5D9E2;
    transition: all 0.15s;
    cursor: pointer
}

.co-action-btn:hover {
    background: #F5F6F8;
    border-color: #205E77
}

.co-btn-primary {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 500;
    background: #205E77;
    color: white;
    border: 1px solid #205E77;
    transition: all 0.15s;
    cursor: pointer
}

.co-btn-primary:hover {
    background: #18485C
}

.co-btn-primary:disabled {
    opacity: 0.6;
    cursor: default
}
</style>
