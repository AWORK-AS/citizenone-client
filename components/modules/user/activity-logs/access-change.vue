<template>
    <div class="space-y-0.5">
        <p class="font-medium text-slate-800">{{ title }}</p>
        <p v-for="(line, index) in lines" :key="index" class="text-slate-600">{{ line }}</p>
        <p v-if="sourceLabel" class="text-xs text-slate-400">{{ sourceLabel }}</p>
    </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { getPermissionLabel } from '@/composables/usePermissions'

/**
 * One access change (log_name 'access') from the activity log: who or which
 * role, and per field what was added, removed or changed. The backend writes
 * `properties.changes` as [{ field, added, removed }] or [{ field, old, new }]
 * (App\Support\AccessChangeLog). Anything missing or unknown shows less, never
 * an error.
 */
const props = defineProps({
    log: {
        type: Object,
        required: true,
    },
})

const { t, te, locale } = useI18n()

const properties = computed<any>(() => props.log?.properties ?? {})
const isRole = computed(() => props.log?.subject?.type === 'Role' || !!properties.value.role_name)

const subjectName = computed(() => {
    if (isRole.value) {
        return properties.value.role_name || props.log?.subject?.label || t('activityLogs.access.unknownRole')
    }
    return props.log?.subject?.label || t('activityLogs.access.unknownEmployee')
})

const title = computed(() => {
    const event = ['created', 'deleted'].includes(props.log?.event) ? props.log.event : 'updated'
    const kind = isRole.value ? 'role' : 'employee'
    return t(`activityLogs.access.title.${kind}.${event}`, { name: subjectName.value })
})

const FIELD_KEYS: Record<string, string> = {
    roles: 'activityLogs.access.fields.roles',
    permissions: 'activityLogs.access.fields.permissions',
    departments: 'activityLogs.access.fields.departments',
    employee_groups: 'activityLogs.access.fields.employeeGroups',
    pages: 'activityLogs.access.fields.pages',
    name: 'activityLogs.access.fields.name',
    level: 'activityLogs.access.fields.level',
    hide_internal_journals: 'activityLogs.access.fields.hideInternalJournals',
    sees_hr_data: 'activityLogs.access.fields.seesHrData',
    counts_as_consultant: 'activityLogs.access.fields.countsAsConsultant',
    certificate_reminder_for: 'activityLogs.access.fields.certificateReminderFor',
}

function fieldLabel(field: string): string {
    const key = FIELD_KEYS[field]
    return key && te(key) ? t(key) : String(field ?? '').replace(/_/g, ' ')
}

function itemLabel(field: string, item: any): string {
    if (field === 'permissions' && item && typeof item === 'object') {
        return getPermissionLabel(item, locale.value)
    }
    return item === null || item === undefined ? '' : String(item)
}

function valueLabel(field: string, value: any): string {
    if (value === null || value === undefined || value === '') {
        return t('activityLogs.access.values.none')
    }
    if (typeof value === 'boolean') {
        return value ? t('activityLogs.access.values.yes') : t('activityLogs.access.values.no')
    }
    if (field === 'level') {
        if (Number(value) === 20) return t('roles.table.regular')
        if (Number(value) === 50) return t('roles.table.manager')
    }
    if (field === 'certificate_reminder_for' && value === '*') {
        return t('activityLogs.access.values.everyone')
    }
    return String(value)
}

const lines = computed(() => {
    const changes = Array.isArray(properties.value.changes) ? properties.value.changes : []
    const result: string[] = []

    for (const change of changes) {
        if (!change || typeof change !== 'object') continue
        const field = String(change.field ?? '')
        const label = fieldLabel(field)

        if (Array.isArray(change.added) || Array.isArray(change.removed)) {
            const added = (change.added ?? []).map((item: any) => itemLabel(field, item)).filter(Boolean)
            const removed = (change.removed ?? []).map((item: any) => itemLabel(field, item)).filter(Boolean)
            if (added.length) result.push(t('activityLogs.access.added', { field: label, items: added.join(', ') }))
            if (removed.length) result.push(t('activityLogs.access.removed', { field: label, items: removed.join(', ') }))
            continue
        }

        if ('old' in change || 'new' in change) {
            result.push(t('activityLogs.access.changed', {
                field: label,
                old: valueLabel(field, change.old),
                new: valueLabel(field, change.new),
            }))
        }
    }

    return result
})

const sourceLabel = computed(() => {
    const source = properties.value.source
    if (!source) return ''
    const key = `activityLogs.access.sources.${String(source).replace(/[^a-z_]/gi, '_')}`
    return te(key) ? t(key) : String(source)
})
</script>
