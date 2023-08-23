import { useEffect } from "react"
import { checkout, checkoutAsGuest } from "../../modules/commerble-nextjs-sdk/client/api";
import Link from "next/link";
import { CartLine } from "../../components/CartLine";
import { useSiteRouter } from "../../hooks/router";
import { useCommerbleState } from "../../modules/commerble-nextjs-sdk/client/hooks";
import { CBPAAS_ENDPOINT } from "../../modules/commerble-nextjs-sdk/client/config";

export async function getServerSideProps(ctx) {
    return { props: { query: ctx.query } }
}

function useCommerble(query) {
    const router = useSiteRouter();
    const asGuest = query.asGuest === 'true';
    const fetcher = asGuest ? () => checkoutAsGuest(1) : () => checkout(1);
    const [data, mutate] = useCommerbleState(fetcher);
    useEffect(() => {
        if (data?.type === 'next') {
            switch (data.next) {
                case 'site/login':
                    router.login();
                    break;
                case 'purchase/shipping':
                    router.push(`/checkout/step1`);
                    break;
                case 'purchase/confirm':
                    router.push(`/checkout/confirm`);
                    break;
            }
        }
    },[data]);
    return { data, mutate };
}

export default function Page({query}) {
    const { data } = useCommerble(query)
    
    if (!data||data.type==='next') return <div></div>
    return <div className="layout-2col">
        <div className="layout-2col__col bg-white">
            <div className="p-2 md:p-4 md:px-8">
                <Link href="/" className="logo">
                    Commerble Shop
                </Link>
            </div>
            <h1 className="text-center my-8 text-indigo-900 text-4xl">Check out</h1>
            <div className="x-center gap-8  w-full">
                    <section className="cart-items">
                    {data?.items.map(item => (
                        <CartLine 
                            key={item.productId}
                            productId={item.productId}
                            name={item.productName} 
                            variation={item.externalId2} 
                            unitPrice={item.unitPriceWithTax} 
                            qty={item.requestAmount} 
                            img={`${CBPAAS_ENDPOINT}/primaryproductimages/${item.productId}/Large`}
                            hiddenActions   
                            href={undefined}/>
                    ))}
                </section>
            </div>
        </div>
        <div className="layout-2col__col x-center pt-16">
            <div className="form-body">
                {data?.state.errors.map(err => <p key={err} className="text-red-400">※ {err}</p>)}
            </div>
        </div>
    </div>
}