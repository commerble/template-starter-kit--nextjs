import React, { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/dist/client/router';
import useSWR from 'swr';
import config from './config';

const initialData: CommerbleState = {
    carts:[],
    shipping: null,
    payment: null,
    confirm: null,
    complete: null,
    external: null,
    login: null,
    register: null,
    registerConfirm: null,
    registerComplete: null,
    memberIndex: null,
} 
export const CommerbleRouting: React.FC<PropsWithChildren<{}>> = (props) => {
    const router = useRouter();
    const cb = useCommerble();
    useEffect(() => {
        if (cb.data.shipping) {
            router.push(config.purchaseShippingUrl, undefined, {shallow:true});
        }
    }, [!!cb.data.shipping])
    useEffect(() => {
        if (cb.data.payment) {
            router.push(config.purchasePaymentUrl, undefined, {shallow:true});
        }
    }, [!!cb.data.payment])
    useEffect(() => {
        if (cb.data.confirm) {
            router.push(config.purchaseConfirmUrl, undefined, {shallow:true});
        }
    }, [!!cb.data.confirm])
    useEffect(() => {
        if (cb.data.complete?.orderId) {
            router.push(config.purchaseCompleteUrl + cb.data.complete.orderId, undefined, {shallow:true});
        }
    }, [cb.data.complete?.orderId])
    useEffect(() => {
        if (cb.data.external?.orderId) {
            router.push(config.purchaseExternalUrl + cb.data.complete.orderId, undefined, {shallow:true});
        }
    }, [cb.data.external?.orderId])
    useEffect(() => {
        if (cb.data.registerConfirm) {
            router.push(config.registerConfirmUrl, undefined, {shallow:true});
        }
    }, [!!cb.data.registerConfirm])
    useEffect(() => {
        if (cb.data.registerComplete) {
            router.push(config.registerCompleteUrl, undefined, {shallow:true});
        }
    }, [!!cb.data.registerComplete])
    return <>{props.children}</>
}
const useCommerble = () => {
    const router = useRouter();
    const { data, mutate} = useSWR('commerble', null, {
        fallbackData: initialData
    })
    const setCarts = (carts: CommerbleCart[]) => {
        mutate({
            ...data,
            carts,
            shipping: null,
            payment: null,
            confirm: null,
            complete: null,
            external: null,
        });
    }
    let loginUrl = config.loginUrl;
    if (typeof window !== "undefined") {
        const url = new URL(config.loginUrl, window.location as unknown as URL);
        url.searchParams.append('returnUrl',router.asPath);
        loginUrl = url.href;
    }
    return {
        data,
        hasDestinationAddress() {
            if (!data.shipping?.deliveryOrderAddress?.recipientlastname
            && !data.shipping?.deliveryOrderAddress?.recipientfirstname
            && !data.shipping?.deliveryOrderAddress?.recipientlastnamekana
            && !data.shipping?.deliveryOrderAddress?.recipientfirstnamekana
            && !data.shipping?.deliveryOrderAddress?.zipCode
            && !data.shipping?.deliveryOrderAddress?.city
            && !data.shipping?.deliveryOrderAddress?.pref
            && !data.shipping?.deliveryOrderAddress?.street
            && !data.shipping?.deliveryOrderAddress?.building
            && !data.shipping?.deliveryOrderAddress?.tel)
                return false;
            
            return data.shipping?.orderCustomerOrderedAddress?.recipientlastname != data.shipping?.deliveryOrderAddress?.recipientlastname
            || data.shipping?.orderCustomerOrderedAddress?.recipientfirstname != data.shipping?.deliveryOrderAddress?.recipientfirstname
            || data.shipping?.orderCustomerOrderedAddress?.recipientlastnamekana != data.shipping?.deliveryOrderAddress?.recipientlastnamekana
            || data.shipping?.orderCustomerOrderedAddress?.recipientfirstnamekana != data.shipping?.deliveryOrderAddress?.recipientfirstnamekana
            || data.shipping?.orderCustomerOrderedAddress?.zipCode != data.shipping?.deliveryOrderAddress?.zipCode
            || data.shipping?.orderCustomerOrderedAddress?.city != data.shipping?.deliveryOrderAddress?.city
            || data.shipping?.orderCustomerOrderedAddress?.pref != data.shipping?.deliveryOrderAddress?.pref
            || data.shipping?.orderCustomerOrderedAddress?.street != data.shipping?.deliveryOrderAddress?.street
            || data.shipping?.orderCustomerOrderedAddress?.building != data.shipping?.deliveryOrderAddress?.building
            || data.shipping?.orderCustomerOrderedAddress?.tel != data.shipping?.deliveryOrderAddress?.tel
        },
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
                router.push(loginUrl);
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
                router.push(loginUrl);
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
            mutate({
                ...data,
                payment: null
            });
            const res = await postShippingForm(cartId, form);
            if (res[0] === 'login') {
                router.push(loginUrl);
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
                router.push(loginUrl);
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
            mutate({
                ...data,
                confirm: null
            });
            const res = await postPaymentForm(cartId, form);
            if (res[0] === 'login') {
                router.push(loginUrl);
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
        clearFormCache() {
            mutate({
                ...data,
                shipping: null,
                payment: null,
            })
        },
        async getConfirmInfo(cartId: number) {
            if (data.confirm) {
                return Promise.resolve(data.confirm);
            }
            const res = await getConfirmInfo(cartId);
            if (res[0] === 'login') {
                router.push(loginUrl);
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
            mutate({
                ...data,
                external: null,
                complete: null,
            });
            const res = await purchase(data.confirm.id, data.confirm.token);
            if (res[0] === 'login') {
                router.push(loginUrl);
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
                    shipping: null,
                    payment: null,
                    confirm: null,
                    external: null,
                    complete: res[1]
                })
            }
            else if (res[0] === 'external') {
                mutate({
                    ...data,
                    shipping: null,
                    payment: null,
                    confirm: null,
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
                router.push(loginUrl);
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
                router.push(loginUrl);
            }
            else if (res[0] === 'complete') {
                mutate({
                    ...data,
                    complete: res[1]
                });
            }
            else if (res[0] === 'external') {
                mutate({
                    ...data,
                    external: res[1]
                });
            }
            return res[0];
        },
        async getRegisterForm() {
            if (data.register){
                mutate({
                    ...data,
                    registerConfirm:null,
                    registerComplete: null,
                })
                return;
            }
            const res = await getSiteAccount();
            mutate({
                ...data,
                registerConfirm:null,
                register: res
            })
        },
        async postRegisterForm(form: CommerbleRegisterForm) {
            const res = await confirmSiteAccount(form);
            if (res[0] === 'confirm') {
                mutate({
                    ...data,
                    registerConfirm: res[1],
                    registerComplete: null,
                })
            }
            else if (res[0] === 'form') {
                mutate({
                    ...data,
                    register: res[1],
                    registerConfirm:null,
                })
            }
        },
        async register(info: CommerbleRegisterConfirmInfo) {
            const res = await createSiteAccount(info);
            if (res[0] === 'complete') {
                mutate({
                    ...data,
                    register: null,
                    registerComplete: res[1],
                })
            }
            else if(res[0] === 'form') {
                mutate({
                    ...data,
                    register: res[1]
                })
            }
            
        },
        async activate(token: string) {
            await getSiteActivate(token);
        },
        async getLoginForm(returnUrl: string) {
            const res = await getLoginForm(returnUrl);
            mutate({
                ...data,
                login: res
            });
        },
        async login(form: CommerbleLoginForm) {
            const res = await login(form, config.rootPrefix);
            if (res[0] === 'succeeded') {
                router.push(res[1]);
            }
            else if (res[0] === 'failed') {
                mutate({
                    ...data,
                    login: res[1]
                });
            }
        },
        async logout(returnUrl: string) {
            await logout(config.rootPrefix);
            router.push(returnUrl);
        },
        async getMemberIndex() {
            const res = await getMemberIndex();
            if (res[0] === 'login') {
                router.push(loginUrl);
            }
            else if (res[0] === 'member') {
                mutate({
                    ...data,
                    memberIndex: res[1],
                })
            }
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
export type CommerbleViewState = {
    messages: string[]
    warnings: string[]
    errors: string[]
}
export type CommerbleCart = {
    id: number
    items: CommerbleCartLine[]
    errors: string[]
    state: CommerbleViewState
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
export type CommerbleLoginForm = {
    userName: string
    password: string
    returnUrl: string
    token: string
    state: CommerbleViewState
}
export type CommerbleRegisterForm = {
    userName: string
    lastName: string
    firstName: string
    lastNameKana: string
    firstNameKana: string
    birthdayY?: number
    birthdayM?: number
    birthdayD?: number
    sex?: number
    subscribe?: boolean
    password: string
    confirmPassword: string
    token: string
    state: CommerbleViewState
}
export type CommerbleRegisterConfirmInfo = {
    userName: string
    lastName: string
    firstName: string
    lastNameKana: string
    firstNameKana: string
    birthY?: number
    birthM?: number
    birthD?: number
    sex?: number
    subscribe?: boolean
    token: string
    model: string
    state: CommerbleViewState
}
export type CommerbleRegisterInfo = {
    state: CommerbleViewState
}
export type CommerbleMemberIndexInfo = {
    state: CommerbleViewState
}
export type CommerbleState = {
    carts: CommerbleCart[]
    shipping: CommerbleShippingForm | null
    payment: CommerblePaymentForm | null
    confirm: CommerbleConfirmInfo | null
    complete: CommerbleOrderInfo | null
    external: CommerbleOrderInfo | null
    login: CommerbleLoginForm | null
    register: CommerbleRegisterForm | null
    registerConfirm: CommerbleRegisterConfirmInfo | null
    registerComplete: CommerbleRegisterInfo | null
    memberIndex: CommerbleMemberIndexInfo | null
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

const getLoginForm = async (returnUrl): Promise<CommerbleLoginForm> => {
    const res = await fetch(`/api/ec/site/login`);
    return { ...(await res.json()), returnUrl };
}
const login = async (data: CommerbleLoginForm, prefix:string): Promise<['failed', CommerbleLoginForm]|['succeeded', string]> => {
    const form = new FormData();
    form.append('UserName', data.userName);
    form.append('Password', data.password);
    form.append('ReturnUrl', prefix + "/site/loginstate");
    form.append('__RequestVerificationToken', data.token);
    const res = await fetch(`/api/ec/site/login`, {
        method: 'post',
        body: form
    });
    const url = new URL(res.url);
    const pathname = url.pathname.toLocaleLowerCase();
    if (pathname.endsWith('/site/login') || res.status == 401 || res.status == 403) {
        return ['failed', await res.json()];
    }
    let returnUrl = data.returnUrl || '/';
    return ['succeeded', returnUrl.startsWith('/') ? returnUrl : '/'];
}
const logout = async (prefix:string): Promise<void> => {
    await fetch(`/api/ec/site/logout?returnUrl=${encodeURIComponent(prefix + '/site/loginstate')}`);
}

const getMemberIndex = async (): Promise<['login']|['member', CommerbleMemberIndexInfo]> => {
    const res = await fetch(`/api/ec/member/index`);
    const url = new URL(res.url);
    const pathname = url.pathname.toLocaleLowerCase();
    if (pathname.endsWith('/site/login') || res.status == 401 || res.status == 403) {
        return ['login'];
    }
    return ['member', await res.json()];
}

const getSiteAccount = async (): Promise<CommerbleRegisterForm> => {
    const res = await fetch(`/api/ec/site/account`);
    return  await res.json();
}
const confirmSiteAccount = async (data: CommerbleRegisterForm): Promise<['form', CommerbleRegisterForm] | ['confirm', CommerbleRegisterConfirmInfo]> => {
    const form = new FormData();
    form.append('UserName', data.userName);
    form.append('LastName', data.lastName);
    form.append('FirstName', data.firstName);
    form.append('LastNameKana', data.lastNameKana);
    form.append('FirstNameKana', data.firstNameKana);
    form.append('BirthdayY', String(data.birthdayY));
    form.append('BirthdayM', String(data.birthdayM));
    form.append('BirthdayD', String(data.birthdayD));
    form.append('Subscribe', String(data.subscribe));
    form.append('Sex', String(data.sex));
    form.append('Password', data.password);
    form.append('ConfirmPassword', data.confirmPassword);
    form.append('confirm', 'confirm');
    form.append('__RequestVerificationToken', data.token);
    const res = await fetch(`/api/ec/site/account`, {
        method: 'post',
        body: form
    });
    const info = await res.json();
    console.log(info)
    if (info.model) {
        return ['confirm', info];
    }
    return ['form', info];
}
const createSiteAccount = async (data: CommerbleRegisterConfirmInfo) : Promise<['form', CommerbleRegisterForm] | ['complete', CommerbleRegisterInfo]> => {
    const form = new FormData();
    form.append('model', data.model);
    form.append('__RequestVerificationToken', data.token);
    form.append('create', 'create');
    const res = await fetch(`/api/ec/site/account`, {
        method: 'post',
        body: form
    });
    const url = new URL(res.url);
    const pathname = url.pathname.toLocaleLowerCase();
    if (pathname.endsWith('/site/accountcomplete')) {
        return ['complete', await res.json()];
    }
    return ['form', await res.json()];
}
const getSiteActivate = async (token: string): Promise<void> => {
    await fetch(`/api/ec/site/activate/${token}`);
}

// export type CommerblePublicConfig = {
//     rootPrefix: string,
//     loginUrl: string,
// }
// export const CommerbleContext = createContext<CommerblePublicConfig>({
//     rootPrefix: '',
//     loginUrl: '/login'
// })
