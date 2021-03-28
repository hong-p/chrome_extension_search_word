console.log("from background");


// 화면이 refresh 될때 감지하는 리스너 
chrome.tabs.onUpdated.addListener(
    function(tabId,changeInfo,tab){
        console.log('changeInfo')
        console.log(changeInfo)
        console.log(tab.url)
        if(/^https:\/\/chrome/.test(tab.url)) return;
        if (/^http(s)?:\/\/[\w]/.test(tab.url) && changeInfo.status === 'complete'){
            chrome.tabs.executeScript(null, {file: "./foreground.js"}, ()=>{
                console.log('Injected!!');
            });
            chrome.tabs.executeScript({
                code : `console.log("test")`
            });
        }
    }
);
