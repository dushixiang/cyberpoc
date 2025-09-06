import {Suspense} from 'react';
import MainHeader from "@/layouts/MainHeader.tsx";
import MainFooter from "@/layouts/MainFooter.tsx";
import {Outlet} from "react-router-dom";
import Landing from "@/components/custom/Landing.tsx";

const MainLayout = () => {
    return (
        <div>
            <MainHeader/>
            <Suspense fallback={<Landing/>}>
                <Outlet/>
            </Suspense>
            <MainFooter/>
        </div>
    );
};

export default MainLayout;