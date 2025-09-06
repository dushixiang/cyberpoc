// 实例相关类型定义
export interface InstanceDetail {
    id: string;
    user_id: string;
    user_name: string;
    challenge_id: string;
    challenge_name: string;
    flag: string;
    exposed: string;
    duration: number;
    cpu_limit: number;
    memory_limit: number;
    status: 'creating' | 'create-failure' | 'created' | 'running' | 'deleting' | 'delete-failure';
    subdomain: string;
    access_url: string;
    message: string;
    created_at: number;
    expires_at: number;
}