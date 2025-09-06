import {App, Breadcrumb, Button, Input, Modal, Switch, Table, Tag} from "antd";
import {ActionType, ProColumns, ProTable} from "@ant-design/pro-components";
import React, {useEffect, useRef, useState} from "react";
import {useMutation} from "@tanstack/react-query";
import {ExclamationCircleOutlined} from "@ant-design/icons"
import UserModal from "./UserModal.tsx";
import userApi from "@/api/user-api.ts";
import {User} from "@/types";

let api = userApi;

const UserPage = () => {
    const actionRef = useRef<ActionType>();
    let [open, setOpen] = useState<boolean>(false);
    let [selectedRowKey, setSelectedRowKey] = useState<string>();
    let [userType, setUserType] = useState<string>('admin'); // 默认显示管理员用户

    let [pskOpen, setPskOpen] = useState<boolean>(false);
    let [psk, setPsk] = useState<string>('');

    let inputRef = useRef<any>();
    const {message, modal} = App.useApp();

    useEffect(() => {
        actionRef.current?.reload();
    }, [userType]); // 当用户类型改变时重新加载

    const postOrUpdate = async (values: any) => {
        if (values['id']) {
            await api.updateById(values['id'], values);
        } else {
            await api.create(values);
        }
    }

    let mutation = useMutation({
        mutationFn: postOrUpdate,
        onSuccess: () => {
            actionRef.current?.reload();
            setOpen(false);
            setSelectedRowKey(undefined);
            message.success('操作成功');
        }
    });

    let changePSKMutation = useMutation({
        mutationFn: async () => {
            await userApi.changePassword(selectedRowKey, psk);
        },
        onSuccess: () => {
            setPsk('');
            setPskOpen(false);
            message.success('修改成功');
        }
    });


    const columns: ProColumns<User>[] = [
        {
            title: '序号',
            dataIndex: 'index',
            valueType: 'indexBorder',
            width: 48,
        },
        {
            title: '用户名称',
            dataIndex: 'name',
        },
        {
            title: '账号',
            dataIndex: 'account',
            hideInSearch: true,
        },
        {
            title: '用户类型',
            dataIndex: 'type',
            hideInSearch: true,
            render: (_, record) => {
                switch (record.type) {
                    case "regular":
                        return <Tag color={"blue"}>普通成员</Tag>
                    case "admin":
                        return <Tag color={"red"}>管理人员</Tag>
                }
                return '';
            }
        },
        {
            title: '状态',
            dataIndex: 'enabled',
            hideInSearch: true,
            render: (_, record) => {
                return <Switch
                    checkedChildren={'启用'}
                    unCheckedChildren={'禁用'}
                    checked={record.enabled}
                    onChange={(checked) => {
                        userApi.enabled(checked, [record.id])
                            .then(() => {
                                actionRef.current?.reload();
                            });
                    }}
                />
            }
        },
        {
            title: '创建时间',
            dataIndex: 'created_at',
            hideInSearch: true,
            valueType: 'dateTime',
            width: 191,
        },
        {
            title: '操作',
            valueType: 'option',
            key: 'option',
            width: 150,
            render: (_, record,) => [
                <a onClick={() => {
                    setOpen(true);
                    setSelectedRowKey(record.id);
                }}>
                    编辑
                </a>,
                <a onClick={() => {
                    setPskOpen(true);
                    setSelectedRowKey(record.id);
                }}>
                    修改密码
                </a>,
                <a className={'danger'} onClick={() => {
                    handleBatchDelete([record.id])
                }}>
                    删除
                </a>
            ],
        },
    ];

    const handleBatchDelete = async (selectedRowKeys: React.Key[]) => {
        modal.confirm({
            title: '确定要删除吗？',
            icon: <ExclamationCircleOutlined/>,
            content: '删除后无法恢复，请谨慎操作。',
            okText: '确认',
            cancelText: '取消',
            onOk: async () => {
                await api.deleteById(selectedRowKeys.join(','));
                actionRef.current?.reload();
            }
        });
    }

    return (<div className="">
            <Breadcrumb
                items={[
                    {
                        title: '首页',
                    },
                    {
                        title: '用户管理',
                    },
                ]}
            />
            <div className={'mt-4'}>
                <ProTable<User>
                    columns={columns}
                    actionRef={actionRef}
                    cardBordered
                    request={async (params = {}, sort, _) => {

                        let sortField = 'created_at';
                        let sortOrder = 'desc';
                        if (Object.keys(sort).length > 0) {
                            sortField = Object.keys(sort)[0];
                            sortOrder = Object.values(sort)[0] as string;
                        }

                        let queryParams = {
                            pageIndex: params.current,
                            pageSize: params.pageSize,
                            name: params.name,
                            type: userType,
                            mail: params.mail,
                            sortField: sortField,
                            sortOrder: sortOrder,
                        }
                        let result = await api.getPaging(queryParams);
                        return {
                            data: result['items'],
                            success: true,
                            total: result['total']
                        };
                    }}
                    columnsState={{
                        persistenceKey: 'user-table',
                        persistenceType: 'localStorage',
                    }}
                    rowKey="id"
                    search={{
                        labelWidth: 'auto',
                    }}
                    options={{
                        setting: {
                            listsHeight: 400,
                        },
                    }}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                    }}
                    rowSelection={{
                        selections: [Table.SELECTION_ALL, Table.SELECTION_INVERT],
                    }}
                    tableAlertOptionRender={({selectedRowKeys}) => {
                        return (
                            <a className={'danger'} onClick={() => {
                                handleBatchDelete(selectedRowKeys)
                            }}>
                                批量删除
                            </a>
                        );
                    }}
                    dateFormatter="string"
                    headerTitle="用户"
                    toolbar={{
                        menu: {
                            type: 'tab',
                            items: [
                                {key: 'admin', label: '管理用户'},
                                {key: 'regular', label: '普通用户'},
                            ],
                            onChange: (activeKey) => {
                                setUserType(activeKey as string)
                            }
                        },
                        actions: [
                            <Button
                                key="button"
                                onClick={() => {
                                    setOpen(true);
                                }}
                                type="primary"
                            >
                                新建
                            </Button>,
                        ]
                    }}
                />

                <UserModal
                    id={selectedRowKey}
                    open={open}
                    confirmLoading={mutation.isPending}
                    handleCancel={() => {
                        setOpen(false);
                        setSelectedRowKey(undefined);
                    }}
                    handleOk={mutation.mutate}
                />

                <Modal
                    title={'修改密码'}
                    open={pskOpen}
                    okButtonProps={{
                        disabled: psk === ''
                    }}
                    onOk={() => {
                        changePSKMutation.mutate();
                    }}
                    onCancel={() => {
                        setPskOpen(false);
                        setPsk('');
                    }}
                    confirmLoading={changePSKMutation.isPending}
                    afterOpenChange={(open) => open && inputRef.current?.focus()}
                    destroyOnClose={true}
                >
                    <div className={'flex justify-center py-4'}>
                        <Input ref={inputRef}
                               onChange={(e) => {
                                   setPsk(e.target.value);
                               }}
                               value={psk}
                               placeholder={'新的密码'}
                        />
                    </div>
                </Modal>
            </div>
        </div>
    );
};

export default UserPage;