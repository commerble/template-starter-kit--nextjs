import { ArrowLeftIcon, SunIcon } from "@heroicons/react/outline";
import { useRouter } from "next/dist/client/router";
import { CartLine } from "../../components/CartLine";
import Link from "next/link";
import { CartSummary } from "../../components/CartSummary";
import useCommerble from "../../libs/commerble";
import { useEffect, useState } from "react";
import { Button } from "../../components/Button";

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

export default function CheckoutConfirmPage({data}) {
    const router = useRouter();
    const cb = useCommerble();
    const [loading, setLoading] = useState(null);

    useEffect(() => {
        cb.getConfirmInfo(1)
    },[])

    const purchase = async () => {
        try{
            setLoading('submit');
            await cb.purchase();
        }
        finally{
            setLoading(null);
        }
    };

    const back = () => {
        setLoading('back');
        cb.clearFormCache();
        router.push('/checkout/step2');
    }

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
                    {cb.data.confirm?.items.map(item => (
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
            </div>
        </div>
        <div className="layout-2col__col x-center pt-16">
            <div className="form-body">
                {cb.data.confirm?.state.errors.map(err => <p key={err} className="text-red-400">※ {err}</p>)}
                <CartSummary
                    subtotal={cb.data.confirm?.subtotal+cb.data.confirm?.discountPrice}
                    discount={cb.data.confirm?.discountPrice}
                    deliveryCharge={cb.data.confirm?.deliveryCharge}
                    usagePoint={cb.data.confirm?.totalUsagePoint}
                    chargePoint={cb.data.confirm?.chargePointSummary}
                    total={cb.data.confirm?.totalPayment}
                    tax10ofTotal={cb.data.confirm?.totalPayment}
                    tax8ofTotal={0}/>

                <h2>お支払方法</h2>
                <p>{paymentMethodText[cb.data.confirm?.paymentMethod]}</p>

                <h2>購入者</h2>
                <p>
                    〒 {cb.data.confirm?.orderCustomerOrderedAddress.zipCode}<br/>
                    {cb.data.confirm?.orderCustomerOrderedAddress.pref} {cb.data.confirm?.orderCustomerOrderedAddress.city} {cb.data.confirm?.orderCustomerOrderedAddress.street}{cb.data.confirm?.orderCustomerOrderedAddress.building}<br/>
                    {cb.data.confirm?.orderCustomerOrderedAddress.recipientlastname} {cb.data.confirm?.orderCustomerOrderedAddress.recipientfirstname} ({cb.data.confirm?.orderCustomerOrderedAddress.recipientlastnamekana} {cb.data.confirm?.orderCustomerOrderedAddress.recipientfirstnamekana})<br/>
                    {cb.data.confirm?.orderCustomerOrderedAddress.tel}
                </p>

                <h2>お届け先</h2>
                <p>
                    〒 {cb.data.confirm?.deliveryOrderAddress.zipCode}<br/>
                    {cb.data.confirm?.deliveryOrderAddress.pref} {cb.data.confirm?.deliveryOrderAddress.city} {cb.data.confirm?.deliveryOrderAddress.street}{cb.data.confirm?.deliveryOrderAddress.building}<br/>
                    {cb.data.confirm?.deliveryOrderAddress.recipientlastname} {cb.data.confirm?.deliveryOrderAddress.recipientfirstname} ({cb.data.confirm?.deliveryOrderAddress.recipientlastnamekana} {cb.data.confirm?.deliveryOrderAddress.recipientfirstnamekana})<br/>
                    {cb.data.confirm?.deliveryOrderAddress.tel}
                </p>

                <h2>お届け日時</h2>
                <p>{cb.data.confirm && cb.data.confirm?.deliveryOrder.deliveryDate ? formatter.format(new Date(cb.data.confirm?.deliveryOrder.deliveryDate)) : '指定なし'}（時間帯：{cb.data.confirm && hourRange[cb.data.confirm?.deliveryOrder.hourRange]}）</p>

                <hr/>

                <div className="flex flex-col items-center gap-4">
                    <Button
                        loading={loading==='submit'}
                        disabled={loading}
                        type="submit"
                        looks="primary"
                        className="w-full"
                        onClick={purchase}
                        >購入する</Button>
                    <Button
                        loading={loading==='back'}
                        disabled={loading}
                        looks="text"
                        className="w-full"
                        leftIcon={<ArrowLeftIcon className="absolute left-4 inline-block w-8 h-8"/>}
                        onClick={back}
                        >もどる</Button>
                </div>
            </div>
        </div>
    </div>
}
