import React from 'react';
import {ProColumns, ProTable} from "@ant-design/pro-components";
import logApi from "@/api/log-api.ts";
import {LoginLog} from "@/types";
import {Breadcrumb, Button, message, Modal, Space, Tag, Typography} from "antd";
import {DeleteOutlined, ExclamationCircleOutlined} from "@ant-design/icons";

const {Text} = Typography;

const LoginLogPage: React.FC = () => {
    const columns: ProColumns<LoginLog>[] = [
        {
            title: '账号',
            dataIndex: 'account',
            fixed: 'left',
            width: 300,
            render: (_, record) => (
                <Text strong>{record.account}</Text>
            )
        },
        {
            title: 'IP地址',
            dataIndex: 'ip',
            width: 140,
            copyable: true,
        },
        {
            title: '地区',
            dataIndex: 'region',
            width: 120,
            render: (_, record) => record.region || '-',
            hideInSearch: true,
        },
        {
            title: '时间',
            dataIndex: 'login_at',
            valueType: 'dateTime',
            width: 180,
            sorter: true,
            hideInSearch: true,
        },
        {
            title: '状态',
            dataIndex: 'success',
            width: 100,
            filters: true,
            filterMultiple: false,
            valueEnum: {
                true: {text: '成功', status: 'Success'},
                false: {text: '失败', status: 'Error'},
            },
            render: (_, record) => (
                record.success ?
                    <Tag color="success">成功</Tag> :
                    <Tag color="error">失败</Tag>
            )
        },
        {
            title: '原因',
            dataIndex: 'reason',
            ellipsis: true,
            render: (_, record) => record.reason || '-'
        },
    ];

    const handleClearLogs = () => {
        Modal.confirm({
            title: '确认清空登录日志',
            icon: <ExclamationCircleOutlined/>,
            content: (
                <Space direction="vertical">
                    <Text>确定要清空所有登录日志吗？</Text>
                    <Text type="danger">此操作不可恢复，请谨慎操作！</Text>
                </Space>
            ),
            okText: '确认清空',
            okType: 'danger',
            cancelText: '取消',
            onOk: async () => {
                try {
                    await logApi.deleteAllLoginLogs();
                    message.success('登录日志已清空');
                    actionRef.current?.reload();
                } catch (error) {
                    message.error('清空登录日志失败: ' + (error as Error).message);
                }
            }
        });
    };

    const actionRef = React.useRef<any>();

    return (
        <div className="">
            <Breadcrumb
                items={[
                    {
                        title: '首页',
                    },
                    {
                        title: '登陆日志',
                    },
                ]}
            />

            <ProTable<LoginLog>
                className={'mt-4'}
                columns={columns}
                actionRef={actionRef}
                request={async (params, sort) => {
                    let sortField = 'login_at';
                    let sortOrder = 'desc';
                    if (Object.keys(sort).length > 0) {
                        sortField = Object.keys(sort)[0];
                        sortOrder = Object.values(sort)[0] as string;
                    }

                    const queryParams = {
                        pageIndex: params.current,
                        pageSize: params.pageSize,
                        sortField: sortField,
                        sortOrder: sortOrder,
                        account: params.account,
                        ip: params.ip,
                        success: params.success,
                    };

                    const data = await logApi.getLoginLogPaging(queryParams);
                    return {
                        data: data.items || [],
                        total: data.total || 0,
                        success: true
                    };
                }}
                rowKey="id"
                pagination={{
                    defaultPageSize: 10,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total) => `共 ${total} 条记录`
                }}
                search={{
                    labelWidth: 'auto',
                }}
                form={{
                    syncToUrl: true,
                    syncToInitialValues: true,
                }}
                options={{
                    density: true,
                    fullScreen: true,
                    setting: true,
                }}
                toolbar={{
                    actions: [
                        <Button
                            key="clear"
                            icon={<DeleteOutlined/>}
                            type="primary"
                            danger
                            onClick={handleClearLogs}
                        >
                            清空日志
                        </Button>
                    ]
                }}
                scroll={{x: 800}}
            />
        </div>
    );
};

export default LoginLogPage;