import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/outline";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Button } from "../../components/Button";
import useCommerble from "../../libs/commerble";

export default function SignupConfirmPage() {
    const router = useRouter();
    const cb = useCommerble();
    const [loading, setLoading] = useState(null);

    useEffect(() => {
        if (!cb.data.registerConfirm) {
            router.push('/signup/');
        }
    },[])

    const register = async () => {
        try{
            setLoading('submit');
            await cb.register(cb.data.registerConfirm);
        }
        finally{
            setLoading(null);
        }
    }

    const back = async () => {
        try{
            setLoading('back');
            // await cb.backRegisterForm(cb.data.registerConfirm);
            router.push('/signup/');
        }
        finally{
            setLoading(null);
        }
    }

    return <>
        {cb.data.registerConfirm&&
        <div className="layout-2col">
            <div className="layout-2col__col bg-center bg-cover" style={{backgroundImage: "url('https://commerble.blob.core.windows.net/corporate/images/AdobeStock_244795496.webp')"}}>
                <div className="p-2 md:p-4 md:px-8">
                    <Link href="/" className="logo bg-white pb-1 px-2">
                        Commerble Shop
                    </Link>
                </div>
                <h1 className="text-center my-8 text-white text-4xl">Signup</h1>
            </div>
            <div className="layout-2col__col x-center pt-16">
                <div className="form-body">
                    {cb.data.register?.state.errors.map(err => <p key={err} className="text-red-400 ml-4">※ {err}</p>)}
                    <h2>メールアドレス</h2>
                    <p>
                        {cb.data.registerConfirm.userName}
                    </p>
                    <h2>お名前</h2>
                    <p>
                        {cb.data.registerConfirm.lastName} {cb.data.registerConfirm.firstName} ({cb.data.registerConfirm.lastNameKana} {cb.data.registerConfirm.firstNameKana})<br/>
                    </p>
                    <h2>生年月日</h2>
                    <p>
                        {cb.data.registerConfirm.birthdayY} 年 {cb.data.registerConfirm.birthdayM} 月 {cb.data.registerConfirm.birthdayD} 日
                    </p>
                    <hr/>
                    <div className="flex flex-col items-center gap-4">
                        <Button
                            loading={loading==='submit'}
                            disabled={loading}
                            looks="primary"
                            className="w-full"
                            rightIcon={<ArrowRightIcon className="absolute right-4 inline-block w-8 h-8 ml-5"/>}
                            onClick={register}
                            >入力確認</Button>
                        <Button
                            loading={loading==='back'}
                            disabled={loading}
                            looks="text"
                            className="w-full"
                            leftIcon={<ArrowLeftIcon className="absolute left-4 inline-block w-8 h-8 mr-5"/>}
                            onClick={back}
                            >入力内容を変更する</Button>
                    </div>
                </div>
            </div>
        </div>
        }
    </>
}