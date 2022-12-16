import { ArrowRightIcon } from "@heroicons/react/outline";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { Button } from "../../components/Button";
import useCommerble from "../../libs/commerble";

export default function SignupCompletePage() {
    const router = useRouter();
    const cb = useCommerble();

    useEffect(() => {
        if (!cb.data.registerComplete) {
            router.push('/signup/');
        }
    },[])
    return <>
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
                    <h2>確認メールを送信しました。</h2>
                    {cb.data.registerComplete?.state.messages.map(msg => <p key={msg} className="text-green-400 ml-4">※ {msg}</p>)}
                    <p>
                        ご登録のメールアドレスに確認メールを送信しました。<br/>
                        メールに記載のURLを開き、メールアドレスの確認を完了してください。
                    </p>
                </div>
            </div>
        </div>
    </>
}