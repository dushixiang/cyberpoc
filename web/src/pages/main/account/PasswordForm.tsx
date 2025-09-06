import toast from "react-hot-toast";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {useForm} from "react-hook-form";
import * as z from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import {useNavigate} from "react-router-dom";
import accountApi from "@/api/account-api.ts";

const formSchema = z.object({
    oldPassword: z.string().min(1, {
        message: "请输入原始密码",
    }),
    newPassword: z.string().min(1, {
        message: "请输入新的密码",
    }),
    newPassword2: z.string().min(1, {
        message: "请确认新的密码",
    }),
}).superRefine(({newPassword, newPassword2}, ctx) => {
    if (newPassword !== newPassword2) {
        ctx.addIssue({
            code: 'custom',
            path: ['newPassword2'],
            message: '您输入的密码不一致。'
        })
    }
})

const PasswordForm = () => {

    let navigate = useNavigate();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            oldPassword: '',
            newPassword: '',
            newPassword2: '',
        },
    })

    const onSubmit = async (values: any) => {
        let success = await accountApi.changePassword(values);
        if (success) {
            toast.success('密码修改成功，即将跳转至登录页面');
            navigate('/login')
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="oldPassword"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel>原始密码</FormLabel>
                            <FormControl>
                                <Input type={'password'} {...field} />
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="newPassword"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel>新的密码</FormLabel>
                            <FormControl>
                                <Input type={'password'} {...field} />
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="newPassword2"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel>确认密码</FormLabel>
                            <FormControl>
                                <Input type={'password'} {...field} />
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}
                />
                <Button type="submit" size='sm'>保存</Button>
            </form>
        </Form>
    );
};

export default PasswordForm;