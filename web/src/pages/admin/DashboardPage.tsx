import React from 'react';
import {useQuery} from "@tanstack/react-query";
import dashboardApi, {DashboardStats} from "@/api/dashboard-api.ts";

const Card: React.FC<{title: string, value: number | string}> = ({title, value}) => (
    <div className="border p-4 rounded-md">
        <div className="text-sm text-gray-500">{title}</div>
        <div className="text-2xl font-bold mt-2">{value}</div>
    </div>
)

const DashboardPage: React.FC = () => {
    const query = useQuery<DashboardStats>({
        queryKey: ['dashboard-stats'],
        queryFn: () => dashboardApi.getStats(),
        refetchInterval: 30000,
    });

    const stats = query.data || {} as DashboardStats;

    return (
        <div className="p-4 bg-white rounded-md">
            <div className="text-xl font-bold mb-4">看板</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <Card title="题目总数" value={stats.challenges || 0}/>
                <Card title="实例总数" value={stats.instances || 0}/>
                <Card title="运行中实例" value={stats.running_instances || 0}/>
                <Card title="通关总数" value={stats.solves || 0}/>
            </div>
        </div>
    );
};

export default DashboardPage;