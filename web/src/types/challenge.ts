// 题目相关类型定义
export interface ChallengeDetail {
    id: string;
    name: string;
    description: string;
    category: string;
    difficulty: string;
    points: number;
    flag: string;
    dynamic_flag: boolean;
    enabled: boolean;
    image_id: string;
    exposed: string;
    duration: number;
    created_at: number;
    updated_at: number;
    attempt_count: number;
    solved_count: number;
    solved: boolean;

    html: string;
}

export interface ChallengeListView {
    id: string;
    name: string;
    category: string;
    difficulty: string;
    points: number;
    created_at: number;
    updated_at: number;
    attempt_count: number;
    solved_count: number;
    solved: boolean;
    challenging: boolean;
}

export interface ChallengeCreateRequest {
    name: string;
    description: string;
    category: string;
    difficulty: string;
    points: number;
    flag?: string;
    dynamic_flag: boolean;
    enabled: boolean;
    image_id?: string;
    exposed?: string;
    duration: number;
    html?: string;
}

export interface ChallengeUpdateRequest extends ChallengeCreateRequest {
    id: string;
}

// 题目类别选项
export const CHALLENGE_CATEGORIES = [
    {label: '源码审计', value: 'audit', color: 'blue'},
];

// 难度等级选项
export const DIFFICULTY_LEVELS = [
    {label: '简单', value: 'easy', color: 'success'},
    {label: '中等', value: 'medium', color: 'warning'},
    {label: '困难', value: 'hard', color: 'error'},
];

export type ChallengeCategory = typeof CHALLENGE_CATEGORIES[number]['value'];
export type DifficultyLevel = typeof DIFFICULTY_LEVELS[number]['value'];
