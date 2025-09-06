import requests from "./core/requests";
import {Captcha, ForgotPasswordRequest, LoginAccount, LoginResult, ResetPasswordRequest, User} from "@/types";

class AccountApi {
    getCaptcha = async () => {
        return await requests.get('/captcha') as Captcha;
    }

    login = async (account: LoginAccount) => {
        return await requests.post('/login', account) as LoginResult;
    }

    logout = async () => {
        await requests.post('/account/logout');
    }

    sendMailCode = async (mail: string) => {
        await requests.post('/send-code', { mail });
        return true;
    }

    register = async (values: any) => {
        return await requests.post('/register', values);
    }

    async changePassword(values: any) {
        return await requests.post('/account/change-password', values);
    }

    async getInfo() {
        return await requests.get(`/account/info`) as User;
    }

    async getInfoWithNoRedirect() {
        return await requests.get(`/account/info?redirect=false`) as User;
    }

    async changeProfile(values: any) {
        return await requests.post(`/account/change-profile`, values) as User;
    }

    forgotPassword = async (request: ForgotPasswordRequest) => {
        await requests.post('/forgot', request);
    }

    resetPassword = async (request: ResetPasswordRequest) => {
        await requests.post('/reset', request);
    }
}

let accountApi = new AccountApi();
export default accountApi;