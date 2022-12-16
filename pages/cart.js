import { ShoppingCartIcon, SunIcon, UserAddIcon } from '@heroicons/react/outline';
import Link from "next/link";
import { useRouter } from 'next/dist/client/router';
import { useEffect, useState } from 'react';
import { CartLine } from '../components/CartLine';
import { Modal } from '../components/Modal';
import { CartSummary } from '../components/CartSummary';
import { useMemo } from 'react';
import useCommerble from '../libs/commerble';
import { Button } from '../components/Button';

export default function CartPage({data}) {
    const router = useRouter();
    const cb = useCommerble();
    const [loading, setLoading] = useState(null);
    const [cartId, setCartId] = useState(0);
    const cart = useMemo(() => cb.data.carts[cartId], [cb.data.carts, cartId]);

    useEffect(() => {
        cb.getCarts();
    }, []);

    const subtotal = useMemo(() => cart?.items.reduce((acc, item) => acc + item.linePrice + item.discountPrice, 0), [cart, cartId]);
    const discount = useMemo(() => cart?.items.reduce((acc, item) => acc + item.discountPrice, 0), [cart, cartId]);

    const update = async (target, diff) => {
        try {
            setLoading('line');
            cb.updateQty(cart, target, diff);
        }
        finally {
            setLoading(null);
        }
    }

    const remove = async (target) => {
        try {
            setLoading('line');
            cb.removeLine(target);
        }
        finally {
            setLoading(null);
        }
    }

    const tryCheckouting = async (guest) => {
        try {
            await cb.tryCheckouting(cart, guest);
        }
        finally {
            setLoading(null);
        }
    }

    const checkout = () => {
        setLoading('tryCheckouting');
        tryCheckouting();
    }

    const checkoutAsGuest = () => {
        setLoading('guest');
        tryCheckouting(true);
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
                                    disabled={loading}/>
                            ))}
                        </section>
                    }
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
                                <Button
                                    loading={loading === 'tryCheckouting'}
                                    disabled={loading}
                                    looks="primary"
                                    className="w-72 text-lg" 
                                    onClick={checkout}
                                    leftIcon={<ShoppingCartIcon className="inline-block w-8 h-8 mr-5 -ml-10"/>}
                                    >購入にすすむ</Button>
                                <Button
                                    loading={loading === 'guest'}
                                    disabled={loading}
                                    looks="text"
                                    className="w-72"
                                    onClick={checkoutAsGuest}
                                    >ゲスト購入</Button>
                            </div> 
                        </>}
                    </section>
                }
            </div>
        </div>
    </>
}
