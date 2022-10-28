import React, { createContext, PropsWithChildren, useContext, useEffect } from 'react';
import { useRouter } from 'next/dist/client/router';
import useSWR from 'swr';

const initialData: CommerbleState = {
    carts:[],
    shipping: null,
    payment: null,
    confirm: null,
    complete: null,
    external: null,
} 
export const CommerbleRouting: React.FC<PropsWithChildren<{}>> = (props) => {
    const router = useRouter();
    const cb = useCommerble();
    useEffect(() => {
        if (cb.data.shipping) {
            router.push(`/checkout/step1`, undefined,{shallow:true});
        }
    }, [!!cb.data.shipping])
    useEffect(() => {
        if (cb.data.payment) {
            router.push(`/checkout/step2`, undefined,{shallow:true});
        }
    }, [!!cb.data.payment])
    useEffect(() => {
        if (cb.data.confirm) {
            router.push(`/checkout/confirm`, undefined,{shallow:true});
        }
    }, [!!cb.data.confirm])
    useEffect(() => {
        if (cb.data.complete?.orderId) {
            router.push(`/checkout/complete/${cb.data.complete.orderId}`, undefined,{shallow:true});
        }
    }, [cb.data.complete?.orderId])
    useEffect(() => {
        if (cb.data.external?.orderId) {
            router.push(`/checkout/external/${cb.data.external.orderId}`, undefined,{shallow:true});
        }
    }, [cb.data.external?.orderId])
    return <>{props.children}</>
}
const useCommerble = () => {
    const config = useContext(CommerbleContext);
    const router = useRouter();
    const { data, mutate} = useSWR('commerble', null, {
        fallbackData: initialData
    })
    const setCarts = (carts: CommerbleCart[]) => {
        mutate({
            ...data,
            carts,
        });
    }
    
    return {
        data,
        getCarts() {
            return getCarts().then(setCarts);
        },
        appendLines(lines: CommerbleCartInRequest) {
            return appendLines(lines).then(setCarts);
        },
        removeLine(line: CommerbleCartLine) {
            return removeLine(line).then(setCarts);
        },
        updateQty(cart: CommerbleCart, target: CommerbleCartLine, diff: number) {
            return updateQty(cart, target, diff).then(setCarts);
        },
        searchAddress,
        async tryCheckouting(cart: CommerbleCart, asGuest: boolean){
            const res = await tryCheckouting(cart, asGuest, config.rootPrefix);
            if (res[0] === 'login') {
                router.push(config.loginUrl);
            }
            else if (res[0] === 'shipping') {
                mutate({
                    ...data,
                    shipping: res[1]
                })
            }
            else if (res[0] === 'confirm') {
                mutate({
                    ...data,
                    confirm: res[1]
                })
            }

        },
        async getShippingForm(cartId: number) {
            const res = await getShippingForm(cartId);
            if (res[0] === 'login') {
                router.push(config.loginUrl);
            }
            else if (res[0] === 'shipping') {
                mutate({
                    ...data,
                    shipping: res[1]
                });
            }
            return res[0];
        },
        async postShippingForm(cartId: number, form: CommerbleShippingForm) {
            const res = await postShippingForm(cartId, form);
            if (res[0] === 'login') {
                router.push(config.loginUrl);
            }
            else if (res[0] === 'shipping') {
                mutate({
                    ...data,
                    shipping: res[1]
                })
            }
            else if (res[0] === 'payment') {
                mutate({
                    ...data,
                    payment: res[1]
                })
            }
            return res[0];
        },
        async getPaymentForm(cartId: number) {
            if (data.payment) {
                return Promise.resolve(data.payment);
            }
            const res = await getPaymentForm(cartId);
            if (res[0] === 'login') {
                router.push(config.loginUrl);
            }
            else if (res[0] === 'payment') {
                mutate({
                    ...data,
                    payment: res[1]
                });
            }
            return res[0];
        },
        async postPaymentForm(cartId: number, form: CommerblePaymentForm) {
            const res = await postPaymentForm(cartId, form);
            if (res[0] === 'login') {
                router.push(config.loginUrl);
            }
            else if (res[0] === 'payment') {
                mutate({
                    ...data,
                    payment: res[1]
                })
            }
            else if (res[0] === 'confirm') {
                mutate({
                    ...data,
                    confirm: res[1]
                })
            }
            return res[0];
        },
        async getConfirmInfo(cartId: number) {
            if (data.confirm) {
                return Promise.resolve(data.confirm);
            }
            const res = await getConfirmInfo(cartId);
            if (res[0] === 'login') {
                router.push(config.loginUrl);
            }
            else if (res[0] === 'confirm') {
                mutate({
                    ...data,
                    confirm: res[1]
                });
            }
            return res[0];
        },
        async purchase() {
            const res = await purchase(data.confirm.id, data.confirm.token);
            if (res[0] === 'login') {
                router.push(config.loginUrl);
            }
            else if (res[0] === 'error') {
                mutate({
                    ...data,
                    confirm: res[1]
                })
            }
            else if (res[0] === 'complete') {
                mutate({
                    ...data,
                    complete: res[1]
                })
            }
            else if (res[0] === 'external') {
                mutate({
                    ...data,
                    external: res[1]
                })
            }
            return res[0];
        },
        async getCompleteInfo(cartId: number, orderId: number) {
            if (data.complete && data.complete.orderId === orderId) {
                return Promise.resolve(data.confirm);
            }
            const res = await getCompleteInfo(cartId, orderId);
            if (res[0] === 'login') {
                router.push(config.loginUrl);
            }
            else if (res[0] === 'complete') {
                mutate({
                    ...data,
                    complete: res[1]
                });
            }
            return res[0];
        },
        async getExternalInfo(cartId: number, orderId: number) {
            if (data.complete && data.complete.orderId === orderId) {
                return Promise.resolve(data.confirm);
            }
            const res = await getExternalInfo(cartId, orderId);
            if (res[0] === 'login') {
                router.push(config.loginUrl);
            }
            else if (res[0] === 'complete') {
                mutate({
                    ...data,
                    complete: res[1]
                });
            }
            if (res[0] === 'external') {
                mutate({
                    ...data,
                    external: res[1]
                });
            }
            return res[0];
        }
    }
}

export default useCommerble;

export type CommerbleCartLine = {
    productId: number
    externalId1: string
    externalId2: string
    externalId3: string
    externalId4: string
    productName: string
    unitPriceWithTax: number
    unitPriceWithoutTax: number
    requestAmount: number
    linePrice: number
    tax: number
    thumbnail: string
}
export type CommerbleCartState = {
    messages: string[]
    warnings: string[]
    errors: string[]
}
export type CommerbleCart = {
    id: number
    items: CommerbleCartLine[]
    errors: string[]
    state: CommerbleCartState
}
export type CommerbleAddress = {
    addressId?: number
    recipientlastname?: string
    recipientlastnamekana?: string
    recipientfirstname?: string
    recipientfirstnamekana?: string
    countryCode?: string
    zipCode?: string
    pref?: string
    city?: string
    street?: string
    building?: string
    tel?: string
}
export type CommerbleShippingForm = {
    customer?: {
        lastName?: string
        lastNameKana?: string
        firstName?: string
        firstNameKana?: string
        emailAddr?: string
    }
    orderCustomerOrderedAddress?: CommerbleAddress
    deliveryOrderAddress?: CommerbleAddress
    deliveryMethod?: number
    serviceValues?: { [key:string]: string }
}
export type CommerblePaymentMethod = 'CashOnDelivery' | 'Token' | 'PointOnly' | 'Cvs' | 'Offsite' | 'Offline' | 'External' | 'None'
export type CommerblePaymentForm = {
    inputUsagePoint?: number
    deliveryOrder?: {
        deliveryDate?: string
        hourRange?: string
        wrappingType?: number
        senderName?: string
    }
    paymentMethod?: CommerblePaymentMethod
    orderCustomer: {
        paymentDetail?: string
        numberOfPayments?: string
    }
    localStoreCardDisplayNo?: number
    isEasyCardEntry?: boolean
    serviceValues?: { [key:string]: string }
}
export type CommerbleConfirmInfo = CommerbleCart & {
    chargePointSummary: number
    deliveryCharge: number
    deliveryOrder?: {
        deliveryDate?: string
        hourRange?: string
        wrappingType?: number
        senderName?: string
    }
    deliveryOrderAddress?: CommerbleAddress
    discountPrice: 0
    orderCustomer: {
        lastName?: string
        lastNameKana?: string
        firstName?: string
        firstNameKana?: string
        emailAddr?: string
        paymentDetail?: string
        numberOfPayments?: string
    }
    orderCustomerOrderedAddress?: CommerbleAddress
    orderCustomerInvoiceAddress?: CommerbleAddress
    paymentMethod?: CommerblePaymentMethod
    serviceValues?: { [key:string]: string }
    subtotal: number
    token: string
    totalPayment: number
    totalUsagePoint: number
}
export type CommerbleOrderInfo = CommerbleCart & {
    orderId: number
    chargePointSummary: number
    deliveryCharge: number
    deliveryOrder?: {
        deliveryDate?: string
        hourRange?: string
        wrappingType?: number
        senderName?: string
    }
    deliveryOrderAddress?: CommerbleAddress
    discountPrice: 0
    orderCustomer: {
        lastName?: string
        lastNameKana?: string
        firstName?: string
        firstNameKana?: string
        emailAddr?: string
        paymentDetail?: string
        numberOfPayments?: string
    }
    orderCustomerOrderedAddress?: CommerbleAddress
    orderCustomerInvoiceAddress?: CommerbleAddress
    paymentMethod?: CommerblePaymentMethod
    serviceValues?: { [key:string]: string }
    subtotal: number
    token: string
    totalPayment: number
    totalUsagePoint: number
}
export type CommerbleState = {
    carts: CommerbleCart[]
    shipping: CommerbleShippingForm | null
    payment: CommerblePaymentForm | null
    confirm: CommerbleConfirmInfo | null
    complete: CommerbleOrderInfo | null
    external: CommerbleOrderInfo | null
}
export type CommerbleCartInRequest = {
    item: number, 
    qty:number, 
    desc?:string
}[]

const getCarts = () => {
    return fetch('/api/ec/order/cart').then(res => res.json());
}

const appendLines = (lines: CommerbleCartInRequest) => {
    const query = lines.map(({item, qty, desc}) => `item=${item}&qty=${qty}&desc=${desc||''}`).join('&');
    return fetch('/api/ec/order/cart?'+query).then(res => res.json());
};

const removeLine = (target: CommerbleCartLine) => {
    return fetch('/api/ec/order/cartitemdelete?item='+target.productId).then(res => res.json());
};

const updateQty = (cart: CommerbleCart, target: CommerbleCartLine, diff: number) => {
    const form = new FormData();
    form.append('CartId', String(cart.id));
    form.append('recalc', 'recalc');
    cart.items.forEach((item,i) => {
        form.append(`Items[${i}].ProductId`, String(item.productId));
        form.append(`Items[${i}].RequestAmount`, String(item.requestAmount + (item == target ? diff : 0)));
    })
    return fetch('/api/ec/order/cart', {
        method: 'post',
        body: form    
    }).then(res => res.json())
};

const tryCheckouting = async (cart: CommerbleCart, asGuest?:boolean, rootPrefix?: string) : Promise<['login']|['shipping', CommerbleShippingForm]|['confirm', CommerbleConfirmInfo]> => {
    const res = asGuest ? await fetch(`/api/ec/site/newguest/?returnUrl=${encodeURIComponent(`${rootPrefix||''}/purchase/${cart.id}`)}`)
                        :  await fetch('/api/ec/purchase/'+cart.id);
    const url = new URL(res.url);
    const pathname = url.pathname.toLocaleLowerCase();
    if (pathname.endsWith('/site/login')) {
        return ['login'];
    }
    if (pathname.endsWith(`/purchase/${cart.id}/shipping`)) {
        return ['shipping', await res.json() as CommerbleShippingForm];
    }
    if (pathname.endsWith(`/purchase/${cart.id}/confirm`)) {
        return ['confirm', await res.json() as CommerbleConfirmInfo];
    }
    throw new Error('not supported');
}

const searchAddress = (zipcode: string) => {
    return fetch(`/api/ec/site/zipcode/${zipcode}`).then(res => res.json());
}

const getShippingForm = async (cartId: number): Promise<['login'] | ['shipping', CommerbleShippingForm]> => {
    const res = await fetch(`/api/ec/purchase/${cartId}/shipping`);
    const url = new URL(res.url);
    const pathname = url.pathname.toLocaleLowerCase();
    if (pathname.endsWith('/site/login')) {
        return ['login'];
    }
    return ['shipping', await res.json() as CommerbleShippingForm];
}

const SetFormData = (data: FormData, obj: object, prefix?: string) => {
    for (const [key, value] of Object.entries(obj||{}).filter(([,value])=>value!==undefined)) {
        if (typeof value === 'object') {
            SetFormData(data, value, [prefix, key+'.'].filter(k => k).join('.'));
        }
        else {
            data.append((prefix||'') + key, value);
        }
    }
}
const postShippingForm = async (cartId:number, form: CommerbleShippingForm): Promise<['login'] | ['shipping',CommerbleShippingForm] | ['payment',CommerblePaymentForm]> => {
    const data = new FormData();
    SetFormData(data, form);
    data.append('next', 'next');
    const res = await fetch(`/api/ec/purchase/${cartId}/shipping`, {
        method: 'post',
        body: data
    });
    const url = new URL(res.url);
    const pathname = url.pathname.toLocaleLowerCase();
    if (pathname.endsWith('/site/login')) {
        return ['login'];
    }
    if (pathname.endsWith(`/purchase/${cartId}/shipping`)) {
        return ['shipping', await res.json() as CommerbleShippingForm];
    }
    if (pathname.endsWith(`/purchase/${cartId}/payment`)) {
        return ['payment', await res.json() as CommerblePaymentForm];
    }
    throw new Error('not supported');
}
const getPaymentForm = async (cartId: number): Promise<['login'] | ['payment', CommerblePaymentForm]> => {
    const res = await fetch(`/api/ec/purchase/${cartId}/payment`);
    const url = new URL(res.url);
    const pathname = url.pathname.toLocaleLowerCase();
    if (pathname.endsWith('/site/login')) {
        return ['login'];
    }
    return ['payment', await res.json() as CommerblePaymentForm];
}
const postPaymentForm = async (cartId:number, form: CommerblePaymentForm): Promise<['login'] | ['payment',CommerblePaymentForm] | ['confirm', CommerbleConfirmInfo]> => {
    const data = new FormData();
    SetFormData(data, form);
    data.append('next', 'next');
    const res = await fetch(`/api/ec/purchase/${cartId}/payment`, {
        method: 'post',
        body: data
    });
    const url = new URL(res.url);
    const pathname = url.pathname.toLocaleLowerCase();
    if (pathname.endsWith('/site/login')) {
        return ['login'];
    }
    if (pathname.endsWith(`/purchase/${cartId}/payment`)) {
        return ['payment', await res.json() as CommerblePaymentForm];
    }
    if (pathname.endsWith(`/purchase/${cartId}/confirm`)) {
        return ['confirm', await res.json() as CommerbleConfirmInfo];
    }
    throw new Error('not supported');
}
const getConfirmInfo = async (cartId: number): Promise<['login'] | ['confirm', CommerbleConfirmInfo]> => {
    const res = await fetch(`/api/ec/purchase/${cartId}/confirm`);
    const url = new URL(res.url);
    const pathname = url.pathname.toLocaleLowerCase();
    if (pathname.endsWith('/site/login')) {
        return ['login'];
    }
    return ['confirm', await res.json() as CommerbleConfirmInfo];
}
const purchase = async (cartId: number, token: string): Promise<['login'] | ['error', CommerbleConfirmInfo] | ['complete', CommerbleOrderInfo] | ['external', CommerbleOrderInfo]> => {
    const form = new FormData();
    form.append('__RequestVerificationToken', token)
    const res = await fetch(`/api/ec/purchase/${cartId}`, {
        method: 'post',
        body: form
    });
    const url = new URL(res.url);
    const pathname = url.pathname.toLocaleLowerCase();
    if (pathname.endsWith('/site/login')) {
        return ['login'];
    }
    if (pathname.endsWith(`/purchase/${cartId}`)) {
        return ['error', await res.json() as CommerbleConfirmInfo];
    }
    if (/\/purchase\/\d+\/complete\/\d+$/.test(pathname)) {
        return ['complete', await res.json() as CommerbleOrderInfo];
    }
    if (/\/purchase\/\d+\/external\/\d+$/.test(pathname)) {
        return ['external', await res.json() as CommerbleOrderInfo];
    }
    throw new Error('not supported');
}
const getCompleteInfo = async (cartId: number, orderId: number): Promise<['login'] | ['complete', CommerbleOrderInfo]> => {
    const res = await fetch(`/api/ec/purchase/${cartId}/complete/${orderId}`);
    const url = new URL(res.url);
    const pathname = url.pathname.toLocaleLowerCase();
    if (pathname.endsWith('/site/login') || res.status == 401 || res.status == 403) {
        return ['login'];
    }
    return ['complete', await res.json() as CommerbleOrderInfo];
}
const getExternalInfo = async (cartId: number, orderId: number): Promise<['login'] | ['complete', CommerbleOrderInfo] | ['external', CommerbleOrderInfo]> => {
    const res = await fetch(`/api/ec/purchase/${cartId}/external/${orderId}`);
    const url = new URL(res.url);
    const pathname = url.pathname.toLocaleLowerCase();
    if (pathname.endsWith('/site/login') || res.status == 401 || res.status == 403) {
        return ['login'];
    }
    if (pathname.endsWith(`/purchase/${cartId}/complete/${orderId}`)) {
        return ['complete', await res.json() as CommerbleOrderInfo];
    }
    return ['external', await res.json() as CommerbleOrderInfo];
}

export type CommerblePublicConfig = {
    rootPrefix: string,
    loginUrl: string,
}
export const CommerbleContext = createContext<CommerblePublicConfig>({
    rootPrefix: '',
    loginUrl: '/cart#login'
})
