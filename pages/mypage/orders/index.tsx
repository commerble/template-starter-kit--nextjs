import Link from "next/link";
import { Button } from "../../../components/Button";
import { ArrowRightIcon } from "@heroicons/react/outline";
import { Fragment, useEffect, useState } from "react";
import { getOrderHistoryList } from "../../../modules/commerble-nextjs-sdk/client/api";
import { Scrollable } from "../../../components/Scrollable";
import { useSiteRouter } from "../../../hooks/router";
import { useCommerbleState } from "../../../modules/commerble-nextjs-sdk/client/hooks";

const fmt = Intl.DateTimeFormat('ja-JP', { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });

export async function getServerSideProps(ctx) {
    return { props: { query: ctx.query } }
}

function useCommerble(query) {
    const router = useSiteRouter();
    const page = Number(query.page) || 0;
    const [data, mutate] = useCommerbleState(() => getOrderHistoryList(page));

    useEffect(() => {
        if (data?.type === 'next' && data.next === 'site/login') {
            router.login();
        }
    }, [data]);

    return { 
        data: data?.type === 'order/historylist' ? data : null, 
        mutate,
    };
}


export default function MyOrderListPage({query}) {
    const cb = useCommerble(query);
    return <>
        {cb.data &&
        <div className="layout-2col">
            <div className="layout-2col__col bg-center bg-cover" style={{backgroundImage: "url('https://commerble.blob.core.windows.net/corporate/images/AdobeStock_244795496.webp')"}}>
                <div className="p-2 md:p-4 md:px-8">
                    <Link href="/" className="logo bg-white pb-1 px-2">
                        Commerble Shop
                    </Link>
                </div>
                <h1 className="text-center my-14 text-white text-4xl">MY ORDERS</h1>
            </div>
            <Scrollable trigger={cb.data?.paging.current} className="layout-2col__col x-center py-16">
                {cb&&
                <div className="form-body">
                    {cb.data?.state.messages.map(msg => <p key={msg} className="bg-green-100 p-2 text-center">{msg}</p>)}
                    {cb.data.items.map(item => <Fragment key={item.id}>
                        <Link href={`/mypage/orders/${item.id}`} className="field">
                            <label>受注番号</label>
                            {item.id}
                        </Link>
                        <div className="field-group">
                            <div className="field">
                                <label>受注日時</label>
                                {fmt.format(new Date(item.orderDate))}
                            </div>
                            <div className="field">
                                <label>ステータス</label>
                                {item.orderStatus}
                            </div>
                            <div className="field">
                                <label>お支払金額</label>
                                {item.totalPayment}
                            </div>
                        </div>
                        <hr />
                    </Fragment>)}
                    {cb.data.paging.current < cb.data.paging.maxPage - 1 &&
                        <Link href={`/mypage/orders?page=${cb.data.paging.current+1}`}>
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
        }
    </>
}