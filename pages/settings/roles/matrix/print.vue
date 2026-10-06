<template>
    <div>

        <Head>
            <Title>{{ $t('roles.matrix.title') }} – {{ companyName }}</Title>
        </Head>

        <!-- Screen-only toolbar -->
        <div class="print:hidden bg-white border-b border-[#EAECF0] px-6 py-3 flex items-center justify-between">
            <button @click="router.back()"
                class="flex items-center gap-2 text-sm text-[#5C6478] hover:text-[#1F2533] transition-colors">
                <Icon name="ph:arrow-left" class="w-4 h-4" />
                {{ $t('back') }}
            </button>
            <FormButton buttonStyle="primary" @click="window.print()" :disabled="state.isLoading">
                <Icon name="ph:printer" class="w-4 h-4" />
                {{ $t('roles.matrix.print') }}
            </FormButton>
        </div>

        <LoadingSpinner :isActive="state.isLoading" class="print:hidden">
            <div></div>
        </LoadingSpinner>

        <!-- Printable content, laid out like the backend's PDF reports (logo, title, meta, table) -->
        <div class="permission-matrix-sheet px-6 py-8 print:p-0">
            <Alert type="danger" :text="state?.error?.message" class="print:hidden mb-4"
                v-if="state.error?.message && state.error.message.length > 0" />

            <img src="/img/logo.svg" alt="CitizenOne" class="h-[40px] w-auto mb-5" />

            <div class="sheet-header">
                <h1>{{ $t('roles.matrix.title') }}</h1>
                <div class="sheet-meta">
                    <div v-if="companyName">{{ $t('roles.matrix.company') }}: {{ companyName }}</div>
                    <div>{{ $t('roles.matrix.generated') }}: {{ generatedAt }}</div>
                </div>
            </div>
            <p class="sheet-note">{{ $t('roles.matrix.note') }} {{ $t('roles.matrix.fullAccessNote') }}</p>

            <ModulesUserRolePermissionMatrixTable v-if="fullMatrix.roles.length" :matrix="fullMatrix"
                :roleLabels="roleLabels" print />
        </div>
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/store/user'
import { usePermissionMatrix } from '@/composables/usePermissionMatrix'

definePageMeta({ layout: false })

const router = useRouter()
const userStore = useUserStore() as any
const { t } = useI18n()
const window = process.client ? globalThis : null as any

const companyName = computed(() => userStore.getUser?.company?.name ?? '')
// Same format as the "Generated" line on the backend's PDF reports.
const generatedAt = moment().format('YYYY-MM-DD HH:mm')

const cssString = (value: string) => `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`

// Page size and the footer go through useHead rather than a <style> block, so
// they are removed with this page and don't change how any other page prints.
// The footer matches the backend PDFs' footer: page / total, then the
// CitizenOne attribution line. Page margin boxes print in Chrome/Edge 131+; a
// browser without them leaves the footer out but prints everything else.
useHead(() => ({
    style: [{
        innerHTML: `@page {
    size: A4 landscape;
    margin: 12mm 10mm 16mm;
    @bottom-center {
        content: counter(page) " / " counter(pages) "\\A" ${cssString(t('roles.matrix.pdfAttribution'))};
        white-space: pre;
        font-family: 'DejaVu Sans', Arial, sans-serif;
        font-size: 8px;
        line-height: 1.5;
        color: #666;
    }
}`,
    }],
}))

const { state, load, fullMatrix, roleLabel } = usePermissionMatrix()
const roleLabels = computed(() => fullMatrix.value.roles.map(roleLabel))

onMounted(() => {
    load()
})
</script>

<style>
.permission-matrix-sheet {
    font-family: 'DejaVu Sans', Arial, sans-serif;
    color: #111;
}

.permission-matrix-sheet .sheet-header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 24px;
    margin-bottom: 6px;
}

.permission-matrix-sheet .sheet-header h1 {
    font-size: 16px;
    font-weight: 700;
    margin: 0;
}

.permission-matrix-sheet .sheet-meta {
    font-size: 11px;
    line-height: 1.4;
    color: #333;
    text-align: right;
    white-space: nowrap;
}

.permission-matrix-sheet .sheet-note {
    font-size: 10px;
    color: #666;
    margin: 0 0 10px;
    max-width: 60rem;
}

@media print {
    .print\:hidden {
        display: none !important;
    }
}
</style>
