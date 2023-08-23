import Link from "next/link";
import { Button } from "../../../../components/Button";
import { CartLine } from "../../../../components/CartLine";
import { getOrderHistory, modifyPayment } from "../../../../modules/commerble-nextjs-sdk/client/api";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useSiteRouter } from "../../../../hooks/router";
import { useCommerbleState } from "../../../../modules/commerble-nextjs-sdk/client/hooks";
import { CBPAAS_ENDPOINT } from "../../../../modules/commerble-nextjs-sdk/client/config";

export async function getServerSideProps(ctx) {
    return { props: { params: ctx.params } }
}

function useCommerble(params) {
    const router = useSiteRouter();
    const id = Number(params.orderId);
    const [data, mutate] = useCommerbleState(() => getOrderHistory(id));

    useEffect(() => {
        if (data?.type === 'next' && data.next === 'site/login') {
            router.login();
        }
    }, [data]);

    return { 
        data: data?.type === 'order/history' ? data : null, 
        mutate
    };
}


export default function MyOrderPage({params}) {
    const router = useSiteRouter();
    const cb = useCommerble(params);
    const [loading, setLoading] = useState(null);
    const { register, handleSubmit, formState: { errors }, reset } = useForm({
        defaultValues: cb.data
    })

    useEffect(() => {
        reset(cb.data);
    }, [reset, cb.data]);

    const onSubmit = async (data) => {
        setLoading('submit');
        try {
            const result = await modifyPayment(data);
            if (result.type === 'order/historypayment') {
                cb.mutate({...result, type: 'order/history'});
            }
            if (result.type === 'next') {
                switch (result.next) {
                    case 'site/login': 
                        router.login();
                        break;
                    case 'order/history': 
                        router.push(`/mypage/orders/${cb.data.id}`);
                        break;
                }
            }
        }
        finally {
            setLoading(null);
        }
    }

    return <>
        <div className="layout-2col">
            <div className="layout-2col__col bg-white">
                <div className="p-2 md:p-4 md:px-8">
                    <Link href="/" className="logo">
                        Commerble Shop
                    </Link>
                </div>
                <h1 className="text-center my-8 text-indigo-900 text-4xl">MY ORDERS</h1>
                <div className="x-center gap-8  w-full">
                    {cb.data&&
                        <section className="cart-items">
                            {cb.data.items.length === 0 && (
                                <p>カートに商品が入っていません。</p>
                            )}
                            {cb.data.items.map(item => (
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
                    }
                </div>
            </div>
            <div className="layout-2col__col x-center py-16">
                {cb.data&&
                    <form className="form-body" onSubmit={handleSubmit(onSubmit)}>
                        {cb.data.state.errors.map(err => <p key={err} className="text-red-400 ml-4">※ {err}</p>)}
                        <div className="field">
                            <label>お支払方法</label>
                            <select {...register('paymentMethod')}>
                                <option value="CashOnDelivery">代引き</option>
                                <option value="Token">クレジットカード</option>
                            </select>
                            {errors?.paymentMethod && <span>This field is required</span>}
                        </div>
                        <hr/>
                        <div className="flex flex-col items-center gap-4">
                            <Button
                                loading={loading==='submit'}
                                disabled={loading}
                                type="submit"
                                looks="primary"
                                className="w-full"
                                >変更する</Button>
                        </div>
                        <Link href={`/mypage/orders/${cb.data.id}`}>
                            <Button
                                looks="text"
                                className="w-full text-sm h-4"
                                >もどる</Button>
                        </Link>
                    </form>
                }
            </div>
        </div>
    </>
}