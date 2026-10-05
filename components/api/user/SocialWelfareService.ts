import BaseAPIService from '@/components/api/BaseAPIService'
import type { ContractFieldDefinition, ContractHourType, DataEnvelope, PaymentTerm } from '@/types/contract'

class SocialWelfareService extends BaseAPIService {
    // Revenue split across primary/secondary case workers (coordinators)
    async getCoordinatorEconomy(params: object): Promise<any> {
        return await this.request(`/user/social-welfare/coordinator-economy`, 'GET', params)
    }

    // Delivered hours per citizen for a period, grouped by paying municipality
    async getBillingExtraction(params: object): Promise<any> {
        return await this.request(`/user/social-welfare/billing-extraction`, 'GET', params)
    }

    // The individual hour registrations behind one extraction row
    async getBillingRegistrations(params: object): Promise<any> {
        return await this.request(`/user/social-welfare/billing-extraction/registrations`, 'GET', params)
    }

    // Turns extraction groups into client invoices, one per group
    async convertToInvoices(payload: object): Promise<any> {
        return await this.request(`/user/social-welfare/billing-extraction/invoices`, 'POST', payload)
    }

    // The customer invoices written from the extraction, for mass actions
    async getClientInvoices(params: object): Promise<any> {
        return await this.request(`/user/social-welfare/billing-extraction/client-invoices`, 'GET', params)
    }

    // One action (mark sent / unsent, e-mail, e-conomic) on several invoices
    async bulkClientInvoices(payload: object): Promise<any> {
        return await this.request(`/user/social-welfare/billing-extraction/client-invoices/bulk`, 'POST', payload)
    }

    // The invoice as a PDF
    async downloadClientInvoice(uuid: string): Promise<Blob | null> {
        return await this.requestBlob(`/user/client-invoices/${uuid}/download`, 'GET')
    }

    // The paying customers' departments (address, EAN, terms)
    async getCustomerDepartments(params: object = {}): Promise<any> {
        return await this.request(`/user/social-welfare/customer-departments`, 'GET', params)
    }

    async saveCustomerDepartment(payload: object): Promise<any> {
        return await this.request(`/user/social-welfare/customer-departments`, 'POST', payload)
    }

    async updateCustomerDepartment(uuid: string, payload: object): Promise<any> {
        return await this.request(`/user/social-welfare/customer-departments/${uuid}`, 'PUT', payload)
    }

    async deleteCustomerDepartment(uuid: string): Promise<any> {
        return await this.request(`/user/social-welfare/customer-departments/${uuid}`, 'DELETE')
    }

    // The contract periods on one intervention, with the stays' fallback
    async getContractPeriods(citizenUuid: string): Promise<any> {
        return await this.request(`/user/social-welfare/citizens/${citizenUuid}/contract-periods`, 'GET')
    }

    async saveContractPeriod(citizenUuid: string, payload: object): Promise<any> {
        return await this.request(`/user/social-welfare/citizens/${citizenUuid}/contract-periods`, 'POST', payload)
    }

    async updateContractPeriod(uuid: string, payload: object): Promise<any> {
        return await this.request(`/user/social-welfare/contract-periods/${uuid}`, 'PUT', payload)
    }

    async deleteContractPeriod(uuid: string): Promise<any> {
        return await this.request(`/user/social-welfare/contract-periods/${uuid}`, 'DELETE')
    }

    // Hour types a contract period grants hours in (contact, administration, transport and the company's own)
    async getContractHourTypes(params: object = {}): Promise<DataEnvelope<ContractHourType[]>> {
        return await this.request(`/user/social-welfare/contract-hour-types`, 'GET', params)
    }

    async saveContractHourType(payload: object): Promise<DataEnvelope<ContractHourType>> {
        return await this.request(`/user/social-welfare/contract-hour-types`, 'POST', payload)
    }

    async updateContractHourType(uuid: string, payload: object): Promise<DataEnvelope<ContractHourType>> {
        return await this.request(`/user/social-welfare/contract-hour-types/${uuid}`, 'PUT', payload)
    }

    async deleteContractHourType(uuid: string): Promise<{ message: string }> {
        return await this.request(`/user/social-welfare/contract-hour-types/${uuid}`, 'DELETE')
    }

    // Payment terms (days and label) a period or a customer department picks from
    async getPaymentTerms(params: object = {}): Promise<DataEnvelope<PaymentTerm[]>> {
        return await this.request(`/user/social-welfare/payment-terms`, 'GET', params)
    }

    async savePaymentTerm(payload: object): Promise<DataEnvelope<PaymentTerm>> {
        return await this.request(`/user/social-welfare/payment-terms`, 'POST', payload)
    }

    async updatePaymentTerm(uuid: string, payload: object): Promise<DataEnvelope<PaymentTerm>> {
        return await this.request(`/user/social-welfare/payment-terms/${uuid}`, 'PUT', payload)
    }

    async deletePaymentTerm(uuid: string): Promise<{ message: string }> {
        return await this.request(`/user/social-welfare/payment-terms/${uuid}`, 'DELETE')
    }

    // The company's own contract fields (a text or number on every period)
    async getContractFieldDefinitions(params: object = {}): Promise<DataEnvelope<ContractFieldDefinition[]>> {
        return await this.request(`/user/social-welfare/contract-field-definitions`, 'GET', params)
    }

    async saveContractFieldDefinition(payload: object): Promise<DataEnvelope<ContractFieldDefinition>> {
        return await this.request(`/user/social-welfare/contract-field-definitions`, 'POST', payload)
    }

    async updateContractFieldDefinition(uuid: string, payload: object): Promise<DataEnvelope<ContractFieldDefinition>> {
        return await this.request(`/user/social-welfare/contract-field-definitions/${uuid}`, 'PUT', payload)
    }

    async deleteContractFieldDefinition(uuid: string): Promise<{ message: string }> {
        return await this.request(`/user/social-welfare/contract-field-definitions/${uuid}`, 'DELETE')
    }
}

export const socialWelfareService = new SocialWelfareService()
