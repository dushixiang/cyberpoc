import {useCallback, useState} from 'react';
import {Link, useNavigate} from "react-router-dom";
import {useMutation} from "@tanstack/react-query";
import {Form, Formik, FormikHelpers} from "formik";
import * as Yup from 'yup';
import nothing from '@/assets/nothing.svg';
import logo from '@/assets/logo.svg';
import './custom.css';
import {cn} from "@/lib/utils";
import {Button, buttonVariants} from "@/components/ui/button";
import {Checkbox} from "@/components/ui/checkbox";
import accountApi from "@/api/account-api.ts";
import {LoginAccount} from "@/types";
import {LoaderIcon, RefreshCw} from "lucide-react";
import {setToken} from "@/api/core/requests.ts";
import {useCaptcha} from "@/hooks/useCaptcha";

// 表单验证 schema
const loginValidationSchema = Yup.object({
    account: Yup.string()
        .email('请输入有效的邮箱地址')
        .required('请输入账号'),
    password: Yup.string()
        .required('请输入密码'),
    captcha: Yup.string()
        .required('请输入验证码'),
});

const Login = () => {
    const navigate = useNavigate();
    const [error, setError] = useState<string>('');
    const { captchaKey, captchaImage, isLoading: captchaLoading, refreshCaptcha } = useCaptcha();

    // 使用 useMutation 处理登录
    const loginMutation = useMutation({
        mutationFn: (loginData: LoginAccount & { key: string }) => accountApi.login(loginData),
        onSuccess: (result) => {
            setToken(result.token);
            navigate('/');
        },
        onError: (error: any) => {
            setError(error?.message || '登录失败，请重试');
            refreshCaptcha(); // 登录失败时刷新验证码
        },
    });

    const handleLogin = useCallback(async (
        values: LoginAccount,
        { setSubmitting }: FormikHelpers<LoginAccount>
    ) => {
        setError('');
        const loginData = { ...values, key: captchaKey };
        
        try {
            await loginMutation.mutateAsync(loginData);
        } finally {
            setSubmitting(false);
        }
    }, [captchaKey, loginMutation]);


    return (
        <div
            className="container relative hidden h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
            <Link
                className={cn(
                    buttonVariants({variant: "ghost"}),
                    "absolute right-4 top-4 md:right-8 md:top-8"
                )}
                to={'/register'}
            >
                注册
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
                            &ldquo;我们致力于为您提供一个安全、有趣和具有挑战性的体验，让您在学习和实践中提升您的网络安全技能。&rdquo;
                        </p>
                    </blockquote>
                </div>
            </div>
            <div className="lg:p-8">
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                    <div className="flex flex-col space-y-2 text-center">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            登录
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            请在下方输入您的账号和密码
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
                            password: '',
                            captcha: '',
                        } as LoginAccount}
                        validationSchema={loginValidationSchema}
                        onSubmit={handleLogin}
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
                                        placeholder="请输入您的邮箱"
                                        autoComplete="email"
                                    />
                                    {errors.account && touched.account && (
                                        <div className="mt-2 text-sm text-red-600 dark:text-red-500">
                                            {errors.account}
                                        </div>
                                    )}
                                </div>

                                {/* 密码输入 */}
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
                                        placeholder="请输入您的密码"
                                        autoComplete="current-password"
                                    />
                                    {errors.password && touched.password && (
                                        <div className="mt-2 text-sm text-red-600 dark:text-red-500">
                                            {errors.password}
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
                                        disabled={!isValid || isSubmitting || loginMutation.isPending || !captchaKey}
                                    >
                                        {(isSubmitting || loginMutation.isPending) && (
                                            <LoaderIcon className="mr-2 h-4 w-4 animate-spin"/>
                                        )}
                                        {isSubmitting || loginMutation.isPending ? '登录中...' : '登录'}
                                    </Button>
                                </div>

                                <div className="mt-2 text-right">
                                    <Link
                                        to="/forgot"
                                        className="text-sm text-primary hover:underline"
                                    >
                                        忘记密码？
                                    </Link>
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
                    {/*<Button variant="outline" type="button" asChild>*/}
                    {/*    <a href={'https://github.com/login/oauth/authorize?client_id=3b62b1717b8bab67ecd9&redirect_uri=https://cyberpoc.typesafe.cn/github/auth'}>Github</a>*/}
                    {/*</Button>*/}
                </div>
            </div>
        </div>
    );
};

export default Login;