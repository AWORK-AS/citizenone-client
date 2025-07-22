export interface EmployeeForm {
    profile_image: any,
    firstname: string,
    lastname: string,
    email: string,
    phone: string,
    birthday: string,
    seniority_date: string,
    departments: any,
    role: string,
    street: string,
    region_uuid: string,
    municipality_uuid: string,
    city_uuid: string,
    post_code: string,
    employment: any,
    emergencyInfo: any,
    permissions: Permission[]
    show_working_hours: boolean,
    media_risks: any
    pages: any
}

type Permission = 'read' | 'create' | 'update' | 'delete'