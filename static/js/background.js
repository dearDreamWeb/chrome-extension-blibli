const DATAKEY = 'blibliData'
/**页面的dom信息 */
const CONTENTINFO = 'contentInfo'
/**过期时间 暂定为3天 */
const EXPRIES = 1000 * 60 * 60 * 24 * 3;
const URLS = {
    // 点赞
    like: 'https://api.bilibili.com/x/web-interface/archive/like',
    // 头部
    add: 'https://api.bilibili.com/x/web-interface/coin/add',
    // 一键三连
    triple: 'https://api.bilibili.com/x/web-interface/archive/like/triple'
}

chrome.runtime.onInstalled.addListener(() => { });

/**接收content发来的消息 */
chrome.runtime.onMessage.addListener(async function (message, sender, sendResponse) {
    if (message.type === 'messageType') {
        // 处理消息
        console.log('content message----', message.data);
        const info = {
            ...message.data,
            createdAt: Date.now()
        }
        const { contentInfo = {} } = await localGetItem(CONTENTINFO)
        contentInfo[info.videoCode] = info;
        let obj = {};
        // 将三天前的dom信息清楚
        for (let key in contentInfo) {
            if (Date.now() - contentInfo[key].createdAt < EXPRIES) {
                obj[key] = contentInfo[key]
            }
        }
        console.log('update content info---', obj)
        await localSetItem(CONTENTINFO, JSON.parse(JSON.stringify(obj)))
        // 发送响应消息给content script
        sendResponse({ response: 'responseMessage' });
    }
});

chrome.webRequest.onBeforeRequest.addListener(async (details) => {
    if (!details.requestBody || !details.requestBody.formData) {
        return
    }
    // 清除数据
    // chrome.storage.local.set({ [DATAKEY]: { like: [], add: [] } }, function () {
    //     chrome.storage.local.get(DATAKEY, function (res) {
    //         console.log('----', res)
    //     });
    // });
    // return;

    chrome.tabs.query({ active: true, currentWindow: true }, async function (tabs) {
        // 获取当前标签页的 URL
        var url = tabs[0].url;
        const data = formDataToArray(details.requestBody.formData)
        const { contentInfo = {} } = await localGetItem(CONTENTINFO)
        const videoCode = getVideoCode(url);
        const contentData = contentInfo[getVideoCode(url)] || {}
        const dataItem = {
            aid: data.aid,
            videoCode: videoCode,
            url,
            title: contentData.title,
            imgUrl: contentData.imgUrl,
            updateTime: Date.now(),
            multiply: data.multiply || 0
        }
        const { blibliData = { like: [], add: [] } } = await localGetItem(DATAKEY);
        // 点赞请求
        if (details.url === URLS.like) {
            if (data.like === '1') {
                if (blibliData.like.some((item) => item.aid === data.aid)) {
                    return;
                }
                blibliData.like.push(dataItem)
            } else {
                const index = blibliData.like.findIndex((item) => item.aid === data.aid)
                if (index < 0) {
                    return
                }
                blibliData.like.splice(index, 1)
            }
        } else if (details.url === URLS.add) {
            // 投币请求
            if (data.select_like === '1') {
                blibliData.like.push(dataItem)
            }
            const index = blibliData.add.findIndex((item) => item.aid === dataItem.aid)
            if (index > -1) {
                blibliData.add[index] = { ...blibliData.add[index], ...dataItem, multiply: blibliData.add[index].multiply + 1 }
            } else {
                blibliData.add.push(dataItem)
            }
        } else if (details.url === URLS.triple) {
            // 一键三连
            const likeIndex = blibliData.like.findIndex((item) => item.aid === dataItem.aid)
            if (likeIndex < 0) {
                blibliData.like.push(dataItem)
            }
            const addIndex = blibliData.add.findIndex((item) => item.aid === dataItem.aid)
            if (addIndex > -1) {
                blibliData.add[addIndex] = { ...blibliData.add[addIndex], multiply: 2 }
            } else {
                blibliData.add.push({ ...dataItem, multiply: 2 })
            }
        }
        await localSetItem(DATAKEY, JSON.parse(JSON.stringify(blibliData)))
        const res = await localGetItem(DATAKEY);
        console.log('--result--', res)
    });
},
    { urls: Object.values(URLS) },
    ['requestBody']
);


/**将返回数据格式成对象 */
function formDataToArray(formData) {
    if (Object.prototype.toString.call(formData) !== '[object Object]') {
        return {}
    }
    let obj = {};
    for (let key in formData) {
        obj[key] = formData[key][0]
    }
    return obj;
}

/** chrome.storage.local.get 封装*/
function localGetItem(key) {
    return new Promise((resolve) => {
        chrome.storage.local.get(key, function (data) {
            resolve(data)
        })
    })
}

/** chrome.storage.local.set 封装*/
function localSetItem(key, data) {
    return new Promise((resolve) => {
        chrome.storage.local.set({ [key]: data }, function () {
            resolve()
        })
    })
}


/**通过地址栏获取videoCode */
function getVideoCode(url) {
    try {
        const pattern = /\/video\/([A-Za-z0-9]+)\//;
        const match = url.match(pattern);
        const bvNumber = match[1];
        return bvNumber
    } catch (err) {
        return false
    }
}