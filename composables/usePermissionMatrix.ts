import moment from 'moment'
import { useI18n } from 'vue-i18n'
import { roleService } from '@/components/api/user/RoleService'
import { permissionService } from '@/components/api/user/PermissionService'
import { pageService } from '@/components/api/user/PageService'
import { PANEL_PERMISSIONS } from '@/composables/usePermissions'
import { buildPermissionMatrix, permissionMatrixCsv } from '@/composables/permissionGroups'
import type { MatrixRole } from '@/composables/permissionGroups'
import type { Error } from '@/types'

// The predefined roles are stored by their English name; the roles table shows them translated.
const PREDEFINED_ROLE_LABELS: Record<string, string> = {
    Admin: 'roles.table.admin',
    User: 'roles.table.user',
    Referrer: 'roles.table.referrer',
    Company: 'roles.table.company',
}

/**
 * Data behind Settings → Roles → Permission overview and its print view: every
 * company role against every permission and page, read-only.
 */
export function usePermissionMatrix() {
    const { t, locale } = useI18n()

    const state = reactive({
        error: {} as Error,
        isLoading: false,
        roles: [] as any[],
        permissions: [] as any[],
        pages: [] as any[],
    })
    const search = ref('')

    async function load() {
        state.error = {} as Error
        state.isLoading = true
        try {
            const [roles, permissions, pages] = await Promise.all([
                roleService.getAllRoles(),
                permissionService.getAllPermissions(),
                pageService.getAllPages(),
            ])
            state.roles = roles?.data ?? []
            state.permissions = permissions?.data ?? []
            state.pages = pages?.data ?? []
        } catch (error: any) {
            state.error = error
        }
        state.isLoading = false
    }

    function build(searchText: string) {
        return buildPermissionMatrix({
            roles: state.roles,
            permissions: state.permissions,
            pages: state.pages,
            locale: locale.value,
            citizenWord: t('terms.citizen'),
            hiddenPermissionNames: PANEL_PERMISSIONS,
            search: searchText,
        })
    }

    const matrix = computed(() => build(search.value))
    // Exports and the print view always show everything, whatever is typed in the search.
    const fullMatrix = computed(() => build(''))

    function roleLabel(role: MatrixRole): string {
        const key = PREDEFINED_ROLE_LABELS[role.name]
        return key ? t(key) : role.name
    }

    function downloadCsv() {
        const roleLabels = fullMatrix.value.roles.map((role) =>
            role.fullAccess ? `${roleLabel(role)} (${t('roles.matrix.fullAccess')})` : roleLabel(role))
        const csv = permissionMatrixCsv(fullMatrix.value, roleLabels, {
            area: t('roles.matrix.area'),
            permission: t('roles.matrix.permission'),
            page: t('roles.matrix.page'),
            pageAccess: t('roles.form.pages'),
        })

        // UTF-8 BOM so Danish characters open correctly in Excel.
        const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${t('roles.matrix.fileName')}_${moment().format('YYYY-MM-DD')}.csv`
        document.body.appendChild(a)
        a.click()
        a.remove()
        URL.revokeObjectURL(url)
    }

    return { state, search, load, matrix, fullMatrix, roleLabel, downloadCsv }
}
