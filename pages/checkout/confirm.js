import { ArrowLeftIcon } from "@heroicons/react/outline";
import axios from "axios";
import { useRouter } from "next/dist/client/router";
import { useState } from "react";
import { CartLine } from "../../components/CartLine";
import { Price } from "../../components/Price";
import { getConfirm } from "../../libs/cbpaas";
import { ERR_UNAUTHORIZED } from "../../libs/constant";
import Link from "next/link";
import { CartSummary } from "../../components/CartSummary";

export default function CheckoutConfirmPage({data}) {
    const router = useRouter();
    const purchase = async () => {
        const result = await axios.post('/api/purchase/1', { token: data.token });
        if (result.data.errors.length === 0) {
            if (result.data.next === 'external') {
                router.push(`/checkout/external/${result.data.orderId}`);
            }
            else if (result.data.next === 'complete') {
                router.push(`/checkout/complete/${result.data.orderId}`);
            }
        }
        else {
            setForm(result);
        }
    };
    const paymentMethodText = {
        None: '指定なし',
        CashOnDelivery: '代引き',
        Token: 'クレジットカード',
    };
    const hourRange = {
        '0000': '指定なし',
        '0812': '午前中',
        '1214': '1200:14:00',
        '1416': '14:00-16:00',
        '1618': '16:00-18:00',
        '1821': '18:00-21:00',
    }
    const formatter = new Intl.DateTimeFormat('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short'});

    return <div className="layout-2col">
        <div className="layout-2col__col bg-white">
            <div className="p-2 md:p-4 md:px-8">
                <Link href="/">
                    <a className="logo">Commerble Shop</a>
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
                            qty={item.requestAmount} 
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
            <div className="form-body">
                {data.state.errors.map(err => <p key={err} className="text-red-400">※ {err}</p>)}
                <CartSummary
                    subtotal={data.subtotal+data.discountPrice}
                    discount={data.discountPrice}
                    deliveryCharge={data.deliveryCharge}
                    usagePoint={data.totalUsagePoint}
                    chargePoint={data.chargePointSummary}
                    total={data.totalPayment}
                    tax10ofTotal={data.totalPayment}
                    tax8ofTotal={data.totalPayment}/>

                <h2>お支払方法</h2>
                <p>{paymentMethodText[data.paymentMethod]}</p>

                <h2>購入者</h2>
                <p>
                    〒 {data.orderCustomerOrderedAddress.zipCode}<br/>
                    {data.orderCustomerOrderedAddress.pref} {data.orderCustomerOrderedAddress.city} {data.orderCustomerOrderedAddress.street}{data.orderCustomerOrderedAddress.building}<br/>
                    {data.orderCustomerOrderedAddress.recipientlastname} {data.orderCustomerOrderedAddress.recipientfirstname} ({data.orderCustomerOrderedAddress.recipientlastnamekana} {data.orderCustomerOrderedAddress.recipientfirstnamekana})<br/>
                    {data.orderCustomerOrderedAddress.tel}
                </p>

                <h2>お届け先</h2>
                <p>
                    〒 {data.deliveryOrderAddress.zipCode}<br/>
                    {data.deliveryOrderAddress.pref} {data.deliveryOrderAddress.city} {data.deliveryOrderAddress.street}{data.deliveryOrderAddress.building}<br/>
                    {data.deliveryOrderAddress.recipientlastname} {data.deliveryOrderAddress.recipientfirstname} ({data.deliveryOrderAddress.recipientlastnamekana} {data.deliveryOrderAddress.recipientfirstnamekana})<br/>
                    {data.deliveryOrderAddress.tel}
                </p>

                <h2>お届け日時</h2>
                <p>{formatter.format(new Date(data.deliveryOrder.deliveryDate))}（時間帯：{hourRange[data.deliveryOrder.hourRange]}）</p>

                <hr/>

                <div className="flex flex-col items-center gap-4">
                    <button className="btn-blue h-14 w-full text-lg relative" onClick={purchase}>購入する</button>
                    <button className="h-14 w-full text-lg relative" onClick={() => router.push('/checkout/step2')}>
                        <ArrowLeftIcon className="absolute left-4 inline-block w-8 h-8"/>もどる</button>
                </div>
            </div>
        </div>
    </div>
}

export async function getServerSideProps(ctx) {
    const data = await getConfirm(ctx, 1);

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