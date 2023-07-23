const DATAKEY = 'blibliData'
const URLS = {
    // 点赞
    like: 'https://api.bilibili.com/x/web-interface/archive/like',
    // 头部
    add: 'https://api.bilibili.com/x/web-interface/coin/add'
}

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

chrome.webRequest.onBeforeRequest.addListener((details) => {

    // 获取请求的详细信息
    // var url = details.url;
    // var headers = details.requestHeaders;
    // var method = details.method;
    if (!details.requestBody || !details.requestBody.formData) {
        return
    }
    console.log(details);
    // chrome.storage.sync.set({ [DATAKEY]: {like:[],add:[]} }, function () {
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
            url,
            updateTime: Date.now(),
            eab_x: data.eab_x || 0
        }
        chrome.storage.sync.get(DATAKEY, function (oldData) {
            const { blibliData = { like: [], add: [] } } = oldData;
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
            } else {
                if (data.select_like === '1') {
                    blibliData.like.push(dataItem)
                    blibliData.add.push(dataItem)
                } else {
                    blibliData.add.push(dataItem)
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

chrome.storage.onChanged.addListener(function (changes, namespace) {
    for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
        console.log(
            `Storage key "${key}" in namespace "${namespace}" changed.`,
            `Old value was "${oldValue}", new value is "${newValue}".`
        );
    }
});