<template>
    <Modal size="sm"
        :title="props.category ? $t('superadmin.appCategories.sliderEditTitle') : $t('superadmin.appCategories.sliderNewTitle')"
        :show="props.isOpen" @close="emit('close')">
        <template #modal-body>
            <form @submit.prevent="submit" class="space-y-4">

                <Alert type="danger" :text="state.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />

                <p class="text-[12px] text-ink-muted -mt-2">
                    {{
                        props.category ?
                            $t('superadmin.appCategories.sliderEditSubtitle') :
                            $t('superadmin.appCategories.sliderNewSubtitle')
                    }}
                </p>

                <!-- Name -->
                <div>
                    <SuperadminFormLabel :label="$t('superadmin.appCategories.form.name')" :required="true" />
                    <SuperadminFormTextField v-model="state.form.name"
                        :placeholder="$t('superadmin.appCategories.form.name')" :hasError="!!state.errors.name" />
                    <SuperadminFormError :error="state.errors.name" />
                    <SuperadminFormError :error="state.error?.errors?.name?.[0]" />
                </div>

                <!-- Roadmap #310: shown to users whose language is not Danish. -->
                <div>
                    <SuperadminFormLabel :label="$t('superadmin.appCategories.form.nameEn')" />
                    <SuperadminFormTextField v-model="state.form.name_en" :placeholder="$t('superadmin.appCategories.form.nameEnHint')" />
                    <SuperadminFormError :error="state.error?.errors?.name_en?.[0]" />
                </div>

                <!-- Icon -->
                <div>
                    <SuperadminFormLabel :label="$t('superadmin.appCategories.form.icon')" />
                    <SuperadminFormTextField v-model="state.form.icon"
                        :placeholder="$t('superadmin.appCategories.form.iconHint')" />
                    <SuperadminFormError :error="state.error?.errors?.icon?.[0]" />
                </div>

                <!-- Sort order -->
                <div>
                    <SuperadminFormLabel :label="$t('superadmin.appCategories.form.sortOrder')" />
                    <SuperadminFormTextField v-model.number="state.form.sort_order" type="number" placeholder="0" />
                    <SuperadminFormError :error="state.error?.errors?.sort_order?.[0]" />
                </div>

                <!-- Is active -->
                <div class="flex items-center justify-between py-3 px-4 border border-line rounded-xl">
                    <span class="text-[13px] font-medium text-ink">{{ $t('superadmin.appCategories.form.isActive')
                        }}</span>
                    <FormSwitch :value="state.form.is_active"
                        @toggleSwitch="state.form.is_active = !state.form.is_active" />
                </div>

                <!-- Footer buttons -->
                <div class="flex items-center gap-3 pt-2">
                    <button type="button" @click="emit('close')"
                        class="flex-1 py-2.5 rounded-lg text-sm font-medium text-ink-body bg-white border border-line hover:bg-surface-canvas transition-colors">
                        {{ $t('cancel') }}
                    </button>
                    <button type="submit"
                        class="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors shadow-sm bg-tertiary"
                        :disabled="state.isLoading">
                        {{ props.category ? $t('update') : $t('save') }}
                    </button>
                </div>
            </form>
        </template>
    </Modal>
</template>

<script setup lang="ts">
import { appCategoryService } from '@/components/api/superadmin/AppCategoryService'
import { useAlert } from '@/composables/alert'
import { useI18n } from 'vue-i18n'
import type { Error } from '@/types'

const props = defineProps({
    isOpen: {
        type: Boolean,
        required: true,
    },
    category: {
        type: Object,
        required: false,
    },
})

const emit = defineEmits(['close', 'saved'])

const { successAlert } = useAlert()
const { t } = useI18n()

const state = reactive({
    error: {} as Error,
    errors: { name: '' },
    isLoading: false,
    form: {
        name: '',
        name_en: '',
        icon: '',
        sort_order: 0,
        is_active: true,
    },
})

watch(() => props.isOpen, (opened) => {
    if (opened) {
        state.error = {} as Error
        state.errors = { name: '' }
        const category = props.category as any
        state.form = {
            // `name` is shown in the viewer's language; the form edits the Danish one.
            name: category?.name_da ?? category?.name ?? '',
            name_en: category?.name_en ?? '',
            icon: category?.icon ?? '',
            sort_order: category?.sort_order ?? 0,
            is_active: category ? category.is_active !== false : true,
        }
    }
})

async function submit() {
    state.errors.name = ''
    if (!state.form.name) {
        state.errors.name = t('superadmin.appCategories.errorNameRequired')
        return
    }
    state.error = {} as Error
    state.isLoading = true
    try {
        const params = {
            name: state.form.name,
            name_en: state.form.name_en?.trim() || null,
            icon: state.form.icon,
            sort_order: Number(state.form.sort_order) || 0,
            is_active: state.form.is_active,
        }
        const category = props.category as any
        if (category?.uuid) {
            const response = await appCategoryService.updateCategory(category.uuid, params)
            if (response) {
                successAlert(
                    t('superadmin.appCategories.successSaved'),
                    t('superadmin.appCategories.successUpdatedBody', { name: state.form.name })
                )
                emit('close')
                emit('saved')
            }
        } else {
            const response = await appCategoryService.saveCategory(params)
            if (response) {
                successAlert(
                    t('superadmin.appCategories.successCreated'),
                    t('superadmin.appCategories.successCreatedBody', { name: state.form.name })
                )
                emit('close')
                emit('saved')
            }
        }
    } catch (error: any) {
        state.error = error
    }
    state.isLoading = false
}
</script>
