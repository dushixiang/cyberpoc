import {Suspense} from "react";
import {Outlet} from "react-router-dom";
import {App as AntdApp, ConfigProvider} from "antd";
import {StyleProvider} from '@ant-design/cssinjs';
import AdminHeader from "@/layouts/AdminHeader.tsx";
import AdminFooter from "@/layouts/AdminFooter.tsx";

const AdminLayout = () => {
    return (
        <StyleProvider hashPriority="high">
            <ConfigProvider theme={{}}>
                <AntdApp>
                    <div className={'min-h-screen flex flex-col bg-[#F2F3F5]'}>
                        <AdminHeader/>
                        <div className={'flex-grow'}>
                            <div className={'max-w-screen-xl mx-auto py-4'}>
                                <Suspense>
                                    <Outlet/>
                                </Suspense>
                            </div>
                        </div>
                        <AdminFooter/>
                    </div>
                </AntdApp>
            </ConfigProvider>
        </StyleProvider>
    );
};

export default AdminLayout;