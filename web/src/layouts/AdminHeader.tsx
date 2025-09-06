import {Dropdown, Menu, MenuProps} from "antd";
import {Link, useLocation} from "react-router-dom";
import {useQuery} from "@tanstack/react-query";
import accountApi from "@/api/account-api.ts";

const AdminHeader = () => {
    let location = useLocation();
    let pathname = location.pathname;

    let userQuery = useQuery({
        queryKey: ['userinfo'],
        queryFn: accountApi.getInfo,
    });

    const items: MenuProps['items'] = [
        {
            key: 'logout',
            danger: true,
            label: (
                <div onClick={() => {
                    accountApi.logout().then(() => userQuery.refetch());
                }}>
                    退出登陆
                </div>
            ),
        },
    ];

    return (
        <div className={'w-full bg-[#001628] '}>
            <div className={'flex items-center max-w-screen-xl mx-auto h-16'}>
                <img src={new URL('@/assets/logo.svg', import.meta.url).href} alt={'Logo'} className={'h-10 w-24'}/>
                <div className={'flex-grow'}>
                    <Menu mode='horizontal'
                          theme={'dark'}
                          selectedKeys={[pathname]}
                          style={{
                              height: 50,
                          }}
                          items={[
                              {
                                  label: <Link to={'/adm/dashboard'}>看板</Link>,
                                  key: '/adm/dashboard',
                              },
                              {
                                  label: <Link to={'/adm/image'}>镜像管理</Link>,
                                  key: '/adm/image',
                              },
                              {
                                  label: <Link to={'/adm/challenge'}>题目管理</Link>,
                                  key: '/adm/challenge',
                              },
                              {
                                  label: <Link to={'/adm/instance'}>环境管理</Link>,
                                  key: '/adm/instance',
                              },
                              {
                                  label: <Link to={'/adm/challenge-record'}>挑战记录</Link>,
                                  key: '/adm/challenge-record',
                              },
                              {
                                  label: <Link to={'/adm/solve'}>通关记录</Link>,
                                  key: '/adm/solve',
                              },
                              {
                                  label: <Link to={'/adm/user'}>用户管理</Link>,
                                  key: '/adm/user',
                              },
                              {
                                  label: <Link to={'/adm/login-log'}>登录日志</Link>,
                                  key: '/adm/login-log',
                              },
                              {
                                  label: <Link to={'/adm/setting'}>系统设置</Link>,
                                  key: '/adm/setting',
                              },
                          ]}
                    />
                </div>

                <div className={'cursor-pointer text-white'}>
                    <Dropdown menu={{items}}>
                        <div className={'text-center flex items-center justify-center h-16'}>
                            {userQuery.data?.name}
                        </div>
                    </Dropdown>
                </div>
            </div>
        </div>
    );
};

export default AdminHeader;