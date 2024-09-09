export interface EmployeeForm {
    firstname: string,
    lastname: string,
    email: string,
    phone: string,
    birthday: string,
    departments: number[],
    role: string,
    street: string,
    region: string,
    municipality: string,
    city: string,
    post_code: string,
    employment: any,
    emergencyInfo: any,
    permissions: Permission[]
}

type Permission = 'read' | 'create' | 'update' | 'delete'