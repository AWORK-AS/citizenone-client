import BaseAPIService from '@/components/api/BaseAPIService';

class CompensatoryPayoutReportService extends BaseAPIService {
    async getPayouts(params: any): Promise<any> {
        return await this.request(`/user/compensatory-payouts`, 'GET', params);
    }

    async exportPayouts(params: any): Promise<Blob | null> {
        return await this.requestBlob(`/user/compensatory-payouts/export`, 'GET', params);
    }
}
export const compensatoryPayoutReportService = new CompensatoryPayoutReportService();
