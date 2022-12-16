import { ArrowLeftIcon, ArrowRightIcon, SunIcon } from "@heroicons/react/outline";
import { useRouter } from "next/dist/client/router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { CartLine } from "../../components/CartLine";
import Link from "next/link";
import useCommerble from "../../libs/commerble";
import { Button } from "../../components/Button";

export default function CheckoutStep2Page({data}) {
    const router = useRouter();
    const cb = useCommerble();
    const [loading, setLoading] = useState(null);
    const { register, handleSubmit, formState: { errors }, getValues, setValue, reset } = useForm({
        defaultValues: cb.data.shipping
    })

    useEffect(() => {
        cb.getPaymentForm(1)
    }, [])

    useEffect(() => {
        reset(cb.data.payment);
    }, [reset, cb.data.payment]);

    const onSubmit = async (data) => {
        try{
            setLoading('submit');
            await cb.postPaymentForm(1, data);
        }
        finally{
            setLoading(null);
        }
    }

    const back = () => {
        setLoading('back');
        cb.clearFormCache();
        router.push('/checkout/step1');
    }

    const validatePaymentMethod = (value) => value && value != 'None';

    return <>
        <div className="layout-2col">
            <div className="layout-2col__col bg-white">
                <div className="p-2 md:p-4 md:px-8">
                    <Link href="/" className="logo">
                        Commerble Shop
                    </Link>
                </div>
                <h1 className="text-center my-8 text-indigo-900 text-4xl">Check out</h1>
                <div className="hidden md:x-center gap-8  w-full">
                    <section className="cart-items">
                        {cb.data.payment?.items.map(item => (
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
                    {/* <pre>{"//DEBUG INFO\n" + JSON.stringify(form, null, '\t')}</pre> */}
                </div>
            </div>
            <form className="layout-2col__col x-center pt-16" onSubmit={handleSubmit(onSubmit)}>
                <div className="form-body">
                    {cb.data.payment?.state.errors.map(err => <p key={err} className="text-red-400 ml-4">※ {err}</p>)}

                    <h2>配送オプション</h2>

                    <div className="field">
                        <label>お届け日</label>
                        <select {...register('deliveryOrder.deliveryDate', { required: false, valueAsDate: false })} autoFocus={true}>
                            <option value="">---</option>
                            {data.deliveryDateOptions.map(d => <option key={d.value} value={d.value}>{d.text}</option>)}
                        </select>
                        {errors?.deliveryOrder?.deliveryDate && <span>This field is required</span>}
                    </div>

                    <div className="field">
                        <label>お届け時間帯</label>
                        <select {...register('deliveryOrder.hourRange', { required: false })}>
                            <option value="0000">指定なし</option>
                            <option value="0812">午前中</option>
                            <option value="1214">12:00-14:00</option>
                            <option value="1416">14:00-16:00</option>
                            <option value="1618">16:00-18:00</option>
                            <option value="1821">18:00-21:00</option>
                        </select>
                        {errors?.deliveryOrder?.hourRange && <span>This field is required</span>}
                    </div>

                    <div className="field">
                        <label>明細書への金額印字</label>
                        <select {...register('deliveryOrder.wrappingType', { required: false })}>
                            <option value="2">印字する</option>
                            <option value="1">印字しない</option>
                        </select>
                        {errors?.deliveryOrder?.wrappingType && <span>This field is required</span>}
                    </div>
                    
                    <h2>お支払オプション</h2>
                    <div className="field">
                        <label>お支払方法</label>
                        <select {...register('paymentMethod', { validate: validatePaymentMethod })}>
                            <option value="CashOnDelivery">代引き</option>
                            <option value="Token">クレジットカード</option>
                        </select>
                        {errors?.paymentMethod && <span>This field is required</span>}
                    </div>

                    <div className="field">
                        <label>ポイント使用</label>
                        <input type="tel" {...register('inputUsagePoint')} />
                    </div>

                    <div className="field">
                        <label>クーポンコード</label><br/>
                        <input {...register('serviceValues.campaignCode')} />
                    </div>

                    <hr/>

                    <div className="flex flex-col items-center gap-4">
                        <Button
                            loading={loading==='submit'}
                            disabled={loading}
                            type="submit"
                            looks="primary"
                            className="w-full"
                            rightIcon={<ArrowRightIcon className="absolute right-4 inline-block w-8 h-8 ml-5"/>}
                            >入力内容を確認</Button>
                        <Button
                            looks="text"
                            className="w-full"
                            leftIcon={<ArrowLeftIcon className="absolute left-4 inline-block w-8 h-8"/>}
                            onClick={back}
                            >もどる</Button>
                    </div>
                </div>
            </form>
        </div>
    </>
}

export async function getServerSideProps(ctx) {
    const data = {};
    const deliveryableDetas = () => {
        const now = new Date().getTime();
        const unit = 1000 * 60 * 60 * 24;
        const formatter = new Intl.DateTimeFormat('ja', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short'});
        return [...new Array(10).keys()].map(i => new Date(now + i * unit)).map(d => ({
            value: d.toISOString().substring(0,10).replace(/-/g, '/'),
            text: formatter.format(d)
        }));
    }

    data.deliveryDateOptions = deliveryableDetas();

    return { props: { data: data } }
}