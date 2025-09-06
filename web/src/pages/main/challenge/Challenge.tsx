import React, {useEffect} from 'react';
import {Link, useSearchParams} from 'react-router-dom';
import {useQuery} from "@tanstack/react-query";
import {Button} from "@/components/ui/button";
import {ChevronLeftIcon, ChevronRightIcon} from "lucide-react";
import indexApi from "@/api/index-api.ts";
import CyberRadio from "@/components/custom/CyberRadio.tsx";
import Landing from "@/components/custom/Landing.tsx";
import Empty from "@/components/custom/Empty.tsx";
import {Card, CardContent} from "@/components/ui/card.tsx";

const d = 1000 * 60 * 60 * 24 * 3;

interface ChallengeProps {
    type: string
}

const Challenge = (props: ChallengeProps) => {

    const [searchParams, setSearchParams] = useSearchParams();

    let difficulty = searchParams.get('difficulty') || '';
    let pageIndex = parseInt(searchParams.get('pageIndex') || "1");
    let pageSize = parseInt(searchParams.get('pageSize') || "8");

    let query = useQuery({
        queryKey: ["challenges-paging", props.type, difficulty, pageIndex, pageSize],
        queryFn: () => {
            let params = {
                'pageIndex': pageIndex,
                'pageSize': pageSize,
                'difficulty': difficulty,
                'type': props.type,
            };
            return indexApi.getPaging(params);
        },
        staleTime: 60 * 1000,
        refetchOnWindowFocus: false,
    });

    useEffect(() => {
        query.refetch();
    }, [searchParams]);

    const renderPassedClassName = (passed: boolean) => {
        if (!passed) {
            return 'border-gray-900';
        }
        return 'border-red-500 text-red-500';
    }

    // const renderPassedBorderClassName = (passed: boolean) => {
    //     if (!passed) {
    //         return 'before:border-gray-900';
    //     }
    //     return 'before:border-red-500';
    // }

    const renderPassed = (passed: boolean) => {
        if (!passed) {
            return undefined;
        }
        return <span className="inline-flex items-center justify-center">
            <p className="whitespace-nowrap text-sm text-red-500">已通关</p>
        </span>
    }

    const renderNew = (createdAt: number) => {
        let now = new Date().getTime();
        if (now - createdAt > d) {
            return undefined;
        }
        return <span className="inline-flex items-center justify-center animate-bounce">
            <p className="whitespace-nowrap text-sm text-purple-500">新</p>
        </span>
    }

    const renderChallenging = (challenging: boolean) => {
        if (!challenging) {
            return undefined;
        }
        return <span className="inline-flex items-center justify-center">
            <p className="whitespace-nowrap text-sm text-blue-500">挑战中...</p>
        </span>
    }

    const renderDifficulty = (difficulty: string) => {
        if (!difficulty) {
            return undefined;
        }
        let comp: React.JSX.Element;
        switch (difficulty.toLowerCase()) {
            case 'easy':
                comp = <span className="inline-flex items-center justify-center">
                    <p className="whitespace-nowrap text-sm">新手</p>
                </span>
                break;
            case 'medium':
                comp = <span className="inline-flex items-center justify-center">
                    <p className="whitespace-nowrap text-sm">入门</p>
                </span>
                break;
            case 'hard':
                comp = <span className="inline-flex items-center justify-center">
                    <p className="whitespace-nowrap text-sm">专家</p>
                </span>
                break;
        }
        return comp;
    }

    const difficulties = [
        {
            name: '全部',
            value: '',
            emoji: '👀'
        },
        {
            name: '新手',
            value: 'easy',
            emoji: '📋'
        },
        {
            name: '入门',
            value: 'medium',
            emoji: '👉'
        },
        {
            name: '专家',
            value: 'hard',
            emoji: '🐴'
        },
    ];

    const handleChangePageIndex = (pageIndex: number) => {
        searchParams.set('pageIndex', pageIndex + "")
        setSearchParams(searchParams);
    }

    return (
        <div>
            <header className='bg-gray-50'>
                <div className="mx-auto max-w-screen-xl py-8 px-4 sm:py-8 lg:px-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <CyberRadio
                            items={difficulties}
                            checked={difficulty}
                            onChange={value => {
                                searchParams.set('difficulty', value)
                                searchParams.set('pageIndex', '1')
                                setSearchParams(searchParams);
                            }}
                        />

                    </div>
                </div>
            </header>

            <div className={'mx-auto max-w-screen-xl px-4'}>

                {
                    query.isLoading ? <Landing/> :
                        <>
                            {query.isError && (
                                <div className="py-12">
                                    <div className="text-center text-red-600">加载失败，请稍后重试</div>
                                </div>
                            )}
                            {
                                (!query.isError && query.data?.items.length === 0) ? <Empty/> :
                                    <>
                                        {query.isFetching && (
                                            <div className="text-xs text-gray-500 py-2">加载中...</div>
                                        )}
                                        <div
                                            className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 py-12 cards">
                                            {
                                                query.data?.items.map(item => {

                                                    return <Link
                                                        key={item.id}
                                                        to={'/challenges/' + item.id}
                                                    >
                                                        <Card
                                                            className={["group relative block bg-white pt-12 transition-transform duration-150 hover:shadow-md hover:-translate-y-0.5",
                                                                renderPassedClassName(item.solved),
                                                            ].join(' ')}
                                                        >
                                                            <CardContent>
                                                                <div className="absolute top-4 left-8 space-x-2">
                                                                    {renderNew(item.created_at)}
                                                                    {renderPassed(item.solved)}
                                                                    {renderChallenging(item.challenging)}
                                                                </div>

                                                                <div className="absolute top-4 right-8 space-x-2">
                                                                    {renderDifficulty(item.difficulty)}
                                                                </div>

                                                                <div className="p-2 space-y-1">
                                                                    <div
                                                                        className="text-lg font-bold tracking-tight">{item.name}</div>
                                                                    <div className={'font-mono text-xs text-gray-700'}>
                                                                        积分: {item.points.toLocaleString()}
                                                                    </div>
                                                                    <div
                                                                        className="mt-4 font-mono text-xs flex items-center justify-between">
                                                                        <div>挑战人次: {item.attempt_count.toLocaleString()}</div>
                                                                        <div>通关人数: {item.solved_count.toLocaleString()}</div>
                                                                    </div>
                                                                </div>
                                                            </CardContent>
                                                        </Card>

                                                    </Link>
                                                })
                                            }
                                        </div>
                                    </>
                            }
                        </>
                }

                <div className="inline-flex justify-center gap-1 float-right">
                    <Button variant="outline"
                        // size="dd"
                            disabled={pageIndex === 1}
                            onClick={() => {
                                handleChangePageIndex(pageIndex - 1);
                            }}
                    >
                        <ChevronLeftIcon className="h-3 w-3"/>
                    </Button>

                    <Button variant="outline"
                            disabled={((query.data?.total || 0) <= pageIndex * pageSize)}
                            onClick={() => {
                                handleChangePageIndex(pageIndex + 1);
                            }}
                    >
                        <ChevronRightIcon className="h-3 w-3"/>
                    </Button>
                </div>

                <div className='mb-12'></div>
            </div>
        </div>
    );
};

export default Challenge;