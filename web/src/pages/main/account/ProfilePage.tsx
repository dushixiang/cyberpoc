import SettingsLayout from "@/pages/main/account/layout";
import {Separator} from "@/components/ui/separator";
import ProfileForm from "@/pages/main/account/ProfileForm.tsx";

const ProfilePage = () => {
    return (
        <SettingsLayout>
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-medium">个人信息</h3>
                    <p className="text-sm text-muted-foreground">
                        这就是其他人在网站上看到您的方式。
                    </p>
                </div>
                <Separator/>
                <ProfileForm/>
            </div>
        </SettingsLayout>
    );
};

export default ProfilePage;