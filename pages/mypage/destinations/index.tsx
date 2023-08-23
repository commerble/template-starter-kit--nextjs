import Link from "next/link";
import React, { Fragment, useEffect } from "react";
import { Button } from "../../../components/Button";
import { ArrowRightIcon } from "@heroicons/react/outline";
import { getMemberAddressList } from "../../../modules/commerble-nextjs-sdk/client/api";
import { Scrollable } from "../../../components/Scrollable";
import { useSiteRouter } from "../../../hooks/router";
import { useCommerbleState } from "../../../modules/commerble-nextjs-sdk/client/hooks";

export async function getServerSideProps(ctx) {
    return { props: { query: ctx.query } }
}

function useCommerble(query) {
    const router = useSiteRouter();
    const page = Number(query.page) || 0;
    const [data, mutate] = useCommerbleState(() => getMemberAddressList(page));

    useEffect(() => {
        if (data?.type === 'next' && data.next === 'site/login') {
            router.login();
        }
    }, [data]);

    return { 
        data: data?.type === 'member/addresslist' ? data : null, 
        mutate,
    };
}

export default function MyDestinationListPage({query}) {
    const cb = useCommerble(query);

    return <>
        <div className="layout-2col">
            <div className="layout-2col__col bg-center bg-cover" style={{backgroundImage: "url('https://commerble.blob.core.windows.net/corporate/images/AdobeStock_244795496.webp')"}}>
                <div className="p-2 md:p-4 md:px-8">
                    <Link href="/" className="logo bg-white pb-1 px-2">
                        Commerble Shop
                    </Link>
                </div>
                <h1 className="text-center my-14 text-white text-4xl">MY DESTINATIONS</h1>
            </div>
            <Scrollable trigger={cb.data?.paging.current} className="layout-2col__col x-center pt-16">
                {cb.data&&
                <div className="form-body">
                    {cb.data?.state.messages.map(msg => <p key={msg} className="bg-green-100 p-2 text-center">{msg}</p>)}
                    {cb.data.items.map(item => <Fragment key={item.addressId}>
                        <Link href={`/mypage/destinations/${item.addressId}`} className="field" >
                            <label>{item.addressName}</label>
                            {item.zipCode} {item.pref}{item.city}{item.street}{item.building}<br/>
                            {item.recipientlastname}{item.recipientfirstname} / {item.recipientlastnamekana}{item.recipientfirstnamekana}<br/>
                            {item.tel}
                        </Link>
                        <hr/>
                    </Fragment>)}
                    <Link href="/mypage/destinations/0">
                        <Button
                            looks="primary"
                            className="w-full text-sm h-4"
                            rightIcon={<ArrowRightIcon className="absolute right-4 inline-block w-8 h-8 ml-5"/>}
                            >新規追加</Button>
                    </Link>
                    <hr/>
                    {cb.data.paging.current < cb.data.paging.maxPage - 1 &&
                        <Link href={`/mypage/destinations/?page=${cb.data.paging.current+1}`}>
                            <Button
                                looks="default"
                                className="w-full"
                                rightIcon={<ArrowRightIcon className="absolute right-4 inline-block w-8 h-8 ml-5"/>}
                                >次のページ</Button>
                        </Link>
                    }
                    <Link href="/mypage/">
                        <Button
                            looks="text"
                            className="w-full text-sm h-4"
                            >もどる</Button>
                    </Link>
                </div>}
            </Scrollable>
        </div>
    </>
}