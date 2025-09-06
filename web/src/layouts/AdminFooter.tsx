const AdminFooter = () => {
    const now = new Date().getFullYear();
    return (
        <div className={'py-8 px-4 text-center w-full'}>
            Copyright © 2020-{now} 指针漂移科技工作室, All Rights Reserved.
        </div>
    );
};

export default AdminFooter;