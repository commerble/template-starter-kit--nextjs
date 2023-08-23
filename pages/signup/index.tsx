import { ArrowRightIcon } from "@heroicons/react/outline";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "../../components/Button";
import { useCommerbleState } from "../../modules/commerble-nextjs-sdk/client/hooks";
import { getSiteAccount, registerAccount } from "../../modules/commerble-nextjs-sdk/client/api";
import { useSiteRouter } from "../../hooks/router";

function useCommerble() {
    const [data, mutate] = useCommerbleState(() => getSiteAccount());
    return { 
        data: data?.type === 'site/account' ? data : null, 
        mutate
    };
}

export default function SignupPage() {
    const router = useSiteRouter();
    const cb = useCommerble();
    const [loading, setLoading] = useState(null);
    const { register, handleSubmit, formState: { errors }, reset } = useForm({
        defaultValues: cb.data
    })

    useEffect(() => {
        reset(cb.data);
    }, [cb.data])

    const onSubmit = async (data) => {
        setLoading('submit');
        try{
            const result = await registerAccount(data);
            if (result.type === 'site/account') {
                cb.mutate(result);
            }
            if (result.type === 'next') {
                switch (result.next) {
                    case 'site/accountcomplete':
                        router.push('/signup/complete/');
                        break;
                }
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
                <h1 className="text-center my-14 text-white text-4xl">Signup</h1>
            </div>
            <form className="layout-2col__col x-center pt-16" onSubmit={handleSubmit(onSubmit)}>
                {cb.data&&
                    <div className="form-body">
                        {cb.data.state.errors.map(err => <p key={err} className="text-red-400 ml-4">※ {err}</p>)}
                        <div className="field">
                            <label>メールアドレス</label>
                            <input {...register("userName", { required: true })} autoFocus={true}/>
                            {errors?.userName && <span>This field is required</span>}
                        </div>
                        <div className="field-group">
                            <div className="field">
                                <label>お名前（姓）</label>
                                <input {...register("lastName", { required: true })}/>
                                {errors?.lastName && <span>This field is required</span>}
                            </div>

                            <div className="field">
                                <label>お名前（名）</label>
                                <input {...register("firstName", { required: true })}/>
                                {errors?.firstName && <span>This field is required</span>}
                            </div>
                        </div>
                        <div className="field-group">
                            <div className="field">
                                <label>フリガナ（姓）</label>
                                <input {...register("lastNameKana", { required: true })}/>
                                {errors?.lastNameKana && <span>This field is required</span>}
                            </div>

                            <div className="field">
                                <label>フリガナ（名）</label>
                                <input {...register("firstNameKana", { required: true })}/>
                                {errors?.firstNameKana && <span>This field is required</span>}
                            </div>
                        </div>
                        <div className="field-group">
                            <div className="field">
                                <label>生年</label>
                                <input {...register("birthdayY", { required: true, valueAsNumber:true, min: 1900 })}/>
                                {errors?.birthdayY && <span>This field is required</span>}
                            </div>

                            <div className="field">
                                <label>月</label>
                                <input {...register("birthdayM", { required: true, valueAsNumber:true, min: 1, max: 12  })}/>
                                {errors?.birthdayM && <span>This field is required</span>}
                            </div>

                            <div className="field">
                                <label>日</label>
                                <input {...register("birthdayD", { required: true, valueAsNumber:true, min: 1, max:31 })}/>
                                {errors?.birthdayD && <span>This field is required</span>}
                            </div>
                        </div>
                        <div className="field">
                            <label>パスワード</label>
                            <input {...register("password", { required: true })} type="password"/>
                            {errors?.password && <span>This field is required</span>}
                        </div>
                        <div className="field">
                            <label>パスワード再入力</label>
                            <input {...register("confirmPassword", { required: true })} type="password"/>
                            {errors?.confirmPassword && <span>This field is required</span>}
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
                                >入力確認</Button>
                        </div>
                    </div>
                }
            </form>
        </div>
    </>
}