<template>
    <div class="p-1 space-y-5">
        <Alert type="danger" :text="state.error" v-if="state.error" />

        <!-- Kontraktudtræk: every contract period in one file, one row each,
             with the period's fields and the intervention's beside it. -->
        <div class="bg-white border border-surface-200 rounded-xl p-5 shadow-sm space-y-4">
            <div>
                <h2 class="text-base font-semibold text-slate-800">{{ $t('economy.contractExport.title') }}</h2>
                <p class="mt-1 text-sm text-slate-500">{{ $t('economy.contractExport.intro') }}</p>
            </div>

            <div class="flex flex-wrap items-end gap-4">
                <div class="space-y-1 min-w-[260px]">
                    <FormLabel :label="$t('economy.contractExport.period')" />
                    <FormDateRangeField name="contract_export_range" v-model="state.range"
                        :placeholder="$t('economy.contractExport.allPeriods')" />
                    <p class="text-xxs text-gray-500">{{ $t('economy.contractExport.periodHint') }}</p>
                </div>

                <div class="space-y-1">
                    <FormLabel :label="$t('economy.contractExport.fileFormat')" />
                    <div class="flex items-center gap-2" role="group" :aria-label="$t('economy.contractExport.fileFormat')">
                        <button v-for="format in formats" :key="format.value" type="button"
                            class="px-3 py-1 rounded-lg text-xs font-semibold border transition-colors"
                            :class="state.format === format.value
                                ? 'bg-primary text-white border-primary'
                                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'"
                            :aria-pressed="state.format === format.value" @click="state.format = format.value">
                            {{ format.label }}
                        </button>
                    </div>
                </div>

                <FormButton type="button" buttonStyle="primary" :disabled="state.isLoading" @click="download">
                    <Icon name="ph:download-simple" class="w-4 h-4 mr-1" />
                    {{ state.isLoading ? $t('economy.contractExport.downloading') : $t('economy.contractExport.download') }}
                </FormButton>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { saveAs } from 'file-saver'
import { useI18n } from 'vue-i18n'
import { socialWelfareService } from '@/components/api/user/SocialWelfareService'

const { t } = useI18n()

const state = reactive({
    range: [] as string[],
    format: 'xlsx' as 'xlsx' | 'csv',
    isLoading: false,
    error: '',
})

const formats = computed(() => [
    { value: 'xlsx' as const, label: t('economy.contractExport.formatExcel') },
    { value: 'csv' as const, label: t('economy.contractExport.formatCsv') },
])

async function download() {
    state.isLoading = true
    state.error = ''

    const params: Record<string, string> = { format: state.format }
    if (state.range?.length === 2) {
        params.from_date = state.range[0]
        params.to_date = state.range[1]
    }

    try {
        const file = await socialWelfareService.downloadContractExport(params)
        if (file) {
            const today = new Date().toISOString().slice(0, 10)
            saveAs(file, `${t('economy.contractExport.fileName')}-${today}.${state.format}`)
        }
    } catch (error: any) {
        state.error = error?.message || t('economy.contractExport.failed')
    } finally {
        state.isLoading = false
    }
}
</script>
