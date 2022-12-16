import Link from "next/link";
import { useEffect } from "react";
import { Button } from "../../../components/Button";
import useCommerble from "../../../libs/commerble";

export default function MyNoticePage() {
    const cb = useCommerble();

    useEffect(() => {
        cb.getMemberIndex();
    }, [])

    return <>
        {cb.data.memberIndex &&
        <div className="layout-2col">
            <div className="layout-2col__col bg-center bg-cover" style={{backgroundImage: "url('https://commerble.blob.core.windows.net/corporate/images/AdobeStock_244795496.webp')"}}>
                <div className="p-2 md:p-4 md:px-8">
                    <Link href="/" className="logo bg-white pb-1 px-2">
                        Commerble Shop
                    </Link>
                </div>
                <h1 className="text-center my-8 text-white text-4xl">Notices</h1>
            </div>
            <div className="layout-2col__col x-center pt-16">
                <div className="form-body">
                    <hr />
                    <Link href="/mypage/">
                        <Button
                            looks="text"
                            className="w-full text-sm h-4"
                            >もどる</Button>
                    </Link>
                </div>
            </div>
        </div>
        }
    </>
}