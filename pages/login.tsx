import useSWR from "swr";
import Link from "next/link";
import { useRouter } from "next/dist/client/router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "../components/Button";
import { ArrowRightIcon } from "@heroicons/react/outline";
import { getSiteLogin, login } from "../modules/commerble-nextjs-sdk/client/api";

function useCommerble() {
    const { data, mutate, error } = useSWR('login', () => getSiteLogin());
    return {
        data: data?.type === 'site/login' ? data : null,
        mutate,
        error,
    }
}

export default function LoginPage() {
    const router = useRouter();
    const cb = useCommerble();
    const [loading, setLoading] = useState(null);
    const { register, handleSubmit, formState: { errors }, reset } = useForm({
        defaultValues: cb.data
    })

    useEffect(() => {
        reset(cb.data);
    }, [cb.data])

    const onSubmit = async (data) => {
        try{
            setLoading('submit');
            const result = await login(data, router.query.returnUrl as string);
            switch(result.type) {
                case 'site/login': 
                    cb.mutate(result, false);
                    break;

                case 'next': 
                    router.push(router.query.returnUrl as string);
                    break;
            }
        }
        finally{
            setLoading(null);
        }
    }

    return <>
        <div className="layout-2col">
            <div className="layout-2col__col bg-center bg-cover" style={{backgroundImage: "url('https://commerble.blob.core.windows.net/corporate/images/AdobeStock_244795496.webp')"}}>
                <div className="p-2 md:p-4 md:px-8">
                    <Link href="/" className="logo bg-white pb-1 px-2">
                        Commerble Shop
                    </Link>
                </div>
                <h1 className="text-center my-14 text-white text-4xl">Login</h1>
            </div>
            <form className="layout-2col__col x-center pt-16" onSubmit={handleSubmit(onSubmit)}>
                {cb.data?.state.errors.map(err => <p key={err} className="text-red-400">※ {err}</p>)}
                {cb.data&&
                    <div className="form-body">
                        <div className="field">
                            <label>メールアドレス</label>
                            <input {...register("userName", { required: true })} autoFocus={true}/>
                            {errors?.userName && <span>This field is required</span>}
                        </div>
                        <div className="field">
                            <label>パスワード</label>
                            <input {...register("password", { required: true })} type="password"/>
                            {errors?.userName && <span>This field is required</span>}
                        </div>
                        <hr/>
                        <div className="flex flex-col items-center gap-4">
                            <Button
                                loading={loading==='submit'}
                                disabled={loading}
                                type="submit"
                                looks="primary"
                                className="w-full"
                                rightIcon={<ArrowRightIcon className="absolute right-4 inline-block w-8 h-8 ml-5"/>}
                                >ログイン</Button>
                            <Link href="/signup">
                                <Button
                                    looks="text"
                                    >アカウントを作成する</Button>
                            </Link>
                        </div>
                    </div>
                }
            </form>
        </div>
    </>
}