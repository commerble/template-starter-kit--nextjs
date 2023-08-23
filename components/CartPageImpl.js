// 'use client'

// import { ShoppingCartIcon } from '@heroicons/react/outline';
// import Link from "next/link";
// import { useState } from 'react';
// import { CartLine } from '../components/CartLine';
// import { CartSummary } from '../components/CartSummary';
// import { Button } from '../components/Button';
// import { useMemo } from 'react';
// import { useCommerbleOrderCart } from '../modules/commerble-nextjs-sdk/client/hooks';
// export const dynamic = "force-dynamic";
// export default function CartPageImpl() {
//     const cb = useCommerbleOrderCart();
//     const [loading, setLoading] = useState(null);

//     const cart = cb.data.carts[0];
//     const cartId = cb.data.carts[0].id;

//     const subtotal = useMemo(() => cart?.items.reduce((acc, item) => acc + item.linePrice + item.discountPrice, 0), [cart, cartId]);
//     const discount = useMemo(() => cart?.items.reduce((acc, item) => acc + item.discountPrice, 0), [cart, cartId]);

//     const update = async (target, diff) => {
//         try {
//             setLoading('line');
//             // cb.updateQty(cart, target, diff);
//         }
//         finally {
//             setLoading(null);
//         }
//     }

//     const remove = async (target) => {
//         try {
//             setLoading('line');
//             // cb.removeLine(target);
//         }
//         finally {
//             setLoading(null);
//         }
//     }

//     const tryCheckouting = async (guest) => {
//         try {
//             // await cb.tryCheckouting(cart, guest);
//         }
//         finally {
//             setLoading(null);
//         }
//     }

//     const checkout = () => {
//         setLoading('tryCheckouting');
//         tryCheckouting(false);
//     }

//     const checkoutAsGuest = () => {
//         setLoading('guest');
//         tryCheckouting(true);
//     }
    
//     return <>
//         <div className="layout-2col">
//             <div className="layout-2col__col bg-white">
//                 <div className="p-2 md:p-4 md:px-8">
//                     <Link href="/" className="logo">
//                         Commerble Shop
//                     </Link>
//                 </div>
//                 <h1 className="text-center my-8 text-indigo-900 text-4xl">Cart</h1>
//                 <div className="x-center gap-8  w-full">
//                     {cart&&
//                         <section className="cart-items">
//                             {cart.items.length === 0 && (
//                                 <p>カートに商品が入っていません。</p>
//                             )}
//                             {cart.items.map(item => (
//                                 <CartLine 
//                                     key={item.productId}
//                                     productId={item.productId}
//                                     name={item.productName} 
//                                     variation={item.externalId2} 
//                                     unitPrice={item.unitPriceWithTax} 
//                                     qty={item.requestAmount} 
//                                     // linePrice={item.linePrice} 
//                                     // discountPrice={item.discountPrice}
//                                     img={`${CBPAAS_ENDPOINT}/primaryproductimages/${item.productId}/Large`}
//                                     onIncClick={() => update(item, +1)}
//                                     onDecClick={() => update(item, -1)}
//                                     onRemoveClick={() => remove(item)}
//                                     disabled={loading}/>
//                             ))}
//                         </section>
//                     }
//                 </div>
//             </div>
//             <div className="layout-2col__col xy-center pb-8">
//                 {cart&&
//                     <section>
//                         {cart.state.errors.map(err => <p key={err} className="text-red-400">※ {err}</p>)}
//                         <CartSummary
//                             subtotal={subtotal}
//                             discount={discount}
//                             total={subtotal}
//                             tax10ofTotal={subtotal}
//                             tax8ofTotal={0}/>
//                         {cart.errors.length === 0 && <>
//                             <hr className="my-8"/>
//                             <div className="flex flex-col gap-4 items-end">
//                                 <Button
//                                     loading={loading === 'tryCheckouting'}
//                                     disabled={loading}
//                                     looks="primary"
//                                     className="w-72 text-lg" 
//                                     onClick={checkout}
//                                     leftIcon={<ShoppingCartIcon className="inline-block w-8 h-8 mr-5 -ml-10"/>}
//                                     >購入にすすむ</Button>
//                                 <Button
//                                     loading={loading === 'guest'}
//                                     disabled={loading}
//                                     looks="text"
//                                     className="w-72"
//                                     onClick={checkoutAsGuest}
//                                     >ゲスト購入</Button>
//                             </div> 
//                         </>}
//                     </section>
//                 }
//             </div>
//         </div>
//     </>
// }
