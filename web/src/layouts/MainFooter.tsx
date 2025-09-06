import logo from "@/assets/logo.svg";
// import WeiXinModal from "./WeiXinModal";
import {Separator} from "@/components/ui/separator"
import {Link} from "react-router-dom";

const MainFooter = () => {

    const now = new Date().getFullYear();

    return (
        <div>
            <Separator/>
            <footer aria-label="Site Footer" className="bg-white">
                <div
                    className="max-w-screen-xl px-4 py-16 mx-auto space-y-8 sm:px-6 lg:space-y-16 lg:px-8"
                >
                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                        <div>
                            <div className="text-teal-600">
                                <a href="#">
                                    <span className="sr-only">Logo</span>
                                    <img src={logo} alt={'logo'}/>
                                </a>
                            </div>

                            <p className="max-w-xs mt-4 text-gray-500">
                                我们致力于为您提供一个安全、有趣和具有挑战性的体验，让您在学习和实践中提升您的网络安全技能。
                            </p>

                            <ul className="flex gap-6 mt-8">

                                <li>
                                    <a
                                        href="https://github.com/dushixiang"
                                        rel="noreferrer"
                                        target="_blank"
                                        className="text-gray-700 transition hover:opacity-75"
                                    >
                                        <span className="sr-only">GitHub</span>

                                        <svg
                                            className="w-6 h-6"
                                            fill="currentColor"
                                            viewBox="0 0 24 24"
                                            aria-hidden="true"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    </a>
                                </li>
                            </ul>
                        </div>

                        <div
                            className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:col-span-2 lg:grid-cols-4"
                        >
                            <div>
                                <p className="font-medium text-gray-900">关于我们</p>

                                <nav aria-label="Footer Navigation - Services" className="mt-6">
                                    <ul className="space-y-4 text-sm">
                                        <li>
                                            <Link to={'/terms'}>
                                                服务条款
                                            </Link>
                                        </li>
                                        <li>
                                            <Link to={'/privacy'}>
                                                隐私政策
                                            </Link>
                                        </li>
                                    </ul>
                                </nav>
                            </div>

                            <div>
                                <p className="font-medium text-gray-900">我们的产品</p>

                                <nav aria-label="Footer Navigation - Company" className="mt-6">
                                    <ul className="space-y-4 text-sm">
                                        <li>
                                            <a target={'_blank'} href="https://next-terminal.typesafe.cn/"
                                               className="text-gray-700 transition hover:opacity-75">
                                                Next Terminal
                                            </a>
                                        </li>

                                        <li>
                                            <a target={'_blank'} href="https://github.com/dushixiang/kafka-map"
                                               className="text-gray-700 transition hover:opacity-75">
                                                Kafka Map
                                            </a>
                                        </li>

                                        <li>
                                            <a target={'_blank'} href="https://github.com/dushixiang/4dnat"
                                               className="text-gray-700 transition hover:opacity-75">
                                                4DNAT
                                            </a>
                                        </li>
                                    </ul>
                                </nav>
                            </div>

                            <div>
                                <p className="font-medium text-gray-900">FAQ</p>

                                <nav aria-label="Footer Navigation - Company" className="mt-6">
                                    <ul className="space-y-4 text-sm">
                                        <li>
                                            <a href="/faq" className="text-gray-700 transition hover:opacity-75">
                                                常见问题
                                            </a>
                                        </li>
                                        <li>
                                            <button className="text-gray-700 transition hover:opacity-75"
                                                // onClick={() => setVisible(true)}
                                            >
                                                加微信群
                                            </button>
                                        </li>
                                    </ul>
                                </nav>
                            </div>

                            <div>
                                <p className="font-medium text-gray-900">合作伙伴</p>

                                <nav aria-label="Footer Navigation - Legal" className="mt-6">
                                    <ul className="space-y-4 text-sm">
                                        <li>
                                            <a href="#" className="text-gray-700 transition hover:opacity-75">
                                                还没找到
                                            </a>
                                        </li>
                                    </ul>
                                </nav>
                            </div>
                        </div>
                    </div>

                    <p className="text-xs text-gray-500">
                        Copyright © 2020-{now} 指针漂移科技工作室, All Rights Reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default MainFooter;