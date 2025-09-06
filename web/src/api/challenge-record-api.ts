import {Api} from "./core/api";
import {ChallengeRecordDetail} from "../types/challenge-record";

class ChallengeRecordApi extends Api<ChallengeRecordDetail> {
    constructor() {
        super("admin/challenge-records");
    }
}

let challengeRecordApi = new ChallengeRecordApi();
export default challengeRecordApi;
