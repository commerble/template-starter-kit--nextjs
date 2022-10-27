import { ShoppingCartIcon, SunIcon, UserAddIcon } from '@heroicons/react/outline';
import Link from "next/link";
import { useRouter } from 'next/dist/client/router';
import { useEffect, useState } from 'react';
import { CartLine } from '../components/CartLine';
import { Modal } from '../components/Modal';
import { CartSummary } from '../components/CartSummary';
import { useMemo } from 'react';
import useCommerble from '../libs/commerble';

export default function CartPage({data}) {
    const router = useRouter();
    const cb = useCommerble();
    const [isLoading, setLoading] = useState(false);
    const [cartId, setCartId] = useState(0);
    const cart = useMemo(() => cb.data.carts[cartId], [cb.data.carts, cartId]);

    useEffect(() => {
        cb.getCarts();
    }, [cb]);

    const subtotal = useMemo(() => cart?.items.reduce((acc, item) => acc + item.linePrice + item.discountPrice, 0), [cart, cartId]);
    const discount = useMemo(() => cart?.items.reduce((acc, item) => acc + item.discountPrice, 0), [cart, cartId]);

    const update = async (target, diff) => {
        try {
            setLoading(true);
            cb.updateQty(cart, target, diff);
        }
        finally {
            setLoading(false);
        }
    }

    const remove = async (target) => {
        try {
            setLoading(true);
            cb.removeLine(target);
        }
        finally {
            setLoading(false);
        }
    }

    const tryCheckouting = async (guest) => {
        try {
            setLoading(true);
            await cb.tryCheckouting(cart, guest);
        }
        finally {
            setLoading(false);
        }
    }

    const isLoginModalOpen = router.asPath.includes('#login');

    if (isLoginModalOpen) {
        history.replaceState("", "", location.pathname)
    }

    return <>
        <div className="layout-2col">
            <div className="layout-2col__col bg-white">
                <div className="p-2 md:p-4 md:px-8">
                    <Link href="/" className="logo">
                        Commerble Shop
                    </Link>
                </div>
                <h1 className="text-center my-8 text-indigo-900 text-4xl">Cart</h1>
                <div className="x-center gap-8  w-full">
                    {cart&&
                        <section className="cart-items">
                            {cart.items.length === 0 && (
                                <p>カートに商品が入っていません。</p>
                            )}
                            {cart.items.map(item => (
                                <CartLine 
                                    key={item.productId}
                                    productId={item.productId}
                                    name={item.productName} 
                                    variation={item.externalId2} 
                                    unitPrice={item.unitPriceWithTax} 
                                    qty={item.requestAmount} 
                                    linePrice={item.linePrice} 
                                    discountPrice={item.discountPrice}
                                    img={item.thumbnail}
                                    onIncClick={() => update(item, +1)}
                                    onDecClick={() => update(item, -1)}
                                    onRemoveClick={() => remove(item)}
                                    disabled={isLoading}/>
                            ))}
                        </section>
                    }
                    {/* <pre>{JSON.stringify(carts, null, '\t')}</pre> */}
                </div>
            </div>
            <div className="layout-2col__col xy-center pb-8">
                {cart&&
                    <section>
                        {cart.state.errors.map(err => <p key={err} className="text-red-400">※ {err}</p>)}
                        <CartSummary
                            subtotal={subtotal}
                            discount={discount}
                            total={subtotal}
                            tax10ofTotal={subtotal}
                            tax8ofTotal={0}/>
                        {cart.errors.length === 0 && <>
                            <hr className="my-8"/>
                            <div className="flex flex-col gap-4 items-end">
                                <button className="btn-blue h-14 w-72 text-lg" onClick={() => tryCheckouting()}>
                                    {isLoading ? (
                                        <SunIcon className="inline-block w-8 h-8 animate-spin"/>
                                    ):(
                                        <><ShoppingCartIcon className="inline-block w-8 h-8 mr-5 -ml-10"/>CHECK OUT</>
                                    )}
                                </button>
                            </div> 
                        </>}
                    </section>
                }
            </div>
        </div>
        <Modal open={isLoginModalOpen}>
            <button className="btn-blue h-14 w-72 text-lg" disabled onClick={() => router.push('/login')}>
                <ShoppingCartIcon className="inline-block w-8 h-8 mr-5 -ml-10"/>ログインして購入</button>
            <button className="btn-blue h-14 w-72 text-lg" disabled onClick={() => router.push('/login')}>
                <UserAddIcon className="inline-block w-8 h-8 mr-5 -ml-10"/>新規会員登録</button>
            <button className="btn-gray h-14 w-72 text-lg" onClick={() => tryCheckouting(true)}>ログインせずに購入</button>
            <button onClick={() => router.back()}>とじる</button>
        </Modal>
    </>
}
