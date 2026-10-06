<template>
    <!-- Read-only: roles as columns, permissions grouped by area as rows, then page access. -->
    <table class="w-full"
        :class="print ? 'permission-matrix-print table-fixed' : 'border-separate border-spacing-0 text-sm text-slate-700'">
        <colgroup>
            <col :style="print ? 'width: 28%' : ''" />
            <col v-for="role in matrix.roles" :key="role.id" />
        </colgroup>
        <thead>
            <tr>
                <th scope="col" class="text-left font-semibold text-slate-800 p-2"
                    :class="!print && 'sticky top-0 left-0 z-30 bg-white border-b border-slate-300 min-w-[16rem]'">
                    {{ $t('roles.matrix.permission') }}
                </th>
                <th v-for="(role, i) in matrix.roles" :key="role.id" scope="col"
                    class="text-center align-bottom font-semibold text-slate-800 p-2 break-words"
                    :class="!print && 'sticky top-0 z-20 bg-white border-b border-slate-300 min-w-[7rem]'">
                    {{ roleLabels[i] }}
                    <span v-if="role.fullAccess" class="matrix-badge mt-1 block w-fit mx-auto"
                        :class="!print && 'rounded-md bg-red-100 px-1.5 py-0.5 text-[10px] font-medium text-red-800'">
                        {{ $t('roles.matrix.fullAccess') }}
                    </span>
                </th>
            </tr>
        </thead>

        <tbody v-for="block in blocks" :key="block.key">
            <tr class="matrix-group-row">
                <th scope="rowgroup" class="text-left font-semibold text-slate-800 px-2 py-1.5"
                    :class="!print && 'sticky left-0 z-10 bg-slate-100 border-b border-slate-200'">
                    {{ block.label }}
                </th>
                <td v-for="(count, i) in block.counts" :key="i" class="text-center px-2 py-1.5"
                    :class="!print && 'text-[11px] text-slate-500 bg-slate-100 border-b border-slate-200'">
                    {{ count }}/{{ block.rows.length }}
                </td>
            </tr>
            <tr v-for="row in block.rows" :key="row.uuid">
                <th scope="row" class="text-left font-normal px-2 py-1 break-words"
                    :class="!print && 'sticky left-0 z-10 bg-white border-b border-slate-100'">
                    {{ row.label }}
                </th>
                <td v-for="(granted, i) in row.granted" :key="i" class="text-center px-2 py-1"
                    :class="!print && 'border-b border-slate-100'">
                    <template v-if="granted">
                        <span v-if="print" aria-hidden="true">✓</span>
                        <Icon v-else name="ph:check-bold" class="size-4 text-primary" aria-hidden="true" />
                        <span class="sr-only">{{ $t('roles.matrix.granted') }}</span>
                    </template>
                </td>
            </tr>
        </tbody>
    </table>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { PermissionMatrix } from '@/composables/permissionGroups'

const props = defineProps<{
    matrix: PermissionMatrix
    /** Display name per role, in the order of `matrix.roles`. */
    roleLabels: string[]
    /** Static layout for the print view, styled like the backend's PDF reports. */
    print?: boolean
}>()

const { t } = useI18n()

// The permission areas, then page access in the same shape.
const blocks = computed(() => [
    ...props.matrix.groups,
    ...(props.matrix.pages.rows.length
        ? [{ key: 'pages', label: t('roles.form.pages'), ...props.matrix.pages }]
        : []),
])
</script>

<style>
/* Same look as the backend's PDF reports (resources/views/pdf/*-overview.blade.php):
   black grid, grey header and section rows. Not only under @media print, so the
   print page previews what the PDF will look like. */
.permission-matrix-print {
    border-collapse: collapse;
    font-size: 10px;
    line-height: 1.35;
    color: #111;
}

.permission-matrix-print th,
.permission-matrix-print td {
    border: 1px solid #222;
    color: #111;
    vertical-align: top;
}

.permission-matrix-print thead th {
    background: #f2f2f2;
    vertical-align: bottom;
}

.permission-matrix-print .matrix-group-row th,
.permission-matrix-print .matrix-group-row td {
    background: #eaeaea;
    font-weight: 700;
}

.permission-matrix-print .matrix-badge {
    padding: 1px 5px;
    border: 1px solid #999;
    border-radius: 10px;
    font-size: 9px;
    font-weight: 400;
    line-height: 1.2;
}

@media print {
    .permission-matrix-print th,
    .permission-matrix-print td {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
    }

    .permission-matrix-print tr {
        break-inside: avoid;
    }

    .permission-matrix-print thead {
        display: table-header-group;
    }
}
</style>
