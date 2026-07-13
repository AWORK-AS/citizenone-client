export interface CitizenChild {
    uuid: string
    citizen_id: number
    firstname: string
    lastname: string
    gender: string
    email: string
    social_security_number: string
    cpr_number: string
    birthday: string | null
    phone: string
    street: string
    origin: string
    post_code: string
    region_id: number | null
    municipality_id: number | null
    city: string
    region?: any
    municipality?: any
    citizen?: {
        uuid: string
        firstname: string
        lastname: string
        [key: string]: any
    }
    created_at: string | null
    updated_at: string | null
}
