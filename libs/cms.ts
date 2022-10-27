
const ep = process.env.CBPAAS_EP;
const authz = process.env.CBPAAS_AUTHZ;

const cms = async (url) => {
    const headers = new Headers();
    headers.append('X-Template-Suffix', 'Json');
    if (authz) {
        headers.append('Authorization', authz);
    }
    return fetch(ep + url, {
        method: 'get',
        headers
    }).then(res => res.json());
}

export default cms;