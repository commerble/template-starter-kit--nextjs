type Record = {
    key: string,
    value: string,
    expires?: Date,
    path?: string,
    domain?: string,
}
export default class Cookie {
    private records: Record[] = [];
    private setCookies: string[] = [];
    constructor(cookie: string|string[]) {
        this.parseCookies(cookie);
    }
    private parseCookie(cookie: string) {
        if (typeof cookie !== 'string')
            return;

        for (let kv of cookie.split(';').map(str => str.trim())){
            const [key, value] = kv.split('=');
            this.records.push({ key, value });
        }
    }
    private parseCookies(cookie: string | string[]){
        if (Array.isArray(cookie)) {
            for (let text of cookie) {
                this.parseCookie(text);
            }
        }
        else {
            this.parseCookie(cookie);
        }
    }
    private appendSetCookie (setCookie: string) {
        if (typeof setCookie !== 'string')
            return;

        const descriptor = setCookie.split(';').map(kv => kv.trim().split('='));
        
        if (descriptor.length == 0 || descriptor[0].length != 2)
            return;
        
        const [key, value] = descriptor[0];
        const [, expires] = descriptor.find(([k]) => k === 'expires') || [null,null];
        const [, path] = descriptor.find(([k]) => k === 'path') || [null,null];
        const [, domain] = descriptor.find(([k]) => k === 'domain') || [null,null];

        this.records.push({ key, value, path, domain, expires: new Date(expires)});
        this.setCookies.push(setCookie);
    }
    public appendSetCookies(setCookie: string | string[]) {
        if (Array.isArray(setCookie)) {
            for (let text of setCookie) {
                this.appendSetCookie(text);
            }
        }
        else {
            this.appendSetCookie(setCookie);
        }
    }
    public getCookieField() {
        const now = new Date();
        const group: Record[] = Object.values(this.records.reduce((o, record) => {
            o[record.key] = record;
            return o;
        }, {}));
        return group.filter(record => !record.expires || now < record.expires).map(record => record.key + '=' + record.value).join('; ');
    }
    public getSetCookieField() {
        return Object.values(this.setCookies.reduce((o, setCookie) => {
            const [key,] = setCookie.split('=');
            o[key] = setCookie;
            return o;
        }, {}));
    }
}