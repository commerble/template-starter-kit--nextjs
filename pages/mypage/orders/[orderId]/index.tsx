import Link from "next/link";
import { Button } from "../../../../components/Button";
import { CartLine } from "../../../../components/CartLine";
import { cancelOrder, commitChanges, getOrderHistory } from "../../../../modules/commerble-nextjs-sdk/client/api";
import { useEffect, useState } from "react";
import { hourRange } from "../../../../libs/constants";
import { useCommerbleState } from "../../../../modules/commerble-nextjs-sdk/client/hooks";
import { useSiteRouter } from "../../../../hooks/router";
import { CBPAAS_ENDPOINT } from "../../../../modules/commerble-nextjs-sdk/client/config";

const fmt = Intl.DateTimeFormat('ja-JP', { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });
const fmtDate = Intl.DateTimeFormat('ja-JP', { year: 'numeric', month: 'numeric', day: 'numeric' });

export async function getServerSideProps(ctx) {
    return { props: { params: ctx.params } }
}

function useCommerble(params) {
    const router = useSiteRouter();
    const id = Number(params.orderId);
    const fetcher = Number.isNaN(id) ? null : () => getOrderHistory(id);
    const [data, mutate] = useCommerbleState(fetcher);

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

    const commit = async () => {
        setLoading('commit');
        try {
            const result = await commitChanges(cb.data.id, cb.data.token);
            if (result.type === 'order/history') {
                cb.mutate(result);
            }
            if (result.type === 'next') {
                switch (result.next) {
                    case 'site/login':
                        router.login();
                        break;
                    case 'order/history':
                        router.reload();
                        break;
                    case 'order/historylist': 
                        router.push(`/mypage/orders/`);
                        break;
                    case 'purchase/external': 
                        break
                }
            }
        }
        finally {
            setLoading(null);
        }
    }
    const cancel = async () => {
        setLoading('cancel');
        try {
            const result = await cancelOrder(cb.data.id, cb.data.token);
            if (result.type === 'order/history') {
                cb.mutate(result);
            }
            if (result.type === 'next') {
                switch (result.next) {
                    case 'site/login':
                        router.login();
                        break;
                    case 'order/historylist': 
                        router.push(`/mypage/orders/`);
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
                    <div className="form-body">
                        {cb.data.state.errors.map(err => <p key={err} className="text-red-400 ml-4">※ {err}</p>)}
                        {cb.data.hasChanges && 
                            <div className="flex flex-col items-center gap-4">
                            <Button
                                loading={loading==='submit'}
                                disabled={loading}
                                looks="primary"
                                className="w-full"
                                onClick={commit}
                                >変更を保存する</Button>
                        </div>}
                        <div className="field">
                            <label>受注番号</label>
                            {cb.data.id}
                        </div>
                        <div className="field">
                            <label>受注日時</label>
                            {fmt.format(new Date(cb.data.orderDate))}
                        </div>
                        <div className="field">
                            <label>ステータス</label>
                            {cb.data.orderStatus}
                        </div>
                        <div className="field">
                            <label>お支払金額</label>
                            {cb.data.totalPayment}
                        </div>
                        <div className="field">
                            <label>お支払方法</label>
                            {cb.data.paymentMethod}
                            {cb.data.canModifyPaymentMethod&&<>
                                <br/><Link href={`/mypage/orders/${cb.data.id}/payment`}>変更する</Link>
                            </>}
                        </div>
                        <div className="field">
                            <label>決済状況</label>
                            {cb.data.paymentStatus}
                        </div>
                        <div className="field">
                            <label>配送番号</label>
                            {cb.data.deliveryOrder.deliveryNo}
                        </div>
                        <hr />
                        <h2>購入者</h2>
                        <p>
                            〒 {cb.data.orderCustomerOrderedAddress.zipCode}<br/>
                            {cb.data.orderCustomerOrderedAddress.pref} {cb.data.orderCustomerOrderedAddress.city} {cb.data.orderCustomerOrderedAddress.street}{cb.data.orderCustomerOrderedAddress.building}<br/>
                            {cb.data.orderCustomerOrderedAddress.recipientlastname} {cb.data.orderCustomerOrderedAddress.recipientfirstname} ({cb.data.orderCustomerOrderedAddress.recipientlastnamekana} {cb.data.orderCustomerOrderedAddress.recipientfirstnamekana})<br/>
                            {cb.data.orderCustomerOrderedAddress.tel}
                            {cb.data.canModify&&<>
                                <br/><Link href={`/mypage/orders/${cb.data.id}/customer`}>変更する</Link>
                            </>}
                        </p>

                        <h2>お届け先</h2>
                        <p>
                            〒 {cb.data?.deliveryOrderAddress.zipCode}<br/>
                            {cb.data.deliveryOrderAddress.pref} {cb.data.deliveryOrderAddress.city} {cb.data.deliveryOrderAddress.street}{cb.data.deliveryOrderAddress.building}<br/>
                            {cb.data.deliveryOrderAddress.recipientlastname} {cb.data.deliveryOrderAddress.recipientfirstname} ({cb.data.deliveryOrderAddress.recipientlastnamekana} {cb.data.deliveryOrderAddress.recipientfirstnamekana})<br/>
                            {cb.data.deliveryOrderAddress.tel}
                            {cb.data.canModify&&<>
                                <br/><Link href={`/mypage/orders/${cb.data.id}/shipping`}>変更する</Link>
                            </>}
                        </p>

                        <h2>お届け日時</h2>
                        <p>
                            {cb.data && cb.data.deliveryOrder.deliveryDate ? fmtDate.format(new Date(cb.data.deliveryOrder.deliveryDate)) : '指定なし'}（時間帯：{cb.data && hourRange[cb.data.deliveryOrder.hourRange]}）
                            {cb.data.canModify&&<>
                                <br/><Link href={`/mypage/orders/${cb.data.id}/delivery`}>変更する</Link>
                            </>}
                        </p>

                        <hr/>
                        {cb.data.canCancel && 
                            <div className="flex flex-col items-center gap-4">
                            <Button
                                loading={loading==='cancel'}
                                disabled={loading}
                                looks="primary"
                                className="w-full"
                                onClick={cancel}
                                >注文をキャンセルする</Button>
                        </div>}
                        {cb.data.hasChanges && 
                            <div className="flex flex-col items-center gap-4">
                            <Button
                                loading={loading==='commit'}
                                disabled={loading}
                                looks="primary"
                                className="w-full"
                                onClick={commit}
                                >変更を保存する</Button>
                        </div>}
                        <Link href="/mypage/orders">
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
