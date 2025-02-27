import BaseAPIService from '@/components/api/user/BaseAPIService'

class CartService extends BaseAPIService {
    async getCart(): Promise<any> {
        return await this.request(`/user/carts`, 'GET')
    }

    async saveCart(params: object): Promise<any> {
        return await this.request(`/user/carts`, 'POST', params)
    }

    async checkoutCart(params: object): Promise<any> {
        return await this.request(`/user/carts/checkout/items`, 'POST', params)
    }
}

export const cartService = new CartService()