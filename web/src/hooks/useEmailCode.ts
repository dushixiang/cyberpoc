import { useCallback, useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import accountApi from '@/api/account-api';

/**
 * 邮箱验证码管理 Hook
 * 提供发送邮箱验证码、倒计时管理等功能
 */
export const useEmailCode = () => {
    const [countdown, setCountdown] = useState(0);
    const [isReady, setIsReady] = useState(true);
    const timerRef = useRef<NodeJS.Timeout>();

    const sendCodeMutation = useMutation({
        mutationFn: (email: string) => accountApi.sendMailCode(email),
        onSuccess: () => {
            toast.success('验证码已发送，请查收邮箱');
            startCountdown();
        },
        onError: (error: any) => {
            toast.error(error?.message || '发送验证码失败，请重试');
        },
    });

    const startCountdown = useCallback((seconds = 60) => {
        setIsReady(false);
        setCountdown(seconds);
        
        timerRef.current = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    setIsReady(true);
                    clearInterval(timerRef.current);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    }, []);

    const sendCode = useCallback((email: string) => {
        if (!isReady || !email) return;
        sendCodeMutation.mutate(email);
    }, [isReady, sendCodeMutation]);

    const buttonText = isReady ? '获取验证码' : `${countdown}秒后重发`;

    // 清理定时器
    const cleanup = useCallback(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }
    }, []);

    return {
        sendCode,
        buttonText,
        isReady,
        isLoading: sendCodeMutation.isPending,
        cleanup,
    };
};
