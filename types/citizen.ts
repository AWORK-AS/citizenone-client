export interface CitizenResponse {
    data: {
        image: string,
        firstname: string,
        lastname: string,
        email: string,
        social_security_number: string,
        birthday: string,
        phone: string,
        departments: { id: number }[],
        address: {
            street: string,
            region_id: number,
            municipality_id: number,
            city_id: number,
            post_code: string,
        },
        diagnosis: string,
    }
}

export interface CitizenForm {
    image: string,
    firstname: string,
    lastname: string,
    email: string,
    social_security_number: string,
    birthday: string,
    phone: string,
    departments: number[],
    street: string,
    region_id: string,
    municipality_id: string,
    city_id: string,
    post_code: string,
    diagnosis: string,
}