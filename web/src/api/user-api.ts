import {Api} from "@/api/core/api.ts";
import requests from "@/api/core/requests.ts";
import {User} from "@/types";

class UserApi extends Api<User> {
    constructor() {
        super("admin/user");
    }

    async changePassword(id: string, psk: string) {
        await requests.post(`/${this.group}/${id}/change-password`, {
            password: psk
        })
    }

    enabled = async (enabled: boolean, appIds: string[]) => {
        if (enabled) {
            await requests.post(`/${this.group}/enabled`, appIds)
        } else {
            await requests.post(`/${this.group}/disabled`, appIds)
        }
    }


}

let userApi = new UserApi();
export default userApi;
