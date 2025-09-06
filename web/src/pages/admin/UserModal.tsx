import {useRef} from 'react';
import {Modal} from "antd";
import {ProForm, ProFormDependency, ProFormInstance, ProFormRadio, ProFormText} from "@ant-design/pro-components";
import userApi from "@/api/user-api.ts";

export interface Props {
    open: boolean
    handleOk: (values: any) => void
    handleCancel: () => void
    confirmLoading: boolean
    id: string | undefined
}

let api = userApi;

const UserModal = ({
                       open,
                       handleOk,
                       handleCancel,
                       confirmLoading,
                       id,
                   }: Props) => {

    const formRef = useRef<ProFormInstance>();

    const get = async () => {
        if (id) {
            return await api.getById(id);
        }
        return {
            type: 'admin'
        };
    }

    return (
        <Modal
            title={id ? '修改用户' : '添加用户'}
            open={open}
            maskClosable={false}
            destroyOnClose={true}
            onOk={() => {
                formRef.current?.validateFields()
                    .then(async values => {

                        handleOk(values);
                        formRef.current?.resetFields();
                    });
            }}
            onCancel={() => {
                formRef.current?.resetFields();
                handleCancel();
            }}
            confirmLoading={confirmLoading}
        >
            <ProForm formRef={formRef} request={get} submitter={false}>
                <ProFormText hidden={true} name={'id'}/>
                <ProFormText label={'用户名称'} name="name" rules={[{required: true}]}/>
                <ProFormText label={'账号'} name="account" rules={[{required: true}]}/>
                <ProFormRadio.Group
                    rules={[{required: true}]}
                    name="type"
                    label="用户权限"
                    options={[
                        {
                            label: '管理人员',
                            value: 'admin',
                        },
                        {
                            label: '普通成员',
                            value: 'regular',
                        },
                    ]}
                />
                <ProFormDependency name={['id']}>
                    {({id}) => {
                        if (!id) {
                            return <ProFormText.Password label={'初始密码'} name="password" rules={[{required: true}]}/>
                        }
                    }}

                </ProFormDependency>
            </ProForm>
        </Modal>
    )
};

export default UserModal;