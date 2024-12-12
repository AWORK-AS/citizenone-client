import { defineStore } from 'pinia'

export const useCouponStore = defineStore('couponStore',
    {
        persist: true,
        state: () => ({
            code: '',
        }),
        actions: {
            setCode(code) {
                this.code = code
            },
            resetCode() {
                this.code = ''
            },
        },
        getters: {
            getCode: (state) => state.code,
        },
    },
)
