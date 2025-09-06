import React, {useEffect, useRef, useState} from 'react';
import './ChallengeDetail.css';
import {useNavigate, useParams} from "react-router-dom";
import {useQuery} from "@tanstack/react-query";
import Countdown from "react-countdown";
import rank1 from "@/assets/rank/rank1.png";
import rank2 from "@/assets/rank/rank2.png";
import rank3 from "@/assets/rank/rank3.png";
import {Badge} from "@/components/ui/badge";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime"
import 'dayjs/locale/zh-cn'
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css';
import 'github-markdown-css/github-markdown-light.css';
import indexApi from "@/api/index-api.ts";
import {ActionResult, ChallengeInstance, InstanceStatus, RankResult} from "@/types";
import Fireworks from "react-canvas-confetti/dist/presets/fireworks";
import {TConductorInstance} from "react-canvas-confetti/src/types";
import {ChallengeDetail} from "@/types/challenge.ts";

dayjs.extend(relativeTime);
dayjs.locale('zh-cn') // 使用本地化语言

const ChallengeDetailPage: React.FC = () => {
    const navigate = useNavigate();
    const params = useParams<{ challengeId: string }>();
    const challengeId = params.challengeId;

    // 状态管理
    const [refetch, setRefetch] = useState(0);
    const [flag, setFlag] = useState('');
    const [flagLoading, setFlagLoading] = useState(false);
    const [flagResult, setFlagResult] = useState<'success' | 'error' | ''>('');

    const controller = useRef<TConductorInstance>();

    const onInitHandler = ({conductor}) => {
        controller.current = conductor;
    };

    // 页面初始化
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    // 数据查询
    const queryDetail = useQuery<ChallengeDetail>({
        queryKey: ["challenge-detail", challengeId],
        queryFn: () => indexApi.getDetail(challengeId),
        refetchInterval: refetch || false,
        enabled: !!challengeId,
    });

    const queryRanks = useQuery<RankResult>({
        queryKey: ["challenge-ranks", challengeId],
        queryFn: () => indexApi.getRank(challengeId),
        enabled: !!challengeId,
    });

    const queryInstance = useQuery<ChallengeInstance>({
        queryKey: ["challenge-instance", challengeId],
        queryFn: () => indexApi.getInstance(challengeId),
        refetchInterval: refetch || false,
        enabled: !!challengeId,
    });

    // 实例状态监控
    useEffect(() => {
        const data = queryInstance.data;
        if (!data) return;

        if (data.status === 'running' || data.status === 'created' || data.status === '') {
            setRefetch(0);
        }
    }, [queryInstance.data]);

    // 代码高亮初始化
    useEffect(() => {
        if (queryDetail.data?.html) {
            hljs.highlightAll();
        }
    }, [queryDetail.data?.html]);

    // 错误处理
    if (!challengeId) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900">题目不存在</h2>
                    <button
                        onClick={() => navigate('/')}
                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        返回首页
                    </button>
                </div>
            </div>
        );
    }

    // 事件处理函数
    const handleRun = async () => {
        try {
            await indexApi.run(challengeId);
            setRefetch(1000);
            queryInstance.refetch();
            queryDetail.refetch();
        } catch (error) {
            console.error('启动挑战失败:', error);
        }
    };

    const handleDestroy = async () => {
        try {
            await indexApi.destroy(challengeId);
            setRefetch(1000);
            queryInstance.refetch();
        } catch (error) {
            console.error('销毁挑战失败:', error);
        }
    };

    const handleSubmitFlag = async () => {
        if (flagLoading || !flag.trim()) return;

        try {
            setFlagLoading(true);
            const result: ActionResult = await indexApi.flag(challengeId, {flag});

            if (result.ok) {
                setFlagResult('success');
                setRefetch(1000);
                setTimeout(() => queryInstance.refetch(), 500);
                queryRanks.refetch();

                // 庆祝动画
                controller.current?.run({
                    duration: 5000,
                    speed: 3,
                })
            } else {
                setFlagResult('error');
            }
        } catch (error) {
            console.error('提交 FLAG 失败:', error);
            setFlagResult('error');
        } finally {
            setFlagLoading(false);
        }
    };

    // 渲染函数
    const renderInstanceStatus = (instance?: ChallengeInstance) => {
        const statusMap: Record<InstanceStatus, React.JSX.Element> = {
            'creating': <Badge variant="outline">创建中...</Badge>,
            'create-failure': <Badge variant="destructive">创建失败</Badge>,
            'created': <Badge variant="secondary">已创建</Badge>,
            'running': <Badge>运行中</Badge>,
            'deleting': <Badge variant="outline">删除中</Badge>,
            'delete-failure': <Badge variant="destructive">删除失败</Badge>,
            '': <Badge variant="secondary">未创建</Badge>,
        };

        return statusMap[instance?.status];
    };

    const renderInstanceUrl = (instance?: ChallengeInstance) => {
        if (instance?.status !== 'running' || !instance?.accessUrl) {
            return <span className="text-gray-500">-</span>;
        }
        if (instance?.accessUrl.startsWith('http')) {
            return (
                <a
                    className="text-indigo-600 hover:text-indigo-800 underline decoration-dashed hover:decoration-solid transition-all"
                    target="_blank"
                    rel="noopener noreferrer"
                    href={instance.accessUrl}
                >
                    {instance.accessUrl}
                </a>
            );
        }
        let accessUrl = `http://${window.location.hostname}:${instance.accessUrl}`;
        return (
            <a
                className="text-indigo-600 hover:text-indigo-800 underline decoration-dashed hover:decoration-solid transition-all"
                target="_blank"
                rel="noopener noreferrer"
                href={accessUrl}
            >
                {accessUrl}
            </a>
        );
    };

    const renderInstanceAction = (instance?: ChallengeInstance) => {
        if (!instance?.status) {
            return (
                <button
                    className="group relative inline-block focus:outline-none focus:ring cursor-pointer"
                    onClick={handleRun}
                >
                    <span
                        className="absolute inset-0 translate-x-0 translate-y-0 bg-yellow-300 transition-transform group-hover:translate-y-1.5 group-hover:translate-x-1.5"/>
                    <span
                        className="relative inline-block border-2 border-current px-8 py-3 text-sm font-bold uppercase tracking-widest">
                        开始挑战
                    </span>
                </button>
            );
        }

        switch (instance.status) {
            case 'creating':
            case 'deleting':
                return null; // 处理中状态不显示按钮
            case 'running':
            case 'created':
            case 'create-failure':
            case 'delete-failure':
                return (
                    <button
                        className="group relative inline-block focus:outline-none focus:ring cursor-pointer"
                        onClick={handleDestroy}
                    >
                        <span
                            className="absolute inset-0 translate-x-0 translate-y-0 bg-yellow-300 transition-transform group-hover:translate-y-1.5 group-hover:translate-x-1.5"/>
                        <span
                            className="relative inline-block border-2 border-current px-8 py-3 text-sm font-bold uppercase tracking-widest">
                            放弃挑战
                        </span>
                    </button>
                );
            default:
                return null;
        }
    };

    const renderInstanceCountdown = (instance?: ChallengeInstance) => {
        if (instance?.status === 'running' && instance.expires_at) {
            return (
                <Countdown
                    date={instance.expires_at}
                    renderer={({formatted}) => (
                        <span className="font-mono">
                            {formatted.hours}时{formatted.minutes}分{formatted.seconds}秒
                        </span>
                    )}
                    onComplete={() => {
                        setRefetch(1000);
                        queryInstance.refetch();
                    }}
                />
            );
        }
        return <span className="font-mono text-gray-500">00时00分00秒</span>;
    };

    const renderRanking = (ranking: number) => {
        const rankImages = {
            1: rank1,
            2: rank2,
            3: rank3,
        };

        const imageSrc = rankImages[ranking as keyof typeof rankImages];

        if (imageSrc) {
            return (
                <img
                    width={32}
                    src={imageSrc}
                    alt={`第${ranking}名`}
                    className="mx-auto"
                />
            );
        }

        return <span className="text-gray-600 font-medium">{ranking}</span>;
    };

    return (
        <div>
            <Fireworks
                onInit={onInitHandler}
                style={{
                    position: 'fixed',
                    pointerEvents: 'none',
                    width: '100%',
                    height: '100%',
                    top: 0,
                    left: 0,
                    zIndex: 999,
                }}
            />

            <header aria-label="Page Header" className="bg-gray-50">
                <div className="mx-auto max-w-screen-xl px-4 py-8 sm:py-8 sm:px-6 lg:px-8">
                    <div className="sm:flex sm:items-center sm:justify-between">
                        <div className="text-center sm:text-left">
                            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                                {queryDetail.data?.name}
                            </h1>
                        </div>

                        <div className="mt-4 ml-4 flex flex-col gap-4 sm:mt-0 sm:flex-row sm:items-center min-w-max">
                            {renderInstanceAction(queryInstance.data)}
                        </div>
                    </div>
                </div>
            </header>

            <div className='mx-auto max-w-screen-xl px-4 py-8 sm:py-12 sm:px-6 lg:px-8'>
                <div className="grid sm:grid-cols-3 gap-4 grid-cols-1">
                    <div className="sm:col-span-2 col-span-1 rounded border-2 border-dashed p-2">
                        <div className={'markdown-body'}
                             dangerouslySetInnerHTML={{
                                 __html: queryDetail.data?.html as string
                             }}>
                        </div>
                    </div>
                    <div className="relative block rounded border-2 border-dashed bg-white p-4">
                        <div className='grid grid-cols-1 divide-y divide-dashed gap-4'>
                            <div>
                                <p className="text-base font-bold">环境信息</p>

                                <div className='mt-4 grid grid-cols-1 gap-2 text-sm text-gray-500'>
                                    <div>
                                        <span className='font-medium'>挑战次数：</span>
                                        {queryDetail.data?.attempt_count}
                                    </div>
                                    <div>
                                        <span className='font-medium'>通关人数：</span>
                                        {queryDetail.data?.solved_count}
                                    </div>
                                    <div>
                                        <span className='font-medium'>挑战状态：</span>
                                        {queryDetail.data?.solved ?
                                            <Badge variant="default">已通关</Badge> :
                                            <Badge variant="secondary">未通关</Badge>
                                        }
                                    </div>
                                    <div>
                                        <span className='font-medium'>环境状态：</span>
                                        {renderInstanceStatus(queryInstance.data)}
                                    </div>
                                    <div>
                                        <span className='font-medium'>剩余时间：</span>
                                        {renderInstanceCountdown(queryInstance.data)}
                                    </div>
                                    <div>
                                        <span className='font-medium'>访问路径：</span>
                                        {renderInstanceUrl(queryInstance.data)}
                                    </div>
                                </div>
                            </div>

                            <div className='pt-4'>
                                <p className="text-base font-bold">提交 FLAG</p>

                                <div className='grid grid-cols-1 gap-4'>
                                    <input
                                        type="text"
                                        id="flag"
                                        value={flag}
                                        placeholder="FLAG-{you_must_find_me}"
                                        className="mt-4 py-2 px-3 w-full border border-black shadow-sm sm:text-sm focus:border-black focus:ring-0 disabled:bg-gray-100"
                                        onChange={(e) => setFlag(e.target.value)}
                                        disabled={flagLoading}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                handleSubmitFlag();
                                            }
                                        }}
                                    />

                                    {flagResult === 'success' && (
                                        <div role="alert"
                                             className="rounded border-l-4 border-green-500 bg-green-50 p-4">
                                            <strong className="block font-medium text-green-800">恭喜 🎉🎉🎉</strong>
                                            <p className="mt-2 text-sm text-green-700">
                                                您成功完成了此项挑战。
                                            </p>
                                        </div>
                                    )}

                                    {flagResult === 'error' && (
                                        <div role="alert" className="rounded border-l-4 border-red-500 bg-red-50 p-4">
                                            <div className="flex items-center gap-2 text-red-800">
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 24 24"
                                                    fill="currentColor"
                                                    className="h-5 w-5"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                                <strong className="block font-medium text-red-800">失败</strong>
                                            </div>
                                            <p className="mt-2 text-sm text-red-700">
                                                您提交的 FLAG 不正确。
                                            </p>
                                        </div>
                                    )}

                                    <button
                                        className={`group relative inline-block overflow-hidden border border-black px-4 py-1.5 focus:outline-none focus:ring ${
                                            flagLoading ? 'cursor-wait opacity-70' : 'cursor-pointer hover:shadow-md'
                                        }`}
                                        onClick={handleSubmitFlag}
                                        disabled={flagLoading || !flag.trim()}
                                    >
                                        <span
                                            className="absolute inset-y-0 left-0 w-[2px] bg-black transition-all group-hover:w-full group-active:bg-black"/>
                                        <span
                                            className="relative text-sm font-medium text-black transition-colors group-hover:text-white">
                                            {flagLoading ? '提交中...' : '提交'}
                                        </span>
                                    </button>
                                </div>
                            </div>

                            <div className='pt-4'>
                                <p className="text-base font-bold">一血 🔥</p>

                                <div>
                                    <table className="mt-4 min-w-full divide-y-2 divide-gray-200 text-sm">
                                        <thead>
                                        <tr>
                                            <th
                                                className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900"
                                            >
                                                用户
                                            </th>
                                            <th
                                                className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900"
                                            >
                                                挑战时间
                                            </th>
                                        </tr>
                                        </thead>

                                        <tbody className="divide-y divide-gray-200">
                                        {queryRanks.data?.first &&
                                            <tr key={queryRanks.data?.first?.user_id}>
                                                <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                                                    <div className='flex items-center gap-2 '>
                                                        <img className='w-8 rounded-full'
                                                             src={queryRanks.data?.first?.user_avatar}
                                                             alt={'avatar'}/>

                                                        <span>
                                                            {queryRanks.data?.first?.user_name}
                                                        </span>
                                                    </div>
                                                </td>

                                                <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                                                    {dayjs(queryRanks.data?.first?.solved_at).fromNow()}
                                                </td>
                                            </tr>
                                        }

                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className='pt-4'>
                                <p className="text-base font-bold">个人排名</p>

                                <div>
                                    <table className="mt-4 min-w-full divide-y-2 divide-gray-200 text-sm">
                                        <thead>
                                        <tr>
                                            <th
                                                className="whitespace-nowrap px-4 py-2 text-center font-medium text-gray-900"
                                            >
                                                排名
                                            </th>
                                            <th
                                                className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900"
                                            >
                                                用户
                                            </th>
                                            <th
                                                className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900"
                                            >
                                                耗时
                                            </th>
                                        </tr>
                                        </thead>

                                        <tbody className="divide-y divide-gray-200">

                                        {queryRanks.data?.solves?.map((item, index) => {
                                            return (<tr key={item.user_id}>
                                                <td className="whitespace-nowrap px-4 py-2 font-medium text-gray-900 text-center">
                                                    {renderRanking(index + 1)}
                                                </td>
                                                <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                                                    <div className='flex items-center gap-2 '>
                                                        <img className='w-8 rounded-full' src={item.user_avatar}
                                                             alt={'avatar'}/>

                                                        <span>
                                                            {item.user_name}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                                                    {item.used_time_str}
                                                </td>
                                            </tr>)
                                        })}
                                        </tbody>
                                    </table>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default ChallengeDetailPage;