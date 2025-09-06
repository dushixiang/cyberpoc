import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import accountApi from '@/api/account-api';

/**
 * 统一的验证码管理 Hook
 * 提供验证码获取、刷新等功能
 */
export const useCaptcha = () => {
    const queryCaptcha = useQuery({
        queryKey: ['getCaptcha'],
        queryFn: accountApi.getCaptcha,
        staleTime: 0, // 确保每次都获取新的验证码
    });

    const refreshCaptcha = useCallback(() => {
        queryCaptcha.refetch();
    }, [queryCaptcha]);

    return {
        captchaData: queryCaptcha.data,
        captchaKey: queryCaptcha.data?.key || '',
        captchaImage: queryCaptcha.data?.captcha,
        isLoading: queryCaptcha.isLoading,
        isError: queryCaptcha.isError,
        error: queryCaptcha.error,
        refreshCaptcha,
    };
};
