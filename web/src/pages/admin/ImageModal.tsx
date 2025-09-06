import React, {useRef} from 'react';
import {Drawer} from "antd";
import {ProForm, ProFormDigit, ProFormText, ProFormTextArea} from "@ant-design/pro-components";
import {useQuery} from "@tanstack/react-query";
import strings from "../../utils/strings";
import imageApi from "../../api/image-api.ts";
import {ImageCreateRequest, ImageUpdateRequest} from "@/types/image.ts";

export interface ImageModalProps {
    open: boolean;
    handleOk: (values: ImageCreateRequest | ImageUpdateRequest) => Promise<boolean>;
    handleCancel: () => void;
    confirmLoading: boolean;
    id: string;
}

const ImageModal: React.FC<ImageModalProps> = ({open, handleOk, handleCancel, confirmLoading, id}) => {
    const formRef = useRef<any>();
    const isEdit = strings.hasText(id);

    // 获取镜像详情
    const {data: imageData, isLoading} = useQuery({
        queryKey: ['image', id],
        queryFn: () => imageApi.getById(id),
        enabled: open && isEdit,
        refetchOnWindowFocus: false,
    });

    const onClose = () => {
        if (formRef.current) {
            formRef.current.resetFields();
        }
        handleCancel();
    };

    const onFinish = async (values: any) => {
        const submitData = isEdit ? {...values, id} : values;
        const success = await handleOk(submitData);
        if (success) {
            if (formRef.current) {
                formRef.current.resetFields();
            }
        }
        return success;
    };

    return (
        <Drawer
            title={isEdit ? '更新镜像' : '新建镜像'}
            placement="right"
            onClose={onClose}
            open={open}
            width={720}
            loading={isLoading}
        >
            <ProForm
                formRef={formRef}
                initialValues={imageData}
                onFinish={onFinish}
                submitter={{
                    searchConfig: {
                        submitText: isEdit ? '更新' : '创建',
                        resetText: '重置',
                    },
                    submitButtonProps: {
                        loading: confirmLoading,
                    },
                    resetButtonProps: {
                        disabled: confirmLoading,
                    },
                }}
                layout="horizontal"
                labelCol={{span: 6}}
                wrapperCol={{span: 18}}
            >
                <ProFormText
                    name="name"
                    label="镜像名称"
                    placeholder="请输入镜像名称"
                    rules={[
                        {required: true, message: '请输入镜像名称'},
                        {min: 2, message: '镜像名称至少2个字符'},
                        {max: 50, message: '镜像名称不能超过50个字符'}
                    ]}
                />

                <ProFormText
                    name="registry"
                    label="镜像仓库地址"
                    placeholder="例如: docker.io/nginx:latest"
                    rules={[
                        {required: true, message: '请输入镜像仓库地址'},
                    ]}
                />

                <ProFormDigit
                    name="cpu_limit"
                    label="CPU 限制"
                    placeholder="CPU限制"
                    fieldProps={{
                        min: 1,
                        max: 32,
                        step: 1,
                        addonAfter: '核',
                        style: {width: '100%'}
                    }}
                    rules={[
                        {required: true, message: '请输入CPU限制'},
                        {type: 'number', min: 0.1, max: 32, message: 'CPU限制范围为0.1-32核'}
                    ]}
                />

                <ProFormDigit
                    name="memory_limit"
                    label="内存限制"
                    placeholder="内存限制"
                    fieldProps={{
                        min: 16,
                        max: 32768,
                        addonAfter: 'MB',
                        style: {width: '100%'}
                    }}
                    rules={[
                        {required: true, message: '请输入内存限制'},
                        {type: 'number', min: 16, max: 32768, message: '内存限制范围为128MB-32GB'}
                    ]}
                />

                <ProFormText
                    name="exposed"
                    label="暴露端口"
                    placeholder="例如: 80,443 或 8080"
                    tooltip="多个端口用逗号分隔"
                />

                <ProFormTextArea
                    name="description"
                    label="描述"
                    placeholder="请输入镜像描述（可选）"
                    fieldProps={{
                        rows: 3,
                        showCount: true,
                        maxLength: 200
                    }}
                    rules={[
                        {max: 200, message: '描述不能超过200个字符'}
                    ]}
                />
            </ProForm>
        </Drawer>
    );
};

export default ImageModal;