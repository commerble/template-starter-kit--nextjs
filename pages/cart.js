
import { ShoppingCartIcon, UserAddIcon } from '@heroicons/react/outline';
import axios from 'axios';
import { useRouter } from 'next/dist/client/router';
import { useEffect, useState } from 'react';
import { CartLine } from '../components/CartLine';
import { Modal } from '../components/Modal';
import { Price } from '../components/Price';
import { getCart } from '../libs/cbpaas';
import { ERR_UNAUTHORIZED } from '../libs/constant';
import Link from "next/link";
import { CartSummary } from '../components/CartSummary';

export default function CartPage({data}) {
    const router = useRouter();
    const [carts, setCarts] = useState(data);

    const cart = carts[0];

    const subtotal = cart.items.reduce((acc, item) => acc + item.linePrice + item.discountPrice, 0);
    const discount = cart.items.reduce((acc, item) => acc + item.discountPrice, 0);

    useEffect(() => {
        (async () => {
            const response = await axios.get('/api/cart');
            setCarts(response.data);
        })();
    }, [setCarts])

    const [isLoading, setLoading] = useState(false); 

    const update = async (target, diff) => {
        try {
            setLoading(true);
            const res = await axios.put('/api/cart', {
                id: cart.id,
                lines: cart.items.map(item => ({
                    item: item.productId,
                    qty: item.requestAmount + (item == target ? diff : 0),
                    desc: item.description,
                }))
            });
            if (res.status === 200) {
                setCarts(res.data);
            }
        }
        finally {
            setLoading(false);
        }
    }

    const remove = async (productId) => {
        try {
            setLoading(true);
            const res = await axios.delete('/api/cart', {
                data: {item:productId}
            });
            if (res.status === 200) {
                setCarts(res.data);
            }
        }
        finally {
            setLoading(false);
        }
    }

    const tryCheckoutStart = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`/api/purchase/1`);
            if (res.status === 200) {
                if (res.data.errors.some(err => err.type === ERR_UNAUTHORIZED)){
                    router.push('/cart#login');
                }
                else if (res.data.next === 'shipping') {
                    router.push('/checkout/step1');
                }
                else if (res.data.next === 'confirm') {
                    router.push('/checkout/confirm');
                }
            }
        }
        finally {
            setLoading(false);
        }
    }
    const checkoutAsGuest = async () => {
        const res = await axios.post('/api/login', {guest:true});
        if (res.status === 200) {
            await tryCheckoutStart();
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
                    <Link href="/">
                        <a href="/" className="logo">Commerble Shop</a>
                    </Link>
                </div>
                <h1 className="text-center my-8 text-indigo-900 text-4xl">Cart</h1>
                <div className="x-center gap-8  w-full">
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
                                onRemoveClick={remove}
                                disabled={isLoading}/>
                        ))}
                    </section>
                    {/* <pre>{JSON.stringify(carts, null, '\t')}</pre> */}
                </div>
            </div>
            <div className="layout-2col__col xy-center">
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
                            <img src="https://developer.apple.com/design/human-interface-guidelines/apple-pay/images/button-check-out-with_2x.png" className="w-72"/>
                            <img src="https://m.media-amazon.com/images/G/01/EPSDocumentation/AmazonPay/Buttons/JPbuttons/amazonpay-gold-button.png" className="w-72"/>
                            <button className="btn-blue h-14 w-72 text-lg" onClick={() => tryCheckoutStart()}>
                                <ShoppingCartIcon className="inline-block w-8 h-8 mr-5 -ml-10"/>CHECK OUT</button>
                        </div> 
                    </>}
                </section>
            </div>
        </div>
        <Modal open={isLoginModalOpen}>
            <button className="btn-blue h-14 w-72 text-lg" onClick={() => router.push('/login')}>
                <ShoppingCartIcon className="inline-block w-8 h-8 mr-5 -ml-10"/>ログインして購入</button>
            <button className="btn-blue h-14 w-72 text-lg" onClick={() => router.push('/login')}>
                <UserAddIcon className="inline-block w-8 h-8 mr-5 -ml-10"/>新規会員登録</button>
            <button className="btn-gray h-14 w-72 text-lg" onClick={() => checkoutAsGuest()}>ログインせずに購入</button>
            <button onClick={() => router.back()}>とじる</button>
        </Modal>
    </>
}

export async function getServerSideProps(ctx) {
    const data = await getCart(ctx);
    return { props: { data } }
}