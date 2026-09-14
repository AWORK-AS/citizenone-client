<template>
    <div class="space-y-5">
        <div class="flex flex-wrap items-center justify-between gap-3">
            <p class="text-sm text-gray-500 max-w-2xl">{{ $t('services.help') }}</p>
            <div class="flex items-center gap-2">
                <FormButton buttonStyle="action" @click="state.isManagingCategories = !state.isManagingCategories">
                    <Icon name="ph:folders" class="size-4" />
                    {{ $t('services.categories.title') }}
                </FormButton>
                <FormButton buttonStyle="action" @click="startNew">
                    <Icon name="ph:plus" class="size-4" />
                    {{ $t('services.new') }}
                </FormButton>
            </div>
        </div>

        <Alert type="danger" :text="state.error" v-if="state.error" />

        <div class="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg p-4 space-y-3" v-if="state.isManagingCategories">
            <h3 class="text-sm font-semibold text-gray-900">{{ $t('services.categories.title') }}</h3>
            <p class="text-xs text-gray-500">{{ $t('services.categories.help') }}</p>

            <div class="flex flex-wrap items-center gap-2" v-if="state.categories.length">
                <div v-for="category in state.categories" :key="category.uuid"
                    class="inline-flex items-center gap-2 rounded-full bg-gray-100 pl-3 pr-2 py-1 text-sm">
                    <span>{{ category.name }}</span>
                    <span class="text-xs text-gray-400 tabular-nums">{{ category.service_count }}</span>
                    <button type="button" class="text-gray-400 hover:text-primary" :aria-label="$t('edit')"
                        @click="renameCategory(category)">
                        <Icon name="ph:pencil-simple" class="size-3.5" />
                    </button>
                    <button type="button" class="text-gray-400 hover:text-red-600" :aria-label="$t('delete')"
                        @click="removeCategory(category)">
                        <Icon name="ph:x" class="size-3.5" />
                    </button>
                </div>
            </div>

            <div class="flex flex-wrap items-end gap-2">
                <div class="space-y-1 w-full sm:w-64">
                    <FormLabel for="category_name" :label="$t('services.categories.name')" />
                    <FormTextField id="category_name" name="category_name" v-model="state.categoryName"
                        :placeholder="$t('services.categories.placeholder')" />
                </div>
                <FormButton buttonStyle="primary" buttonSize="xs" @click="addCategory"
                    :disabled="!state.categoryName.trim()">
                    {{ $t('services.categories.add') }}
                </FormButton>
            </div>
        </div>

        <div class="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg p-4 space-y-3" v-if="state.isEditing">
            <div class="grid grid-cols-1 sm:grid-cols-6 gap-3">
                <div class="space-y-1">
                    <FormLabel for="code" :label="$t('services.form.code')" />
                    <FormTextField id="code" name="code" v-model="state.form.code"
                        :placeholder="$t('services.form.codePlaceholder')" />
                </div>
                <div class="space-y-1 sm:col-span-2">
                    <FormLabel for="name" :label="$t('services.form.name')" />
                    <FormTextField id="name" name="name" v-model="state.form.name"
                        :placeholder="$t('services.form.name')" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="category" :label="$t('services.form.category')" />
                    <FormSelect id="category" :options="categoryOptions" v-model="state.form.service_category_uuid"
                        :placeholder="$t('services.form.noCategory')" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="unit_price" :label="priceLabel" />
                    <FormNumberField name="unit_price" :min="0" v-model="state.form.unit_price"
                        :placeholder="priceLabel" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="vat_rate" :label="$t('services.form.vatRate')" />
                    <FormNumberField name="vat_rate" :min="0" v-model="state.form.vat_rate"
                        :placeholder="$t('services.form.vatRate')" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="default_subsidy" :label="$t('services.form.subsidy')" />
                    <FormNumberField name="default_subsidy" :min="0" v-model="state.form.default_subsidy"
                        :placeholder="$t('services.form.subsidy')" />
                </div>
            </div>

            <p class="text-xs text-gray-500">{{ $t('services.form.vatHelp') }}</p>

            <div class="flex items-center justify-end gap-2">
                <FormButton buttonStyle="action" buttonSize="xs" @click="state.isEditing = false">
                    {{ $t('cancel') }}
                </FormButton>
                <FormButton buttonStyle="primary" buttonSize="xs" @click="save" :disabled="state.isSaving">
                    {{ $t('save') }}
                </FormButton>
            </div>
        </div>

        <div class="inline-flex flex-wrap gap-1 rounded-lg bg-gray-100 p-0.5" v-if="state.categories.length">
            <button type="button" v-for="option in filterOptions" :key="option.value" @click="state.filter = option.value"
                :class="[
                    'rounded-md px-3 py-1.5 text-sm font-medium transition',
                    state.filter === option.value ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'
                ]">
                {{ option.label }}
            </button>
        </div>

        <LoadingSpinner :isActive="state.isPageLoading">
            <div v-if="state.services.length === 0"
                class="px-6 py-14 bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg text-center">
                <div class="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                    <Icon name="ph:tag" class="h-7 w-7 text-primary" />
                </div>
                <h3 class="mt-4 text-lg font-semibold text-gray-900">{{ $t('services.empty.title') }}</h3>
                <p class="mt-1 text-sm text-gray-500 max-w-md mx-auto">{{ $t('services.empty.text') }}</p>
            </div>

            <div v-else class="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg overflow-x-auto">
                <table class="min-w-full text-sm">
                    <thead>
                        <tr class="text-left text-xs uppercase tracking-wide text-gray-500">
                            <th class="px-4 py-3">{{ $t('services.form.code') }}</th>
                            <th class="px-4 py-3">{{ $t('services.form.name') }}</th>
                            <th class="px-4 py-3 text-right">{{ priceLabel }}</th>
                            <th class="px-4 py-3 text-right">{{ $t('services.form.vatRate') }}</th>
                            <th class="px-4 py-3 text-right">{{ $t('services.form.subsidy') }}</th>
                            <th class="px-4 py-3"></th>
                        </tr>
                    </thead>
                    <tbody v-for="group in groups" :key="group.key">
                        <tr class="bg-gray-50/70">
                            <th colspan="6"
                                class="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                {{ group.name }}
                                <span class="ml-1 font-normal text-gray-400 tabular-nums">{{ group.services.length }}</span>
                            </th>
                        </tr>
                        <tr v-for="service in group.services" :key="service.uuid" class="border-t border-gray-100">
                            <td class="px-4 py-3 tabular-nums">{{ service.code }}</td>
                            <td class="px-4 py-3">
                                {{ service.name }}
                                <span class="text-xs text-gray-400" v-if="!service.is_active">
                                    &middot; {{ $t('services.inactive') }}
                                </span>
                            </td>
                            <td class="px-4 py-3 text-right tabular-nums">{{ formatAmount(service.unit_price) }}</td>
                            <td class="px-4 py-3 text-right tabular-nums">{{ service.vat_rate }} %</td>
                            <td class="px-4 py-3 text-right tabular-nums">{{ formatAmount(service.default_subsidy) }}</td>
                            <td class="px-4 py-3 text-right whitespace-nowrap">
                                <button type="button" class="text-gray-400 hover:text-primary mr-2"
                                    :aria-label="$t('edit')" @click="startEdit(service)">
                                    <Icon name="ph:pencil-simple" class="size-4" />
                                </button>
                                <button type="button" class="text-gray-400 hover:text-red-600"
                                    :aria-label="$t('delete')" @click="remove(service)">
                                    <Icon name="ph:trash" class="size-4" />
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </LoadingSpinner>
    </div>
</template>

<script setup lang="ts">
import { citizenInvoiceService } from '@/components/api/user/CitizenInvoiceService'
import { useAlert } from '@/composables/alert'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
    defaultVatRate?: number
    pricesIncludeVat?: boolean
}>()

const emit = defineEmits(['changed'])

const { successAlert } = useAlert()
const { t, locale } = useI18n()

const state = reactive({
    services: [] as any[],
    categories: [] as any[],
    form: emptyForm(),
    categoryName: '',
    filter: 'all',
    editingUuid: null as string | null,
    isEditing: false,
    isManagingCategories: false,
    isPageLoading: true,
    isSaving: false,
    error: '',
})

// The heading tells you which price you are typing, so nobody has to guess
// whether VAT is already in the number.
const priceLabel = computed(() => props.pricesIncludeVat
    ? t('services.form.unitPriceIncl')
    : t('services.form.unitPrice'))

const categoryOptions = computed(() => state.categories.map((category: any) => ({
    value: category.uuid,
    label: category.name,
})))

const filterOptions = computed(() => [
    { value: 'all', label: t('services.categories.all') },
    ...state.categories.map((category: any) => ({ value: category.uuid, label: category.name })),
    { value: 'none', label: t('services.categories.uncategorised') },
])

// Services are shown under their category, and anything without one lands in
// a group at the bottom rather than disappearing.
const groups = computed(() => {
    const visible = state.services.filter((service: any) => {
        if (state.filter === 'all') return true
        if (state.filter === 'none') return !service.category

        return service.category?.uuid === state.filter
    })

    const result: any[] = []

    for (const category of state.categories) {
        const services = visible.filter((service: any) => service.category?.uuid === category.uuid)

        if (services.length) result.push({ key: category.uuid, name: category.name, services })
    }

    const uncategorised = visible.filter((service: any) => !service.category)

    if (uncategorised.length) {
        result.push({ key: 'none', name: t('services.categories.uncategorised'), services: uncategorised })
    }

    return result
})

function emptyForm() {
    return {
        code: '',
        name: '',
        service_category_uuid: null as string | null,
        unit_price: '',
        vat_rate: String(props.defaultVatRate ?? 0),
        default_subsidy: '',
    }
}

function formatAmount(amount: number): string {
    return new Intl.NumberFormat(locale.value === 'en' ? 'en-GB' : 'da-DK', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(Number(amount) || 0)
}

function startNew() {
    state.form = emptyForm()
    // A filtered list says which category you are working in, so a new service
    // starts there.
    if (state.filter !== 'all' && state.filter !== 'none') state.form.service_category_uuid = state.filter
    state.editingUuid = null
    state.isEditing = true
}

function startEdit(service: any) {
    state.form = {
        code: service.code || '',
        name: service.name,
        service_category_uuid: service.category?.uuid || null,
        unit_price: String(service.unit_price ?? ''),
        vat_rate: String(service.vat_rate ?? 0),
        default_subsidy: service.default_subsidy ? String(service.default_subsidy) : '',
    }
    state.editingUuid = service.uuid
    state.isEditing = true
}

async function load() {
    state.error = ''

    try {
        const [services, categories] = await Promise.all([
            citizenInvoiceService.getServices(),
            citizenInvoiceService.getServiceCategories(),
        ])

        state.services = services?.data || []
        state.categories = categories?.data || []
        emit('changed', state.services)
    } catch (error: any) {
        state.error = error?.message || ''
    } finally {
        state.isPageLoading = false
    }
}

async function save() {
    state.isSaving = true
    state.error = ''

    const payload = {
        code: state.form.code || null,
        name: state.form.name,
        service_category_uuid: state.form.service_category_uuid || null,
        unit_price: Number(state.form.unit_price) || 0,
        vat_rate: Number(state.form.vat_rate) || 0,
        default_subsidy: Number(state.form.default_subsidy) || 0,
    }

    try {
        if (state.editingUuid) {
            await citizenInvoiceService.updateService(state.editingUuid, payload)
        } else {
            await citizenInvoiceService.createService(payload)
        }

        successAlert(`${t('alert.success')}!`, `${t('services.saved')}.`)
        state.isEditing = false
        await load()
    } catch (error: any) {
        state.error = error?.message || ''
    } finally {
        state.isSaving = false
    }
}

async function remove(service: any) {
    state.error = ''

    try {
        await citizenInvoiceService.deleteService(service.uuid)
        await load()
    } catch (error: any) {
        state.error = error?.message || ''
    }
}

async function addCategory() {
    state.error = ''

    try {
        await citizenInvoiceService.createServiceCategory({ name: state.categoryName.trim() })
        state.categoryName = ''
        await load()
    } catch (error: any) {
        state.error = error?.message || ''
    }
}

async function renameCategory(category: any) {
    const name = window.prompt(t('services.categories.name'), category.name)

    if (!name || name.trim() === category.name) return

    state.error = ''

    try {
        await citizenInvoiceService.updateServiceCategory(category.uuid, { name: name.trim() })
        await load()
    } catch (error: any) {
        state.error = error?.message || ''
    }
}

// Deleting the group never deletes what is in it, so this needs no warning
// beyond what the help text already says.
async function removeCategory(category: any) {
    state.error = ''

    try {
        await citizenInvoiceService.deleteServiceCategory(category.uuid)

        if (state.filter === category.uuid) state.filter = 'all'

        await load()
    } catch (error: any) {
        state.error = error?.message || ''
    }
}

onMounted(() => load())
</script>
