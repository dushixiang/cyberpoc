import React, {useRef, useState} from 'react';
import {Button, Layout, message, Popconfirm, Tag} from "antd";
import {ActionType, DragSortTable, ProColumns} from "@ant-design/pro-components";
import {PlusOutlined} from "@ant-design/icons";
import ChallengeModal from "./ChallengeModal.tsx";
import challengeApi from "../../api/challenge-api.ts";
import {CHALLENGE_CATEGORIES, ChallengeDetail, DIFFICULTY_LEVELS} from "@/types/challenge.ts";

const ChallengePage: React.FC = () => {
    const [open, setOpen] = useState<boolean>(false);
    const [confirmLoading, setConfirmLoading] = useState<boolean>(false);
    const [selectedRowKey, setSelectedRowKey] = useState<string>('');

    const actionRef = useRef<ActionType>();
    // 无需自定义拖拽行

    // 处理编辑
    const handleEdit = (record: ChallengeDetail) => {
        setOpen(true);
        setSelectedRowKey(record.id || '');
    };

    // 处理删除
    const handleDelete = async (record: ChallengeDetail) => {
        try {
            await challengeApi.deleteById(record.id!);
            message.success('删除成功');
            actionRef.current?.reload();
        } catch (error) {
            message.error('删除失败');
        }
    };

    // 渲染难度标签（基于 DIFFICULTY_LEVELS，并区分颜色）
    const renderDifficulty = (difficulty: string) => {
        const normalized = (difficulty || '').toLowerCase();
        const found = DIFFICULTY_LEVELS.find(l => l.value === normalized || l.label.toLowerCase() === normalized);
        const color = found?.color || 'default';
        return <Tag color={color}>{found ? found.label : difficulty}</Tag>;
    };

    // 渲染类别标签（基于 CHALLENGE_CATEGORIES，分配不同颜色）
    const renderCategory = (category: string) => {
        const normalized = (category || '').toLowerCase();
        const found = CHALLENGE_CATEGORIES.find(c => c.value === normalized || c.label.toLowerCase() === normalized);
        const color = found?.color || 'default';
        return <Tag color={color}>{found ? found.label : category}</Tag>;
    };

    const columns: ProColumns<ChallengeDetail>[] = [
        {
            title: '排序',
            dataIndex: 'sort',
            width: 60,
            className: 'drag-visible',
            hideInSearch: true,
        },
        {
            dataIndex: 'index',
            valueType: 'indexBorder',
            width: 48,
        },
        {
            title: '题目名称',
            dataIndex: 'name',
            key: 'name',
            sorter: true,
            ellipsis: true,
            copyable: true,
        },
        {
            title: '类别',
            dataIndex: 'category',
            key: 'category',
            hideInSearch: true,
            render: (_, record) => renderCategory(record.category),
            filters: CHALLENGE_CATEGORIES.map(cat => ({text: cat.label, value: cat.value})),
            width: 80,
        },
        {
            title: '难度',
            dataIndex: 'difficulty',
            key: 'difficulty',
            hideInSearch: true,
            render: (_, record) => renderDifficulty(record.difficulty),
            filters: DIFFICULTY_LEVELS.map(level => ({text: level.label, value: level.value})),
            width: 80,
        },
        {
            title: '分值',
            dataIndex: 'points',
            key: 'points',
            hideInSearch: true,
            render: (points: number) => `${points} 分`,
            width: 80,
        },
        {
            title: '持续时长',
            dataIndex: 'duration',
            key: 'duration',
            hideInSearch: true,
            render: (duration: number) => `${duration} 分钟`,
            width: 120,
        },
        {
            title: 'Flag类型',
            dataIndex: 'dynamic_flag',
            key: 'dynamic_flag',
            hideInSearch: true,
            render: (dynamic_flag: boolean) =>
                dynamic_flag ? <Tag color="processing">动态</Tag> : <Tag color="default">静态</Tag>,
            width: 80,
        },
        {
            title: '启用状态',
            dataIndex: 'enabled',
            key: 'enabled',
            hideInSearch: true,
            render: (enabled: boolean) =>
                enabled ? <Tag color="success">启用</Tag> : <Tag color="error">禁用</Tag>,
            width: 80,
        },
        {
            title: '创建时间',
            key: 'created_at',
            dataIndex: 'created_at',
            valueType: 'dateTime',
            hideInSearch: true,
            width: 180,
        },
        {
            title: '操作',
            valueType: 'option',
            key: 'option',
            width: 100,
            render: (_, record) => [
                <Button
                    key="edit"
                    type="link"
                    size="small"
                    onClick={() => handleEdit(record)}
                    style={{
                        margin: 0,
                        padding: 0,
                    }}
                >
                    编辑
                </Button>,
                <Popconfirm
                    key="delete"
                    title="确认删除"
                    description="您确认要删除这个题目吗？此操作不可恢复。"
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
                </Popconfirm>,
            ],
        },
    ];

    // 处理表格请求
    const handleRequest = async (params: any = {}, sort: any) => {
        try {
            let sortField = 'sort';
            let sortOrder = 'desc';
            if (Object.keys(sort).length > 0) {
                sortField = Object.keys(sort)[0];
                sortOrder = Object.values(sort)[0] as string;
            }

            const queryParams = {
                pageIndex: params.current,
                pageSize: params.pageSize,
                name: params.name,
                category: params.category,
                difficulty: params.difficulty,
                enabled: params.enabled,
                sortField: sortField,
                sortOrder: sortOrder,
            };

            const result = await challengeApi.getPaging(queryParams);
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
    const handleModalOk = async (values: any) => {
        setConfirmLoading(true);
        try {
            if ('id' in values && values.id) {
                await challengeApi.updateById(values.id, values);
                message.success('题目更新成功');
            } else {
                await challengeApi.create(values);
                message.success('题目创建成功');
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
            <DragSortTable<ChallengeDetail>
                columns={columns}
                actionRef={actionRef}
                rowKey="id"
                request={handleRequest}
                dragSortKey="sort"
                onDragSortEnd={async (_beforeIndex, _afterIndex, newDataSource) => {
                    try {
                        const items = (newDataSource as ChallengeDetail[]).map((item, idx, arr) => ({
                            id: item.id!,
                            sort: arr.length - idx,
                        }));
                        await challengeApi.sortItems(items);
                        message.success('排序已保存');
                        actionRef.current?.reload();
                    } catch (e) {
                        message.error('排序保存失败');
                    }
                }}
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
                headerTitle="题目管理"
                toolBarRender={() => [
                    <Button
                        key="create"
                        type="primary"
                        icon={<PlusOutlined/>}
                        onClick={handleCreate}
                    >
                        新建题目
                    </Button>,
                ]}
            />

            <ChallengeModal
                id={selectedRowKey}
                open={open}
                confirmLoading={confirmLoading}
                handleCancel={handleModalCancel}
                handleOk={handleModalOk}
            />
        </Layout.Content>
    );
};

export default ChallengePage;