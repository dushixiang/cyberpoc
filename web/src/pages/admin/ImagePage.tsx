import React, { useRef, useState, useEffect } from 'react';
import { Button, Layout, message, Popconfirm, Table, Tag, Space } from "antd";
import { ActionType, ProColumns, ProTable } from "@ant-design/pro-components";
import { PlusOutlined } from "@ant-design/icons";
import ImageModal from "./ImageModal.tsx";
import imageApi from "../../api/image-api.ts";
import { ImageCreateRequest, ImageDetail, ImageUpdateRequest } from "@/types/image.ts";

const ImagePage: React.FC = () => {
    const [open, setOpen] = useState<boolean>(false);
    const [confirmLoading, setConfirmLoading] = useState<boolean>(false);
    const [selectedRowKey, setSelectedRowKey] = useState<string>('');
    const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
    const [autoRefresh, setAutoRefresh] = useState<boolean>(false);

    const actionRef = useRef<ActionType>();

    // 自动刷新逻辑
    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;
        if (autoRefresh) {
            interval = setInterval(() => {
                actionRef.current?.reload();
            }, 3000); // 每3秒刷新一次
        }
        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [autoRefresh]);

    // 处理编辑
    const handleEdit = (record: ImageDetail) => {
        setOpen(true);
        setSelectedRowKey(record.id || '');
    };

    // 处理删除
    const handleDelete = async (record: ImageDetail) => {
        try {
            await imageApi.deleteById(record.id!);
            message.success('删除成功');
            actionRef.current?.reload();
        } catch (error) {
            message.error('删除失败');
        }
    };

    // 处理单个镜像同步
    const handleSync = async (record: ImageDetail) => {
        try {
            await imageApi.syncById(record.id!);
            message.success('同步成功');
            actionRef.current?.reload();
        } catch (error) {
            message.error('同步失败');
        }
    };

    // 处理单个镜像拉取
    const handlePull = async (record: ImageDetail) => {
        try {
            await imageApi.pullById(record.id!);
            message.success('已开始拉取镜像');
            setAutoRefresh(true); // 开启自动刷新
            actionRef.current?.reload();
        } catch (error) {
            message.error('拉取失败');
        }
    };

    // 渲染状态标签（适配新的状态集合）
    const renderStatus = (status: ImageDetail['status']) => {
        switch (status) {
            case 'ready':
                return <Tag color="success">可用</Tag>;
            case 'missing':
                return <Tag color="error">不存在</Tag>;
            case 'pulling':
                return <Tag color="processing">拉取中</Tag>;
            case 'failed':
                return <Tag color="error">失败</Tag>;
            case 'deleting':
                return <Tag color="warning">删除中</Tag>;
            case 'verifying':
                return <Tag color="default">校验中</Tag>;
            case 'unknown':
            default:
                return <Tag color="default">未知</Tag>;
        }
    };

    const columns: ProColumns<ImageDetail>[] = [
        {
            dataIndex: 'index',
            valueType: 'indexBorder',
            width: 48,
        },
        {
            title: '镜像名称',
            dataIndex: 'name',
            key: 'name',
            sorter: true,
            ellipsis: true,
            copyable: true,
        },
        {
            title: '仓库地址',
            dataIndex: 'registry',
            key: 'registry',
            sorter: true,
            ellipsis: true,
            copyable: true,
        },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            hideInSearch: true,
            render: (_, record) => renderStatus(record.status),
            width: 80,
        },
        {
            title: 'CPU限制',
            dataIndex: 'cpu_limit',
            key: 'cpu_limit',
            hideInSearch: true,
            render: (cpu_limit: number) => `${cpu_limit} 核`,
            sorter: true,
            width: 100,
        },
        {
            title: '内存限制',
            dataIndex: 'memory_limit',
            key: 'memory_limit',
            hideInSearch: true,
            render: (memory_limit: number) => `${memory_limit} MB`,
            sorter: true,
            width: 100,
        },
        {
            title: '暴露端口',
            dataIndex: 'exposed',
            key: 'exposed',
            hideInSearch: true,
            ellipsis: true,
            width: 100,
        },
        {
            title: '描述',
            dataIndex: 'description',
            key: 'description',
            hideInSearch: true,
            ellipsis: true,
            // width: 200,
        },
        {
            title: '创建时间',
            key: 'created_at',
            dataIndex: 'created_at',
            valueType: 'dateTime',
            hideInSearch: true,
            sorter: true,
            width: 180,
        },
        {
            title: '操作',
            valueType: 'option',
            key: 'option',
            width: 180,
            render: (_, record) => (
                <Space size="small">
                    <Button
                        type="link"
                        size="small"
                        onClick={() => handleSync(record)}
                        style={{
                            margin: 0,
                            padding: 0,
                        }}
                    >
                        同步
                    </Button>
                    <Button
                        type="link"
                        size="small"
                        onClick={() => handlePull(record)}
                        disabled={record.status === 'pulling'}
                        style={{
                            margin: 0,
                            padding: 0,
                        }}
                    >
                        拉取
                    </Button>
                    <Button
                        type="link"
                        size="small"
                        onClick={() => handleEdit(record)}
                        style={{
                            margin: 0,
                            padding: 0,
                        }}
                    >
                        编辑
                    </Button>
                    <Popconfirm
                        title="确认删除"
                        description="您确认要删除这个镜像吗？此操作不可恢复。"
                        onConfirm={() => handleDelete(record)}
                        okText="确认"
                        cancelText="取消"
                    >
                        <Button
                            type="link"
                            size="small"
                            danger
                            style={{
                                margin: 0,
                                padding: 0,
                            }}
                        >
                            删除
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    // 处理表格请求
    const handleRequest = async (params: any = {}, sort: any) => {
        try {
            let sortField = 'created_at';
            let sortOrder = 'desc';
            if (Object.keys(sort).length > 0) {
                sortField = Object.keys(sort)[0];
                sortOrder = Object.values(sort)[0] as string;
            }

            const queryParams = {
                pageIndex: params.current,
                pageSize: params.pageSize,
                name: params.name,
                sortField: sortField,
                sortOrder: sortOrder,
            };

            const result = await imageApi.getPaging(queryParams);
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

    // 处理模态框确认
    const handleModalOk = async (values: ImageCreateRequest | ImageUpdateRequest) => {
        setConfirmLoading(true);
        try {
            if ('id' in values && values.id) {
                await imageApi.updateById(values.id, values as ImageUpdateRequest);
                message.success('镜像更新成功');
            } else {
                await imageApi.create(values as ImageCreateRequest);
                message.success('镜像创建成功');
            }
            setOpen(false);
            setSelectedRowKey('');
            actionRef.current?.reload();
            return true;
        } catch (error) {
            message.error('操作失败');
            return false;
        } finally {
            setConfirmLoading(false);
        }
    };

    // 处理模态框取消
    const handleModalCancel = () => {
        setOpen(false);
        setSelectedRowKey('');
    };

    // 处理新建
    const handleCreate = () => {
        setOpen(true);
        setSelectedRowKey('');
    };

    return (
        <Layout.Content className="page-container">
            <ProTable<ImageDetail>
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
                headerTitle="镜像管理"
                toolBarRender={() => [
                    <Button
                        key="create"
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleCreate}
                    >
                        新建镜像
                    </Button>,
                    <Button
                        key="auto-refresh"
                        type={autoRefresh ? "primary" : "default"}
                        onClick={() => setAutoRefresh(!autoRefresh)}
                    >
                        {autoRefresh ? "关闭自动刷新" : "开启自动刷新"}
                    </Button>,
                    <Button
                        key="sync-all"
                        onClick={async () => {
                            try {
                                await imageApi.syncAll();
                                message.success('已同步状态');
                                actionRef.current?.reload();
                            } catch (e) {
                                message.error('同步失败');
                            }
                        }}
                    >
                        同步状态
                    </Button>,
                    <Button
                        key="pull-all"
                        onClick={async () => {
                            try {
                                await imageApi.pullAll();
                                message.success('已开始拉取全部镜像');
                                setAutoRefresh(true); // 开启自动刷新
                                actionRef.current?.reload();
                            } catch (e) {
                                message.error('拉取失败');
                            }
                        }}
                    >
                        全部拉取
                    </Button>,
                ]}
            />

            <ImageModal
                id={selectedRowKey}
                open={open}
                confirmLoading={confirmLoading}
                handleCancel={handleModalCancel}
                handleOk={handleModalOk}
            />
        </Layout.Content>
    );
};

export default ImagePage;