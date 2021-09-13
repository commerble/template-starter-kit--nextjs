import { ArrowDownIcon, ArrowRightIcon, CheckCircleIcon, CubeIcon, CurrencyYenIcon, TruckIcon } from "@heroicons/react/outline";
import { useRouter } from "next/dist/client/router";
import { CartLine } from "../../../components/CartLine";
import { getComplete } from "../../../libs/cbpaas";
import Link from "next/link";

export default function CheckoutCompletePage({data}) {
    const router = useRouter();
    return <div className="layout-2col">
        <div className="layout-2col__col bg-white">
            <div className="p-2 md:p-4 md:px-8">
                <Link href="/">
                    <a href="/" className="logo">Commerble Shop</a>
                </Link>
            </div>
            <h1 className="text-center my-8 text-indigo-900 text-4xl">Check out</h1>
            <div className="x-center gap-8  w-full">
                    <section className="cart-items">
                    {data.items.map(item => (
                        <CartLine 
                            key={item.productId}
                            productId={item.productId}
                            name={item.productName} 
                            variation={item.externalId2} 
                            unitPrice={item.unitPriceWithTax} 
                            qty={item.orderAmount} 
                            img={item.thumbnail}
                            linePrice={item.linePrice} 
                            discountPrice={item.discountPrice}
                            hiddenActions/>
                    ))}
                </section>
                {/* <pre className="w-full overflow-x-scroll">{"//DEBUG INFO\n" + JSON.stringify(data, null, '\t')}</pre> */}
            </div>
        </div>
        <div className="layout-2col__col x-center pt-16">
            <h2>お買い上げありがとうございます。</h2>
            <div className="form-body">
                <ul className="bg-white rounded p-8 w-96 max-w-xl">
                    <li className="text-xl text-indigo-600"><CurrencyYenIcon className="inline-block w-16 h-16 mr-8"/>ご注文完了</li>
                    <li className="text-gray-500"><ArrowDownIcon className="inline-block w-8 h-16 mr-12 ml-4"/>翌営業日</li>
                    <li className="text-xl"><CubeIcon className="inline-block w-16 h-16 text-gray-500 mr-8"/>発送準備</li>
                    <li className="text-gray-500"><ArrowDownIcon className="inline-block w-8 h-16 mr-12 ml-4"/></li>
                    <li className="text-xl"><TruckIcon className="inline-block w-16 h-16 text-gray-500 mr-8"/>配送</li>
                    <li className="text-gray-500"><ArrowDownIcon className="inline-block w-8 h-16 mr-12 ml-4"/>1～2日</li>
                    <li className="text-xl"><CheckCircleIcon className="inline-block w-16 h-16 text-gray-500 mr-8"/>完了</li>
                </ul>

                <hr/>

                <div className="flex flex-col items-center gap-4">
                    <button className="btn btn-blue h-14 w-full text-lg relative" onClick={() => {}}>注文履歴を確認する<ArrowRightIcon className="absolute right-4 inline-block w-8 h-8"/></button>
                    <Link href="/">
                        <a className="btn btn-gray h-14 w-full text-lg relative" onClick={() => router.push('/')}>ショッピングをつづける<ArrowRightIcon className="absolute right-4 inline-block w-8 h-8"/></a>
                    </Link>
                </div>
            </div>
        </div>
    </div>
}

export async function getServerSideProps(ctx) {
    const data = await getComplete(ctx, 1, ctx.params.orderId);

    if (data.errors.some(err => err.type === ERR_UNAUTHORIZED)) {
        return {
            redirect: {
                permanent: false,
                destination: "/login",
            },
            props:{},
        }
    }

    return { props: { data: data } }
}