import { IncomingMessage, ServerResponse } from 'http';
import {ERR_UNAUTHORIZED} from './constant';
import https from 'https';
import Cookie from './cookie';

const ROOT_PATH = process.env.CBPAAS_EP;
const AUTHORIZE = process.env.CBPAAS_AUTHZ;

export type Context = {
    req: IncomingMessage,
    res: ServerResponse
}

type Method = "get" | "post" | "put" | "patch" | "delete";

type Options = {
    method: Method,
    headers: {[key:string]: string|string[]},
    body?: string
}

export type SendResponse = {
    statusCode: number,
    statusMessage: string,
    headers: {[key:string]: string|string[]},
    body: string
}


const send = (url:string, options:Options) : Promise<SendResponse> => {
    return new Promise((resolve, reject) => {
        const uri = new URL(url);
        const request = https.request({
            ...options,
            headers: {
                'Authorization': AUTHORIZE,
                'X-Template-Suffix': 'Json',
                ...(options.headers||{}),
            },
            hostname: uri.hostname,
            port: uri.port || uri.protocol === 'https:' ? 443 : 80,
            path: uri.pathname + uri.search,
        }, response => {
            let body: Uint8Array = new Uint8Array();
            response.on('data', chunk => {
                const merge = new Uint8Array(body.length + chunk.length);
                merge.set(body, 0);
                merge.set(chunk, body.length);
                body = merge;
            });
            response.on('end', () => resolve({ 
                statusCode: response.statusCode, 
                statusMessage: response.statusMessage,
                headers: response.headers,
                body: new TextDecoder().decode(body),
            }));
        });
        request.on('error', reject);
        if (options.body) {
            request.write(options.body);
        }
        request.end();
    });
}

const absoluteUrl = url => /^https?:\/\//.test(url) ? url : ROOT_PATH + url;

const absolutePath = url => new URL(absoluteUrl(url)).pathname;

const absoluteRedirectUrl = url => /^https?:\/\//.test(url) ? url : new URL(ROOT_PATH).origin + url;

const getLocation = (response: {headers:{[key:string]: string|string[]}}):string => {
    return (Array.isArray(response.headers['location']) ? response.headers['location'][0] : response.headers['location'])?.toLowerCase();
}

export const get = async (context: Context, url: string, redirect = false, cookie = null) => {
    if (cookie === null)
        cookie = new Cookie(context.req.headers['cookie']);

    let response = await send(absoluteUrl(url), {
        method: 'get',
        headers: {
            cookie: cookie.getCookieField()
        }
    });

    if (response.headers['set-cookie']) {
        cookie.appendSetCookies(response.headers['set-cookie']);
    }

    if (redirect && 300 <= response.statusCode && response.statusCode < 400) {
        const redirectLocation = getLocation(response)
        if (redirectLocation) {
            response = await get(context, absoluteRedirectUrl(redirectLocation), true, cookie);
        }
    }

    context.res.setHeader('set-cookie', cookie.getSetCookieField());

    return response;
}

export const post = async (context, url, body, contentType = 'application/x-www-form-urlencoded') => {
    
    const response = await send(absoluteUrl(url), {
        method: 'post',
        headers: {
            cookie: context.req.headers.cookie || '',
            'Content-Type': contentType,
            'Content-Length': body.length
        },
        body
    });

    if (response.headers['set-cookie']) {
        context.res.setHeader('set-cookie', response.headers['set-cookie']);
    }

    return response;
}

export const NeedAuthorizeError = new Error('Unauthorized');
export const RetryRequest = new Error('Retry');

export const getCart = async (context: Context) => {
    const response = await get(context, '/order/cart', true);

    if (response.statusCode != 200) {
        throw new Error(response.statusMessage);
    }

    return JSON.parse(response.body);
}

export type Line = {
    item: number,
    qty?: number,
    desc?: string, 
}

export const addToCart = async (context: Context, lines: Line[]) => {
    const parameters = (lines||[]).map(line => `item=${line.item}&qty=${line.qty||1}&desc=${line.desc||''}`).join('&');
    const response = await get(context, `/order/cart?${parameters}`, true);

    if (response.statusCode != 200)
        throw new Error(response.statusMessage);

    return JSON.parse(response.body);
}

export const removeFromCart = async (context: Context, item: number) => {
    const response = await get(context, `/order/CartItemDelete?item=${item}`);

    if (response.statusCode < 300 && 400 <= response.statusCode)
        throw new Error(response.statusMessage);

    return await getCart(context);
}

export const clearCart = async (context: Context, cartId: number) => {
    const response = await post(context, `/order/cart`, `CartId=${cartId}&itemclear=itemclear`);

    if (response.statusCode < 300 && 400 <= response.statusCode)
        throw new Error(response.statusMessage);
}

export const relpaceCart = async (context: Context, cartId: number, lines: Line[]) => {
    await clearCart(context, cartId);
    return await addToCart(context, lines);
}

export type CheckoutingResult = {
    errors: { type: string, detailErrorMessage?: string, detailErrorCode?: string, item?}[],
    next?: 'shipping' | 'confirm',
}

export const startCheckout = async (context: Context, cartId: number, direct: boolean = false) : Promise<CheckoutingResult> => {
    const response = await get(context, `/purchase/${cartId}?direct=${direct}`);
    const shippingUrl = absolutePath(`/purchase/${cartId}/shipping`);
    const confirmUrl = absolutePath(`/purchase/${cartId}/confirm`);

    if (300 <= response.statusCode && response.statusCode < 400) {
        const location = getLocation(response);

        if (location == shippingUrl) return { errors: [], next: 'shipping' };
        if (location == confirmUrl) return { errors: [], next: 'confirm' };

        return { errors: [{ type: ERR_UNAUTHORIZED }] };
    }

    return JSON.parse(response.body);
}


export const loginAsGuest = async (context: Context) => {
    const checkoutUrl = absolutePath(`/cart`);
    const response = await get(context, `/site/newguest?returnUrl=${encodeURIComponent(checkoutUrl)}`);

    if (getLocation(response) !== checkoutUrl)
        throw new Error('Cannot make guest user');
}

export type CheckoutedResult = {
    errors: [],
    next?: 'complete' | 'external',
    cartId?: number,
    orderId?: number,
}
export const checkout = async (context: Context, cartId: number, token: string) : Promise<CheckoutedResult> => {
    const body = `__RequestVerificationToken=${encodeURIComponent(token)}`;
    const response = await post(context, `/purchase/${cartId}`, body);
    
    if (response.statusCode === 200)
        return JSON.parse(response.body);

    const location = getLocation(response);
    
    if (location) {
        const orderId = parseInt(location.match(/\/(\d+)$/)[1]);
        if (location.indexOf('external') != -1)
            return { next: 'external', cartId, orderId, errors: [] };

        if (location.indexOf('complete') != -1)
            return { next: 'complete', cartId, orderId, errors: [] };
    }
    
    throw new Error(response.statusMessage);
}

export const getShippingForm = async (context: Context, cartId: number) => {
    const response = await get(context, `/purchase/${cartId}/shipping`);
    
    if (response.statusCode === 200)
        return JSON.parse(response.body);

    if (300 <= response.statusCode && response.statusCode < 400)
        return { errors: [{ type: ERR_UNAUTHORIZED }] };

    throw new Error(response.statusMessage);
}
export type Address = {
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
export type ShippingForm = {
    customer?: {
        lastName?: string
        lastNameKana?: string
        firstName?: string
        firstNameKana?: string
        emailAddr?: string
    }
    orderCustomerOrderedAddress?: Address
    deliveryOrderAddress?: Address
    deliveryMethod?: number
    serviceValues?: { [key:string]: string }
}
const toFormUrlEncoded = (obj: object, prefix: string) => {
    return Object.entries(obj).filter(([,value])=>value!==undefined).map(([key, value]) => {
        if (typeof value === 'object')
            return toFormUrlEncoded(value||{}, [prefix, key+'.'].filter(k => k).join('.'));
        return `${prefix}${key}=${encodeURIComponent(value === null ? '' : value)}`
    }).filter(k => k).join('&')
}
const shippingToFormUrlEncoded = (form: ShippingForm) => {
    return toFormUrlEncoded({
        next: 'next',
        customer: form.customer,
        orderCustomerOrderedAddress: form.orderCustomerOrderedAddress,
        deliveryOrderAddress: form.deliveryOrderAddress,
        deliveryMethod: form.deliveryMethod,
        serviceValues: Object.entries(form.serviceValues||{}).reduce((o, [key, value]) => {
            o[`ServiceValues[${key}]`] = value;
            return o;
        }, {})
    }, '')
}
export const setShippingForm = async (context: Context, cartId: number, form: ShippingForm) => {
    const body = shippingToFormUrlEncoded(form);
    const response = await post(context, `/purchase/${cartId}/shipping`, body);
    
    if (response.statusCode === 200)
        return JSON.parse(response.body);

    if (300 <= response.statusCode && response.statusCode < 400 && getLocation(response) === absolutePath(`/purchase/${cartId}/payment`))
        return { errors: [] };

    throw new Error(response.statusMessage);
}

export const getPaymentForm = async (context: Context, cartId: number) => {
    const response = await get(context, `/purchase/${cartId}/payment`);
    
    if (response.statusCode === 200)
        return JSON.parse(response.body);
    
    if (300 <= response.statusCode && response.statusCode < 400)
        return { errors: [{ type: ERR_UNAUTHORIZED }] };

    throw new Error(response.statusMessage);
}
export type PaymentForm = {
    inputUsagePoint?: number
    deliveryOrder?: {
        deliveryDate?: string
        hourRange?: string
        wrappingType?: number
        senderName?: string
    }
    paymentMethod?: 'CashOnDelivery' | 'Token' | 'PointOnly' | 'Cvs' | 'Offsite' | 'Offline' | 'External' | 'None'
    orderCustomer: {
        paymentDetail?: string
        numberOfPayments?: string
    }
    localStoreCardDisplayNo?: number
    isEasyCardEntry?: boolean
    serviceValues?: { [key:string]: string }
}
const paymentToFormUrlEncoded = (form: PaymentForm) => {
    return toFormUrlEncoded({
        deliveryOrder: form.deliveryOrder,
        inputUsagePoint: form.inputUsagePoint,
        paymentMethod: form.paymentMethod,
        localStoreCardDisplayNo: form.localStoreCardDisplayNo,
        isEasyCardEntry: form.isEasyCardEntry,
        orderCustomer: form.orderCustomer ? {
            paymentDetail: form.orderCustomer.paymentDetail,
            numberOfPayments: form.orderCustomer.numberOfPayments,
        } : undefined,
        serviceValues: Object.entries(form.serviceValues||{}).reduce((o, [key, value]) => {
            o[`ServiceValues[${key}]`] = value;
            return o;
        }, {})
    }, '');
}
export const setPaymentForm = async (context: Context, cartId: number, form: PaymentForm) => {
    const body = paymentToFormUrlEncoded(form);
    const response = await post(context, `/purchase/${cartId}/payment`, body);

    if (response.statusCode === 200)
        return JSON.parse(response.body);

    if (300 <= response.statusCode && response.statusCode < 400 && getLocation(response) === absolutePath(`/purchase/${cartId}/confirm`))
        return { errors: [] };

    throw new Error(response.statusMessage);
}


export const getConfirm = async (context: Context, cartId: number) => {
    const response = await get(context, `/purchase/${cartId}/confirm`);
    
    if (response.statusCode === 200)
        return JSON.parse(response.body);

    if (300 <= response.statusCode && response.statusCode < 400)
        return { errors: [{ type: ERR_UNAUTHORIZED }] };

    throw new Error(response.statusMessage);
}


export const getComplete = async (context: Context, cartId: number, orderId: number) => {
    const response = await get(context, `/purchase/${cartId}/complete/${orderId}`);
    
    if (response.statusCode === 200)
        return JSON.parse(response.body);

    if (300 <= response.statusCode && response.statusCode < 400)
        return { errors: [{ type: ERR_UNAUTHORIZED }] };

    throw new Error(response.statusMessage);
}

export const getExternal = async (context: Context, cartId: number, orderId: number) => {
    const response = await get(context, `/purchase/${cartId}/external/${orderId}`);
    
    if (response.statusCode === 200)
        return JSON.parse(response.body);
    
    if (300 <= response.statusCode && response.statusCode < 400)
        return { errors: [{ type: ERR_UNAUTHORIZED }] };

    throw new Error(response.statusMessage);
}