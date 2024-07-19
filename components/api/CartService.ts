import BaseAPIService from '@/components/api/BaseAPIService'

class CartService extends BaseAPIService {
    async getCart(): Promise<any> {
        return await this.request(`/user/carts`, 'GET')
    }

    async saveCart(params: object): Promise<any> {
        return await this.request(`/user/carts`, 'POST', params)
    }

    async checkoutCart(): Promise<any> {
        return await this.request(`/user/carts/checkout/items`, 'POST')
    }
}

export const cartService = new CartService()