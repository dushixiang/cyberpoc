import {Api} from "@/api/core/api.ts";
import requests from "@/api/core/requests.ts";
import {Solve} from "@/types";

class SolveApi extends Api<Solve> {
    constructor() {
        super("admin/solves");
    }

    // 立即重新计算排行榜
    async recomputeRanks() {
        return await requests.post(`/${this.group}/recompute-ranks`);
    }

    // 修复通关记录
    async fixRecords() {
        return await requests.post(`/${this.group}/fix-records`) as { ok: boolean; deleted: number };
    }
}

let solveApi = new SolveApi();
export default solveApi;