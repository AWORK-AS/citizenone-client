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

    async getCitizenRooms(citizen_uuid: string): Promise<any> {
        return await this.request(`/user/rooms/citizens/list`, 'GET', { citizen_uuid })
    }

    async addCitizenToRoom(room_uuid: string, citizen_uuid: string[]): Promise<any> {
        return await this.request(`/user/rooms/citizens/add`, 'POST', { room_uuid, citizen_uuid })
    }

    async removeCitizenFromRoom(room_uuid: string, citizen_uuid: string[]): Promise<any> {
        return await this.request(`/user/rooms/citizens/remove`, 'POST', { room_uuid, citizen_uuid })
    }
}

export const roomService = new RoomService()