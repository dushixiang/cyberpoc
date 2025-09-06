import {PageData} from "./core/api";
import qs from "qs";
import requests from "./core/requests";
import {ActionResult, ChallengeInstance, RankResult, RanksResponse} from "@/types";
import {ChallengeDetail, ChallengeListView} from "@/types/challenge.ts";


class IndexApi {

    group = `challenges`

    getPaging = async (params: any) => {
        let paramsStr = qs.stringify(params);
        return await requests.get(`/${this.group}/paging?` + paramsStr) as PageData<ChallengeListView>;
    }

    getDetail = async (id: string | undefined) => {
        return await requests.get(`/${this.group}/` + id) as ChallengeDetail;
    }

    getRank = async (id: string | undefined) => {
        return await requests.get(`/${this.group}/${id}/rank`) as RankResult;
    }

    getInstance = async (id: string | undefined) => {
        return await requests.get(`/${this.group}/${id}/instance`) as ChallengeInstance;
    }

    run = async (id: string | undefined) => {
        await requests.post(`/${this.group}/${id}/run`);
    }

    reset = async (id: string | undefined) => {
        await requests.post(`/${this.group}/${id}/reset`);
    }

    destroy = async (id: string | undefined) => {
        await requests.post(`/${this.group}/${id}/destroy`);
    }

    flag = async (id: string | undefined, flag: any) => {
        return await requests.post(`/${this.group}/${id}/flag`, flag) as ActionResult;
    }

    overtime = async (id: string | undefined) => {
        await requests.post(`/${this.group}/${id}/overtime`);
    }

    getRanks = async () => {
        return await requests.get('/ranks') as RanksResponse;
    }
}

const indexApi = new IndexApi();
export default indexApi;