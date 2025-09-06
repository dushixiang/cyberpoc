import {Api} from "./core/api";
import {ImageDetail} from "../types/image";

class ImageApi extends Api<ImageDetail> {
    constructor() {
        super("admin/images");
    }

    async syncAll() {
        await (await import('./core/requests')).default.post(`/admin/images/sync-all`);
    }

    async pullAll() {
        await (await import('./core/requests')).default.post(`/admin/images/pull-all`);
    }

    async syncById(id: string) {
        await (await import('./core/requests')).default.post(`/admin/images/${id}/sync`);
    }

    async pullById(id: string) {
        await (await import('./core/requests')).default.post(`/admin/images/${id}/pull`);
    }
}

let imageApi = new ImageApi();
export default imageApi;