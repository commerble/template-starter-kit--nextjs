import Link from "next/link";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "../../components/Button";
import { ArrowRightIcon } from "@heroicons/react/outline";
import { getMemberAccount, searchAddress, updateMemberAccount, updateMemberAccountAddress, updateMemberUserName } from "../../modules/commerble-nextjs-sdk/client/api";
import { CommerbleMemberAccount } from "../../modules/commerble-nextjs-sdk/client/types";
import { useSiteRouter } from "../../hooks/router";
import { useCommerbleState } from "../../modules/commerble-nextjs-sdk/client/hooks";

function useCommerble() {
    const router = useSiteRouter();
    const [data, mutate] = useCommerbleState(() => getMemberAccount());

    useEffect(() => {
        if (data?.type === 'next' && data.next === 'site/login') {
            router.login();
        }
    }, [data]);

    return { 
        data: data?.type === 'member/account' ? data : null, 
        mutate
    };
}

export default function MyAccountPage() {
    const cb = useCommerble();

    return <>
        <div className="layout-2col">
            <div className="layout-2col__col bg-center bg-cover" style={{backgroundImage: "url('https://commerble.blob.core.windows.net/corporate/images/AdobeStock_244795496.webp')"}}>
                <div className="p-2 md:p-4 md:px-8">
                    <Link href="/" className="logo bg-white pb-1 px-2">
                        Commerble Shop
                    </Link>
                </div>
                <h1 className="text-center my-14 text-white text-4xl">MY ACCOUNT</h1>
            </div>
            <div className="layout-2col__col x-center py-16">
                {cb.data && <>
                    {cb.data.state.errors.map(err => <p key={err} className="text-red-400 ml-4">※ {err}</p>)}
                    <AccountForm cb={cb}/>
                    {cb.data.state.errors.map(err => <p key={err} className="text-red-400 ml-4">※ {err}</p>)}
                    <AddressForm cb={cb}/>
                    {cb.data.state.errors.map(err => <p key={err} className="text-red-400 ml-4">※ {err}</p>)}
                    <UserNameForm cb={cb}/> 
                    <Link href="/mypage/">
                        <Button
                            looks="text"
                            className="w-full text-sm h-4"
                            >もどる</Button>
                    </Link>
                </>}
            </div>
        </div>
    </>
}

function AccountForm({cb}) {
    const router = useSiteRouter();
    const [loading, setLoading] = useState(null);
    const { register, handleSubmit, formState: { errors }, reset } = useForm({
        defaultValues: cb.data
    })

    useEffect(() => {
        reset(cb.data);
    }, [cb.data])

    const onSubmit = async (data) => {
        setLoading('submit');
        try {
            const result = await updateMemberAccount(data);
            if (result.type === 'member/account') {
                cb.mutate(result, false);
            }
            if (result.type === 'next') {
                switch (result.next) {
                    case 'site/login':
                        router.login();
                        break;
                    case 'member/index':
                        router.push(`/mypage`);
                }
            }
        }
        finally {
            setLoading(null);
        }
    }
    
    return <form className="form-body" onSubmit={handleSubmit(onSubmit)}>
        <div className="field-group">
            <div className="field">
                <label>お名前（姓）</label>
                <input {...register("lastName", { required: true })}/>
                {errors?.lastName && <span>This field is required</span>}
            </div>

            <div className="field">
                <label>お名前（名）</label>
                <input {...register("firstName", { required: true })}/>
                {errors?.firstName && <span>This field is required</span>}
            </div>
        </div>
        <div className="field-group">
            <div className="field">
                <label>フリガナ（姓）</label>
                <input {...register("lastNameKana", { required: true })}/>
                {errors?.lastNameKana && <span>This field is required</span>}
            </div>

            <div className="field">
                <label>フリガナ（名）</label>
                <input {...register("firstNameKana", { required: true })}/>
                {errors?.firstNameKana && <span>This field is required</span>}
            </div>
        </div>
        <div className="field-group">
            <div className="field">
                <label>生年</label>
                <input {...register("birthdayY", { required: true, valueAsNumber:true, min: 1900 })}/>
                {errors?.birthdayY && <span>This field is required</span>}
            </div>

            <div className="field">
                <label>月</label>
                <input {...register("birthdayM", { required: true, valueAsNumber:true, min: 1, max: 12  })}/>
                {errors?.birthdayM && <span>This field is required</span>}
            </div>

            <div className="field">
                <label>日</label>
                <input {...register("birthdayD", { required: true, valueAsNumber:true, min: 1, max:31 })}/>
                {errors?.birthdayD && <span>This field is required</span>}
            </div>
        </div>
        <div className="field">
            <label>性別</label>
            <select {...register("sex", { required: true })}>
                <option value="NotKnown">未指定</option>
                <option value="Male">男性</option>
                <option value="Female">女性</option>
                <option value="NotApplicable">その他</option>
            </select>
            {errors?.sex && <span>This field is required</span>}
        </div>
        <div className="field">
            <label><input type="checkbox" {...register("subscribe")}/>メルマガ配信希望する</label>
        </div>
        <hr />
        <div className="flex flex-col items-center gap-4">
            <Button
                loading={loading==='submit'}
                disabled={loading}
                type="submit"
                looks="primary"
                className="w-full"
                rightIcon={<ArrowRightIcon className="absolute right-4 inline-block w-8 h-8 ml-5"/>}
                >会員情報を変更する</Button>
        </div>
        <hr/>
    </form>
}

function AddressForm({cb}) {
    const router = useSiteRouter();
    const [loading, setLoading] = useState(null);
    const { register, handleSubmit, formState: { errors }, getValues, setValue, reset } = useForm<CommerbleMemberAccount>({
        defaultValues: cb.data
    })
    
    useEffect(() => {
        reset(cb.data);
    }, [cb.data])

    const onSubmit = async (data) => {
        setLoading('submit');
        try {
            const result = await updateMemberAccountAddress(data.address);
            if (result.type === 'member/account') {
                cb.mutate(result, false);
            }
            if (result.type === 'next') {
                switch (result.next) {
                    case 'site/login':
                        router.login();
                        break;
                    case 'member/index':
                        router.push(`/mypage`);
                }
            }
        }
        finally {
            setLoading(null);
        }
    }
    const searchZipCode = () => {
        setLoading("zipCode");
        try {
            const code = getValues("address.zipCode");
            searchAddress(code).then(result => {
                const addr = result[0];
                setValue("address.pref", addr.Prefecture)
                setValue("address.city", addr.City)
                setValue("address.street", addr.Street)
            });
        }
        finally {
            setLoading(null);
        }
    }
    
    return <form className="form-body" onSubmit={handleSubmit(onSubmit)}>
        <div className="field">
            <label>郵便番号</label>
            <div className="half btn-group">
                <input maxLength={7} {...register("address.zipCode", { required: true })}/>
                <Button
                    loading={loading==='address.zipCode'}
                    disabled={loading}
                    looks="custom"
                    className="btn-gray"
                    onClick={searchZipCode}
                    >検索</Button>
            </div>
            {errors?.address?.zipCode && <span>This field is required</span>}
        </div>
        <div className="field-group">
            <div className="field">
                <label>都道府県</label>
                <input {...register("address.pref", { required: true })}/>
                {errors?.address?.pref && <span>This field is required</span>}
            </div>

            <div className="field">
                <label>市区町村</label>
                <input {...register("address.city", { required: true })}/>
                {errors?.address?.city && <span>This field is required</span>}
            </div>
        </div>

        <div className="field">
            <label>通り・丁目・番・号</label>
            <input {...register("address.street", { required: false })}/>
        </div>

        <div className="field">
            <label>建物名・部屋番号</label>
            <input {...register("address.building", { required: false })}/>
        </div>

        <div className="field">
            <label>電話番号</label>
            <input maxLength={11} className="half" {...register("address.tel", { required: true })}/>
            {errors?.address?.tel && <span>This field is required</span>}
        </div>
        <hr />
        <div className="flex flex-col items-center gap-4">
            <Button
                loading={loading==='submit'}
                disabled={loading}
                type="submit"
                looks="primary"
                className="w-full"
                rightIcon={<ArrowRightIcon className="absolute right-4 inline-block w-8 h-8 ml-5"/>}
                >会員住所を変更する</Button>
        </div>
        <hr/>
    </form>
}

function UserNameForm({cb}) {
    const router = useSiteRouter();
    const [loading, setLoading] = useState(null);
    const { register, handleSubmit, formState: { errors }, reset } = useForm({
        defaultValues: cb.data
    })
    
    useEffect(() => {
        reset(cb.data);
    }, [cb.data])
    
    const onSubmit = async (data) => {
        setLoading('submit');
        try {
            const result = await updateMemberUserName(data);
            if (result.type === 'member/account') {
                cb.mutate(result, false);
            }
            if (result.type === 'next') {
                switch (result.next) {
                    case 'site/login':
                        router.login();
                        break;
                    case 'member/index':
                        router.push(`/mypage`);
                }
            }
        }
        finally {
            setLoading(null);
        }
    }
    return <form className="form-body" onSubmit={handleSubmit(onSubmit)}>
        <div className="field">
            <label>ログインID</label>
            <input type="email" placeholder="メールアドレス" {...register("userName", { required: true })}/>
            {errors?.userName && <span>This field is required</span>}
        </div>
        <hr />
        <div className="flex flex-col items-center gap-4">
            <Button
                loading={loading==='submit'}
                disabled={loading}
                type="submit"
                looks="primary"
                className="w-full"
                rightIcon={<ArrowRightIcon className="absolute right-4 inline-block w-8 h-8 ml-5"/>}
                >ログインIDを変更する</Button>
        </div>
    </form>
}