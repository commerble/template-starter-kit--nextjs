import Link from "next/link";
import { useEffect } from "react";
import { Button } from "../../../components/Button";
import { Scrollable } from "../../../components/Scrollable";
import { getMemberNoticeList } from "../../../modules/commerble-nextjs-sdk/client/api";
import { CartLine } from "../../../components/CartLine";
import { ArrowRightIcon } from "@heroicons/react/outline";
import { useCommerbleState } from "../../../modules/commerble-nextjs-sdk/client/hooks";
import { useSiteRouter } from "../../../hooks/router";
import { CBPAAS_ENDPOINT } from "../../../modules/commerble-nextjs-sdk/client/config";

function useCommerble() {
    const router = useSiteRouter();
    const page = Number(router.query.page) || 0;
    const [data, mutate] = useCommerbleState(() => getMemberNoticeList(page));

    useEffect(() => {
        if (data?.type === 'next' && data.next === 'site/login') {
            router.login();
        }
    }, [data]);

    return { 
        data: data?.type === 'member/noticelist' ? data : null, 
        mutate
    };
}


export default function MyNoticeListPage() {
    const cb = useCommerble();

    return <>
        <div className="layout-2col">
            <div className="layout-2col__col bg-center bg-cover" style={{backgroundImage: "url('https://commerble.blob.core.windows.net/corporate/images/AdobeStock_244795496.webp')"}}>
                <div className="p-2 md:p-4 md:px-8">
                    <Link href="/" className="logo bg-white pb-1 px-2">
                        Commerble Shop
                    </Link>
                </div>
                <h1 className="text-center my-14 text-white text-4xl">Notices</h1>
            </div>
            <Scrollable trigger={cb.data?.paging.current} className="layout-2col__col x-center pt-16">
                {cb.data&&
                <div className="form-body">
                    {cb.data?.state.messages.map(msg => <p key={msg} className="bg-green-100 p-2 text-center">{msg}</p>)}
                    {cb.data.items.map(item => 
                        <CartLine 
                            key={item.id}
                            productId={item.product.id}
                            name={item.product.name}
                            variation={item.product.externalId2}
                            unitPrice={item.product.unitPriceWithTax}
                            img={`${CBPAAS_ENDPOINT}/primaryproductimages/${item.product.id}/Large`}
                            href={item.canCancel ? `/mypage/notices/${item.id}`:undefined}
                            hiddenActions 
                            desc={item.status}/>)}
                    <hr />
                    {cb.data.paging.current < cb.data.paging.maxPage - 1 &&
                        <Link href={`/mypage/notices/?page=${cb.data.paging.current+1}`}>
                            <Button
                                looks="default"
                                className="w-full"
                                rightIcon={<ArrowRightIcon className="absolute right-4 inline-block w-8 h-8 ml-5"/>}
                                >次のページ</Button>
                        </Link>
                    }
                    <Link href="/mypage/">
                        <Button
                            looks="text"
                            className="w-full text-sm h-4"
                            >もどる</Button>
                    </Link>
                </div>
                }
            </Scrollable>
        </div>
    </>
}