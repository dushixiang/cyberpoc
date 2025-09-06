import React, {useEffect, useState} from 'react';
import {Button, Form, Input, InputNumber, message} from 'antd';
import propertyApi from "@/api/property-api.ts";

const SettingPage: React.FC = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const load = async () => {
        try {
            const data = await propertyApi.get();
            form.setFieldsValue({
                system_name: data.system_name || '',
                max_challenge_count: data.max_challenge_count ? Number(data.max_challenge_count) : undefined,
            });
        } catch (error) {
            message.error('加载配置失败');
        }
    };

    useEffect(() => {
        load();
    }, []);

    const onFinish = async (values: any) => {
        setLoading(true);
        try {
            const valuesToSave = {
                ...values,
                mail_ssl: values.mail_ssl ? 'true' : 'false',
            };
            await propertyApi.set(valuesToSave);
            message.success('保存成功');
        } catch (error) {
            message.error('保存失败');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="p-4 bg-white rounded-md">
            <div className="text-xl font-bold mb-4">系统设置</div>
            <Form form={form} layout="vertical" onFinish={onFinish}>
                <div className="border rounded-md p-4 mb-4">
                    <div className="text-base font-semibold mb-3">系统配置</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Form.Item name="system_name" label="系统名称">
                            <Input placeholder="CyberPOC"/>
                        </Form.Item>
                        <Form.Item name="max_challenge_count" label="最大并发挑战数">
                            <InputNumber min={0} className="w-full" placeholder="100"/>
                        </Form.Item>
                    </div>
                </div>

                <Button type="primary" htmlType="submit" loading={loading}>保存</Button>
            </Form>
        </div>
    );
};

export default SettingPage;