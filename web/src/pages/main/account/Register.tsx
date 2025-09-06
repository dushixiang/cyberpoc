import {useCallback, useState} from 'react';
import {Link, useNavigate} from "react-router-dom";
import {useMutation} from "@tanstack/react-query";
import {Form, Formik, FormikHelpers} from "formik";
import * as Yup from 'yup';
import './custom.css';
import toast from "react-hot-toast";
import {cn} from "@/lib/utils";
import {Button, buttonVariants} from "@/components/ui/button";
import nothing from "@/assets/nothing.svg";
import logo from "@/assets/logo.svg";
import {Checkbox} from "@/components/ui/checkbox";
import accountApi from "@/api/account-api.ts";
import {RegisterAccount} from "@/types";
import {LoaderIcon, Mail, RefreshCw} from "lucide-react";
import {useCaptcha} from "@/hooks/useCaptcha";
import {useEmailCode} from "@/hooks/useEmailCode";

// 表单验证 schema
const registerValidationSchema = Yup.object({
    account: Yup.string()
        .email('请输入有效的邮箱地址')
        .required('请输入邮箱'),
    code: Yup.string()
        .required('请输入邮箱验证码')
        .length(6, '验证码应为6位数字'),
    name: Yup.string()
        .required('请输入姓名')
        .min(2, '姓名至少需要2个字符')
        .max(32, '姓名不能超过32个字符'),
    password: Yup.string()
        .required('请输入密码')
        .min(6, '密码至少需要6位')
        .matches(/^(?=.*[a-zA-Z])(?=.*\d)/, '密码必须包含字母和数字'),
    captcha: Yup.string()
        .required('请输入验证码'),
});

const Register = () => {
    const navigate = useNavigate();
    const [error, setError] = useState<string>('');
    const {captchaKey, captchaImage, isLoading: captchaLoading, refreshCaptcha} = useCaptcha();
    const {sendCode, buttonText, isReady: emailCodeReady, isLoading: emailCodeLoading} = useEmailCode();

    // 使用 useMutation 处理注册
    const registerMutation = useMutation({
        mutationFn: (registerData: RegisterAccount & { key: string }) => accountApi.register(registerData),
        onSuccess: () => {
            toast.success('注册成功，即将跳转登录页面');
            setTimeout(() => {
                navigate('/login');
            }, 1000);
        },
        onError: (error: any) => {
            setError(error?.message || '注册失败，请重试');
            refreshCaptcha(); // 注册失败时刷新验证码
        },
    });

    const handleRegister = useCallback(async (
        values: RegisterAccount,
        {setSubmitting}: FormikHelpers<RegisterAccount>
    ) => {
        setError('');
        const registerData = {...values, key: captchaKey};

        try {
            await registerMutation.mutateAsync(registerData);
        } finally {
            setSubmitting(false);
        }
    }, [captchaKey, registerMutation, refreshCaptcha]);

    const handleSendEmailCode = useCallback((email: string) => {
        if (!email) {
            toast.error('请先输入邮箱地址');
            return;
        }
        sendCode(email);
    }, [sendCode]);


    return (
        <div
            className="container relative hidden h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
            <Link
                className={cn(
                    buttonVariants({variant: "ghost"}),
                    "absolute right-4 top-4 md:right-8 md:top-8"
                )}
                to={'/login'}
            >
                登录
            </Link>
            <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
                <div className="absolute inset-0 bg-zinc-900 flex items-center justify-center">
                    <img width={400} src={nothing} alt={'bg'}/>
                </div>
                <div className="relative z-20 flex items-center text-lg font-medium">
                    <img src={logo} alt={'logo'} width={100}/>
                </div>
                <div className="relative z-20 mt-auto">
                    <blockquote className="space-y-2">
                        <p className="text-lg">
                            &ldquo;我们的平台提供了多种不同类型的挑战，包括密码学、二进制、网络和Web应用程序漏洞等。您可以在这些挑战中发现漏洞、解密密码和破解加密算法，这将有助于您提高对网络安全的了解和认识。&rdquo;
                        </p>
                    </blockquote>
                </div>
            </div>
            <div className="lg:p-8">
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                    <div className="flex flex-col space-y-2 text-center">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            注册
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            创建您的账户以开始网络安全挑战之旅
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
                            code: '',
                            name: '',
                            password: '',
                            captcha: '',
                        } as RegisterAccount}
                        validationSchema={registerValidationSchema}
                        onSubmit={handleRegister}
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
                                    <label htmlFor="account" className="sr-only">邮箱</label>
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
                                        placeholder="请输入您的邮箱"
                                        autoComplete="email"
                                    />
                                    {errors.account && touched.account && (
                                        <div className="mt-2 text-sm text-red-600 dark:text-red-500">
                                            {errors.account}
                                        </div>
                                    )}
                                </div>

                                {/* 邮箱验证码输入 */}
                                <div>
                                    <label htmlFor="code" className="sr-only">邮箱验证码</label>
                                    <div className="relative">
                                        <input
                                            id="code"
                                            name="code"
                                            type="text"
                                            className={cn(
                                                "input pr-32",
                                                errors.code && touched.code && "border-red-500 focus:border-red-500"
                                            )}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            value={values.code}
                                            placeholder="请输入6位邮箱验证码"
                                            maxLength={6}
                                            autoComplete="off"
                                        />

                                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className={cn(
                                                    "text-xs h-8 px-3",
                                                    !emailCodeReady && "text-muted-foreground"
                                                )}
                                                disabled={!emailCodeReady || emailCodeLoading || !values.account}
                                                onClick={() => handleSendEmailCode(values.account)}
                                            >
                                                {emailCodeLoading && (
                                                    <LoaderIcon className="mr-1 h-3 w-3 animate-spin"/>
                                                )}
                                                <Mail className="mr-1 h-3 w-3"/>
                                                {buttonText}
                                            </Button>
                                        </div>
                                    </div>
                                    {errors.code && touched.code && (
                                        <div className="mt-2 text-sm text-red-600 dark:text-red-500">
                                            {errors.code}
                                        </div>
                                    )}
                                </div>

                                {/* 姓名输入 */}
                                <div>
                                    <label htmlFor="name" className="sr-only">姓名</label>
                                    <input
                                        id="name"
                                        name="name"
                                        type="text"
                                        className={cn(
                                            "input",
                                            errors.name && touched.name && "border-red-500 focus:border-red-500"
                                        )}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        value={values.name}
                                        placeholder="请输入您的姓名"
                                        autoComplete="name"
                                    />
                                    {errors.name && touched.name && (
                                        <div className="mt-2 text-sm text-red-600 dark:text-red-500">
                                            {errors.name}
                                        </div>
                                    )}
                                </div>

                                {/* 密码输入 */}
                                <div>
                                    <label htmlFor="password" className="sr-only">密码</label>
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
                                        placeholder="请输入密码（至少6位，包含字母和数字）"
                                        autoComplete="new-password"
                                    />
                                    {errors.password && touched.password && (
                                        <div className="mt-2 text-sm text-red-600 dark:text-red-500">
                                            {errors.password}
                                        </div>
                                    )}
                                </div>

                                {/* 验证码输入 */}
                                <div>
                                    <label htmlFor="captcha" className="sr-only">验证码</label>
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
                                                    <LoaderIcon className="h-4 w-4 animate-spin"/>
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
                                                    <div
                                                        className="absolute inset-0 bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 rounded flex items-center justify-center">
                                                        <RefreshCw
                                                            className="h-4 w-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200"/>
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
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="terms-and-privacy" required/>
                                    <label
                                        htmlFor="terms-and-privacy"
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                        我已阅读并同意 <Link
                                        to="/terms"
                                        className="underline underline-offset-4 hover:text-primary"
                                    >
                                        服务条款
                                    </Link>{" "}
                                        和{" "}
                                        <Link
                                            to="/privacy"
                                            className="underline underline-offset-4 hover:text-primary"
                                        >
                                            隐私政策
                                        </Link>
                                    </label>
                                </div>
                                <div>
                                    <Button
                                        className="w-full cursor-pointer"
                                        type="submit"
                                        disabled={!isValid || isSubmitting || registerMutation.isPending || !captchaKey}
                                    >
                                        {(isSubmitting || registerMutation.isPending) && (
                                            <LoaderIcon className="mr-2 h-4 w-4 animate-spin"/>
                                        )}
                                        {isSubmitting || registerMutation.isPending ? '注册中...' : '注册'}
                                    </Button>
                                </div>
                            </Form>
                        )}
                    </Formik>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t"/>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
                        </div>
                    </div>
                    {/*<Button variant="outline" type="button" asChild >*/}
                    {/*    <a href={'https://github.com/login/oauth/authorize?client_id=3b62b1717b8bab67ecd9&redirect_uri=https://cyberpoc.typesafe.cn/github/auth'}>Github</a>*/}
                    {/*</Button>*/}
                </div>
            </div>
        </div>
    );
};

export default Register;