import React, {useEffect, useRef, useState} from 'react';
import {Divider, Drawer} from "antd";
import {ProForm, ProFormDigit, ProFormSelect, ProFormSwitch, ProFormText,} from "@ant-design/pro-components";
import {useQuery} from "@tanstack/react-query";
import MDEditor from "@uiw/react-md-editor";
import {marked} from "marked";
import strings from "@/utils/strings";
import challengeApi from "@/api/challenge-api.ts";
import imageApi from "@/api/image-api.ts";
import {
    CHALLENGE_CATEGORIES,
    ChallengeCreateRequest,
    ChallengeUpdateRequest,
    DIFFICULTY_LEVELS
} from "@/types/challenge.ts";

export interface ChallengeModalProps {
    open: boolean;
    handleOk: (values: ChallengeCreateRequest | ChallengeUpdateRequest) => Promise<boolean>;
    handleCancel: () => void;
    confirmLoading: boolean;
    id: string;
}

const ChallengeModal: React.FC<ChallengeModalProps> = ({open, handleOk, handleCancel, confirmLoading, id}) => {
    const formRef = useRef<any>();
    const isEdit = strings.hasText(id);
    const [md, setMd] = useState<string>("");

    // 获取题目详情
    const {data: challengeData, isLoading} = useQuery({
        queryKey: ['challenge', id],
        queryFn: () => challengeApi.getById(id),
        enabled: open && isEdit,
        refetchOnWindowFocus: false,
    });

    useEffect(() => {
        if (challengeData) {
            setMd(challengeData.description);
        }
    }, [challengeData]);

    // 获取镜像列表
    const {data: imageList} = useQuery({
        queryKey: ['images', 'list'],
        queryFn: () => imageApi.getAll(),
        enabled: open,
        refetchOnWindowFocus: false,
    });

    const onClose = () => {
        if (formRef.current) {
            formRef.current.resetFields();
        }
        setMd("");
        handleCancel();
    };

    const onFinish = async (values: any) => {
        const html = md ? marked.parse(md) as string : '';
        const submitData = isEdit ? {...values, id, html, description: md} : {...values, html, description: md};
        const success = await handleOk(submitData);
        if (success) {
            if (formRef.current) {
                formRef.current.resetFields();
            }
            setMd("");
        }
        return success;
    };

    return (
        <Drawer
            title={isEdit ? '更新题目' : '新建题目'}
            placement="right"
            onClose={onClose}
            open={open}
            width={window.innerWidth * 0.9}
            loading={isLoading}
            destroyOnClose={true}
        >
            <ProForm
                formRef={formRef}
                initialValues={challengeData}
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
                {/* 基本信息 */}
                <ProFormText
                    name="name"
                    label="题目名称"
                    placeholder="请输入题目名称"
                    rules={[
                        {required: true, message: '请输入题目名称'},
                        {min: 2, message: '题目名称至少2个字符'},
                        {max: 100, message: '题目名称不能超过100个字符'}
                    ]}
                />

                <ProFormSelect
                    name="category"
                    label="题目类别"
                    placeholder="请选择题目类别"
                    options={CHALLENGE_CATEGORIES}
                    rules={[
                        {required: true, message: '请选择题目类别'}
                    ]}
                />

                <ProFormSelect
                    name="difficulty"
                    label="难度等级"
                    placeholder="请选择难度等级"
                    options={DIFFICULTY_LEVELS}
                    rules={[
                        {required: true, message: '请选择难度等级'}
                    ]}
                />

                <ProFormDigit
                    name="points"
                    label="题目分值"
                    placeholder="题目分值"
                    fieldProps={{
                        min: 1,
                        max: 1000,
                        addonAfter: '分',
                        style: {width: '100%'}
                    }}
                    rules={[
                        {required: true, message: '请输入题目分值'},
                        {type: 'number', min: 1, max: 1000, message: '分值范围为1-1000分'}
                    ]}
                />

                <ProFormSwitch
                    name="dynamic_flag"
                    label="动态Flag"
                    tooltip="开启后每个用户的Flag都不相同"
                />

                <ProFormText
                    name="flag"
                    label="静态Flag"
                    placeholder="请输入静态Flag（动态Flag时可选）"
                    tooltip="仅在关闭动态Flag时必填"
                    dependencies={['dynamic_flag']}
                    rules={[
                        ({getFieldValue}) => ({
                            validator(_, value) {
                                if (!getFieldValue('dynamic_flag') && !value) {
                                    return Promise.reject(new Error('关闭动态Flag时必须设置静态Flag'));
                                }
                                return Promise.resolve();
                            },
                        }),
                    ]}
                />

                <ProFormSelect
                    name="image_id"
                    label="关联镜像"
                    placeholder="请选择关联镜像（可选）"
                    options={imageList?.map((image: any) => ({
                        label: image.name,
                        value: image.id,
                    })) || []}
                    showSearch
                    allowClear
                />

                <ProFormDigit
                    name="duration"
                    label="持续时长"
                    placeholder="持续时长"
                    fieldProps={{
                        min: 1,
                        max: 1440,
                        addonAfter: '分钟',
                        style: {width: '100%'}
                    }}
                    rules={[
                        {required: true, message: '请输入持续时长'},
                        {type: 'number', min: 1, max: 1440, message: '持续时长范围为1-1440分钟'}
                    ]}
                />

                <ProFormSwitch
                    name="enabled"
                    label="启用状态"
                    tooltip="关闭后用户无法看到此题目"
                />

                {/* Markdown 描述 */}
                <Divider>题目描述（Markdown）</Divider>
                <div data-color-mode="light" style={{marginBottom: 12}}>
                    <MDEditor value={md} onChange={(v) => setMd(v || "")} height={480}/>
                </div>
            </ProForm>
        </Drawer>
    );
};

export default ChallengeModal;