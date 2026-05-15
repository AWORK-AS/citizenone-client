import { useUserStore } from '@/store/user'

const ROLE_LEVELS: Record<string, number> = {
    Admin: 80,
    Manager: 50,
    User: 20,
}

export const PERMISSION_LABELS: Record<string, string> = {
    scheduler: 'roles.permissions.scheduler',
    create_schedule: 'roles.permissions.createSchedule',
    read_schedule: 'roles.permissions.readSchedule',
    view_schedule: 'roles.permissions.viewSchedule',
    update_schedule: 'roles.permissions.updateSchedule',
    delete_schedule: 'roles.permissions.deleteSchedule',
    create_citizen_journal: 'roles.permissions.createCitizenJournal',
    view_citizen_journal: 'roles.permissions.viewCitizenJournal',
    update_citizen_journal: 'roles.permissions.updateCitizenJournal',
    delete_citizen_journal: 'roles.permissions.deleteCitizenJournal',
    create_citizen_calendar: 'roles.permissions.createCitizenCalendar',
    view_citizen_calendar: 'roles.permissions.viewCitizenCalendar',
    update_citizen_calendar: 'roles.permissions.updateCitizenCalendar',
    delete_citizen_calendar: 'roles.permissions.deleteCitizenCalendar',
    create_citizen_health: 'roles.permissions.createCitizenHealth',
    view_citizen_health: 'roles.permissions.viewCitizenHealth',
    update_citizen_health: 'roles.permissions.updateCitizenHealth',
    delete_citizen_health: 'roles.permissions.deleteCitizenHealth',
    create_citizen_medicine: 'roles.permissions.createCitizenMedicine',
    update_citizen_medicine: 'roles.permissions.updateCitizenMedicine',
    delete_citizen_medicine: 'roles.permissions.deleteCitizenMedicine',
    create_citizen_plan: 'roles.permissions.createCitizenPlan',
    update_citizen_plan: 'roles.permissions.updateCitizenPlan',
    delete_citizen_plan: 'roles.permissions.deleteCitizenPlan',
    create_citizen_document: 'roles.permissions.createCitizenDocument',
    update_citizen_document: 'roles.permissions.updateCitizenDocument',
    delete_citizen_document: 'roles.permissions.deleteCitizenDocument',
    create_citizen_economy: 'roles.permissions.createCitizenEconomy',
    update_citizen_economy: 'roles.permissions.updateCitizenEconomy',
    delete_citizen_economy: 'roles.permissions.deleteCitizenEconomy',
    create_citizen_contact: 'roles.permissions.createCitizenContact',
    update_citizen_contact: 'roles.permissions.updateCitizenContact',
    delete_citizen_contact: 'roles.permissions.deleteCitizenContact',
    create_citizen_children: 'roles.permissions.createCitizenChildren',
    update_citizen_children: 'roles.permissions.updateCitizenChildren',
    delete_citizen_children: 'roles.permissions.deleteCitizenChildren',
    delete_calendar: 'roles.permissions.deleteCalendar',
    create_citizen: 'roles.permissions.createCitizen',
    update_citizen: 'roles.permissions.updateCitizen',
    update_form_field_config: 'roles.permissions.updateFormFieldConfig',
}

export function usePermissions() {
    const userStore = useUserStore() as any

    function maxRoleLevel(): number {
        const roles: any[] = userStore.getUser?.roles ?? []
        if (!roles.length) return 0
        return Math.max(...roles.map((r: any) => r.level ?? 0))
    }

    function isAtLeast(roleName: string): boolean {
        const threshold = ROLE_LEVELS[roleName] ?? 0
        return maxRoleLevel() >= threshold
    }

    function can(permissionName: string): boolean {
        // Use the flat permissions list on the user object (combined from all roles)
        const permissions: any[] = userStore.getUser?.permissions ?? []
        if (permissions.some((p: any) => p.name === permissionName)) return true
        // Fallback: check nested role permissions
        const roles: any[] = userStore.getUser?.roles ?? []
        return roles.some((role: any) =>
            role.permissions?.some((p: any) => p.name === permissionName)
        )
    }

    return { isAtLeast, can }
}
