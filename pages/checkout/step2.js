import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/outline";
import axios from "axios";
import { useRouter } from "next/dist/client/router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { CartLine } from "../../components/CartLine";
import { getPaymentForm } from "../../libs/cbpaas";
import { ERR_UNAUTHORIZED } from "../../libs/constant";
import Link from "next/link";

export default function CheckoutStep2Page({data}) {
    const router = useRouter();

    const [form, setForm] = useState(data);

    const { register, handleSubmit, formState: { errors } } = useForm({
        defaultValues: form
    })

    const onSubmit = async (data) => {
        const result = await axios.post('/api/purchase/1/payment', data);
        if (result.data.errors.length === 0) {
            router.push('/checkout/confirm');
        }
        else {
            setForm(result);
        }
    }

    return <>
        <div className="layout-2col">
            <div className="layout-2col__col bg-white">
                <div className="p-2 md:p-4 md:px-8">
                    <Link href="/">
                        <a className="logo">Commerble Shop</a>
                    </Link>
                </div>
                <h1 className="text-center my-8 text-indigo-900 text-4xl">Check out</h1>
                <div className="hidden md:x-center gap-8  w-full">
                    <section className="cart-items">
                        {form.items.map(item => (
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
                    {form.state.errors.map(err => <p key={err} className="text-red-400 ml-4">??? {err}</p>)}

                    <h2>?????????????????????</h2>

                    <div className="field">
                        <label>????????????</label>
                        <select {...register('deliveryOrder.deliveryDate', { required: false })}>
                            <option value="">---</option>
                            {data.deliveryDateOptions.map(d => <option key={d.value} value={d.value}>{d.text}</option>)}
                        </select>
                        {errors?.deliveryOrder?.deliveryDate && <span>This field is required</span>}
                    </div>

                    <div className="field">
                        <label>??????????????????</label>
                        <select {...register('deliveryOrder.hourRange', { required: false })}>
                            <option value="0000">????????????</option>
                            <option value="0812">?????????</option>
                            <option value="1214">12:00-14:00</option>
                            <option value="1416">14:00-16:00</option>
                            <option value="1618">16:00-18:00</option>
                            <option value="1821">18:00-21:00</option>
                        </select>
                        {errors?.deliveryOrder?.hourRange && <span>This field is required</span>}
                    </div>

                    <div className="field">
                        <label>???????????????????????????</label>
                        <select {...register('deliveryOrder.wrappingType', { required: false })}>
                            <option value="2">????????????</option>
                            <option value="1">???????????????</option>
                        </select>
                        {errors?.deliveryOrder?.wrappingType && <span>This field is required</span>}
                    </div>
                    
                    <h2>????????????????????????</h2>
                    <div className="field">
                        <label>???????????????</label>
                        <select {...register('paymentMethod', { required: true })}>
                            <option value="CashOnDelivery">?????????</option>
                            <option value="Token">????????????????????????</option>
                        </select>
                        {errors?.paymentMethod && <span>This field is required</span>}
                    </div>

                    <div className="field">
                        <label>??????????????????</label>
                        <input type="tel" {...register('inputUsagePoint')} />
                    </div>

                    <div className="field">
                        <label>?????????????????????</label><br/>
                        <input {...register('serviceValues.campaignCode')} />
                    </div>

                    <hr/>

                    <div className="flex flex-col items-center gap-4">
                        <button type="submit" className="btn-blue h-14 w-full text-lg relative">?????? <ArrowRightIcon className="absolute right-4 inline-block w-8 h-8 ml-5"/></button>
                        <button type="button" className="h-14 w-full text-lg relative" onClick={() => router.push('/checkout/step1')}><ArrowLeftIcon className="absolute left-4 inline-block w-8 h-8"/>?????????</button>
                    </div>
                </div>
            </form>
        </div>
    </>
}

export async function getServerSideProps(ctx) {
    const data = await getPaymentForm(ctx, 1);

    if (data.errors.some(err => err.type === ERR_UNAUTHORIZED)) {
        return {
            redirect: {
                permanent: false,
                destination: "/login",
            },
            props:{},
        }
    }

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