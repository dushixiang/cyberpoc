import {useCallback, useEffect, useState} from 'react';
import {Link, useNavigate, useParams} from "react-router-dom";
import {useMutation} from "@tanstack/react-query";
import {Form, Formik, FormikHelpers} from "formik";
import * as Yup from 'yup';
import '../account/custom.css';
import {cn} from "@/lib/utils";
import {Button, buttonVariants} from "@/components/ui/button";
import toast from "react-hot-toast";
import accountApi from "@/api/account-api.ts";
import {ResetPasswordRequest} from "@/types";
import {useCaptcha} from "@/hooks/useCaptcha";
import {LoaderIcon, RefreshCw, Lock} from "lucide-react";

interface ResetPasswordFormData extends ResetPasswordRequest {
    confirmPassword: string;
}

// 表单验证 schema
const resetPasswordValidationSchema = Yup.object({
    password: Yup.string()
        .required('请输入新密码')
        .min(6, '密码至少需要6位')
        .matches(/^(?=.*[a-zA-Z])(?=.*\d)/, '密码必须包含字母和数字'),
    confirmPassword: Yup.string()
        .required('请确认密码')
        .oneOf([Yup.ref('password')], '两次输入的密码不一致'),
    captcha: Yup.string()
        .required('请输入验证码'),
});

const ResetPasswordPage = () => {
    const navigate = useNavigate();
    const params = useParams();
    const token = params['token'];
    const [success, setSuccess] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const { captchaKey, captchaImage, isLoading: captchaLoading, refreshCaptcha } = useCaptcha();

    useEffect(() => {
        if (!token) {
            navigate('/login');
        }
    }, [token, navigate]);

    // 使用 useMutation 处理重置密码
    const resetPasswordMutation = useMutation({
        mutationFn: (requestData: ResetPasswordRequest) => accountApi.resetPassword(requestData),
        onSuccess: () => {
            setSuccess(true);
            toast.success('密码重置成功');
        },
        onError: (error: any) => {
            setError(error?.message || '重置失败，请重试');
            refreshCaptcha(); // 失败时刷新验证码
        },
    });

    const handleResetPassword = useCallback(async (
        values: ResetPasswordFormData,
        { setSubmitting }: FormikHelpers<ResetPasswordFormData>
    ) => {
        setError('');
        const request: ResetPasswordRequest = {
            token: token!,
            password: values.password,
            captcha: values.captcha,
            captchaKey: captchaKey,
        };
        
        try {
            await resetPasswordMutation.mutateAsync(request);
        } finally {
            setSubmitting(false);
        }
    }, [token, captchaKey, resetPasswordMutation, refreshCaptcha]);

    if (success) {
        return (
            <div className="container relative h-screen flex-col items-center justify-center grid">
                <div className="lg:p-8">
                    <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                        <div className="flex flex-col space-y-2 text-center">
                            <h1 className="text-2xl font-semibold tracking-tight">
                                密码重置成功
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                您的密码已成功重置，请使用新密码登录。
                            </p>
                        </div>
                        <div>
                            <Button
                                onClick={() => navigate('/login')}
                                className="w-full"
                            >
                                去登录
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container relative h-screen flex-col items-center justify-center grid">
            <Link
                className={cn(
                    buttonVariants({variant: "ghost"}),
                    "absolute right-4 top-4 md:right-8 md:top-8"
                )}
                to={'/login'}
            >
                返回登录
            </Link>
            <div className="lg:p-8">
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                    <div className="flex flex-col space-y-2 text-center">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            重置密码
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            请输入您的新密码
                        </p>
                    </div>

                    {/* 错误提示 */}
                    {error && (
                        <div className="rounded-md bg-red-50 p-4 mb-4">
                            <div className="text-sm text-red-800">{error}</div>
                        </div>
                    )}

                    <Formik
                        initialValues={{
                            password: '',
                            confirmPassword: '',
                            captcha: '',
                        } as ResetPasswordFormData}
                        validationSchema={resetPasswordValidationSchema}
                        onSubmit={handleResetPassword}
                    >
                        {({
                              values,
                              errors,
                              touched,
                              handleChange,
                              handleBlur,
                              handleSubmit,
                              isSubmitting,
                              isValid,
                          }) => (
                            <Form className="space-y-4" onSubmit={handleSubmit}>
                                {/* 新密码输入 */}
                                <div>
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        className={cn(
                                            "input",
                                            errors.password && touched.password && "border-red-500 focus:border-red-500"
                                        )}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        value={values.password}
                                        placeholder="请输入新密码（至少6位，包含字母和数字）"
                                        autoComplete="new-password"
                                    />
                                    {errors.password && touched.password && (
                                        <div className="mt-2 text-sm text-red-600 dark:text-red-500">
                                            {errors.password}
                                        </div>
                                    )}
                                </div>

                                {/* 确认密码输入 */}
                                <div>
                                    <input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type="password"
                                        className={cn(
                                            "input",
                                            errors.confirmPassword && touched.confirmPassword && "border-red-500 focus:border-red-500"
                                        )}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        value={values.confirmPassword}
                                        placeholder="请确认新密码"
                                        autoComplete="new-password"
                                    />
                                    {errors.confirmPassword && touched.confirmPassword && (
                                        <div className="mt-2 text-sm text-red-600 dark:text-red-500">
                                            {errors.confirmPassword}
                                        </div>
                                    )}
                                </div>

                                {/* 验证码输入 */}
                                <div>
                                    <div className="relative">
                                        <input
                                            id="captcha"
                                            name="captcha"
                                            type="text"
                                            className={cn(
                                                "input pr-32",
                                                errors.captcha && touched.captcha && "border-red-500 focus:border-red-500"
                                            )}
                                            placeholder="请输入验证码"
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            value={values.captcha}
                                            autoComplete="off"
                                        />

                                        <div className="absolute inset-y-0 right-0 flex items-center">
                                            {captchaLoading ? (
                                                <div className="w-24 h-10 flex items-center justify-center">
                                                    <LoaderIcon className="h-4 w-4 animate-spin" />
                                                </div>
                                            ) : (
                                                <div 
                                                    className="relative w-24 h-10 cursor-pointer group"
                                                    onClick={refreshCaptcha}
                                                    title="点击刷新验证码"
                                                >
                                                    <img
                                                        className="w-full h-full object-cover rounded"
                                                        src={captchaImage}
                                                        alt="验证码"
                                                    />
                                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 rounded flex items-center justify-center">
                                                        <RefreshCw className="h-4 w-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    {errors.captcha && touched.captcha && (
                                        <div className="mt-2 text-sm text-red-600 dark:text-red-500">
                                            {errors.captcha}
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <Button
                                        className="w-full"
                                        type="submit"
                                        disabled={!isValid || isSubmitting || resetPasswordMutation.isPending || !captchaKey}
                                    >
                                        {(isSubmitting || resetPasswordMutation.isPending) && (
                                            <LoaderIcon className="mr-2 h-4 w-4 animate-spin"/>
                                        )}
                                        <Lock className="mr-2 h-4 w-4" />
                                        {isSubmitting || resetPasswordMutation.isPending ? '重置中...' : '重置密码'}
                                    </Button>
                                </div>
                            </Form>
                        )}
                    </Formik>
                </div>
            </div>
        </div>
    );
};

export default ResetPasswordPage;
