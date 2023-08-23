import Link from "next/link";
import { Button } from "../../components/Button";
import { getMemberPoint } from "../../modules/commerble-nextjs-sdk/client/api";
import { useEffect, useState } from "react";
import { useSiteRouter } from "../../hooks/router";
import { useCommerbleState } from "../../modules/commerble-nextjs-sdk/client/hooks";

const fmt = Intl.DateTimeFormat('ja-JP', { year: 'numeric', month: 'numeric', day: 'numeric' })

function useCommerble() {
    const router = useSiteRouter();
    const [data, mutate] = useCommerbleState(() => getMemberPoint());

    useEffect(() => {
        if (data?.type === 'next' && data.next === 'site/login') {
            router.login();
        }
    }, [data]);

    return { 
        data: data?.type === 'member/point' ? data : null, 
        mutate
    };
}

export default function MyPointPage() {
    const cb = useCommerble();

    return <>
        <div className="layout-2col">
            <div className="layout-2col__col bg-center bg-cover" style={{backgroundImage: "url('https://commerble.blob.core.windows.net/corporate/images/AdobeStock_244795496.webp')"}}>
                <div className="p-2 md:p-4 md:px-8">
                    <Link href="/" className="logo bg-white pb-1 px-2">
                        Commerble Shop
                    </Link>
                </div>
                <h1 className="text-center my-14 text-white text-4xl">MY POINT</h1>
            </div>
            <div className="layout-2col__col x-center pt-16">
                {cb.data &&
                    <div className="form-body">
                        <h2>有効ポイント</h2>
                        <p>{cb.data.activePoint} pt</p>

                        <h2>付与予定ポイント</h2>
                        <p>{cb.data.temporaryPoint} pt</p>

                        <h2>有効期限</h2>
                        <p>{fmt.format(new Date(cb.data.expireDate))}</p>
                        
                        <hr />
                        <Link href="/mypage/">
                            <Button
                                looks="text"
                                className="w-full text-sm h-4"
                                >もどる</Button>
                        </Link>
                    </div>
                }
            </div>
        </div>
    </>
}