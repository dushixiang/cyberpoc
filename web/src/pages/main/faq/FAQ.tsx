import {Accordion, AccordionContent, AccordionItem, AccordionTrigger,} from "@/components/ui/accordion";

const Faq = () => {
    return (
        <div>
            <header aria-label="Page Header" className="bg-gray-50">
                <div className="mx-auto max-w-screen-xl px-4 py-8 sm:py-8 sm:px-6 lg:px-8">
                    <div className="sm:flex sm:items-center sm:justify-between">
                        <div className="text-center sm:text-left">
                            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                                FAQ
                            </h1>

                            <p className="mt-1.5 text-sm text-gray-500">

                            </p>
                        </div>

                        <div className="mt-4 flex flex-col gap-4 sm:mt-0 sm:flex-row sm:items-center min-w-max">

                        </div>
                    </div>
                </div>
            </header>

            <div className="mx-auto max-w-screen-xl px-4 py-8 sm:py-12 sm:px-6 lg:px-8">
                <div className="space-y-4">

                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="item-1">
                            <AccordionTrigger>FLAG的 位置在哪里？</AccordionTrigger>
                            <AccordionContent>
                                <p className="px-4 mt-4 leading-relaxed text-gray-700">
                                    有三个地方可能会存在 FLAG，分别是：
                                </p>
                                <p className="px-4 mt-4 leading-relaxed text-gray-700">
                                    1. 环境变量。
                                </p>
                                <p className="px-4 mt-4 leading-relaxed text-gray-700">
                                    2. /tmp/flag
                                </p>
                                <p className="px-4 mt-4 leading-relaxed text-gray-700">
                                    3. 数据库的某一张表里面。
                                </p>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </div>

            </div>
        </div>
    );
};

export default Faq;