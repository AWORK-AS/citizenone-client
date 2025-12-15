import BaseAPIService from '@/components/api/BaseAPIService'

class BookingClientService extends BaseAPIService {
    async getCurrentLoggedInClient(): Promise<any> {
        return await this.request(`/booking-client`, 'GET')
    }

    async updateCitizenLangugage(params: object): Promise<any> {
        return await this.request(`/client/update/language`, 'PUT', params)
    }

    async appointments(params: object): Promise<any> {
        return await this.request(`/booking-client/dashboard`, 'GET', params)
    }

    async appointmentDetail(uuid: string): Promise<any> {
        return await this.request(`/booking-client/appointment/${uuid}`, 'GET')
    }
}

export const bookingClientService = new BookingClientService()