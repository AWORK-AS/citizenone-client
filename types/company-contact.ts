export interface CompanyContact {
    id?: number
    uuid: string
    company_id?: number
    firstname: string
    lastname: string | null
    email: string | null
    phone: string | null
    street: string | null
    post_code: string | null
    company_name: string | null
    contact_job_title: {
        uuid: string
        en_title: string
        dk_title: string
        system_name: string
    } | null
    language: {
        uuid: string
        name: string
        code: string
    } | null
    region: {
        uuid: string
        name: string
    } | null
    municipality: {
        uuid: string
        name: string
    } | null
    city: {
        uuid: string
        name: string
    } | null
    assigned_citizens_count?: number
    created_at?: string
    updated_at?: string
}

export interface CompanyContactForm {
    contact_job_title_uuid: string
    firstname: string
    lastname?: string
    email?: string
    phone?: string
    street?: string
    post_code?: string
    company_name?: string
    language_uuid?: string
    region_uuid?: string
    municipality_uuid?: string
    city_uuid?: string
}
