import {Api} from "./core/api";
import requests from "./core/requests";
import {ChallengeDetail} from "@/types/challenge";

class ChallengeApi extends Api<ChallengeDetail> {
    constructor() {
        super("admin/challenges");
    }

    async sortItems(items: { id: string, sort: number }[]) {
        return await requests.post(`/admin/challenges/sort`, items);
    }
}

let challengeApi = new ChallengeApi();
export default challengeApi;