import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "../../../components/Button";
import { deleteMemberFavorite, getMemberFavorite } from "../../../modules/commerble-nextjs-sdk/client/api";
import { CartLine } from "../../../components/CartLine";
import { useCommerbleState } from "../../../modules/commerble-nextjs-sdk/client/hooks";
import { useSiteRouter } from "../../../hooks/router";
import { CBPAAS_ENDPOINT } from "../../../modules/commerble-nextjs-sdk/client/config";

export async function getServerSideProps(ctx) {
    return { props: { params: ctx.params } }
}

function useCommerble(params) {
    const router = useSiteRouter();
    const id = Number(params.productId);
    const fetcher = Number.isNaN(id) ? null : () => getMemberFavorite(id);
    const [data, mutate] = useCommerbleState(fetcher);

    useEffect(() => {
        if (data?.type === 'next' && data.next === 'site/login') {
            router.login();
        }
    }, [data]);

    return { 
        data: data?.type === 'member/favorite' ? data : null, 
        mutate,
    };
}

export default function MyFavoritePage({params}) {
    const router = useSiteRouter();
    const cb = useCommerble(params);
    const [loading, setLoading] = useState(null);
    const remove = async () => {
        setLoading('delete');
        try {
            const result = await deleteMemberFavorite(cb.data.product.id, cb.data.token);
            if (result.type === 'next') {
                switch (result.next) {
                    case 'site/login':
                        router.login();
                        break;
                    case 'member/favoritelist':
                        router.push('/mypage/favorites');
                        break;
                }
            }
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
                <h1 className="text-center my-14 text-white text-4xl">My Favorites</h1>
            </div>
            <div className="layout-2col__col x-center pt-16">
                {cb.data &&
                <div className="form-body">
                    <CartLine 
                        key={cb.data.product.id}
                        productId={cb.data.product.id}
                        name={cb.data.product.name}
                        variation={cb.data.product.externalId2}
                        unitPrice={cb.data.product.unitPriceWithTax}
                        img={`${CBPAAS_ENDPOINT}/primaryproductimages/${cb.data.product.id}/Large`}
                        href={`/item/${cb.data.product.id}`}
                        hiddenActions/>
                    <hr />
                    <Button
                        loading={loading==='delete'}
                        disabled={loading}
                        looks="default"
                        className="w-full"
                        onClick={remove}
                        >お気に入りを解除する</Button>
                    <Link href="/mypage/favorites/">
                        <Button
                            looks="text"
                            className="w-full text-sm h-4"
                            >もどる</Button>
                    </Link>
                </div>
                }
            </div>
        </div>
    </>
}
