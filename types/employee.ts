export interface EmployeeForm {
    profile_image: any,
    firstname: string,
    lastname: string,
    email: string,
    password: string,
    phone: string,
    birthday: string,
    seniority_date: string,
    departments: any,
    roles: string[],
    street: string,
    region_uuid: string,
    municipality_uuid: string,
    city: string,
    post_code: string,
    employment: any,
    emergencyInfo: any,
    permissions: Permission[]
    show_working_hours: boolean,
    show_compensatory_hours: boolean,
    do_not_count_sick_leave: boolean,
    media_risks: any
    pages: any
}

type Permission = 'read' | 'create' | 'update' | 'delete'