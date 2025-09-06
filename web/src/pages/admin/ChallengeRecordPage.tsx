import React, {useEffect, useState} from 'react';
import {Layout, List, message} from "antd";
import challengeRecordApi from "@/api/challenge-record-api.ts";
import {ChallengeRecordDetail} from "@/types/challenge-record.ts";
import dayjs from "dayjs";

const ChallengeRecordPage: React.FC = () => {
    const [items, setItems] = useState<ChallengeRecordDetail[]>([]);
    const [total, setTotal] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(false);
    const [pageIndex, setPageIndex] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(10);

    const fetchRecords = async (pi = pageIndex, ps = pageSize) => {
        try {
            setLoading(true);
            const queryParams = {
                pageIndex: pi,
                pageSize: ps,
                sortField: "created_at",
                sortOrder: "desc",
            };
            const result = await challengeRecordApi.getPaging(queryParams);
            setItems(result.items || []);
            setTotal(result.total || 0);
        } catch (e) {
            message.error('获取数据失败');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRecords(1, pageSize);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <Layout.Content className="page-container bg-white rounded-md p-4 pt-2">
            <List
                header={<div className="text-base font-semibold">挑战记录</div>}
                loading={loading}
                dataSource={items}
                renderItem={(record) => (
                    <List.Item>
                        <div className="text-sm">
                            <span className="text-blue-600 font-semibold">{record.user_name}</span>
                            <span className="text-gray-500"> 在 </span>
                            <span className="text-gray-700 font-mono">
                                {dayjs(record.created_at).format("YYYY-MM-DD HH:mm:ss")}
                            </span>
                            <span className="text-gray-500"> 启动了 </span>
                            <span className="text-purple-600 font-semibold">{record.challenge_name}</span>
                            <span className="text-gray-500"> 题目。</span>
                        </div>
                    </List.Item>
                )}
                pagination={{
                    total: total,
                    current: pageIndex,
                    pageSize: pageSize,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    onChange: (page, size) => {
                        setPageIndex(page);
                        setPageSize(size);
                        fetchRecords(page, size);
                    },
                    size: 'small',
                }}
            />
        </Layout.Content>
    );
};

export default ChallengeRecordPage;