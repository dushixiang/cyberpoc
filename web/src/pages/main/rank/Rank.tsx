import {useQuery} from "@tanstack/react-query";
import rank1 from '@/assets/rank/red-rank1.png';
import rank2 from '@/assets/rank/red-rank2.png';
import rank3 from '@/assets/rank/red-rank3.png';
import indexApi from "@/api/index-api.ts";

const Rank = () => {

    let query = useQuery({
        queryKey: ["queryRanks"],
        queryFn: () => indexApi.getRanks(),
        refetchInterval: 10 * 60 * 1000, // 每10分钟自动刷新一次，与后端重算频率匹配
        staleTime: 5 * 60 * 1000, // 5分钟内视为新鲜，减少不必要请求
    });

    const renderRanking = (ranking: number) => {
        switch (ranking) {
            case 1:
                return <img width={32} src={rank1} alt={ranking + ""} className="mx-auto"/>
            case 2:
                return <img width={32} src={rank2} alt={ranking + ""} className="mx-auto"/>
            case 3:
                return <img width={32} src={rank3} alt={ranking + ""} className="mx-auto"/>
            default:
                return ranking;
        }
    }

    const renderSkeletonRows = (count: number = 10) => {
        return Array.from({length: count}).map((_, idx) => (
            <tr key={`skeleton-${idx}`}>
                <td className="whitespace-nowrap px-4 py-3 text-center">
                    <div className="h-5 w-6 bg-gray-200 animate-pulse rounded"/>
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                    <div className='flex items-center gap-2'>
                        <div className='w-8 h-8 rounded-full bg-gray-200 animate-pulse'/>
                        <div className='h-4 w-28 bg-gray-200 animate-pulse rounded'/>
                    </div>
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                    <div className='h-4 w-10 bg-gray-200 animate-pulse rounded'/>
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                    <div className='h-4 w-16 bg-gray-200 animate-pulse rounded'/>
                </td>
            </tr>
        ));
    }

    const renderTableBody = () => {
        if (query.isError) {
            return (
                <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-red-600">
                        加载失败，请稍后重试
                    </td>
                </tr>
            );
        }
        if (query.isFetching && !query.data) {
            return renderSkeletonRows(10);
        }
        if (!query.data || !query.data.items || query.data.items.length === 0) {
            return (
                <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-gray-500">
                        暂无数据
                    </td>
                </tr>
            );
        }
        return query.data.items.map((item, index) => (
            <tr key={item.userId}>
                <td className="whitespace-nowrap px-4 py-2 font-medium text-gray-900 text-center">
                    {renderRanking(index + 1)}
                </td>
                <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                    <div className='flex items-center gap-2 '>
                        <img className='w-8 h-8 object-cover rounded-full' src={item.userAvatar} alt={'avatar'} onError={(e) => {
                            (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyBoZWlnaHQ9IjMyIiB3aWR0aD0iMzIiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI2RkZCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxMiIgY3k9IjciIHI9IjQiLz48cGF0aCBkPSJNMTIgMTFjLTQuNDIgMC04IDMuNTgtOCA4aDE2YzAtNC40Mi0zLjU4LTgtOC04eiIvPjwvc3ZnPg=='
                        }}/>
                        <span>{item.userName}</span>
                    </div>
                </td>
                <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                    {item.score}
                </td>
                <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                    {item.totalTimeStr || '-'}
                </td>
            </tr>
        ))
    }

    return (
        <div>
            <header aria-label="Page Header" className="bg-gray-50">
                <div className="mx-auto max-w-screen-xl px-4 py-8 sm:py-8 sm:px-6 lg:px-8">
                    <div className="sm:flex sm:items-center sm:justify-between">
                        <div className="text-center sm:text-left">
                            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                                排行榜
                            </h1>

                            <p className="mt-1.5 text-sm text-gray-500">
                                每10分钟更新一次，按通关积分累计排序，相同积分时按耗时排序
                            </p>
                        </div>

                        <div className="mt-4 flex flex-col gap-2 sm:mt-0 sm:flex-row sm:items-center min-w-max">
                            <div className="text-xs text-gray-500">
                                上次更新：{query.data?.updated_at ? new Date(query.data.updated_at).toLocaleString() : '-'}
                            </div>
                            <button
                                onClick={() => query.refetch()}
                                disabled={query.isFetching}
                                className={`inline-flex items-center justify-center rounded border border-gray-800 px-3 py-1 text-xs font-medium transition ${query.isFetching ? 'opacity-60 cursor-wait' : 'hover:bg-gray-900 hover:text-white'}`}
                            >
                                {query.isFetching ? '刷新中...' : '刷新'}
                            </button>
                        </div>
                    </div>
                </div>
            </header>


            <div className="mx-auto max-w-screen-xl px-4 py-8 sm:py-12 sm:px-6 lg:px-8">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead>
                        <tr className="bg-gray-50">
                            <th
                                className="whitespace-nowrap px-4 py-3 text-center font-medium text-gray-900"
                            >
                                排名
                            </th>
                            <th
                                className="whitespace-nowrap px-4 py-3 text-left font-medium text-gray-900"
                            >
                                名称
                            </th>
                            <th
                                className="whitespace-nowrap px-4 py-3 text-left font-medium text-gray-900"
                            >
                                积分
                            </th>
                            <th
                                className="whitespace-nowrap px-4 py-3 text-left font-medium text-gray-900"
                            >
                                耗时
                            </th>
                        </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-200">
                        {renderTableBody()}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Rank;