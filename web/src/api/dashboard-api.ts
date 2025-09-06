import requests from "@/api/core/requests.ts";

export type DashboardStats = {
    challenges: number;
    instances: number;
    running_instances: number;
    solves: number;
}

class DashboardApi {
    async getStats(): Promise<DashboardStats> {
        return await requests.get('/admin/dashboard/stats') as DashboardStats;
    }
}

let dashboardApi = new DashboardApi();
export default dashboardApi;