<template>
    <div>
        <Modal size="xs" :title="$t('subscription.coupon.coupon')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <form @submit.prevent="submitForm()">
                        <Alert type="danger" :text="state?.error?.message"
                            v-if="state.error?.message && state.error.message.length > 0" />
                        <div class="space-y-1">
                            <FormLabel for="code" :label="$t('subscription.coupon.form.couponCode')" />
                            <FormTextField id="code" name="code"
                                :placeholder="$t('subscription.coupon.form.couponCode')"
                                v-model="state.formCoupon.code" />
                            <FormError :error="v$?.formCoupon?.code?.$errors[0]?.$message.toString()" />
                            <FormError :error="state?.error?.errors?.code?.[0]" />
                        </div>
                        <div class="mt-6">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <FormButton type="button" buttonStyle="cancel" class="rounded-md" @click="closeModal">
                                    {{ $t('cancel') }}
                                </FormButton>
                                <FormButton type="submit" buttonStyle="primary" class="rounded-md">
                                    {{ $t('subscription.coupon.form.apply') }}
                                </FormButton>
                            </div>
                        </div>
                    </form>
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { couponService } from '@/components/api/CouponService'
import { useVuelidate } from "@vuelidate/core"
import { required, helpers } from '@vuelidate/validators'
import { useAlert } from '@/composables/alert'
import { useI18n } from "vue-i18n"
import { useCouponStore } from '@/store/coupon'
import type { Error } from '@/types'

const { successAlert } = useAlert()
const { t } = useI18n()
const couponStore = useCouponStore()

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
})
const emit = defineEmits(['close'])

const state = reactive({
    error: {} as Error,
    formCoupon: {
        code: couponStore.getCode,
    },
    isPageLoading: false,
})

const rules = computed(() => {
    return {
        formCoupon: {
            code: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
        },
    }
})

const v$ = useVuelidate(rules, state)

function closeModal() {
    emit('close')
}

function submitForm() {
    state.error = {}
    v$.value.$validate()
    if (!v$.value.$error) {
        validateCoupon()
    }
}

async function validateCoupon() {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            code: state.formCoupon.code,
        }
        const response = await couponService.validateCouponCode(params)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('subscription.coupon.form.alert.couponCodeSuccessfullyAdded')}.`)
            couponStore.setCode(state.formCoupon.code)
            closeModal()
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>