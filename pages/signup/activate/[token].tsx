import { ArrowRightIcon } from "@heroicons/react/outline";
import Link from "next/link";
import { Button } from "../../../components/Button";
import { getSiteActivate } from "../../../modules/commerble-nextjs-sdk/client/api";
import { useCommerbleState } from "../../../modules/commerble-nextjs-sdk/client/hooks";

function useCommerble(params) {
    const [data, mutate] = useCommerbleState(() => getSiteActivate(params.token));

    return { 
        data: data?.type === 'site/activate' ? data : null, 
        mutate,
    };
}

export default function ActivatePage({params}) {
    const cb = useCommerble(params);

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
            <div className="layout-2col__col x-center pt-16">
                <div className="form-body">
                    <h2>会員登録が完了しました。</h2>
                    {cb.data?.state.messages.map(msg => <p key={msg} className="text-green-400 ml-4">※ {msg}</p>)}
                    <p>
                        ご登録いただいたユーザー名とパスワードでログイン後、引き続きお買い物をお楽しみください。
                    </p>
                    <hr/>
                    <Link href="/cart">
                        <Button
                            looks="primary"
                            className="w-full"
                            rightIcon={<ArrowRightIcon className="absolute right-4 inline-block w-8 h-8 ml-5"/>}
                            >カート</Button>
                    </Link>
                    <Link href="/mypage">
                        <Button
                            className="w-full"
                            >マイページ</Button>
                    </Link>
                    <Link href="/">
                        <Button
                            looks="text"
                            className="w-full"
                            >トップページ</Button>
                    </Link>
                </div>
            </div>
        </div>
    </>
}

export async function getServerSideProps(ctx) {
    return { props: { params: ctx.params } }
}