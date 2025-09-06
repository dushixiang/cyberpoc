import requests from "@/api/core/requests.ts";

class PropertyApi {

    group = 'admin/property';

    get = async () => {
        return await requests.get(`/${this.group}`) as Record<string, string>;
    }

    set = async (values: any) => {
        await requests.put(`/${this.group}`, values);
    }
}

let propertyApi = new PropertyApi();
export default propertyApi;