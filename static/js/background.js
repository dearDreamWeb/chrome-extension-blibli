const DATAKEY = 'blibliData'
const URLS = {
    // 点赞
    like: 'https://api.bilibili.com/x/web-interface/archive/like',
    // 头部
    add: 'https://api.bilibili.com/x/web-interface/coin/add',
    // 一键三连
    triple: 'https://api.bilibili.com/x/web-interface/archive/like/triple'
}
let domData = {}

chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        "id": "superwang9527",
        "title": "chrome for blibli",
        "contexts": ["selection"]
    });
});

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

// chrome.webRequest.onCompleted.addListener((details) => {
//     console.log(details)
// },
//     { urls: ['https://api.bilibili.com/x/web-interface/wbi/view?*'] },
//     ['responseHeaders']
// );

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.type === 'messageType') {
        // 处理消息
        console.log(message.data);
        domData = message.data;
        // 发送响应消息给content script
        sendResponse({ response: 'responseMessage' });
    }
});

chrome.webRequest.onBeforeRequest.addListener((details) => {
    if (!details.requestBody || !details.requestBody.formData) {
        return
    }

    // 清除数据
    // chrome.storage.sync.set({ [DATAKEY]: { like: [], add: [] } }, function () {
    //     chrome.storage.sync.get(DATAKEY, function (res) {
    //         console.log('----', res)
    //     });
    // });
    // return;

    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        // 获取当前标签页的 URL
        var url = tabs[0].url;
        const data = formDataToArray(details.requestBody.formData)
        const dataItem = {
            aid: data.aid,
            videoCode: domData.videoCode,
            url,
            title: domData.title,
            imgUrl: domData.imgUrl,
            updateTime: Date.now(),
            multiply: data.multiply || 0
        }
        chrome.storage.sync.get(DATAKEY, function (oldData) {
            const { blibliData = { like: [], add: [] } } = oldData;
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
            chrome.storage.sync.set({ [DATAKEY]: JSON.parse(JSON.stringify(blibliData)) }, function () {
                chrome.storage.sync.get(DATAKEY, function (res) {
                    console.log('----', res)
                });
            });
        });

    });
},
    { urls: Object.values(URLS) },
    ['requestBody']
);
