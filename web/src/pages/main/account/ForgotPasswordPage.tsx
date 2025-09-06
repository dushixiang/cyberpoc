import {useCallback, useState} from 'react';
import {Link, useNavigate} from "react-router-dom";
import {useMutation} from "@tanstack/react-query";
import {Form, Formik, FormikHelpers} from "formik";
import * as Yup from 'yup';
import '../account/custom.css';
import {cn} from "@/lib/utils";
import {Button, buttonVariants} from "@/components/ui/button";
import toast from "react-hot-toast";
import {ForgotPasswordRequest} from "@/types";
import accountApi from "@/api/account-api.ts";
import {useCaptcha} from "@/hooks/useCaptcha";
import {LoaderIcon, RefreshCw, Mail} from "lucide-react";

// 表单验证 schema
const forgotPasswordValidationSchema = Yup.object({
    account: Yup.string()
        .email('请输入有效的邮箱地址')
        .required('请输入邮箱地址'),
    captcha: Yup.string()
        .required('请输入验证码'),
});

const ForgotPasswordPage = () => {
    const navigate = useNavigate();
    const [sent, setSent] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const { captchaKey, captchaImage, isLoading: captchaLoading, refreshCaptcha } = useCaptcha();

    // 使用 useMutation 处理忘记密码
    const forgotPasswordMutation = useMutation({
        mutationFn: (requestData: ForgotPasswordRequest & { captchaKey: string }) => 
            accountApi.forgotPassword(requestData),
        onSuccess: () => {
            setSent(true);
            toast.success('密码重置邮件已发送，请检查您的邮箱');
        },
        onError: (error: any) => {
            setError(error?.message || '发送失败，请重试');
            refreshCaptcha(); // 失败时刷新验证码
        },
    });

    const handleForgotPassword = useCallback(async (
        values: ForgotPasswordRequest,
        { setSubmitting }: FormikHelpers<ForgotPasswordRequest>
    ) => {
        setError('');
        const requestData = { ...values, captchaKey };
        
        try {
            await forgotPasswordMutation.mutateAsync(requestData);
        } finally {
            setSubmitting(false);
        }
    }, [captchaKey, forgotPasswordMutation, refreshCaptcha]);

    if (sent) {
        return (
            <div className="container relative h-screen flex-col items-center justify-center grid">
                <div className="lg:p-8">
                    <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                        <div className="flex flex-col space-y-2 text-center">
                            <h1 className="text-2xl font-semibold tracking-tight">
                                邮件已发送
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                我们已向您的邮箱发送了重置密码链接，请检查您的邮箱并点击链接重置密码。
                            </p>
                        </div>
                        <div className="flex flex-col space-y-2">
                            <Button 
                                onClick={() => navigate('/login')}
                                className="w-full"
                            >
                                返回登录
                            </Button>
                            <Button 
                                variant="outline" 
                                onClick={() => setSent(false)}
                                className="w-full"
                            >
                                重新发送
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
                            忘记密码
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            请输入您的邮箱地址，我们将发送重置密码链接到您的邮箱
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
                            account: '',
                            captcha: '',
                        } as ForgotPasswordRequest}
                        validationSchema={forgotPasswordValidationSchema}
                        onSubmit={handleForgotPassword}
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
                                {/* 邮箱输入 */}
                                <div>
                                    <input 
                                        id="account" 
                                        name="account" 
                                        type="email"
                                        className={cn(
                                            "input",
                                            errors.account && touched.account && "border-red-500 focus:border-red-500"
                                        )}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        value={values.account}
                                        placeholder="请输入您的邮箱地址"
                                        autoComplete="email"
                                    />
                                    {errors.account && touched.account && (
                                        <div className="mt-2 text-sm text-red-600 dark:text-red-500">
                                            {errors.account}
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
                                                    <div className="absolute inset-0 bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 rounded flex items-center justify-center">
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
                                        className="w-full cursor-pointer"
                                        type="submit"
                                        disabled={!isValid || isSubmitting || forgotPasswordMutation.isPending || !captchaKey}
                                    >
                                        {(isSubmitting || forgotPasswordMutation.isPending) && (
                                            <LoaderIcon className="mr-2 h-4 w-4 animate-spin"/>
                                        )}
                                        <Mail className="mr-2 h-4 w-4" />
                                        {isSubmitting || forgotPasswordMutation.isPending ? '发送中...' : '发送重置邮件'}
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

export default ForgotPasswordPage;