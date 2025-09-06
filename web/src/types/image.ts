// 镜像相关类型定义
export interface ImageDetail {
    id?: string;
    name: string;
    registry: string;
    status?: 'unknown' | 'pulling' | 'ready' | 'missing' | 'failed' | 'verifying' | 'deleting';
    cpu_limit: number;
    memory_limit: number;
    description?: string;
    created_at?: number;
    updated_at?: number;
}

export interface ImageCreateRequest {
    name: string;
    registry: string;
    cpu_limit: number;
    memory_limit: number;
    description?: string;
}

export interface ImageUpdateRequest extends ImageCreateRequest {
    id: string;
}
