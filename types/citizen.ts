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
            region_uuid: string,
            municipality_uuid: string,
            city_uuid: string,
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
    region_uuid: string,
    municipality_uuid: string,
    city_uuid: string,
    post_code: string,
    diagnosis: string,
}