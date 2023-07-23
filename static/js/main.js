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
            objData[item.aid] = item;
        }
    })
    let arr = Object.values(objData).sort((a, b) => b.updateTime - a.updateTime)

    const listMainDom = document.getElementById('listMain')
    // document.getElementsByTagName('a')[0].getAttribute('data-link')
    arr.forEach((item) => {
        const itemDom = document.createElement('div')
        itemDom.classList = ['itemBox']
        itemDom.innerHTML = `
            <div class='videoLink'>视频地址</div>
            <div class='itemBoxFooter'>
                <div>点赞：<span>${item.like ? '有' : '无'}</span></div>
                <div>投币数：<span>${item.eab_x || 0}</span></div>
                <div>时间：<span>${new Date(item.updateTime).toLocaleString()}</span></div>
            </div>
        `
        listMainDom.appendChild(itemDom)
    })
    const videDomArr = document.getElementsByClassName('videoLink');
    Array.from(videDomArr).forEach((dom, index) => {
        dom.onclick = () => {
            window.open(arr[index].url)
        }
    })
    console.log('--1231--', arr)
});