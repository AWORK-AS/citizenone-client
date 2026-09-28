<template>
    <!-- What the consultant match reads from the inquiry: the language the case
         must be handled in, one that is a plus, and where it takes place. -->
    <section>
        <h3 class="mb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            {{ $t('inquiryMatchNeeds.heading') }}
        </h3>
        <p class="mb-3 text-[11px] text-slate-400">{{ $t('inquiryMatchNeeds.hint') }}</p>
        <div class="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
            <div class="space-y-1">
                <FormLabel for="primary_spoken_language" :label="$t('inquiryMatchNeeds.primaryLanguage')" />
                <FormSelect id="primary_spoken_language" :options="primaryOptions" searchable
                    :modelValue="form.primary_spoken_language_uuid"
                    @update:modelValue="(value: any) => set('primary_spoken_language_uuid', value)" />
                <FormError :error="props.error?.errors?.primary_spoken_language_uuid?.[0]" />
            </div>
            <div class="space-y-1">
                <FormLabel for="secondary_spoken_language" :label="$t('inquiryMatchNeeds.secondaryLanguage')" />
                <FormSelect id="secondary_spoken_language" :options="secondaryOptions" searchable
                    :modelValue="form.secondary_spoken_language_uuid"
                    @update:modelValue="(value: any) => set('secondary_spoken_language_uuid', value)" />
                <FormError :error="props.error?.errors?.secondary_spoken_language_uuid?.[0]" />
            </div>
            <div class="space-y-1">
                <FormLabel for="location_address" :label="$t('inquiryMatchNeeds.location')" />
                <FormTextField id="location_address" name="location_address"
                    :placeholder="$t('inquiryMatchNeeds.locationPlaceholder')"
                    :modelValue="form.location_address"
                    @update:modelValue="(value: any) => set('location_address', value)" />
                <FormError :error="props.error?.errors?.location_address?.[0]" />
            </div>
            <div class="space-y-1">
                <FormLabel for="location_postal_code" :label="$t('inquiryMatchNeeds.postalCode')" />
                <FormTextField id="location_postal_code" name="location_postal_code" placeholder="8000"
                    :modelValue="form.location_postal_code"
                    @update:modelValue="(value: any) => set('location_postal_code', value)" />
                <FormError :error="props.error?.errors?.location_postal_code?.[0]" />
            </div>
        </div>
        <p v-if="locationStatus" class="mt-2 flex items-center gap-1.5 text-[11px] text-slate-500">
            <Icon :name="props.inquiry?.location_geocoded ? 'ph:map-pin' : 'ph:clock'" class="size-3.5" />
            {{ locationStatus }}
        </p>
    </section>
</template>

<script setup lang="ts">
import { spokenLanguageService } from '@/components/api/user/SpokenLanguageService'
import { useI18n } from 'vue-i18n'

const props = defineProps({
    // The inquiry being edited, or nothing when a new one is taken.
    inquiry: {
        type: Object,
        required: false,
        default: null,
    },
    error: {
        type: Object,
        required: false,
    },
})

// Emits the four fields as one object. Only emitted once something is touched,
// so a save that never opened this block leaves the stored values alone.
const emit = defineEmits(['update'])

const { t } = useI18n()

const languages = ref<any[]>([])

const form = reactive({
    primary_spoken_language_uuid: null as string | null,
    secondary_spoken_language_uuid: null as string | null,
    location_address: '',
    location_postal_code: '',
})

function fromInquiry(inquiry: any) {
    form.primary_spoken_language_uuid = inquiry?.primary_spoken_language?.uuid ?? null
    form.secondary_spoken_language_uuid = inquiry?.secondary_spoken_language?.uuid ?? null
    form.location_address = inquiry?.location_address ?? ''
    form.location_postal_code = inquiry?.location_postal_code ?? ''
}

fromInquiry(props.inquiry)
watch(() => props.inquiry, (value) => fromInquiry(value))

function set(key: keyof typeof form, value: any) {
    ;(form as any)[key] = value ?? (key.startsWith('location') ? '' : null)

    // The same language cannot be both; picking it as primary clears it as
    // secondary rather than leaving a combination the server refuses.
    if (key === 'primary_spoken_language_uuid' && value && value === form.secondary_spoken_language_uuid) {
        form.secondary_spoken_language_uuid = null
    }

    emit('update', {
        primary_spoken_language_uuid: form.primary_spoken_language_uuid,
        secondary_spoken_language_uuid: form.secondary_spoken_language_uuid,
        location_address: form.location_address?.trim() || null,
        location_postal_code: form.location_postal_code?.trim() || null,
    })
}

const languageOptions = computed(() => languages.value.map((l: any) => ({ value: l.uuid, label: l.name })))
const primaryOptions = computed(() => languageOptions.value)
const secondaryOptions = computed(() =>
    languageOptions.value.filter((option: any) => option.value !== form.primary_spoken_language_uuid)
)

// Whether the saved location has been placed on the map. Geocoding runs after
// the save, so a new location reads as pending until it has.
const locationStatus = computed(() => {
    const inquiry = props.inquiry

    if (!inquiry || (!inquiry.location_address && !inquiry.location_postal_code)) return ''

    if (inquiry.location_geocoded) {
        return t('inquiryMatchNeeds.geocoded.' + (inquiry.location_geocode_source || 'address'))
    }

    return inquiry.location_geocoded_at ? t('inquiryMatchNeeds.notFound') : t('inquiryMatchNeeds.pending')
})

onMounted(async () => {
    try {
        const response = await spokenLanguageService.getSpokenLanguages()
        languages.value = response?.data ?? []
    } catch {
        languages.value = []
    }
})
</script>
