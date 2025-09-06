import React from 'react';
import {SidebarNav} from "@/components/custom/sidebar-nav";

const sidebarNavItems = [
    {
        title: "个人信息",
        href: "/profile",
    },
    {
        title: "修改密码",
        href: "/password",
    },
]

interface SettingsLayoutProps {
    children: React.ReactNode
}

const SettingsLayout = ({ children }: SettingsLayoutProps) => {
    return (
        <div>
            <header aria-label="Page Header" className="bg-gray-50">
                <div className="mx-auto max-w-screen-xl px-4 py-8 sm:py-8 sm:px-6 lg:px-8">
                    <div className="sm:flex sm:items-center sm:justify-between">
                        <div className="text-center sm:text-left">
                            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                                设置
                            </h1>

                            <p className="mt-1.5 text-sm text-gray-500">

                            </p>
                        </div>

                        <div className="mt-4 flex flex-col gap-4 sm:mt-0 sm:flex-row sm:items-center min-w-max">

                        </div>
                    </div>
                </div>
            </header>

            <div className="mx-auto max-w-screen-xl px-4 py-8 sm:py-12 sm:px-6 lg:px-8">
                <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
                    <aside>
                        <SidebarNav items={sidebarNavItems} />
                    </aside>
                    <div className="min-w-0">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsLayout;