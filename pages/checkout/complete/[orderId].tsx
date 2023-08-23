import { ArrowDownIcon, ArrowRightIcon, CheckCircleIcon, CurrencyYenIcon, GiftIcon, TruckIcon } from "@heroicons/react/outline";
import { CartLine } from "../../../components/CartLine";
import Link from "next/link";
import { useEffect } from "react";
import { useSiteRouter } from "../../../hooks/router";
import { useCommerbleState } from "../../../modules/commerble-nextjs-sdk/client/hooks";
import { getPurchaseComplete } from "../../../modules/commerble-nextjs-sdk/client/api";
import { CBPAAS_ENDPOINT } from "../../../modules/commerble-nextjs-sdk/client/config";

export async function getServerSideProps(ctx) {
    return { props: { params: ctx.params } }
}

function useCommerble(params) {
    const router = useSiteRouter();
    const [data, mutate] = useCommerbleState(() => getPurchaseComplete(1, params.orderId));

    useEffect(() => {
        if (data?.type === 'next' && data.next === 'site/login') {
            router.login();
        }
    }, [data]);

    return {
        data: data?.type === 'purchase/complete' ? data : null,
        mutate
    }
}

export default function CheckoutCompletePage({params}) {
    const router = useSiteRouter();
    const cb = useCommerble(params);

    return <div className="layout-2col">
        <div className="layout-2col__col bg-white">
            <div className="p-2 md:p-4 md:px-8">
                <Link href="/" className="logo">
                    Commerble Shop
                </Link>
            </div>
            <h1 className="text-center my-8 text-indigo-900 text-4xl">Thank you :)</h1>
            <div className="x-center gap-8  w-full">
                    <section className="cart-items">
                    {cb.data?.items.map(item => (
                        <CartLine 
                            key={item.productId}
                            productId={item.productId}
                            name={item.productName} 
                            variation={item.externalId2} 
                            unitPrice={item.unitPriceWithTax} 
                            qty={item.orderAmount} 
                            img={`${CBPAAS_ENDPOINT}/primaryproductimages/${item.productId}/Large`}
                            hiddenActions/>
                    ))}
                </section>
            </div>
        </div>
        <div className="layout-2col__col x-center pt-16">
            <h2>お買い上げありがとうございます。</h2>
            <div className="form-body">
                <ul className="bg-white rounded p-8 md:w-96 max-w-xl">
                    <li className="text-xl text-indigo-600"><CurrencyYenIcon className="inline-block w-16 h-16 mr-8"/>ご注文完了</li>
                    <li className="text-gray-500"><ArrowDownIcon className="inline-block w-8 h-16 mr-12 ml-4"/>翌営業日</li>
                    <li className="text-xl"><GiftIcon className="inline-block w-16 h-16 text-gray-500 mr-8"/>発送準備</li>
                    <li className="text-gray-500"><ArrowDownIcon className="inline-block w-8 h-16 mr-12 ml-4"/></li>
                    <li className="text-xl"><TruckIcon className="inline-block w-16 h-16 text-gray-500 mr-8"/>配送</li>
                    <li className="text-gray-500"><ArrowDownIcon className="inline-block w-8 h-16 mr-12 ml-4"/>1～2日</li>
                    <li className="text-xl"><CheckCircleIcon className="inline-block w-16 h-16 text-gray-500 mr-8"/>お受け取り</li>
                </ul>

                <hr/>

                <div className="flex flex-col items-center gap-4">
                    {/* <button className="btn btn-blue h-14 w-full text-lg relative" onClick={() => {}}>注文履歴を確認する<ArrowRightIcon className="absolute right-4 inline-block w-8 h-8"/></button> */}
                    <Link href="/" className="btn btn-gray h-14 w-full relative">
                        ショッピングをつづける<ArrowRightIcon className="absolute right-4 inline-block w-8 h-8"/>
                    </Link>
                </div>
            </div>
        </div>
    </div>
}