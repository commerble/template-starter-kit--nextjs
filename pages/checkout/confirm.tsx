import { ArrowLeftIcon } from "@heroicons/react/outline";
import { CartLine } from "../../components/CartLine";
import Link from "next/link";
import { CartSummary } from "../../components/CartSummary";
import { useEffect, useState } from "react";
import { Button } from "../../components/Button";
import { useSiteRouter } from "../../hooks/router";
import { useCommerbleState } from "../../modules/commerble-nextjs-sdk/client/hooks";
import { getPurchaseConfirm, purchase } from "../../modules/commerble-nextjs-sdk/client/api";
import { hourRange, paymentMethodText } from "../../libs/constants";
import { CBPAAS_ENDPOINT } from "../../modules/commerble-nextjs-sdk/client/config";

const formatter = new Intl.DateTimeFormat('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short'});

function useCommerble() {
    const router = useSiteRouter();
    const [data, mutate] = useCommerbleState(() => getPurchaseConfirm(1));

    useEffect(() => {
        if (data?.type === 'next' && data.next === 'site/login') {
            router.login();
        }
    }, [data]);

    return {
        data: data?.type === 'purchase/confirm' ? data : null,
        mutate
    }
}

export default function CheckoutConfirmPage() {
    const router = useSiteRouter();
    const cb = useCommerble();
    const [loading, setLoading] = useState(null);

    const checkout = async () => {
        setLoading('submit');
        try{
            const result = await purchase(1, cb.data.token);
            if (result.type === 'purchase/error') {
                cb.mutate({...result, type: 'purchase/confirm'});
            }
            if (result.type === 'next') {
                switch (result.next) {
                    case 'site/login':
                        router.login();
                        break;
                    case 'purchase/complete':
                        const id = result.raw.match(/\/(\d+)$/)[1];
                        router.push(`/checkout/complete/${id}/`);
                        break;
                    case 'purchase/external':
                        throw new Error('unused');
                }
            }
        }
        finally{
            setLoading(null);
        }
    };

    const back = () => {
        router.push('/checkout/step2/');
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
                    {cb.data?.items.map(item => (
                        <CartLine 
                            key={item.productId}
                            productId={item.productId}
                            name={item.productName} 
                            variation={item.externalId2} 
                            unitPrice={item.unitPriceWithTax} 
                            qty={item.requestAmount} 
                            img={`${CBPAAS_ENDPOINT}/primaryproductimages/${item.productId}/Large`}
                            hiddenActions/>
                    ))}
                </section>
            </div>
        </div>
        <div className="layout-2col__col x-center pt-16">
            <div className="form-body">
                {cb.data?.state.errors.map(err => <p key={err} className="text-red-400">※ {err}</p>)}
                <CartSummary
                    subtotal={cb.data?.subtotal+cb.data?.discountPrice}
                    discount={cb.data?.discountPrice}
                    deliveryCharge={cb.data?.deliveryCharge}
                    usagePoint={cb.data?.totalUsagePoint}
                    chargePoint={cb.data?.chargePointSummary}
                    total={cb.data?.totalPayment}
                    tax10ofTotal={cb.data?.totalPayment}
                    tax8ofTotal={0}/>

                <h2>お支払方法</h2>
                <p>{paymentMethodText[cb.data?.paymentMethod]}</p>

                <h2>購入者</h2>
                <p>
                    〒 {cb.data?.orderCustomerOrderedAddress.zipCode}<br/>
                    {cb.data?.orderCustomerOrderedAddress.pref} {cb.data?.orderCustomerOrderedAddress.city} {cb.data?.orderCustomerOrderedAddress.street}{cb.data?.orderCustomerOrderedAddress.building}<br/>
                    {cb.data?.orderCustomerOrderedAddress.recipientlastname} {cb.data?.orderCustomerOrderedAddress.recipientfirstname} ({cb.data?.orderCustomerOrderedAddress.recipientlastnamekana} {cb.data?.orderCustomerOrderedAddress.recipientfirstnamekana})<br/>
                    {cb.data?.orderCustomerOrderedAddress.tel}
                </p>

                <h2>お届け先</h2>
                <p>
                    〒 {cb.data?.deliveryOrderAddress.zipCode}<br/>
                    {cb.data?.deliveryOrderAddress.pref} {cb.data?.deliveryOrderAddress.city} {cb.data?.deliveryOrderAddress.street}{cb.data?.deliveryOrderAddress.building}<br/>
                    {cb.data?.deliveryOrderAddress.recipientlastname} {cb.data?.deliveryOrderAddress.recipientfirstname} ({cb.data?.deliveryOrderAddress.recipientlastnamekana} {cb.data?.deliveryOrderAddress.recipientfirstnamekana})<br/>
                    {cb.data?.deliveryOrderAddress.tel}
                </p>

                <h2>お届け日時</h2>
                <p>{cb.data && cb.data?.deliveryOrder.deliveryDate ? formatter.format(new Date(cb.data?.deliveryOrder.deliveryDate)) : '指定なし'}（時間帯：{cb.data && hourRange[cb.data?.deliveryOrder.hourRange]}）</p>

                <hr/>

                <div className="flex flex-col items-center gap-4">
                    <Button
                        loading={loading==='submit'}
                        disabled={loading}
                        type="submit"
                        looks="primary"
                        className="w-full"
                        onClick={checkout}
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
