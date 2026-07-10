export function useCitizenAutoFill() {
    function getCitizenAutoFillValue(source: string | undefined | null, citizen: any): string {
        if (!source || !citizen) return ''

        switch (source) {
            case 'citizen_name':
                return [citizen.firstname, citizen.lastname].filter(Boolean).join(' ')
            case 'citizen_cpr':
                return citizen.social_security_number ?? ''
            case 'citizen_birthday':
                return citizen.birthday ?? ''
            case 'citizen_admission_date':
                return citizen.date_admitted ?? ''
            case 'citizen_discharge_date':
                return citizen.date_discharged ?? ''
            default:
                return ''
        }
    }

    return { getCitizenAutoFillValue }
}
