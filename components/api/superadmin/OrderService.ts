import BaseAPIService from '@/components/api/BaseAPIService'

class OrderService extends BaseAPIService {
    async getOrders(params: object): Promise<any> {
        return await this.request(`/superadmin/external-data`, 'GET', params)
    }

    async getOrder(orderUuid: string): Promise<any> {
        return await this.request(`/superadmin/orders/${orderUuid}`, 'GET')
    }

    async createOrder(params: object): Promise<any> {
        return await this.request(`/superadmin/orders`, 'POST', params)
    }

    async updateOrder(orderUuid: string, params: object): Promise<any> {
        return await this.request(`/superadmin/orders/${orderUuid}`, 'PUT', params)
    }

    async updateOrderStatus(orderUuid: string, status: string): Promise<any> {
        return await this.request(`/superadmin/orders/${orderUuid}/status`, 'PUT', { status })
    }

    async deleteOrder(orderUuid: string): Promise<any> {
        return await this.request(`/superadmin/orders/${orderUuid}`, 'DELETE')
    }
}

export const orderService = new OrderService()
