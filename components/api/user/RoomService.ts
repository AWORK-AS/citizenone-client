import BaseAPIService from '@/components/api/BaseAPIService'

class RoomService extends BaseAPIService {
    async getRooms(params: object): Promise<any> {
        return await this.request(`/user/rooms`, 'GET', params)
    }

    async getRoom(roomUuid: any): Promise<any> {
        return await this.request(`/user/rooms/${roomUuid}`, 'GET')
    }

    async saveRoom(params: object): Promise<any> {
        return await this.request(`/user/rooms`, 'POST', params)
    }

    async updateRoom(roomUuid: any, params: object): Promise<any> {
        return await this.request(`/user/rooms/${roomUuid}`, 'PUT', params)
    }

    async deleteRoom(roomUuid: any): Promise<any> {
        return await this.request(`/user/rooms/${roomUuid}`, 'DELETE')
    }

    async getAllRooms(params: object): Promise<any> {
        return await this.request(`/user/rooms/all/list`, 'GET', params)
    }
}

export const roomService = new RoomService()