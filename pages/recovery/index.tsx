import { ArrowRightIcon } from "@heroicons/react/outline";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "../../components/Button";
import { useCommerbleState } from "../../modules/commerble-nextjs-sdk/client/hooks";
import { getSiteRecovery, requestRecovery } from "../../modules/commerble-nextjs-sdk/client/api";

function useCommerble() {
    const [data, mutate] = useCommerbleState(() => getSiteRecovery());
    return { 
        data: data?.type === 'site/recovery' ? data : null, 
        mutate
    };
}

export default function RecoveryPage() {
    const cb = useCommerble();
    const [loading, setLoading] = useState(null);
    const { register, handleSubmit, formState: { errors } } = useForm({
        defaultValues: { userName: '' }
    })

    const onSubmit = async (data) => {
        setLoading('submit');
        try{
            const result = await requestRecovery(data, cb.data.token);
            if (result.type === 'site/recovery') {
                cb.mutate(result);
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
                        {cb.data.state.messages.map(msg => <p key={msg} className="bg-green-100 p-2 text-center">{msg}</p>)}
                        <div className="field">
                            <label>メールアドレス</label>
                            <input {...register("userName", { required: true })} autoFocus={true}/>
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
                                >入力確認</Button>
                        </div>
                    </div>
                }
            </form>
        </div>
    </>
}