<template>
    <!-- Shown while an Admin views the system as another role. -->
    <div v-if="role" class="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3"
        data-testid="role-preview-banner">
        <p class="text-sm font-semibold text-amber-900">
            {{ $t('rolePreview.banner', { role: role.name }) }}
            <span class="font-normal text-amber-800">{{ $t('rolePreview.readOnly') }}</span>
        </p>
        <FormButton type="button" buttonStyle="primary" @click="endPreviewRole">
            {{ $t('rolePreview.end') }}
        </FormButton>
    </div>
</template>

<script setup lang="ts">
import { readPreviewRole, endPreviewRole } from '@/composables/usePreviewRole'

const role = ref(readPreviewRole())
</script>
