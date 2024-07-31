export interface AccountForm {
    firstname: string,
    lastname: string,
    email: string,
    phone: string,
    birthday: string,
    role: string,
    permissions: Permission[]
}

type Permission = 'read' | 'create' | 'update' | 'delete'