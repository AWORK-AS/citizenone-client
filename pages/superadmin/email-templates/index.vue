<template>
    <div>
        <NuxtLayout name="superadmin">
            <Head>
                <Title>{{ $t('superadmin.emailTemplates.title') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>
            <template #header>{{ $t('superadmin.emailTemplates.title') }}</template>

            <div class="p-1">
                <div class="mb-5">
                    <h1 class="text-[22px] font-semibold text-[#1F2533]">{{ $t('superadmin.emailTemplates.title') }}</h1>
                    <p class="text-sm text-[#6B7280]">{{ $t('superadmin.emailTemplates.subtitle') }}</p>
                </div>

                <Alert type="danger" :text="state.error" v-if="state.error" />

                <LoadingSpinner :isLoading="state.isLoading">
                    <div v-if="!state.templates.length" class="text-sm text-[#6B7280] py-10 text-center">
                        {{ $t('superadmin.emailTemplates.noTemplates') }}
                    </div>

                    <div v-else>
                        <!-- Language switcher -->
                        <div class="inline-flex rounded-xl bg-[#F0F1F4] p-1 mb-5">
                            <button v-for="loc in locales" :key="loc" @click="setLocale(loc)"
                                class="px-4 py-1.5 rounded-lg text-sm font-medium transition-colors"
                                :class="state.locale === loc ? 'bg-white text-[#205E77] shadow-sm' : 'text-[#6B7280] hover:text-[#1F2533]'">
                                {{ localeLabel(loc) }}
                            </button>
                        </div>

                        <div class="grid grid-cols-1 lg:grid-cols-12 gap-5">
                            <!-- List -->
                            <div class="lg:col-span-4 space-y-2">
                                <button v-for="tpl in filteredTemplates" :key="tpl.uuid" @click="selectTemplate(tpl)"
                                    class="w-full text-left rounded-xl border px-4 py-3 transition-colors"
                                    :class="state.editing?.uuid === tpl.uuid ? 'border-[#205E77] bg-[#205E77]/5' : 'border-[#F0F1F4] bg-white hover:border-[#205E77]/40'">
                                    <p class="text-sm font-semibold text-[#1F2533]">{{ keyLabel(tpl.key) }}</p>
                                    <p class="text-xs text-[#6B7280] mt-0.5 truncate">{{ tpl.subject }}</p>
                                </button>
                            </div>

                        <!-- Editor -->
                        <div class="lg:col-span-8" v-if="state.editing">
                            <div class="rounded-xl border border-[#F0F1F4] bg-white p-5 space-y-4">
                                <div class="flex items-center justify-between">
                                    <p class="text-sm font-semibold text-[#1F2533]">
                                        {{ keyLabel(state.editing.key) }}
                                        <span class="ml-1 text-xs font-normal text-[#6B7280] uppercase">({{ state.editing.locale }})</span>
                                    </p>
                                </div>

                                <div>
                                    <label class="block text-xs font-medium text-[#6B7280] mb-1">{{ $t('superadmin.emailTemplates.subject') }}</label>
                                    <input v-model="form.subject" type="text"
                                        class="w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm focus:border-[#205E77] focus:outline-none" />
                                </div>

                                <div>
                                    <label class="block text-xs font-medium text-[#6B7280] mb-1">{{ $t('superadmin.emailTemplates.body') }}</label>
                                    <textarea v-model="form.body" rows="12"
                                        class="w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-[13px] font-mono focus:border-[#205E77] focus:outline-none"></textarea>
                                </div>

                                <div>
                                    <p class="text-xs font-medium text-[#6B7280] mb-1">{{ $t('superadmin.emailTemplates.placeholders') }}</p>
                                    <div class="flex flex-wrap gap-1.5">
                                        <button v-for="ph in placeholders" :key="ph" type="button" @click="copyPlaceholder(ph)"
                                            class="inline-flex items-center gap-x-1 rounded-md bg-[#205E77]/10 px-2 py-1 text-xs font-mono text-[#205E77] hover:bg-[#205E77]/20">
                                            <Icon name="ph:copy" class="h-3 w-3" /> {{ phTag(ph) }}
                                        </button>
                                    </div>
                                    <p class="text-[11px] text-[#9CA3AF] mt-1">{{ $t('superadmin.emailTemplates.placeholdersHint') }}</p>
                                </div>

                                <div>
                                    <p class="text-xs font-medium text-[#6B7280] mb-1">{{ $t('superadmin.emailTemplates.preview') }}</p>
                                    <div class="rounded-lg border border-[#E5E7EB] bg-[#f8f9fa] p-3 max-h-80 overflow-y-auto" v-html="previewHtml"></div>
                                </div>

                                <div class="flex justify-end gap-x-3 pt-1">
                                    <button type="button" @click="state.editing = null"
                                        class="px-4 py-2 rounded-lg text-sm font-medium text-[#6B7280] hover:bg-[#F3F4F6]">
                                        {{ $t('superadmin.emailTemplates.cancel') }}
                                    </button>
                                    <button type="button" @click="save" :disabled="state.isSaving"
                                        class="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white shadow-sm disabled:opacity-60"
                                        style="background:#205E77">
                                        <Icon name="ph:check" class="w-4 h-4" /> {{ $t('superadmin.emailTemplates.save') }}
                                    </button>
                                </div>
                            </div>
                        </div>
                        </div>
                    </div>
                </LoadingSpinner>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { emailTemplateService } from '@/components/api/superadmin/EmailTemplateService'
import { useAlert } from '@/composables/alert'
import { useI18n } from 'vue-i18n'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()

const placeholders = ['firstname', 'lastname', 'login_url', 'app_name', 'year']

const state = reactive({
    templates: [] as any[],
    editing: null as any,
    locale: '',
    isLoading: false,
    isSaving: false,
    error: '',
})

const form = reactive({ subject: '', body: '' })

const LOCALE_ORDER = ['dk', 'en', 'no', 'sv']
const LOCALE_LABELS: Record<string, string> = { dk: 'Dansk', en: 'English', no: 'Norsk', sv: 'Svenska' }
function localeLabel(loc: string) { return LOCALE_LABELS[loc] ?? loc.toUpperCase() }

// Languages present, ordered (dk first).
const locales = computed(() => {
    const present = [...new Set(state.templates.map(t2 => t2.locale))]
    return present.sort((a, b) => LOCALE_ORDER.indexOf(a) - LOCALE_ORDER.indexOf(b))
})

const filteredTemplates = computed(() => state.templates.filter(t2 => t2.locale === state.locale))

function setLocale(loc: string) {
    state.locale = loc
    state.editing = null // editor belongs to the previously selected language
}

function keyLabel(key: string) {
    const map: Record<string, string> = {
        employee_account: 'Login-mail til ansatte',
        admin_invitation: 'Velkomst-mail til admin',
    }
    return map[key] ?? key
}

function selectTemplate(tpl: any) {
    state.editing = tpl
    form.subject = tpl.subject
    form.body = tpl.body
}

function phTag(ph: string) {
    return '{{' + ph + '}}'
}

function copyPlaceholder(ph: string) {
    if (process.client) navigator.clipboard?.writeText(phTag(ph))
}

const sampleValues: Record<string, string> = {
    firstname: 'Anna', lastname: 'Hansen', login_url: '#', app_name: 'CitizenOne',
    year: String(new Date().getFullYear()),
}

const previewHtml = computed(() => {
    let html = form.body || ''
    for (const ph of placeholders) {
        html = html.replaceAll(`{{${ph}}}`, sampleValues[ph] ?? '')
    }
    // Wrap with the same logo header the real email uses, so the preview matches.
    const logo = '<div style="text-align:center;margin-bottom:24px"><img src="/img/logo.svg" alt="CitizenOne" style="width:200px;max-width:80%;height:auto" /></div>'
    return logo + html
})

async function load() {
    state.isLoading = true
    state.error = ''
    try {
        const res: any = await emailTemplateService.getEmailTemplates()
        state.templates = res?.data ?? []
        if (!state.locale || !locales.value.includes(state.locale)) {
            state.locale = locales.value[0] ?? ''
        }
    } catch (e: any) {
        state.error = e?.message || 'Kunne ikke hente skabeloner.'
    }
    state.isLoading = false
}

async function save() {
    if (!state.editing) return
    state.isSaving = true
    state.error = ''
    try {
        const res: any = await emailTemplateService.updateEmailTemplate(state.editing.uuid, { subject: form.subject, body: form.body })
        const updated = res?.data
        const idx = state.templates.findIndex(t2 => t2.uuid === state.editing.uuid)
        if (idx >= 0 && updated) state.templates[idx] = updated
        successAlert(`${t('alert.success')}!`, t('superadmin.emailTemplates.saved'))
        state.editing = null
    } catch (e: any) {
        state.error = e?.message || 'Kunne ikke gemme skabelonen.'
    }
    state.isSaving = false
}

onMounted(load)
</script>
