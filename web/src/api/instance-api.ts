import {Api} from "./core/api";
import requests from "./core/requests";
import {InstanceDetail} from "../types/instance";

class InstanceApi extends Api<InstanceDetail> {
    constructor() {
        super("admin/instances");
    }

    async destroyById(id: string) {
        await requests.post(`/${this.group}/${id}/destroy`);
    }
}

let instanceApi = new InstanceApi();
export default instanceApi;