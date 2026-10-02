import BaseAPIService from '@/components/api/BaseAPIService'
import type { AgreementPayload, RegisterPaymentPayload } from '@/types/agreement'

/**
 * Company agreements and manual invoice payment registration.
 * Superadmin only; the backend authorises every call. Agreement data is
 * internal and has no customer-facing endpoint.
 */
class AgreementService extends BaseAPIService {
    async getCompanyAgreements(companyUuid: string): Promise<{ data: any[] }> {
        return await this.request(`/superadmin/companies/${companyUuid}/agreements`, 'GET')
    }

    /** Subscriptions of the company that can be linked, with any agreement they already belong to. */
    async getLinkableSubscriptions(companyUuid: string): Promise<any> {
        return await this.request(`/superadmin/companies/${companyUuid}/agreement-subscriptions`, 'GET')
    }

    async createAgreement(companyUuid: string, payload: AgreementPayload): Promise<{ data: any }> {
        return await this.request(`/superadmin/companies/${companyUuid}/agreements`, 'POST', payload)
    }

    async getAgreement(agreementUuid: string): Promise<{ data: any }> {
        return await this.request(`/superadmin/agreements/${agreementUuid}`, 'GET')
    }

    async updateAgreement(agreementUuid: string, payload: AgreementPayload): Promise<{ data: any }> {
        return await this.request(`/superadmin/agreements/${agreementUuid}`, 'PUT', payload)
    }

    /** 422 when invoices have already been created for the agreement. */
    async deleteAgreement(agreementUuid: string): Promise<void> {
        return await this.request(`/superadmin/agreements/${agreementUuid}`, 'DELETE')
    }

    async cancelAgreement(agreementUuid: string, cancelledAt: string): Promise<{ data: any }> {
        return await this.request(`/superadmin/agreements/${agreementUuid}/cancel`, 'POST', { cancelled_at: cancelledAt })
    }

    /** Same body as create; returns the installments without saving anything. */
    async previewSchedule(payload: AgreementPayload): Promise<any> {
        return await this.request(`/superadmin/agreements/preview-schedule`, 'POST', payload)
    }

    /** Replaces the set of subscriptions (licences, Pro profile) linked to the agreement. */
    async linkSubscriptions(agreementUuid: string, subscriptionUuids: string[]): Promise<{ data: any }> {
        return await this.request(`/superadmin/agreements/${agreementUuid}/subscriptions`, 'PUT', {
            subscription_uuids: subscriptionUuids,
        })
    }

    /** Links an existing invoice to an installment. Returns the full agreement. */
    async linkInvoice(agreementUuid: string, installmentUuid: string, invoiceUuid: string): Promise<{ data: any }> {
        return await this.request(`/superadmin/agreements/${agreementUuid}/installments/${installmentUuid}/link-invoice`, 'POST', {
            invoice_uuid: invoiceUuid,
        })
    }

    async registerPayment(invoiceUuid: string, payload: RegisterPaymentPayload): Promise<any> {
        return await this.request(`/superadmin/invoices/${invoiceUuid}/payment`, 'POST', payload)
    }

    async undoPayment(invoiceUuid: string): Promise<any> {
        return await this.request(`/superadmin/invoices/${invoiceUuid}/payment`, 'DELETE')
    }
}

export const agreementService = new AgreementService()
