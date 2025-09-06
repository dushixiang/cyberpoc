import './App.css'
import {createBrowserRouter, RouterProvider} from "react-router-dom";
import {lazy, Suspense} from "react";
import NavigationPage from "@/pages/admin/NavigationPage.tsx";

// 懒加载布局组件
const AdminLayout = lazy(() => import("@/layouts/AdminLayout.tsx"));
const MainLayout = lazy(() => import("@/layouts/MainLayout.tsx"));

// 懒加载管理员页面
const DashboardPage = lazy(() => import("@/pages/admin/DashboardPage.tsx"));
const LoginLogPage = lazy(() => import("@/pages/admin/LoginLogPage.tsx"));
const SettingPage = lazy(() => import("@/pages/admin/SettingPage.tsx"));
const UserPage = lazy(() => import("@/pages/admin/UserPage.tsx"));
const ImagePage = lazy(() => import("@/pages/admin/ImagePage.tsx"));
const ChallengePage = lazy(() => import("@/pages/admin/ChallengePage.tsx"));
const InstancePage = lazy(() => import("@/pages/admin/InstancePage.tsx"));
const ChallengeRecordPage = lazy(() => import("@/pages/admin/ChallengeRecordPage.tsx"));
const SolvePage = lazy(() => import("@/pages/admin/SolvePage.tsx"));

// 懒加载主要页面
const FAQ = lazy(() => import("@/pages/main/faq/FAQ.tsx"));
const Terms = lazy(() => import("@/pages/main/faq/Terms.tsx"));
const Privacy = lazy(() => import("@/pages/main/faq/Privacy.tsx"));
const Login = lazy(() => import("@/pages/main/account/Login.tsx"));
const Register = lazy(() => import("@/pages/main/account/Register.tsx"));
const Challenge = lazy(() => import("@/pages/main/challenge/Challenge.tsx"));
const ChallengeDetailPage = lazy(() => import("@/pages/main/challenge/ChallengeDetailPage.tsx"));
const Rank = lazy(() => import("@/pages/main/rank/Rank.tsx"));
const ProfilePage = lazy(() => import("@/pages/main/account/ProfilePage.tsx"));
const PasswordPage = lazy(() => import("@/pages/main/account/PasswordPage.tsx"));
const ForgotPasswordPage = lazy(() => import("@/pages/main/account/ForgotPasswordPage.tsx"));
const ResetPasswordPage = lazy(() => import("@/pages/main/account/ResetPasswordPage.tsx"));

// 加载组件包装器
const LazyWrapper = ({ children }: { children: React.ReactNode }) => (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>}>
        {children}
    </Suspense>
);

const router = createBrowserRouter([
    {
        path: '/login',
        element: <LazyWrapper><Login/></LazyWrapper>
    },
    {
        path: '/register',
        element: <LazyWrapper><Register/></LazyWrapper>
    },
    {
        path: '/forgot',
        element: <LazyWrapper><ForgotPasswordPage/></LazyWrapper>
    },
    {
        path: '/reset/:token',
        element: <LazyWrapper><ResetPasswordPage/></LazyWrapper>
    },
    {
        element: <LazyWrapper><AdminLayout/></LazyWrapper>,
        children: [
            {path: `/adm`, element: <NavigationPage/>},
            {path: `/adm/dashboard`, element: <LazyWrapper><DashboardPage/></LazyWrapper>},
            {path: `/adm/user`, element: <LazyWrapper><UserPage/></LazyWrapper>},
            {path: `/adm/image`, element: <LazyWrapper><ImagePage/></LazyWrapper>},
            {path: `/adm/challenge`, element: <LazyWrapper><ChallengePage/></LazyWrapper>},
            {path: `/adm/instance`, element: <LazyWrapper><InstancePage/></LazyWrapper>},
            {path: `/adm/challenge-record`, element: <LazyWrapper><ChallengeRecordPage/></LazyWrapper>},
            {path: `/adm/solve`, element: <LazyWrapper><SolvePage/></LazyWrapper>},
            {path: `/adm/login-log`, element: <LazyWrapper><LoginLogPage/></LazyWrapper>},
            {path: `/adm/setting`, element: <LazyWrapper><SettingPage/></LazyWrapper>},
        ]
    },
    {
        path: `/`,
        element: <LazyWrapper><MainLayout/></LazyWrapper>,
        children: [
            {
                index: true,
                path: "/",
                element: <LazyWrapper><Challenge type={'code-audit'}/></LazyWrapper>,
            },
            {
                index: true,
                path: "/vulnerability",
                element: <LazyWrapper><Challenge type={'vul-recurrence'}/></LazyWrapper>,
            },
            {
                path: "/challenges/:challengeId",
                element: <LazyWrapper><ChallengeDetailPage/></LazyWrapper>,
            },
            {
                path: "/rank",
                element: <LazyWrapper><Rank/></LazyWrapper>,
            },
            {
                path: "/faq",
                element: <LazyWrapper><FAQ/></LazyWrapper>,
            },
            {
                path: "/terms",
                element: <LazyWrapper><Terms/></LazyWrapper>,
            },
            {
                path: "/privacy",
                element: <LazyWrapper><Privacy/></LazyWrapper>,
            },
            {
                path: "/profile",
                element: <LazyWrapper><ProfilePage/></LazyWrapper>,
            },
            {
                path: "/password",
                element: <LazyWrapper><PasswordPage/></LazyWrapper>,
            },
        ]
    }
    // {path: "/no-permission", element: <NoPermissionPage/>},

]);

function App() {

    return (
        <>
            <RouterProvider router={router}/>
        </>
    )
}

export default App
