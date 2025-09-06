import React, {useRef} from 'react';
import {ProColumns, ProTable, ActionType} from "@ant-design/pro-components";
import solveApi from "@/api/solve-api.ts";
import {Solve} from "@/types";
import {Breadcrumb, Button, message, Modal, Space, Tag, Typography, Avatar} from "antd";
import {ExclamationCircleOutlined, ReloadOutlined, ToolOutlined} from "@ant-design/icons";

const {Text} = Typography;

const SolvePage: React.FC = () => {
    const actionRef = useRef<ActionType>();

    const columns: ProColumns<Solve>[] = [
        {
            title: '序号',
            dataIndex: 'index',
            valueType: 'indexBorder',
            width: 48,
        },
        {
            title: '用户',
            dataIndex: 'user_name',
            width: 200,
            render: (_, record) => (
                <div className='flex items-center gap-2'>
                    <Avatar 
                        size="small" 
                        src={record.user_avatar} 
                        alt={record.user_name}
                    />
                    <Text strong>{record.user_name}</Text>
                </div>
            ),
            hideInSearch: true,
        },
        {
            title: '题目',
            dataIndex: 'challenge_name',
            width: 200,
            render: (_, record) => (
                <Text>{record.challenge_name}</Text>
            ),
            hideInSearch: true,
        },
        {
            title: '积分',
            dataIndex: 'points',
            width: 100,
            render: (_, record) => (
                <Tag color="blue">{record.points}</Tag>
            ),
            hideInSearch: true,
        },
        {
            title: '耗时',
            dataIndex: 'used_time_str',
            width: 120,
            render: (_, record) => (
                <Text code>{record.used_time_str}</Text>
            ),
            hideInSearch: true,
        },
        {
            title: '通关时间',
            dataIndex: 'solved_at',
            valueType: 'dateTime',
            width: 180,
            sorter: true,
            hideInSearch: true,
        },
    ];

    const handleRecomputeRanks = () => {
        Modal.confirm({
            title: '确认重新计算排行榜',
            icon: <ExclamationCircleOutlined/>,
            content: (
                <Space direction="vertical">
                    <Text>确定要立即重新计算排行榜吗？</Text>
                    <Text type="secondary">此操作会根据最新的通关记录重新计算所有用户的排名。</Text>
                </Space>
            ),
            okText: '确认计算',
            cancelText: '取消',
            onOk: async () => {
                try {
                    await solveApi.recomputeRanks();
                    message.success('排行榜计算完成');
                } catch (error) {
                    message.error('计算排行榜失败: ' + (error as Error).message);
                }
            }
        });
    };

    const handleFixRecords = () => {
        Modal.confirm({
            title: '确认修复通关记录',
            icon: <ToolOutlined/>,
            content: (
                <Space direction="vertical">
                    <Text>确定要修复通关记录吗？</Text>
                    <Text type="warning">此操作会删除所有对应题目已不存在的通关记录。</Text>
                    <Text type="danger">此操作不可恢复，请谨慎操作！</Text>
                </Space>
            ),
            okText: '确认修复',
            okType: 'danger',
            cancelText: '取消',
            onOk: async () => {
                try {
                    const result = await solveApi.fixRecords();
                    message.success(`修复完成，删除了 ${result.deleted} 条无效记录`);
                    actionRef.current?.reload();
                } catch (error) {
                    message.error('修复通关记录失败: ' + (error as Error).message);
                }
            }
        });
    };

    return (
        <div className="">
            <Breadcrumb
                items={[
                    {
                        title: '首页',
                    },
                    {
                        title: '通关记录管理',
                    },
                ]}
            />
            <div className={'mt-4'}>
                <ProTable<Solve>
                    columns={columns}
                    actionRef={actionRef}
                    cardBordered
                    request={async (params = {}, sort, _) => {
                        let sortField = 'solved_at';
                        let sortOrder = 'desc';
                        if (Object.keys(sort).length > 0) {
                            sortField = Object.keys(sort)[0];
                            sortOrder = Object.values(sort)[0] as string;
                        }

                        const data = await solveApi.getPaging({
                            pageIndex: params.current,
                            pageSize: params.pageSize,
                            sort_field: sortField,
                            sort_order: sortOrder,
                        });

                        return {
                            data: data.items,
                            success: true,
                            total: data.total,
                        };
                    }}
                    editable={{
                        type: 'multiple',
                    }}
                    columnsState={{
                        persistenceKey: 'solve-table',
                        persistenceType: 'localStorage',
                    }}
                    rowKey="id"
                    search={false}
                    dateFormatter="string"
                    headerTitle="通关记录"
                    toolBarRender={() => [
                        <Button
                            key="recompute"
                            type="primary"
                            icon={<ReloadOutlined/>}
                            onClick={handleRecomputeRanks}
                        >
                            立即计算排行榜
                        </Button>,
                        <Button
                            key="fix"
                            danger
                            icon={<ToolOutlined/>}
                            onClick={handleFixRecords}
                        >
                            修复通关记录
                        </Button>,
                    ]}
                    pagination={{
                        pageSize: 20,
                        showSizeChanger: true,
                    }}
                />
            </div>
        </div>
    );
};

export default SolvePage;