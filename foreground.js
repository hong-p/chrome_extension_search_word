console.log("from foreground");


document.addEventListener('mousemove', function(){
    
    mouseEvent();
});


// function delay(ms){
//     return new Promise(resolve=>setTimeout(resolve,ms));
// }
var word;

async function mouseEvent() {
    var e;
    if (!e)
        e = window.event;
    // console.log(e)
    let x, y;
    let str;
    // console.log(e)

    let timeout = 1000;
    x = e.clientX;
    y = e.clientY;
    // if(e.clientX && e.clientY){
        //     x = e.clientX + (document.documentElement.scrollLeft ? document.documentElement.scrollLeft : document.body.scrollLeft)
        //     y = e.clientY + (document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop)
        // }else{
            //     x=e.pageX;
            //     y=e.pageY;
            // }
    str = getWordUnderCursor(x, y);
    // console.log(`x: ${x}, y: ${y}`);
    // console.log(`word: ${word}, str: ${str}`);
    if(str === null || str ==='') {
        // console.log('word is null')
        var tooltip = document.querySelector('#oyToolTip');
        if(tooltip != null) {
            tooltip.remove();
        }
        return
    }
    // if(str === word) return;
    if (str !== null) {
        // console.log(`word: ${word}, str: ${str}`);
        // await delay(timeout);
        // console.log(e.target)
        word = str;
    }else{
        word = null;
    }
    // console.log(`word: ${word}`);
    var tooltipId = 'oyToolTip';
    if(word != null){
        // console.log('word is not null')
        var tt = document.querySelector('#oyToolTip')
        if(tt != null) return;
        var newEl = document.createElement('div');
        newEl.setAttribute('id', tooltipId);
        newEl.style.background='-webkit-gradient(linear, 0% 0%, 0% 100%, from(rgb(105, 105, 105)), to(rgb(84, 84, 84)))';
        newEl.style.display='block'
        newEl.style.padding='2px 4px';
        newEl.style.position='absolute';
        newEl.style.zIndex='2147483647 !important'
        newEl.style.fontSize='9pt'
        newEl.style.fontWeight='normal'
        newEl.style.color='rgb(241, 241, 241)';
        newEl.style.borderRadius='0.2em';
        newEl.style.boxShadow='rgba(0, 0, 0, 0.4) 2px 2px 5px';
        newEl.style.left=x+document.documentElement.scrollLeft+30+'px';
        newEl.style.top=y+document.documentElement.scrollTop+30+'px';
        newEl.innerHTML=word;
        document.body.append(newEl);
    }else{
        
    }
}

function getWordUnderCursor(clientX, clientY) {
    var range, textNode, offset;
   
    if (document.caretRangeFromPoint) {     // Chrome
       
        range = document.caretRangeFromPoint(clientX, clientY);
        if (range == null)
            return null;
        textNode = range.startContainer;
        offset = range.startOffset;
        // console.log(range)
    }
   
    //data contains a full sentence
    //offset represent the cursor position in this sentence
    var data = textNode.data,
        i = offset,
        begin,
        end;

    if (data == null)
        return null;
   
    //Find the begin of the word (space)
    while (i > 0 && /[\{\}\[\]\/?.,;:|\)*~`!^\-_+<>@\#$%&\\\=\(\'\"\s]/.test(data[i]) == false) { --i; }
    begin = i;

    //Find the end of the word
    i = offset;
    while (i < data.length && /[\{\}\[\]\/?.,;:|\)*~`!^\-_+<>@\#$%&\\\=\(\'\"\s]/.test(data[i]) == false) { ++i; }
    end = i;

    //Return the word under the mouse cursor

    var resultString = data.substring(begin, end);
    range.setStart(textNode, begin);
    range.setEnd(textNode, end);

    var rect = range.getBoundingClientRect();    
    if (rect.left > clientX || rect.right < clientX ||
               rect.top > clientY || rect.bottom < clientY) {

        return null;
    }
    return resultString;
}
