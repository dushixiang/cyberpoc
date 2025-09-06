import SettingsLayout from "@/pages/main/account/layout";
import {Separator} from "@/components/ui/separator";
import PasswordForm from "@/pages/main/account/PasswordForm.tsx";

const PasswordPage = () => {
    return (
        <SettingsLayout>
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-medium">修改密码</h3>
                    <p className="text-sm text-muted-foreground">
                        越复杂的密码安全性越高，同时经常修改密码也有助于您的账户安全。
                    </p>
                </div>
                <Separator/>
                <PasswordForm/>
            </div>
        </SettingsLayout>
    );
};

export default PasswordPage;