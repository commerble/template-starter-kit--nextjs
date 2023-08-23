import { ClockIcon, UserIcon, HeartIcon, ShoppingBagIcon, SparklesIcon, TruckIcon } from "@heroicons/react/outline";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "../../components/Button";
import { getMemberIndex, logout } from "../../modules/commerble-nextjs-sdk/client/api";
import { useSiteRouter } from "../../hooks/router";
import { useCommerbleState } from "../../modules/commerble-nextjs-sdk/client/hooks";

function useCommerble() {
    const router = useSiteRouter();
    const [data, mutate] = useCommerbleState(() => getMemberIndex());

    useEffect(() => {
        if (data?.type === 'next' && data.next === 'site/login') {
            router.login();
        }
    }, [data]);

    return { 
        data: data?.type === 'member/index' ? data : null, 
        mutate
    };
}

export default function MyPage() {
    const cb = useCommerble();
    const [loading, setLoading] = useState(null);

    const signout = () => {
        setLoading('logout');
        logout('/');
    };

    return <>
        <div className="layout-2col">
            <div className="layout-2col__col bg-center bg-cover" style={{backgroundImage: "url('https://commerble.blob.core.windows.net/corporate/images/AdobeStock_244795496.webp')"}}>
                <div className="p-2 md:p-4 md:px-8">
                    <Link href="/" className="logo bg-white pb-1 px-2">
                        Commerble Shop
                    </Link>
                </div>
                <h1 className="text-center my-14 text-white text-4xl">MY PAGE</h1>
            </div>
            <div className="layout-2col__col x-center pt-16">
                {cb.data&&
                    <div className="form-body">
                        {cb.data.state.errors.map(err => <p key={err} className="text-red-400">※ {err}</p>)}
                        {cb.data.state.messages.map(msg => <p key={msg} className="bg-green-100 p-2 text-center">{msg}</p>)}
                        <ul className="menu">
                            <li>
                                <Link href="/mypage/orders/">
                                    <ShoppingBagIcon className="inline-block w-6 h-6 left-1/2 -ml-20 absolute"/>
                                    購入履歴
                                </Link>
                            </li>
                            <li>
                                <Link href="/mypage/account">
                                    <UserIcon className="inline-block w-6 h-6 left-1/2 -ml-20 absolute"/>
                                    会員情報
                                </Link>
                            </li>
                            <li>
                                <Link href="/mypage/point">
                                    <SparklesIcon className="inline-block w-6 h-6 left-1/2 -ml-20 absolute"/>
                                    ポイント
                                </Link>
                            </li>
                            <li>
                                <Link href="/mypage/destinations/">
                                    <TruckIcon className="inline-block w-6 h-6 left-1/2 -ml-20 absolute"/>
                                    お届け先
                                </Link>
                            </li>
                            <li>
                                <Link href="/mypage/favorites/">
                                    <HeartIcon className="inline-block w-6 h-6 left-1/2 -ml-20 absolute"/>
                                    お気に入り
                                </Link>
                            </li>
                            <li>
                                <Link href="/mypage/notices/">
                                    <ClockIcon className="inline-block w-6 h-6 left-1/2 -ml-20 absolute"/>
                                    次回入荷予約
                                </Link>
                            </li>
                        </ul>
                        <hr />
                        <Button
                            loading={loading==='logout'}
                            disabled={loading}
                            looks="text"
                            className="w-full text-sm h-4"
                            onClick={signout}
                            >ログアウト</Button>
                    </div>
                }
            </div>
        </div>
    </>
}