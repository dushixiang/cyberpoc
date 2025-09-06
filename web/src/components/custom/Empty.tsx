import nothing from '@/assets/nothing.svg'

const Empty = () => {

    return (
        <div className="grid py-12 px-4 bg-white place-content-center">
            <div className="text-center">
                <img width={400} src={nothing} alt={'nothing'}/>

                <h1
                    className="mt-6 text-2xl font-bold tracking-tight text-gray-900 sm:text-4xl"
                >
                    👀
                </h1>

                <p className="mt-4 text-gray-500">没有更多数据了。</p>
            </div>
        </div>
    );
};

export default Empty;