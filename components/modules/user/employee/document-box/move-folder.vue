<template>
    <!-- Moves the document to another folder of the personnel file, with the
         date it was obtained when it lands among the certificates. -->
    <div class="mb-4 space-y-2 rounded-lg border border-gray-200 p-3">
        <FormLabel :label="$t('employees.documents.moveFolder.folder')" />
        <FormSelect id="move_folder" :options="folderOptions" :canClear="false" :canDeselect="false"
            :modelValue="props.fileType || props.currentType" @update:modelValue="(value: string) => emit('update:fileType', value)" />
        <div v-if="isMoving && datedTypes.includes(props.fileType)" class="space-y-1">
            <FormLabel :label="$t('employees.documents.form.issuedAt')" />
            <FormDateField id="move_issued_at" name="move_issued_at" :modelValue="props.issuedAt"
                @update:modelValue="(value: string) => emit('update:issuedAt', value)" />
            <p class="text-xs text-gray-500">{{ $t('employees.documents.moveFolder.issuedAtHelp') }}</p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
    currentType: { type: String, default: '' },
    fileType: { type: String, default: '' },
    issuedAt: { type: String, default: '' },
})
const emit = defineEmits(['update:fileType', 'update:issuedAt'])

// Same list and order as the folders on the personnel file.
const types = ['employment_contract', 'criminal_record', 'child_protection_certificate', 'drivers_license', 'passport', 'cv', 'education', 'work_permit', 'miscellaneous']
// Folders where the date obtained decides when the document runs out.
const datedTypes = ['criminal_record', 'child_protection_certificate', 'drivers_license', 'cv']

const folderOptions = computed(() => types.map(type => ({ value: type, label: t(`consultantProfile.documentTypes.${type}`) })))
const isMoving = computed(() => !!props.fileType && props.fileType !== props.currentType)
</script>
