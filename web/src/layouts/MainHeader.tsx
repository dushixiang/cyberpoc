import logo from '@/assets/logo.svg'
import {Link, useNavigate} from "react-router-dom";
import {clearCurrentUser} from "@/utils/permission";
import accountApi from "../api/account-api";
import {Button} from "@/components/ui/button";
import {DropdownMenu} from '@radix-ui/react-dropdown-menu';
import {
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import HeaderNav from "@/components/custom/header-nav.tsx";
import {useQuery, useQueryClient} from "@tanstack/react-query";
import {LoaderIcon} from "lucide-react";

const headerNavItems = [
    {
        title: "源码审计",
        href: "/",
    },
    {
        title: "排行榜",
        href: "/rank",
    },
    {
        title: "FAQ",
        href: "/faq",
    },
]

const MainHeader = () => {

    let navigate = useNavigate();
    const queryClient = useQueryClient();

    // 使用 react-query 获取用户信息
    const {data: user, isLoading, error} = useQuery({
        queryKey: ['userInfo'],
        queryFn: accountApi.getInfoWithNoRedirect,
        retry: false,
        refetchOnWindowFocus: false,
        staleTime: 5 * 60 * 1000, // 5分钟内不重新获取
    });

    const renderUserInfo = () => {
        // 如果正在加载，显示加载状态
        if (isLoading) {
            return <div className="hidden flex-1 items-center justify-end space-x-2 sm:flex">
                <LoaderIcon className="h-4 w-4 animate-spin"/>
            </div>;
        }

        // 如果有错误或者没有用户信息，显示登录注册按钮
        if (error || !user) {
            return <div className="hidden flex-1 items-center justify-end space-x-2 sm:flex">
                <Button size='sm' asChild variant={'secondary'}>
                    <Link to="/register">
                        注册
                    </Link>
                </Button>

                <Button size='sm' asChild>
                    <Link to="/login">
                        登录
                    </Link>
                </Button>
            </div>;
        }

        return <div className="hidden flex-1 items-center justify-end space-x-1 sm:flex">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <div className={'flex space-x-2'}>
                        <Button variant='link' size='sm' asChild>
                            <Link to="/profile">
                                {user.name}
                            </Link>
                        </Button>
                        <Avatar className={'w-8 h-8'}>
                            <AvatarImage src={user.avatar} alt="@cyberpoc"/>
                            <AvatarFallback>CN</AvatarFallback>
                        </Avatar>
                    </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                    <DropdownMenuLabel>{user.account}</DropdownMenuLabel>
                    <DropdownMenuSeparator/>
                    <DropdownMenuGroup>
                        <DropdownMenuItem>
                            <Link to={'/profile'}>
                                个人信息
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <Link to={'/password'}>
                                修改密码
                            </Link>
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator/>
                    <DropdownMenuItem onClick={logout}>
                        退出
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    }

    const logout = async () => {
        try {
            await accountApi.logout();
            clearCurrentUser();
            // 清除用户信息查询缓存
            queryClient.removeQueries({queryKey: ['userInfo']});
            // 清除所有查询缓存（可选，根据需要）
            queryClient.clear();
            navigate('/');
        } catch (error) {
            console.error('Logout failed:', error);
            // 即使登出失败，也清除本地状态
            clearCurrentUser();
            queryClient.removeQueries({queryKey: ['userInfo']});
            navigate('/');
        }
    }

    return (
        <div>
            <header aria-label="Site Header" className="shadow-sm">
                <div className="mx-auto max-w-screen-xl p-4">
                    <div className="flex items-center justify-between gap-4 lg:gap-10">
                        <div className="flex">
                            <Link to="/">
                                <span className="sr-only">Logo</span>
                                <img src={logo} alt={'logo'} width={100}/>
                            </Link>
                        </div>

                        <HeaderNav items={headerNavItems}/>

                        {renderUserInfo()}
                    </div>
                </div>
            </header>
        </div>
    );
};

export default MainHeader;