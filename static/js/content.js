const DATAKEY = 'blibliData'

const videoCode = getVideoCode()

window.onload = () => {
    if (!videoCode) {
        return;
    }
    const dom = document.querySelector('#viewbox_report h1')
    const imgDom = document.querySelector('source[type="image/avif"]')
    console.log('load finished-----')
    chrome.runtime.sendMessage({
        type: 'messageType', data: {
            videoCode,
            title: dom ? dom.innerText : '',
            imgUrl: imgDom ? imgDom.srcset : ''
        }
    });

    // 实时更新标题和封面图片
    if (dom && imgDom) {
        chrome.storage.local.get(DATAKEY, function (oldData) {
            const { blibliData = { like: [], add: [] } } = oldData;
            const index = blibliData.like.findIndex((item) => item.videoCode === videoCode)
            if (index > -1) {
                blibliData.like[index] = {
                    ...blibliData.like[index],
                    title: dom.innerText,
                    imgUrl: imgDom.srcset
                }
            }
            const addIndex = blibliData.add.findIndex((item) => item.videoCode === videoCode)
            if (addIndex > -1) {
                blibliData.add[addIndex] = {
                    ...blibliData.add[addIndex],
                    title: dom.innerText,
                    imgUrl: imgDom.srcset
                }
            }

            if (index > -1 || addIndex > -1) {
                chrome.storage.local.set({ [DATAKEY]: JSON.parse(JSON.stringify(blibliData)) }, function () { });
            }
        })
    }
}

/**通过地址栏获取videoCode */
function getVideoCode() {
    try {
        const url = location.href;
        const pattern = /\/video\/([A-Za-z0-9]+)\//;
        const match = url.match(pattern);
        const bvNumber = match[1];
        return bvNumber
    } catch (err) {
        return false
    }
}