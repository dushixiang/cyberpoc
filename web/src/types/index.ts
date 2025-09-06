export type Captcha = {
    captcha: string
    key: string
}

export interface RegisterAccount {
    account: string
    code: string
    name: string
    password: string
    captcha: string
    key: string
}

export type LoginAccount = {
    account: string
    password: string
    captcha: string
    key: string
}

export type LoginResult = {
    token: string
}

export interface User {
    id: string;
    name: string;
    account: string;
    type: string;
    password: string;
    avatar: string;
    enabled: boolean;
    created_at: number;
}

export interface ForgotPasswordRequest {
    account: string
    captcha: string
    captchaKey: string
}

export interface ResetPasswordRequest {
    token: string
    password: string
    captcha: string
    captchaKey: string
}

export interface Image {
    id: string
    name: string
}

export interface Instance {
    id: string
    name: string
}



export type InstanceStatus =
    | "creating"
    | "create-failure"
    | "created"
    | "running"
    | "deleting"
    | "delete-failure"
    | "";

export interface ChallengeInstance {
    status: InstanceStatus;
    created_at: number;
    expires_at: number;
    accessUrl: string;
}

export interface ActionResult {
    ok: boolean
}

export interface Solve {
    id: string;
    user_id: string;
    user_name: string;
    user_avatar: string;
    challenge_id: string;
    challenge_name: string;
    points: number;
    start_at: number;
    solved_at: number;
    used_time: number;
    used_time_str: string;
}

export interface RankResult {
    solves: Solve[],
    first: Solve,
}

export interface Rank {
    score: number
    userId: string
    userName: string
    userAvatar: string
    totalTime: number
    totalTimeStr: string
}

export interface RanksResponse {
    items: Rank[]
    updated_at: number
}

export interface LoginLog {
    id: string;
    account: string;
    ip: string;
    login_at: number;
    success: boolean;
    reason: string;
    region: string;
    user_agent: {
        name?: string;
        version?: string;
        os?: string;
        device?: string;
    }
}
