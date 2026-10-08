/**
 * API client for a form a clinic sent a patient as a link in an email or SMS.
 * Deliberately does NOT extend BaseAPIService: that class attaches whatever
 * Bearer token is in localStorage and redirects to login on a 401, and the
 * patient opening this link has no CitizenOne session - a staff member's
 * token on a shared computer must not ride along either. The token in the
 * URL finds the form; the patient's date of birth opens it.
 */
export class PublicFormLinkClient {
    private apiBaseURL: string

    private token: string

    constructor(apiBaseURL: string, token: string) {
        this.apiBaseURL = apiBaseURL.replace(/\/$/, '')
        this.token = token
    }

    async getSummary(): Promise<any> {
        return this.request(`/public/forms/${encodeURIComponent(this.token)}`)
    }

    async unlock(birthday: string): Promise<any> {
        return this.request(`/public/forms/${encodeURIComponent(this.token)}/unlock`, 'POST', { birthday })
    }

    async submit(birthday: string, answers: object): Promise<any> {
        return this.request(`/public/forms/${encodeURIComponent(this.token)}/submit`, 'PUT', { birthday, answers })
    }

    private async request(path: string, method: string = 'GET', body?: object): Promise<any> {
        const response = await fetch(`${this.apiBaseURL}${path}`, {
            method,
            credentials: 'omit',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: body ? JSON.stringify(body) : undefined,
        })

        const data = await response.json().catch(() => ({}))

        if (!response.ok) {
            throw { status: response.status, message: data?.message, errors: data?.errors }
        }

        return data
    }
}
