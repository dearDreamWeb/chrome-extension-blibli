window.onload = () => {
    const dom = document.querySelector('#viewbox_report h1')
    const imgDom = document.querySelector('source[type="image/avif"]')
    chrome.runtime.sendMessage({
        type: 'messageType', data: {
            title: dom ? dom.innerText : '',
            imgUrl: imgDom ? imgDom.srcset : ''
        }
    });
}

