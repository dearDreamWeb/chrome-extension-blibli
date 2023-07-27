const DATAKEY = 'blibliData'
const SWITCHTHEME = 'switchTheme'

let activeIndex = 0;
let objData = {}
let showArr = []

init()

chrome.storage.local.get(DATAKEY, function (res) {
    const { blibliData = { like: [], add: [] } } = res;
    console.log(res, blibliData)
    blibliData.add.forEach((item) => {
        objData[item.aid] = item
    })
    blibliData.like.forEach((item) => {
        if (objData[item.aid]) {
            const updateTime = Math.max(objData[item.aid].updateTime, item.updateTime)
            objData[item.aid] = { ...objData[item.aid], updateTime, like: true }
        } else {
            objData[item.aid] = { ...item, like: true };
        }
    })
    let allArr = Object.values(objData).sort((a, b) => b.updateTime - a.updateTime);
    let likeArr = blibliData.like.map((item) => ({ ...item, like: true })).sort((a, b) => b.updateTime - a.updateTime)
    let addArr = blibliData.add.sort((a, b) => b.updateTime - a.updateTime)
    showArr = [allArr, likeArr, addArr]
    renderList(showArr[0])
});

/**初始化 */
function init() {
    toggleTheme()
    $('.optionItem').on('click', function () {
        $('.optionItem').removeClass('activeOption')
        $(this).toggleClass('activeOption')
        renderList(showArr[$(this).index()])
    })
}

/**渲染列表 */
function renderList(arr) {
    $('#listMain').html('')
    if (arr.length) {
        arr.forEach((item) => {
            const itemDom = `
                <div class='itemBox'>
                    <div>
                        ${item.imgUrl ?
                    `<img class='videoImg' src='https:${item.imgUrl}' alt='封面图片' />`
                    : `<div class='emptyImg'>暂无图片</div>`
                }
                    </div>
                    <div class='itemBoxFooter'>
                        <div class='header' data-text='${item.title || '未命名'}'>
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
}

/**切换主题 */
function toggleTheme() {
    chrome.storage.local.get(SWITCHTHEME, function (res) {
        const { switchTheme = 'classic' } = res;
        $('body').attr('theme', switchTheme)
        $('.slider').text(switchTheme === 'classic' ? '经典' : '暗黑')
    })
    $('.switchInput').on('click', function () {
        chrome.storage.local.get(SWITCHTHEME, function (res) {
            const { switchTheme = 'classic' } = res;
            $('body').attr('theme', switchTheme)
            const newValue = switchTheme === 'classic' ? 'dark' : 'classic'
            $('body').attr('theme', newValue)
            $('.slider').text(switchTheme !== 'classic' ? '经典' : '暗黑')
            chrome.storage.local.set({ [SWITCHTHEME]: newValue })
        })
    })
}