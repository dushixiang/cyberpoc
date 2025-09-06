import requests from "@/api/core/requests.ts";
import {PageData} from "@/api/core/api.ts";
import {LoginLog} from "@/types";
import qs from "qs";

class LogApi {
    async getLoginLogPaging(queryParams: any){
        let queryStr = qs.stringify(queryParams);
        return await requests.get(`/admin/login-log/paging?${queryStr}`) as PageData<LoginLog>;
    }
    
    async deleteAllLoginLogs() {
        return await requests.delete('/admin/login-log/all');
    }
}

let logApi = new LogApi();
export default logApi;