const DATAKEY = 'blibliData'

chrome.storage.sync.get(DATAKEY, function (res) {
    const { blibliData = { like: [], add: [] } } = res;
    console.log(res, blibliData)
    let objData = {}
    blibliData.add.forEach((item) => {
        objData[item.aid] = item
    })
    blibliData.like.forEach((item) => {
        if (objData[item.aid]) {
            objData[item.aid] = { ...objData[item.aid], like: true }
        } else {
            objData[item.aid] = { ...item, like: true };
        }
    })
    let arr = Object.values(objData).sort((a, b) => b.updateTime - a.updateTime)
    if (arr.length) {
        arr.forEach((item) => {
            const itemDom = `
                <div class='itemBox'>
                    <div>
                        <img class='videoImg' src='https:${item.imgUrl}' alt='封面图片' />
                    </div>
                    <div class='itemBoxFooter'>
                        <div class='header' data-text='${item.title}'>
                            <div class='videoLink' data-link='${item.url}'>${item.title || '未命名'}</div>
                        </div>
                        <div>点赞：<span>${item.like ? '有' : '无'}</span></div>
                        <div>投币：<span>${item.multiply || 0}</span></div>
                        <div>时间：<span>${new Date(item.updateTime).toLocaleString()}</span></div>
                    </div>
                </div>
            `
            $('#listMain').append(itemDom)
        })
        $('.videoLink').on('click', function () {
            window.open($(this).attr('data-link'))
        })
    } else {
        $('#listMain').append(`<div class='emptyData'>暂时无数据</div>`)
    }
});