export interface EmployeeForm {
    profile_image: any,
    firstname: string,
    lastname: string,
    email: string,
    phone: string,
    birthday: string,
    departments: any,
    role: string,
    street: string,
    region_id: string,
    municipality_id: string,
    city_id: string,
    post_code: string,
    employment: any,
    emergencyInfo: any,
    permissions: Permission[]
}

type Permission = 'read' | 'create' | 'update' | 'delete'