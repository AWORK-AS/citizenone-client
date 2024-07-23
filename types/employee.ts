export interface EmployeeForm {
    firstname: string,
    lastname: string,
    email: string,
    phone: string,
    birthday: string,
    departments: number[],
    role: string,
    permissions: Permission[]
}

type Permission = 'read' | 'create' | 'update' | 'delete'