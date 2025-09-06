import {useQuery} from "@tanstack/react-query";
import toast from "react-hot-toast";
import {Button} from "@/components/ui/button";
import {zodResolver} from "@hookform/resolvers/zod"
import * as z from "zod"
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage,} from "@/components/ui/form"
import {Input} from "@/components/ui/input"
import {useForm} from "react-hook-form";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import accountApi from "@/api/account-api.ts";
import {useEffect} from "react";
import {setCurrentUser} from "@/utils/permission.ts";


const formSchema = z.object({
    name: z.string().min(3, {
        message: "名称长度不能小于3",
    }).max(32, {
        message: "名称长度不能大于32",
    }),
    avatar: z.string().trim()
})

const ProfileForm = () => {

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            avatar: '',
        },
    })

    let query = useQuery({
        queryKey: ['profileInfo'],
        queryFn: accountApi.getInfo,
        refetchOnWindowFocus: false,
    });

    useEffect(() => {
        if (query.data) {
            let data = query.data;
            setCurrentUser(data);
            form.setValue('name', data.name);
            form.setValue('avatar', data.avatar);
        }
    }, [query.data]);

    const handleFileChange = (event: any) => {
        if (event.target.files.length === 0) {
            return;
        }
        let file = event.target.files[0];
        //声明js的文件流
        const reader = new FileReader();
        if (file) {
            //通过文件流将文件转换成Base64字符串
            reader.readAsDataURL(file);
            //转换成功后
            reader.onloadend = function () {
                //输出结果
                form.setValue('avatar', reader.result as string);
            }
        }
    }

    // 2. Define a submit handler.
    async function onSubmit(values: z.infer<typeof formSchema>) {
        // Do something with the form values.
        // ✅ This will be type-safe and validated.
        console.log(values)

        await accountApi.changeProfile(values);
        toast.success('修改成功');
        query.refetch();
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="avatar"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel>头像</FormLabel>
                            <FormControl>
                                <div className="flex items-center space-x-4">
                                    <Avatar
                                        className={'cursor-pointer w-16 h-16'}
                                        onClick={() => {
                                            document.getElementById('file')?.click();
                                        }}
                                    >
                                        <AvatarImage src={field.value} alt="@cyberpoc"/>
                                        <AvatarFallback>D</AvatarFallback>
                                    </Avatar>
                                    <input id={'file'}
                                           type='file'
                                           hidden={true}
                                           onChange={handleFileChange}
                                           accept="image/gif,image/jpeg,image/jpg,image/png"/>
                                </div>
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="name"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel>名称</FormLabel>
                            <FormControl>
                                <Input placeholder="起个响亮的名字吧" {...field} />
                            </FormControl>
                            <FormDescription>
                                这是你公开显示的名称。
                            </FormDescription>
                            <FormMessage/>
                        </FormItem>
                    )}
                />
                <Button type="submit" size='sm' disabled={query.isLoading}>保存</Button>
            </form>
        </Form>
    );
};

export default ProfileForm;