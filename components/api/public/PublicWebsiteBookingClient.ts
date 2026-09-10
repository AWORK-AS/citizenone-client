/**
 * A minimal, dependency-free API client for the public website-booking
 * widget. Deliberately does NOT extend BaseAPIService: that class always
 * attaches a Bearer token from localStorage and 401-redirects to `/` via
 * revokeAccess() on failure - both are actively wrong on a third-party
 * domain, where there is no CitizenOne session and no `/` to redirect to.
 * This client sends no auth at all; the embed token in the URL is what
 * scopes every request to one company (see VerifyWebsiteBookingDomain on
 * the backend).
 */
export class PublicWebsiteBookingClient {
    private apiBaseURL: string

    private embedToken: string

    constructor(apiBaseURL: string, embedToken: string) {
        this.apiBaseURL = apiBaseURL.replace(/\/$/, '')
        this.embedToken = embedToken
    }

    async getConfig(): Promise<any> {
        return this.request(`/public/website-booking/${this.embedToken}/config`)
    }

    async getDepartments(): Promise<any> {
        return this.request(`/public/website-booking/${this.embedToken}/departments`)
    }

    async getServices(departmentUuid?: string): Promise<any> {
        const query = departmentUuid ? `?department_uuid=${encodeURIComponent(departmentUuid)}` : ''
        return this.request(`/public/website-booking/${this.embedToken}/services${query}`)
    }

    // Reuses the existing public time-slots-by-booking-setting-uuid route
    // rather than a new one - see WebsitePublicServiceResource.booking_setting_uuid.
    async getTimeSlots(bookingSettingUuid: string, date: string): Promise<any> {
        return this.request(`/user/online-booking/courses-events/booking-settings/${bookingSettingUuid}/time-slots/${date}`)
    }

    async book(serviceUuid: string, payload: object): Promise<any> {
        return this.request(`/public/website-booking/${this.embedToken}/services/${serviceUuid}/book`, 'POST', payload)
    }

    private async request(path: string, method: string = 'GET', body?: object): Promise<any> {
        const response = await fetch(`${this.apiBaseURL}${path}`, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: body ? JSON.stringify(body) : undefined,
        })

        const data = await response.json().catch(() => ({}))

        if (!response.ok) {
            throw { status: response.status, message: data?.message }
        }

        return data
    }
}
