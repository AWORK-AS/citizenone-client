import { useI18n } from 'vue-i18n'
import { formatQuotaGb, formatStorage, formatStorageUsed, storageLocale } from '@/composables/storageFormat'

/** Locale-aware storage formatters bound to the active app language. */
export function useStorageFormat() {
    const { locale } = useI18n()
    const tag = () => storageLocale(locale.value)

    return {
        formatStorage: (bytes: any) => formatStorage(bytes, tag()),
        formatStorageUsed: (bytes: any, gb: any) => formatStorageUsed(bytes, gb, tag()),
        /** Exact bytes when the API sent them, otherwise the legacy display string. */
        formatStorageOr: (bytes: any, fallback: any) =>
            bytes === null || bytes === undefined ? fallback : formatStorage(bytes, tag()),
        formatQuotaGb: (gb: any) => formatQuotaGb(gb, tag()),
    }
}
