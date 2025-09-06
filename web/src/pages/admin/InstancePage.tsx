import React, {useRef, useState} from 'react';
import {Layout, message, Popconfirm, Table, Tag} from "antd";
import {ActionType, ProColumns, ProTable} from "@ant-design/pro-components";
import {DesktopOutlined, ExclamationCircleOutlined, LoadingOutlined} from "@ant-design/icons";
import instanceApi from "@/api/instance-api.ts";
import {InstanceDetail} from "@/types/instance.ts";

const InstancePage: React.FC = () => {
    const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);

    const actionRef = useRef<ActionType>();

    // 处理销毁实例
    const handleDestroy = async (record: InstanceDetail) => {
        try {
            await instanceApi.destroyById(record.id);
            message.success('实例销毁成功');
            actionRef.current?.reload();
        } catch (error) {
            message.error('实例销毁失败');
        }
    };

    // 渲染状态标签
    const renderStatus = (status: InstanceDetail['status']) => {
        switch (status) {
            case 'creating':
                return <Tag color="processing" icon={<LoadingOutlined/>}>创建中</Tag>;
            case 'create-failure':
                return <Tag color="error" icon={<ExclamationCircleOutlined/>}>创建失败</Tag>;
            case 'created':
                return <Tag color="success" icon={<DesktopOutlined/>}>已创建</Tag>;
            case 'running':
                return <Tag color="success" icon={<DesktopOutlined/>}>运行中</Tag>;
            case 'deleting':
                return <Tag color="processing" icon={<LoadingOutlined/>}>删除中</Tag>;
            case 'delete-failure':
                return <Tag color="error" icon={<ExclamationCircleOutlined/>}>删除失败</Tag>;
            default:
                return <Tag color="default">{status}</Tag>;
        }
    };

    const columns: ProColumns<InstanceDetail>[] = [
        {
            dataIndex: 'index',
            valueType: 'indexBorder',
            width: 48,
        },
        {
            title: '题目名称',
            dataIndex: 'challenge_name',
            key: 'challenge_name',
            sorter: true,
            ellipsis: true,
            copyable: true,
        },
        {
            title: 'FLAG',
            dataIndex: 'flag',
            key: 'flag',
            hideInSearch: true,
            ellipsis: true,
            copyable: true,
        },
        {
            title: 'CPU限制',
            dataIndex: 'cpu_limit',
            key: 'cpu_limit',
            hideInSearch: true,
            render: (cpu_limit: number) => `${cpu_limit} 核`,
        },
        {
            title: '内存限制',
            dataIndex: 'memory_limit',
            key: 'memory_limit',
            hideInSearch: true,
            render: (memory_limit: number) => `${memory_limit} MB`,
        },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            hideInSearch: true,
            render: (_, record) => renderStatus(record.status),
        },
        {
            title: '剩余时长',
            dataIndex: 'expires_at',
            key: 'expires_at',
            hideInSearch: true,
            valueType: 'second',
            renderText: (_, record) => {
                const now = Date.now();
                const remaining = (record.expires_at - now) / 1000;
                return Math.max(0, remaining);
            }
        },
        {
            title: '用户信息',
            dataIndex: 'user_name',
            key: 'user_name',
            hideInSearch: true,
            width: 200,
            render: (user_name: string, record) => (
                <div>
                    <div>{user_name}</div>
                    <div className="text-gray-500 text-sm">{record.user_id}</div>
                </div>
            ),
        },
        {
            title: '访问地址',
            dataIndex: 'access_url',
            key: 'access_url',
            hideInSearch: true,
            ellipsis: true,
            render: (access_url: string) =>
                access_url ? (
                    <a href={access_url} target="_blank" rel="noopener noreferrer">
                        {access_url}
                    </a>
                ) : '-',
        },
        {
            title: '创建时间',
            key: 'created_at',
            dataIndex: 'created_at',
            valueType: 'dateTime',
            hideInSearch: true,
            sorter: true,
        },
        {
            title: '操作',
            valueType: 'option',
            key: 'option',
            width: 80,
            render: (_, record) => [
                <Popconfirm
                    key="destroy"
                    title="确认销毁"
                    description="您确认要销毁此实例吗？此操作不可恢复。"
                    onConfirm={() => handleDestroy(record)}
                    okText="确认"
                    cancelText="取消"
                >
                    <a className="text-red-500">销毁</a>
                </Popconfirm>
            ],
        },
    ];

    // 处理表格请求
    const handleRequest = async (params: any = {}, sort: any) => {
        try {
            let field = '';
            let order = '';
            if (Object.keys(sort).length > 0) {
                field = Object.keys(sort)[0];
                order = Object.values(sort)[0] as string;
            }

            const queryParams = {
                pageIndex: params.current,
                pageSize: params.pageSize,
                name: params.name,
                user_name: params.user_name,
                challenge_name: params.challenge_name,
                status: params.status,
                field: field,
                order: order,
            };

            const result = await instanceApi.getPaging(queryParams);
            return {
                data: result.items,
                success: true,
                total: result.total,
            };
        } catch (error) {
            message.error('获取数据失败');
            return {
                data: [],
                success: false,
                total: 0,
            };
        }
    };

    return (
        <Layout.Content className="page-container">
            <ProTable<InstanceDetail>
                columns={columns}
                actionRef={actionRef}
                rowSelection={{
                    selections: [Table.SELECTION_ALL, Table.SELECTION_INVERT],
                    selectedRowKeys: selectedRowKeys,
                    onChange: (keys: React.Key[]) => {
                        setSelectedRowKeys(keys as string[]);
                    },
                }}
                request={handleRequest}
                rowKey="id"
                search={{
                    labelWidth: 'auto',
                }}
                pagination={{
                    defaultPageSize: 10,
                    showSizeChanger: true,
                    showQuickJumper: true,
                }}
                form={{
                    syncToUrl: true,
                    syncToInitialValues: true,
                }}
                dateFormatter="string"
                headerTitle="实例管理"
                toolBarRender={() => []}
                polling={2000}
            />
        </Layout.Content>
    );
};

export default InstancePage;