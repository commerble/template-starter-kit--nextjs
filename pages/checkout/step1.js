import { ERR_UNAUTHORIZED } from "../../libs/constant";
import { useRouter } from "next/dist/client/router";
import { useState } from "react";
import { getShippingForm } from "../../libs/cbpaas";
import { useForm } from "react-hook-form";
import axios from "axios";
import { CartLine } from "../../components/CartLine";
import { ArrowRightIcon } from "@heroicons/react/outline";
import Link from "next/link";

export default function CheckoutStep1Page({data}) {
    const router = useRouter();

    const [form, setForm] = useState(data);

    const { register, handleSubmit, formState: { errors }, getValues, setValue } = useForm({
        defaultValues: form
    })

    const onSubmit = async (data) => {
        data.orderCustomerOrderedAddress.recipientlastname = data.customer.lastName;
        data.orderCustomerOrderedAddress.recipientfirstname = data.customer.firstName;
        data.orderCustomerOrderedAddress.recipientlastnamekana = data.customer.lastNameKana;
        data.orderCustomerOrderedAddress.recipientfirstnamekana = data.customer.firstNameKana;
        data.deliveryOrderAddress = data.orderCustomerOrderedAddress;
        const res = await axios.post('/api/purchase/1/shipping', data);
        if (res.data.errors.length === 0) {
            router.push('/checkout/step2');
        }
        else {
            setForm(res.data);
        }
    }

    const searchZipCode = async () => {
        const code = getValues("orderCustomerOrderedAddress.zipCode");
        const result = await axios.get(`/api/address?zipcode=${code}`);
        if (result.status === 200 && result.data.length > 0) {
            const addr = result.data[0];
            setValue("orderCustomerOrderedAddress.pref", addr.Prefecture)
            setValue("orderCustomerOrderedAddress.city", addr.City)
            setValue("orderCustomerOrderedAddress.street", addr.Street)
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
                <div className="hidden md:x-center gap-8 ">
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
                    {form.state.errors.map(err => <p key={err} className="text-red-400 ml-4">※ {err}</p>)}

                    <h2>購入者</h2>
                    
                    <div className="field">
                        <label>メールアドレス</label>
                        <input {...register("customer.emailAddr", { required: true })}/>
                        {errors?.customer?.emailAddr && <span>This field is required</span>}
                    </div>

                    <div className="field-group">
                        <div className="field">
                            <label>お名前（姓）</label>
                            <input {...register("customer.lastName", { required: true })}/>
                            {errors?.customer?.lastName && <span>This field is required</span>}
                        </div>

                        <div className="field">
                            <label>お名前（名）</label>
                            <input {...register("customer.firstName", { required: true })}/>
                            {errors?.customer?.firstName && <span>This field is required</span>}
                        </div>
                    </div>
                    <div className="field-group">
                        <div className="field">
                            <label>フリガナ（姓）</label>
                            <input {...register("customer.lastNameKana", { required: true })}/>
                            {errors?.customer?.lastNameKana && <span>This field is required</span>}
                        </div>

                        <div className="field">
                            <label>フリガナ（名）</label>
                            <input {...register("customer.firstNameKana", { required: true })}/>
                            {errors?.customer?.firstNameKana && <span>This field is required</span>}
                        </div>
                    </div>

                    <div className="field">
                        <label>郵便番号</label>
                        <div className="half btn-group">
                            <input maxLength={7} {...register("orderCustomerOrderedAddress.zipCode", { required: true })}/>
                            <button type="button" className="btn btn-gray" onClick={searchZipCode}>検索</button>
                        </div>
                        {errors?.orderCustomerOrderedAddress?.zipCode && <span>This field is required</span>}
                    </div>
                    <div className="field-group">
                        <div className="field">
                            <label>都道府県</label>
                            <input {...register("orderCustomerOrderedAddress.pref", { required: true })}/>
                            {errors?.orderCustomerOrderedAddress?.pref && <span>This field is required</span>}
                        </div>

                        <div className="field">
                            <label>市区町村</label>
                            <input {...register("orderCustomerOrderedAddress.city", { required: true })}/>
                            {errors?.orderCustomerOrderedAddress?.city && <span>This field is required</span>}
                        </div>
                    </div>

                    <div className="field">
                        <label>通り・丁目・番・号</label>
                        <input {...register("orderCustomerOrderedAddress.street", { required: false })}/>
                        {errors?.orderCustomerOrderedAddress?.street && <span>This field is required</span>}
                    </div>

                    <div className="field">
                        <label>建物名・部屋番号</label>
                        <input {...register("orderCustomerOrderedAddress.building", { required: false })}/>
                        {errors?.orderCustomerOrderedAddress?.building && <span>This field is required</span>}
                    </div>

                    <div className="field">
                        <label>電話番号</label>
                        <input maxLength={11} className="half" {...register("orderCustomerOrderedAddress.tel", { required: true })}/>
                        {errors?.orderCustomerOrderedAddress?.tel && <span>This field is required</span>}
                    </div>
                    
                    <hr/>

                    <div className="flex flex-col items-center gap-4">
                        <button type="submit" className="btn-blue h-14 w-full text-lg relative">この住所に届ける <ArrowRightIcon className="absolute right-4 inline-block w-8 h-8 ml-5"/></button>
                        <button className="h-14 w-full text-lg">別の住所に届ける</button>
                    </div>
                </div>
            </form>
        </div>
    </>
}

export async function getServerSideProps(ctx) {
    const data = await getShippingForm(ctx, 1);

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