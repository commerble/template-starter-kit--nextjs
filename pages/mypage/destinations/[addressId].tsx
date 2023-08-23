import Link from "next/link";
import { Button } from "../../../components/Button";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { getMemberAddress, createMemberAddress, updateMemberAddress, deleteMemberAddress, getMemberCreateAddress, searchAddress } from "../../../modules/commerble-nextjs-sdk/client/api";
import { CommerbleMemberAddress, CommerbleResult } from "../../../modules/commerble-nextjs-sdk/client/types";
import { useCommerbleState } from "../../../modules/commerble-nextjs-sdk/client/hooks";
import { useSiteRouter } from "../../../hooks/router";

export async function getServerSideProps(ctx) {
    return { props: { params: ctx.params } }
}

function useCommerble(params) {
    const router = useSiteRouter();
    const id = Number(params.addressId);
    const fetcher = Number.isNaN(id) ? null : id === 0 ? () => getMemberCreateAddress() : () => getMemberAddress(id);
    const [data, mutate] = useCommerbleState(fetcher);

    useEffect(() => {
        if (data?.type === 'next' && data.next === 'site/login') {
            router.login();
        }
    }, [data]);

    return { 
        data: data?.type === 'member/address' ? data : null, 
        mutate,
    };
}

export default function MyDestinationPage({params}) {
    const router = useSiteRouter();
    const cb = useCommerble(params);
    const [loading, setLoading] = useState(null);
    const { register, handleSubmit, formState: { errors }, getValues, setValue, reset } = useForm<CommerbleMemberAddress>({
        defaultValues: cb.data
    })
    useEffect(() => {
        reset(cb.data);
    }, [cb.data])
    const handleResult = (result: CommerbleMemberAddress|CommerbleResult<'site/login'|'member/addresslist'>) => {
        if (result.type === 'member/address') {
            cb.mutate(result);
        }
        if (result.type === 'next') {
            switch (result.next) {
                case 'site/login':
                    router.login();
                    break;
                case 'member/addresslist': 
                    router.push(`/mypage/destinations`);
                    break;
            }
        }
    }
    const handleCreate = async (data) => {
        setLoading('submit');
        try {
            handleResult(await createMemberAddress(data, data.token));
        }
        finally {
            setLoading(null);
        }
    }
    const handleUpdate = async (data) => {
        setLoading('submit');
        try {
            handleResult(await updateMemberAddress(data, data.token));
        }
        finally {
            setLoading(null);
        }
    }
    const handleDelete = async (data) => {
        setLoading('submit');
        try {
            handleResult(await deleteMemberAddress(data, data.token));
        }
        finally {
            setLoading(null);
        }
    }
    const searchZipCode = () => {
        setLoading("zipCode");
        try {
            const code = getValues("zipCode");
            searchAddress(code).then(result => {
                const addr = result[0];
                setValue("pref", addr.Prefecture)
                setValue("city", addr.City)
                setValue("street", addr.Street)
            });
        }
        finally {
            setLoading(null);
        }
    }
    
    return <>
        <div className="layout-2col">
            <div className="layout-2col__col bg-center bg-cover" style={{backgroundImage: "url('https://commerble.blob.core.windows.net/corporate/images/AdobeStock_244795496.webp')"}}>
                <div className="p-2 md:p-4 md:px-8">
                    <Link href="/" className="logo bg-white pb-1 px-2">
                        Commerble Shop
                    </Link>
                </div>
                <h1 className="text-center my-14 text-white text-4xl">My Destinations</h1>
            </div>
            <div className="layout-2col__col x-center pt-16">
                {cb.data&&
                <form className="form-body">
                    {cb.data.state.errors.map(err => <p key={err} className="text-red-400 ml-4">※ {err}</p>)}
                    <div className="field">
                        <label>お届け先名</label>
                        <input {...register('addressName', { required: true, maxLength: 10 })}/>
                        {errors.addressName?.type === 'required' && <span>This field is required</span>}
                        {errors.addressName?.type === 'maxLength' && <span>This field must be less than equals to 10</span>}
                    </div>
                    <div className="field-group">
                        <div className="field">
                            <label>お名前（姓）</label>
                            <input {...register("recipientlastname", { required: true })}/>
                            {errors?.recipientlastname && <span>This field is required</span>}
                        </div>

                        <div className="field">
                            <label>お名前（名）</label>
                            <input {...register("recipientfirstname", { required: true })}/>
                            {errors?.recipientfirstname && <span>This field is required</span>}
                        </div>
                    </div>
                    <div className="field-group">
                        <div className="field">
                            <label>フリガナ（姓）</label>
                            <input {...register("recipientlastnamekana", { required: true })}/>
                            {errors?.recipientlastnamekana && <span>This field is required</span>}
                        </div>

                        <div className="field">
                            <label>フリガナ（名）</label>
                            <input {...register("recipientfirstnamekana", { required: true })}/>
                            {errors?.recipientfirstnamekana && <span>This field is required</span>}
                        </div>
                    </div>
                    <div className="field">
                        <label>郵便番号</label>
                        <div className="half btn-group">
                            <input maxLength={7} {...register("zipCode", { required: true })}/>
                            <Button
                                loading={loading==='zipCode'}
                                disabled={loading}
                                looks="custom"
                                className="btn-gray"
                                onClick={searchZipCode}
                                >検索</Button>
                        </div>
                        {errors?.zipCode && <span>This field is required</span>}
                    </div>
                    <div className="field-group">
                        <div className="field">
                            <label>都道府県</label>
                            <input {...register("pref", { required: true })}/>
                            {errors?.pref && <span>This field is required</span>}
                        </div>

                        <div className="field">
                            <label>市区町村</label>
                            <input {...register("city", { required: true })}/>
                            {errors?.city && <span>This field is required</span>}
                        </div>
                    </div>

                    <div className="field">
                        <label>通り・丁目・番・号</label>
                        <input {...register("street", { required: false })}/>
                    </div>

                    <div className="field">
                        <label>建物名・部屋番号</label>
                        <input {...register("building", { required: false })}/>
                    </div>

                    <div className="field">
                        <label>電話番号</label>
                        <input maxLength={11} className="half" {...register("tel", { required: true })}/>
                        {errors?.tel && <span>This field is required</span>}
                    </div>
                    <hr/>
                    <div className="flex flex-col items-center gap-4">
                        <Button
                            loading={loading==='submit'}
                            disabled={loading}
                            looks="primary"
                            className="w-full"
                            onClick={router.query.addressId==='0'?handleSubmit(handleCreate):handleSubmit(handleUpdate)}
                            >保存する</Button>
                    </div>
                    {router.query.addressId!=='0'&&
                        <Button
                            looks="default"
                            className="w-full text-sm h-4"
                            value="delete"
                            onClick={handleSubmit(handleDelete)}
                            >削除</Button>
                    }
                    <Link href="/mypage/destinations">
                        <Button
                            looks="text"
                            className="w-full text-sm h-4"
                            >もどる</Button>
                    </Link>
                </form>}
            </div>
        </div>
    </>
}
