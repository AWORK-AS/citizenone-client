<template>
    <!-- Company modules — admin enables/disables whole modules for the company -->
    <div class="mt-8 card" v-if="state.pages.length">
        <div class="card-header">
            <h3 class="text-sm font-semibold text-slate-900">{{ $t('companyModulesCard.title') }}</h3>
        </div>
        <div class="card-body">
            <p class="text-sm text-slate-500">{{ $t('companyModulesCard.description') }}</p>
            <p class="text-xs text-slate-400 mt-1 mb-4">{{ $t('companyModulesCard.onlyHides') }}</p>

            <div class="flex flex-wrap items-center gap-2 mb-5">
                <FormButton type="button" buttonStyle="secondary" buttonSize="xs"
                    :disabled="!state.recommended" @click="useRecommended">
                    <Icon name="ph:magic-wand" class="h-4 w-4" aria-hidden="true" />
                    {{ $t('companyModulesCard.useRecommended') }}
                </FormButton>
                <FormButton type="button" buttonStyle="link" buttonSize="xs" @click="setAll(true)">
                    {{ $t('companyModulesCard.allOn') }}
                </FormButton>
                <FormButton type="button" buttonStyle="link" buttonSize="xs" @click="setAll(false)">
                    {{ $t('companyModulesCard.allOff') }}
                </FormButton>
                <p v-if="state.recommended && state.industryName" class="w-full text-xs text-slate-400">
                    {{ $t('companyModulesCard.recommendedFor', { industry: state.industryName }) }}
                </p>
                <p v-else-if="!state.recommended" class="w-full text-xs text-slate-400">
                    {{ $t('companyModulesCard.noRecommendation') }}
                </p>
            </div>

            <div v-for="group in groups" :key="group.key" class="mb-5 last:mb-0">
                <h4 class="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
                    {{ $t(`companyModulesCard.groups.${group.key}`) }}
                </h4>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div v-for="page in group.pages" :key="page.uuid"
                        class="flex items-start justify-between gap-3 rounded-lg border border-slate-100 px-3 py-2.5">
                        <div class="min-w-0">
                            <p class="text-sm text-slate-800">{{ label(page.name) }}</p>
                            <p v-if="help(page.name)" class="text-xs text-slate-500 mt-0.5">{{ help(page.name) }}</p>
                        </div>
                        <FormSwitch :value="state.enabled.includes(page.uuid)" :label="label(page.name)"
                            @toggleSwitch="toggle(page.uuid)" />
                    </div>
                </div>
            </div>

            <p v-if="state.enabled.length === 0" class="mt-4 text-xs text-amber-600">
                {{ $t('companyModulesCard.noneWarning') }}
            </p>

            <div class="mt-5">
                <FormButton type="button" buttonStyle="primary" class="w-full" @click="save">
                    {{ $t('save') }}
                </FormButton>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { companyService } from '@/components/api/user/CompanyService'
import { useUserStore } from '@/store/user'
import { useAlert } from '@/composables/alert'
import { COMPANY_MODULES, groupModules, modulePagesAfterSave } from '@/composables/companyModules'

const { t, te } = useI18n()
const userStore = useUserStore() as any
const { successAlert } = useAlert()

const state = reactive<{
    pages: { uuid: string; name: string }[]
    enabled: string[]
    recommended: string[] | null
    industryName: string | null
}>({ pages: [], enabled: [], recommended: null, industryName: null })

const groups = computed(() => groupModules(state.pages))

function label(name: string) {
    return te(`companyModules.${name}`) ? t(`companyModules.${name}`) : name
}

function help(name: string) {
    const key = COMPANY_MODULES[name]?.help
    return key && te(`companyModulesCard.help.${key}`) ? t(`companyModulesCard.help.${key}`) : ''
}

async function fetchModules() {
    try {
        const response: any = await companyService.getCompanyModules()
        state.pages = response?.pages ?? []
        state.enabled = response?.enabled_page_uuids ?? []
        state.recommended = Array.isArray(response?.recommended_page_uuids) ? response.recommended_page_uuids : null
        state.industryName = response?.industry_name ?? null
    } catch (e) { /* leave empty */ }
}

function toggle(uuid: string) {
    const i = state.enabled.indexOf(uuid)
    if (i === -1) state.enabled.push(uuid)
    else state.enabled.splice(i, 1)
}

function setAll(on: boolean) {
    state.enabled = on ? state.pages.map(page => page.uuid) : []
}

// Only fills in the switches. Nothing changes until the admin presses Save,
// so they can look the recommendation over and adjust it first.
function useRecommended() {
    if (state.recommended) state.enabled = [...state.recommended]
}

async function save() {
    try {
        await companyService.updateCompanyModules({ page_uuids: state.enabled })
        // Update the in-memory user so the sidebar regenerates live (no reload).
        const enabledNames = state.pages.filter(page => state.enabled.includes(page.uuid)).map(page => page.name)
        const u: any = userStore.getUser
        if (u?.company) {
            userStore.setUser({
                ...u,
                company: { ...u.company, module_pages: modulePagesAfterSave(enabledNames), modules_configured: true },
            })
        }
        successAlert(`${t('alert.success')}!`, t('companyModulesCard.saved'))
    } catch (e) { }
}

onMounted(fetchModules)
</script>
