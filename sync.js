/**
 * 設定
 */

 const config = {
    // Commerble Web APIの認証情報は環境変数で指定します。
    // 使用する環境変数名は apiEndpointEnvKey,apiUsernameEnvKey,apiPasswordEnvKeyで指定します。
    // 例 set CBAPI_ENDPOINT=http://172.31.51.85/data
    apiEndpointEnvKey: 'CBAPI_DM_ENDPOINT',
    apiUsernameEnvKey: 'CBAPI_DM_USERNAME',
    apiPasswordEnvKey: 'CBAPI_DM_PASSWORD',
    apiItemLimit: 100,
    templateDirPath: './templates',
    mailTemplatePrefix: 'Mail',
    sharedTemplates: [
        'ModdSharedViewStart',
        'ModdSharedHelpers',
        'ModdSharedFunctions',
    ],
    escapeTemplates: [
    ]
}

/**
 * 以下同期スクリプト
 */
 
const chokidar = require('chokidar')
const fetch = require('node-fetch')
const fs = require('fs').promises
const path = require('path')
const stripBom = require('strip-bom')

const typeMap = {
    template: '.txt',
    cshtml: '.cshtml',
    mail: '.cshtml',
    csx: '.csx'
}

async function main() {
    const mode =  process.argv[2]
    
    if (mode == 'all') {
        await uploadAll()
        return
    }

    if (mode == 'watch') {
        await watch()
        return
    }

    console.log(process.argv)
    console.log('sync.js <mode>')
    console.log('mode = upload | sync')
}

async function uploadAll(){
    const files = await getFiles(config.templateDirPath)
    const plan = [] 
    let nameMaxSize  = 0
    for (const file of files) {
        const relative = path.relative(config.templateDirPath, file)
        const nameExt = relative.replace(/[\\\/]/g, '')
        const ext = path.extname(nameExt)
        const name = nameExt.replace(ext, '')
        if (config.sharedTemplates.some(_ => _ == name)) {
            plan.unshift(file)
        } else {
            plan.push(file)
        }
        nameMaxSize = Math.max(nameMaxSize, name.length)
    }
    for (const file of plan) {
        const success = await upload(file, nameMaxSize)
        if (!success) {
            console.log('Panic!')
            process.exit(1);
        }
    }
    console.log('Done!')
}

async function watch() {
    const files = await getFiles(config.templateDirPath)
    chokidar.watch(config.templateDirPath, {
        persistent: true
    }).on('all', (event, file, stats) => {
        if(file.endsWith('.cshtml')||file.endsWith('.csx')||file.endsWith('.txt')) {
            if (event == 'add' && !files.includes(file)) {
                upload(file)
            }
            else if(event == 'change') {
                setTimeout(() => {upload(file)}, 500)
            }
        }
    }).on('error', console.error)
}

async function upload(file, nameMaxSize = 28) {
    const relative = path.relative(config.templateDirPath, file)
    const nameExt = relative.replace(/[\\\/]/g, '')
    const ext = path.extname(nameExt)
    const name = nameExt.replace(ext, '')
    const type = resolveType(name, ext)
    const template = await getTemplate(name)
    let text = stripBom(await fs.readFile(file, 'utf8'))
    if (config.escapeTemplates.includes(name)) {
        text = escapeTemplate(text)
    }
    const model = {
        ...(template || { Name: name }),
        Type: type,
        Text: text || `/*${name}*/`
    }

    const now = new Date()
    const nowText = `${now.toLocaleTimeString()}.${now.getMilliseconds()}`.padEnd(12, '0')
    const valid = await validateTemplate(model.Name, model.Type, model.Text)
    if (valid.startsWith('NG')) {
        console.error(`\x1b[31m[${nowText}] ${name.padEnd(nameMaxSize)}\t${valid}\x1b[0m`)
        return false
    }
    const result = await upsertTemplate(model)
    if (result.startsWith('NG')) {
        console.error(`[${nowText}] ${name.padEnd(nameMaxSize)}\t${result}`)
        return false
    }
    console.log(`[${nowText}] ${name.padEnd(nameMaxSize)}\t${result}`)
    return true;
}

async function getFiles(root) {
    const files = []
    const dirs = [root]
    do{
        const dir = dirs.pop()
        const items = await fs.readdir(dir, { withFileTypes: true })
        for (const item of items) {
            if (item.isFile())
                files.push(path.join(dir, item.name))
            else if (item.isDirectory())
                dirs.push(path.join(dir, item.name))
        }
    }while(dirs.length > 0) 
    return files
}

async function getTemplate(name) {
    let response = await fetch(ep() + `/meta/Templates?$select=Id,Name&$filter=Name eq '${name}'`, { headers: { Authorization: auth() }})
    if (!response.ok) {
        const text = await response.text()
        console.error('fetch error:', text)
        return []
    }

    const data = await response.json()

    return data.value[0] || null
}

async function validateTemplate(name, type, content) {
    const [url, model] = type == 'cshtml' ? [ ep() + '/template/validate', { Template: content, WithViews: !config.sharedTemplates.some(_ => _ == name) } ]
                       : type == 'mail'   ? [ ep() + '/mail/validate', { Template: content } ]
                       : type == 'csx'    ? [ ep() + '/query/validate', { Script: content } ]
                       : [null,null]

    if (url == null)
        return 'skip'

    const response = await fetch(url, { method: 'post', headers: { Authorization: auth(), 'Content-Type': 'application/json' }, body: JSON.stringify(model) })
    if (!response.ok) {
        const contentType = response.headers.get('Content-Type')
        if (contentType && contentType.includes('application/json')) {
            const json = await response.json()
            return 'NG:\n' + json.Message
        }
        else {
            const text = await response.text()
            return 'NG:\n' + response.statusText + text
        }
    }

    return 'OK'
}

async function upsertTemplate(template) {
    const [ method, url ]  = template.Id ? [ 'put', ep() + `/meta/Templates(${template.Id})`] : ['post', ep() + '/meta/Templates']
    const response = await fetch(url, { method,  headers: { Authorization: auth(), 'Content-Type': 'application/json' }, body: JSON.stringify(template)})
    if (!response.ok) {
        const text = await response.text()
        return 'NG:\n' + text
    }
    return 'OK'
}
function ep() {
    const url =  process.env[config.apiEndpointEnvKey]
    return url.endsWith('/') ? url.splice(0, url.length - 1) : url
}
function auth() {
    return 'Basic ' + Buffer.from(`${process.env[config.apiUsernameEnvKey]}:${process.env[config.apiPasswordEnvKey]}`).toString('base64')
}

function resolveType(name, ext) {
    if (ext == typeMap.mail && name.startsWith(config.mailTemplatePrefix))
        return 'mail'
    
    return Object.keys(typeMap).find(key => typeMap[key] == ext)
}

function escapeTemplate(text) {
    return text.replace(/\{\{/g, '{ {')
}

main().catch(message => console.error(message));