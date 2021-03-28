var g_debug = false;
var g_wordForDebug = null;
var g_debugString = null;
var g_forceShowToolTip = false;
var g_foundWord = null;

var g_mouseEvent;
var g_mouseX = 0, g_mouseY = 0, g_mouseTarget = null, g_mousePageX = 0, g_mousePageY = 0, g_mousePressed = 0, g_rMouseX = 0, g_rMouseY = 0, g_oldMouseX = 0, g_oldMouseY = 0;
var g_pageHeight = 0, g_pageWidth = 0;
var g_pressKey = {};
var g_loading = false;
var g_focusIframe = null;
var g_contextSelectionWord = null;
var g_mouseHoverElapsedTime = 0;
var g_privateDic = null;
// const
var MaxSentenceLen = 1800;
var ArrowSize = 10;

var g_startTootipTime = 0;


//var bridgeLine = '<hr noshade>';
var bridgeLine = '<dicbridgeLine>';
var brDoubleTag = '<br/><br/>';
var brTag = '<br/>';
var dicMeanTagBegin = '<dicmean style="user-select: text;">';
var dicMeanTagEnd = '</dicmean>';
var dicWordTagBegin = '<dicword style="user-select: text;">';
var dicWordTagEnd = '</dicword>';
var dicWordClassTagBegin = '<dicwordclass style="user-select: text;">';
var dicWordClassTagEnd = '</dicwordclass>';
var dicCountTagBegin = '<diccount style="user-select: text;">';
var dicCountTagEnd = '</diccount>';

var g_domParser = new DOMParser();

var g_userOptions = {};
g_userOptions["tooltipDownDelayTime"] = 700;
g_userOptions["tooltipUpDelayTime"] = 300;
g_userOptions["enableEngKor"] = "true";
g_userOptions["transKorAny"] = "false";
g_userOptions["enableJapaneseKor"] = "true";
g_userOptions["enableChineseKor"] = "true";
g_userOptions["enablePronunciation"] = "false";
g_userOptions["enableTranslate"] = "true";
g_userOptions["popupKey"] = 0;
g_userOptions["detectWordType"] = 0;
g_userOptions["sentenceTranslatorType"] = "0";
g_userOptions["visableLoading"] = "true";
g_userOptions["popupOrientation"] = "0";
g_userOptions["popupFixed"] = "0";
g_userOptions["popupWidth"] = "400";
g_userOptions["popupHeight"] = "150";
g_userOptions["privateDictUrl"] = null;
g_userOptions["enableEE"] = false;
g_userOptions["enableHanja"] = false;
g_userOptions["enableDrag"] = false;
g_userOptions["volume"] = "100";


function getWordUnderCursor(clientX, clientY) {
    var range, textNode, offset;
    
    if (document.caretRangeFromPoint) {     // Chrome
        
        range = document.caretRangeFromPoint(clientX, clientY);
        if (range == null)
            return null;
        textNode = range.startContainer;
        offset = range.startOffset;
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

function getSelectedWord() {
    if (g_focusIframe) {
        var word = getSelectedTextFromIFrame(g_focusIframe);
        if (word != null) {
           return word;
        }
    }
    
    if (window.getSelection) {
        return window.getSelection();
    } else if (document.getSelection) {
        return document.getSelection();
    } else if (document.selection) {
        return document.selection.createRange();
    }
    return '';
}

function getSelectedTextFromIFrame(frame) {
    // In ExtJS use: 
    // var frame = Ext.getDom(frameId); 


    var frameWindow = frame && frame.contentWindow;
    var frameDocument = frameWindow && frameWindow.document;

    if (frameDocument) {
        if (frameDocument.getSelection) {
            // Most browsers 
            return frameDocument.getSelection();
        }
        else if (frameDocument.selection) {
            // Internet Explorer 8 and below 
            return frameDocument.selection.createRange();
        }
        else if (frameWindow.getSelection) {
            // Safari 3 
            return frameWindow.getSelection();
        }
    }

    /* Fall-through. This could happen if this function is called 
       on a frame that doesn't exist or that isn't ready yet. */
    return null;
}

function isInSelectedTextArea(x, y) {
    if (g_mousePressed != 0)
        return false;

    var s = getSelectedWord();

    if (s == null)
        return false;

    var oRange = s.getRangeAt(0); //get the text range
    var oRect = oRange.getBoundingClientRect();

    if (oRect.left <= x && oRect.right >= x &&
         oRect.top <= y && oRect.bottom >= y) {
        return true;
    }

    return false;
}


function onMouseMove(e) {
    g_mouseX = e.clientX,
    g_mouseY = e.clientY;
    
    g_mousePressed = e.which;
    g_mouseTarget = e.target;
    g_mouseEvent = e;

    g_pageHeight = g_mouseTarget.ownerDocument.documentElement.clientHeight;
    g_pageWidth= g_mouseTarget.ownerDocument.documentElement.clientWidth;
    if (g_mousePressed > 0 || e.button > 0) {
        if (InDicLayer(g_mouseTarget) == false) {
            g_mouseTarget = null;
            $('#dicLayer').hide();
        }
    }    

    var toolbarHeight = window.outerHeight - window.innerHeight;
    var toolbarWidth = window.outerWidth - window.innerWidth;

    //g_mousePageX = (e.screenX - window.screenX) / (window.outerWidth) * 100;
    //g_mousePageY = (e.screenY - window.screenY) / (window.outerHeight) * 100;

    g_mousePageX = (g_mouseX) / (g_pageWidth) * 100;
    g_mousePageY = (g_mouseY) / (g_pageHeight) * 100;
    
    if (g_debug == true) {
        
        $('#ylog').html('<p>x:' + parseInt(g_mousePageX) + ', y:' + parseInt(g_mousePageY) + ', word:' + g_wordForDebug + ', debugString:' + g_debugString);
        $('#ylog p').css('color', 'black');
    }
}

window.onmousemove = onMouseMove;

function parseEnglishEnglish(word, lang) {
    
    try {

        if (word == null || word.length == 0)
            return null;

        var jdata = JSON.parse($("#dicRawData").text());
        if (jdata.entries.length == 0)
            return null;
    
        word = jdata.entries[0].entry;
        // extract data
        var phoneticSymbol = '';
        if (jdata.entries[0].pronunciation_ipa)
            phoneticSymbol = '[' + jdata.entries[0].pronunciation_ipa + ']';

        var meanings = [];
        var meaningCount = 0;
        $.each(jdata.entries[0].definitions, function (key, data) {
        
            meanings[meaningCount] = bridgeLine;
            meaningCount++;

            if (key == "i")
                key = "Idioms";
            else if (key == "vp")
                key = "Verb phrases";

            meanings[meaningCount] = dicWordClassTagBegin + key + dicWordClassTagEnd+ brDoubleTag;
            meaningCount++;

            var count = 0;
        
            $.each(data, function (index, data) {
            
                if (data.type == "simple") {
                    if (data.definition.label == null) {
                        ++count;
                        meanings[meaningCount] = dicCountTagBegin + count + '.' + dicCountTagEnd + dicMeanTagBegin + data.definition.content + dicMeanTagEnd + brDoubleTag;
                        meaningCount++; 
                    }
                    else {
                        ++count;
                        meanings[meaningCount] = dicCountTagBegin + count + '.' + dicCountTagEnd + dicMeanTagBegin + data.definition.label + dicMeanTagEnd + brDoubleTag;
                        meaningCount++;

                        meanings[meaningCount] = dicMeanTagBegin + data.definition.content + dicMeanTagEnd + brDoubleTag;
                        meaningCount++;
                    }

                }
                else if (data.type == "group") {
                    ++count;
                    meanings[meaningCount] = dicCountTagBegin + count + '.' + dicCountTagEnd + dicMeanTagBegin + data.group_label + dicMeanTagEnd + brDoubleTag;
                    meaningCount++;

                    $.each(data.definitions, function (index2, data2) {
                        meanings[meaningCount] = dicMeanTagBegin + data2.content + dicMeanTagEnd + brDoubleTag;
                        meaningCount++;
                    });
                }
            
            
            })
        });

    
        $.each(jdata.entries[0].supnt_data, function (key, data) {

            if ("synonyms" == key || "antonyms" == key)
            {
                meanings[meaningCount] = bridgeLine;
                meaningCount++;

                meanings[meaningCount] = dicWordClassTagBegin + key + dicWordClassTagEnd+ brDoubleTag;
                meaningCount++;

                $.each(data, function (index, data) {

                    if (data.type == "syndesc" || data.type == "antdesc")
                    {
                        meanings[meaningCount] = dicMeanTagBegin + data.value + dicMeanTagEnd + brDoubleTag;
                        meaningCount++;
                    }
                });
            }
        
        
        });
    
        if (meanings.length == 0)
            return null;

        var soundUrl = "https://translate.googleapis.com/translate_tts?client=gtx&ie=UTF-8&tl=" + lang + "&q=" + encodeURIComponent(word);

        return { word: word, phoneticSymbol: phoneticSymbol, soundUrl: soundUrl, meanings: meanings };
    }
    catch(err)
    {
        return null;
    }
}


function parseKoreanEnglish(word, lang) {
    if ($("#dicRawData").text().indexOf("[") == -1)
        return null;

    try {
        var jdata = JSON.parse($("#dicRawData").text());

        var meanings = [];
        var count = 0;

        for (var meaningCount in jdata.mean) {
            ++count;
            meanings.push(dicCountTagBegin + count + '.' + dicCountTagEnd + dicMeanTagBegin + jdata.mean[meaningCount] + dicMeanTagEnd + brDoubleTag);
        }

        if (meanings.length == 0)
            return null;

        return { word: jdata.word, phoneticSymbol: jdata.phoneticSymbol, soundUrl: jdata.soundUrl, meanings: meanings };
    }
    catch (e) {
        return null;
    }
    
}

function parseKoreanChinese(word, lang) {
    if ($("#dicRawData").text().indexOf("[") == -1)
        return null;

    try {
        var jdata = JSON.parse($("#dicRawData").text());

        var meanings = [];
        var count = 0;

        for (var meaningCount in jdata.mean) {
            ++count;
            meanings.push(dicCountTagBegin + count + '.' + dicCountTagEnd + dicMeanTagBegin + jdata.mean[meaningCount] + dicMeanTagEnd + brDoubleTag);
        }

        if (meanings.length == 0)
            return null;

        return { word: jdata.word, phoneticSymbol: jdata.phoneticSymbol, soundUrl: jdata.soundUrl, meanings: meanings };
    }
    catch (e) {
        return null;
    }
}

function parseChineseKorean(word, lang) {
    if ($("#dicRawData").text().indexOf("[") == -1)
        return null;

    try {
        var jdata = JSON.parse($("#dicRawData").text());

        // extract data
        var phoneticSymbol = '';
        if (jdata.pinyin)
            phoneticSymbol = jdata.pinyin;

        var meanings = [];

        for (var meaningCount in jdata.mean) {

            meanings[meaningCount] = dicMeanTagBegin + jdata.mean[meaningCount] + dicMeanTagEnd + brDoubleTag;
        }

        if (meanings.length == 0)
            return null;

        var soundUrl = "http://tts.cndic.naver.com/tts/mp3ttsV1.cgi?url=cndic.naver.com&spk_id=250&text_fmt=0&pitch=100&volume=100&speed=100&wrapper=0&enc=0&text=" + encodeURIComponent(word);

        return { word: jdata.word, phoneticSymbol: phoneticSymbol, soundUrl: soundUrl, meanings: meanings };
    }
    catch (e) {
        return null;
    }
    
}

function parseHanjaKorean(word, lang) {

    
    if ($("#dicRawData").text().indexOf("[") == -1)
        return null;

    try {
        var jdata = JSON.parse($("#dicRawData").text());

        // extract data
        var phoneticSymbol = '';
        if (jdata.pinyin)
            phoneticSymbol = jdata.pinyin;

        if (jdata.readPronun)
            phoneticSymbol = phoneticSymbol + '[' + jdata.readPronun + ']';

        var meanings = [];
        var count = 0;
        for (var meaningCount in jdata.mean) {
            ++count;
            meanings[meaningCount] = dicMeanTagBegin + jdata.mean[meaningCount] + dicMeanTagEnd + brDoubleTag;

        }

        if (meanings.length == 0)
            return null;
        var soundUrl = "https://tts.cndic.naver.com/tts/mp3ttsV1.cgi?url=cndic.naver.com&spk_id=250&text_fmt=0&pitch=100&volume=100&speed=100&wrapper=0&enc=0&text=" + encodeURIComponent(word);

        return { word: jdata.word, phoneticSymbol: phoneticSymbol, soundUrl: soundUrl, meanings: meanings };
    }
    catch (e) {
        return null;
    }
    
}

function parseJapaneseKorean(word, lang) {
    if ($("#dicRawData").text().indexOf("[") == -1)
        return null;

    try {
        var jdata = JSON.parse($("#dicRawData").text());

        // extract data
        var phoneticSymbol = '';
        if (jdata.pinyin)
            phoneticSymbol = '[' + jdata.pinyin + ']';

        var meanings = [];

        for (var meaningCount in jdata.mean) {

            meanings[meaningCount] = jdata.mean[meaningCount];
        }

        if (meanings.length == 0)
            return null;

        var soundUrl = "https://translate.googleapis.com/translate_tts?client=gtx&ie=UTF-8&tl=" + lang + "&q=" + encodeURIComponent(jdata.soundWord);

        return { word: jdata.word, phoneticSymbol: phoneticSymbol, soundUrl: soundUrl, meanings: meanings, rawwords: jdata.rawwords, basicWord: jdata.basicWord };
    }
    catch (e) {
        return null;
    }
    
}

function parseGoogleTranslate(word, lang, data) {
    
    try {
		
        var jdata = data;
		
        var meanings = [];
        if (jdata.sentences) {
            meanings[0] = "";
            for (var i = 0; i < jdata.sentences.length; ++i)
                meanings[0] += jdata.sentences[i].trans;
        }

        if (jdata.src) {
            lang = jdata.src;
        }

        if (meanings.length == 0)
            return null;

        var soundUrl = "https://translate.googleapis.com/translate_tts?client=gtx&ie=UTF-8&tl=" + lang + "&q=" + encodeURIComponent(word).substring(0, 320);
    
        return { word: word, phoneticSymbol: "", soundUrl: soundUrl, meanings: meanings, isSentence:true };
    }
    catch (err) {
        return null;
    }
}

function parsePapagoTranslate(word, lang, data) {
    
    try {
		
        var jdata = data;
		
        var meanings = [];
        if (jdata.translatedText) {
            meanings[0] = jdata.translatedText;
        }

        if (jdata.srcLangType) {
            lang = jdata.srcLangType;
        }

        if (meanings.length == 0)
            return null;

        var soundUrl = "https://translate.googleapis.com/translate_tts?client=gtx&ie=UTF-8&tl=" + lang + "&q=" + encodeURIComponent(word).substring(0, 320);
    
        return { word: word, phoneticSymbol: "", soundUrl: soundUrl, meanings: meanings, isSentence:true };
    }
    catch (err) {
        return null;
    }
}

chrome.runtime.onMessage.addListener(onMessageProc);

function onMessageProc(request, sender, sendResponse) {
    if (request.id == 1) {
        g_contextSelectionWord = request.greeting;

        showWordToolTipCore(g_rMouseX, g_rMouseY, request.greeting, 1000);
    }
    else if (request.id == 2) {
        var e = jQuery.Event("keyup");
        e.which = 192; // # Some key code value
        e.keyCode = 192;
        $(document).trigger(e);
    }
}


function convertRawDataToJson(word, from_lang, to_lang, parser, data)
{
    if (data == null)
        return null;

    if (from_lang == 'zh')    {
        data = convertRawDataToJsonForNaverChiness(word, parser, data, to_lang);
    }
    else if (from_lang == 'hanja') {
        data = convertRawDataToJsonForNaverHanja(word, parser, data);
    }
    else if (from_lang == 'ja') {
        data = convertRawDataToJsonForNaverJapan(word, parser, data);
    }
    else if (from_lang == 'en') {
        data = convertRawDataToJsonForNaverEnglish(word, parser, data);
    }
    else if (from_lang == 'ko') {
        if (to_lang == 'ja')
            data = convertRawDataToJsonForNaverJapan(word, parser, data);
        else if (to_lang == 'zh')
            data = convertRawDataToJsonForNaverChiness(word, parser, data, to_lang);
        else
            data = convertRawDataToJsonForNaverEnglish(word, parser, data);
    }
    
    $("#dicRawData").text(data);
	
    return parser(word, from_lang);
}

function convertRawDataToJsonForNaverHanja(word, parser, data) 
{
	try
	{
		if (data.indexOf("<html") >= 0) {

			var jsonData = {};
			jsonData.word = $(data).find(".result_chn_chr:first  dl dt").text();
			jsonData.pinyin = "";

			jsonData.readPronun = $(data).find(".result_chn_chr:first  .single dd .sound").text();
			jsonData.mean = [];        

			$(data).find(".result_chn_chr").each(function () {

				var hanjas = [];
				$(this).find("dl dt a").each(function () {
					hanjas.push($(this).text());
				});

				var hunms = [];
				$(this).find("dd a span").each(function () {
					hunms.push($(this).text());
				});

				var meanings = [];
				$(this).find(".meaning").each(function () {
					meanings.push($(this).text());
				});

				for (var i = 0; i < hunms.length; ++i) {
					jsonData.mean.push(bridgeLine);
					jsonData.mean.push(dicWordClassTagBegin + hanjas[i] + ' ' + '[' + hunms[i] + ']' + dicWordClassTagEnd);
					jsonData.mean.push(meanings[i]);
				}

			});

			$(data).find(".result_chn_words").each(function () {

				var hanjas = [];
				$(this).find("dl dt a").each(function () {
					hanjas.push($(this).text());
				});

				var hunms = [];
				$(this).find("dd a span").each(function () {
					hunms.push($(this).text());
				});

				var meanings = [];
				$(this).find(".meaning").each(function () {
					meanings.push($(this).text());
				});

				for (var i = 0; i < hunms.length; ++i) {
					jsonData.mean.push(bridgeLine);
					jsonData.mean.push(dicWordClassTagBegin + hanjas[i] + ' ' + '[' + hunms[i] + ']' + dicWordClassTagEnd);
					jsonData.mean.push(meanings[i]);
				}

			});

			return JSON.stringify(jsonData);
		}
	}
    catch (err)
	{
		data = "";
	}

    return data;
}

function convertRawDataToJsonForNaverChiness(word, parser, data, to_lang) 
{   
	try
    {
		var jsonData = {};
		jsonData.mean = [];
    
		var json = data;
		var items = json.searchResults.searchEntryList.items;		
		for(var i in items)
        {
            if (to_lang == 'ko') {
                
                if (items[i].dicType != "zh" && items[i].dicType != "zhen")
                    continue;
            }

			var name = items[i].entryName;
            var pinyin = items[i].pinyin;


            var wordItem = name;
            if (pinyin != null && pinyin.length > 0)
                wordItem += '[' + pinyin + ']';

			if (jsonData.mean.length == 0)
				jsonData.word = wordItem;
		
			jsonData.mean.push(bridgeLine);
			jsonData.mean.push(dicWordClassTagBegin + wordItem + dicWordClassTagEnd);
		
			for(var m in items[i].meanList)
			{
				var mean = "";			
				//if (m > 0)
				//	mean += brTag;

				mean += '['+items[i].meanList[m].partsLabel +']' +' ' + items[i].meanList[m].mean;
			
				jsonData.mean.push(mean);
			}        
		}

		var examples = [];
		items = json.searchResults.searchExampleList.items;
		for(var i in items)
        {
            if (to_lang == 'ko') {
                if (items[i].dicType != "zh" && items[i].dicType != "zhen")
                    continue;
            }

			var name = items[i].example;
			var pinyin = items[i].pinyin;

			var wordItem = name;
            if (pinyin != null && pinyin.length > 0)
                wordItem += '[' + pinyin + ']';

			var duplicated = false;
			for(var x in examples)
			{
				if (examples[x] == wordItem)
				{
					duplicated = true;
					break;
				}
			}

			if (duplicated == true)
				continue;
		
			examples.push(wordItem);

			jsonData.mean.push(bridgeLine);
			jsonData.mean.push(dicWordClassTagBegin + wordItem + dicWordClassTagEnd+ brDoubleTag);
				
			jsonData.mean.push(items[i].translatedExample);
		}
        
		data = JSON.stringify(jsonData);
	}
	catch(err)
	{
		data = "";
	}
	
    return data;
}

function convertRawDataToJsonForNaverJapan(word, parser, data) 
{
	try
	{
		var jsonData = {};
		jsonData.pinyin = "";
		jsonData.mean = [];
		jsonData.rawwords = "";
		var json = data;
		jsonData.word = json.searchResultMap.searchResultListMap.WORD.query;
		jsonData.basicWord = jsonData.word;
		jsonData.soundWord = jsonData.word;
		var items = json.searchResultMap.searchResultListMap.WORD.items;
		for(var i in items)
		{
			var item = items[i];		
			jsonData.rawwords += item.expEntry;
			var meaning = item.expEntry;
			if (item.expKanji != null)
				meaning += "["+item.expKanji+"]";
			if (item.expAudioRead != null)
				meaning += brDoubleTag +  "음독 "+item.expAudioRead;
			if (item.expMeaningRead != null)
				meaning += brDoubleTag + "훈독 "+item.expMeaningRead;
			if (item.expKoreanHanja != null)
				meaning += brDoubleTag + "한국한자 "+item.expKoreanHanja+" [" + item.expKoreanPron + "]" ;

			for(var m in item.meansCollector)
			{
				var meansCollector = item.meansCollector[m];				
				for(var mm in meansCollector.means)
				{
					var mean = meansCollector.means[mm];
					if (mean.subjectGroup == null)
						meaning += brDoubleTag + mean.value;
					else
						meaning += brDoubleTag + mean.subjectGroup + mean.value;
				}	
			}

			jsonData.mean.push(bridgeLine);
			jsonData.mean.push(dicWordClassTagBegin + meaning + dicWordClassTagEnd+ brDoubleTag);
		}

		items = json.searchResultMap.searchResultListMap.EXAMPLE.items;
		for(var i in items)
		{
			var item = items[i];	
			var meaning = item.expExample1 + " (" + item.expEntry + ")";
			meaning += brDoubleTag + item.expExample2;

			jsonData.mean.push(bridgeLine);
			jsonData.mean.push(dicWordClassTagBegin + meaning + dicWordClassTagEnd+ brDoubleTag);
		}

		items = json.searchResultMap.searchResultListMap.VLIVE.items;
		for(var i in items)
		{
			var item = items[i];	
			var meaning = item.expExample1;
			meaning += brDoubleTag + item.expExample2;
			meaning += brDoubleTag + item.expExample3;

			jsonData.mean.push(bridgeLine);
			jsonData.mean.push(dicWordClassTagBegin + meaning + dicWordClassTagEnd+ brDoubleTag);
		}

		return JSON.stringify(jsonData);
	}
	catch(err)
	{
		data = "";
	}
	
    return data;
	
}
function convertRawDataToJsonForNaverJapan2(word, parser, data) 
{
	try
	{

		if (data.indexOf("<html") >= 0) {
                
			var jsonData = {};
       
			jsonData.pinyin = "";
			jsonData.mean = [];
			jsonData.rawwords = "";
			
			$(data).find(".row").each(function () {
				
				var wordItem = $(this).find(".origin .link .highlight").text();
				var soundWord = wordItem;
				jsonData.rawwords += wordItem;

				$(this).find(".srch_top .entry .autolink2").each(function (){
					var buttonTag = "<a class=\"autolink\" href=\"javascript:;\" url=" + 
											"\"https://ja.dict.naver.com/hanja-tooltip.nhn?query=q&q=" + encodeURIComponent($(this).text()) + "\">" + $(this).text() + "</a>";
					
					wordItem = wordItem.replace($(this).text(),  buttonTag);
				});

				if (jsonData.mean.length == 0)
				{
					jsonData.soundWord = soundWord;
					jsonData.word = wordItem;

					// 기본형이 존재하는 가.
					var txt_sch = $(data).find(".txt_sch");
					if (txt_sch != null)
					{
						var basic = $(txt_sch).find("a > span[class='jp']");
						if (basic != null && basic.length > 0)
							jsonData.basicWord = basic.text();
					}
				}
                
				jsonData.mean.push(bridgeLine);
				jsonData.mean.push(dicWordClassTagBegin + wordItem + dicWordClassTagEnd+ brDoubleTag);

				var mean = "";
				
				var subLable = [];
				var subMean = [];
				$(this).find(".top_dn dt").each(function () {                    
					subLable.push($(this).text());
				});
				$(this).find(".mean_list").each(function () {                    
					subMean.push($(this).text());
				});

				for (var i = 0; i < subMean.length; ++i)
				{
					mean += brDoubleTag + subMean[i];
				}
				/*
				for (var i = 0; i < subLable.length; ++i)
				{
					mean += brDoubleTag + subLable[i] + ' ' + subMean[i];
				}
            
				var i = 1;
				$(this).find(".inner_lst").each(function () {
					mean += brDoubleTag + i + '.'+ $(this).text();
					++i;
				});
				*/
				jsonData.mean.push(mean + brDoubleTag + brDoubleTag);
			});

			if (jsonData.mean.length > 0)
				jsonData.mean.push(brDoubleTag + brDoubleTag);
			
			return JSON.stringify(jsonData);

		}
	}
    catch(err)
	{
		data = "";
	}
	
    return data;
}

function convertRawDataToJsonForNaverEnglish(word, parser, data) 
{
	try
	{
	
		if (data.indexOf("<html") >= 0) {
			data = g_domParser.parseFromString(data, "text/html");
        
			var jsonData = {};
        
			jsonData.mean = [];
        
			jsonData.word = $(data).find(".word_num .first:first .fnt_e30").text();
			if (jsonData.word == null || jsonData.word.length == 0)
				jsonData.word = word;
			jsonData.soundUrl = $(data).find(".word_num .first a[playlist]").attr('playlist');
			jsonData.phoneticSymbol = $(data).find(".word_num .first:first .fnt_e25").text();
        
			var meanings = [];
        
			var mean = "";
			var subLable = [];
			var subMean = [];
			$(data).find(".word_num dt .fnt_e30").each(function () {
				subLable.push($(this).text().trim());
			});
			$(data).find(".word_num dd").each(function () {
				subMean.push($(this).find("p:first").text().trim());
			});
        
		
			if (g_privateDic != null)
			{
				if (g_privateDic.get(word.toUpperCase()) != null)
					meanings.push(word + " [ref private dict]" + brDoubleTag+ g_privateDic.get(word.toUpperCase()));
			}
			
			
			for (var i = 0; i < subLable.length; ++i) {
				meanings.push(subLable[i] + brDoubleTag + subMean[i]);
			}

			for (var i = 0; i < meanings.length; ++i) {
				jsonData.mean.push(meanings[i]);
			}
		
			return JSON.stringify(jsonData);

		}
	}
    catch(err)
	{
		
		data = "";
	}

    return data;
}


function translateSentence(word, lang, toLang) {
    word = word.replace(/<script>/gi, "<div>");
    word = word.replace(/<\/script>/gi, "</div>");
    var url = null;	
	var postData = null;
	var parser = null;
    
	if (g_userOptions["sentenceTranslatorType"] == "0")
	{
		url = "https://translate.googleapis.com/translate_a/single?client=gtx&sl=" + 'auto' + "&tl=" + toLang + "&hl=ko&dt=t&dt=bd&dj=1&source=icon&q=" + encodeURIComponent(word);
		parser = parseGoogleTranslate;
	}
	else if (g_userOptions["sentenceTranslatorType"] == "1")
	{
	
		if (lang == "zh")
			lang = "zh-CN";

		url = "https://papago.naver.com/apis/n2mt/translate";
		postData = {
			deviceId:uuidv4(),
			dict:false,
			dictDisplay:30,
			honorific:false,
			instant:false,
			source:lang,
			target:toLang,
			text:word
		};
		parser = parsePapagoTranslate;
	}

    chrome.runtime.sendMessage({ url: url, postData: postData }, function (data) {
        if (data != null)
		{	
			var parsedData = parser(word, lang, data);
			
			if (parsedData != null) {
				presentParsedDic(lang, parsedData);				
			}
		}		
         
		g_foundWord = word;
        g_loading = false;
        $("#dicLayerLoader").removeClass('dicLayerloader');
    });
}

function loadWordMeaningFromWeb(word) {

    if (g_loading == true)
        return;

    var url = "";
    var parser = parseKoreanEnglish;

    guessLanguage.detect(word, function (language) {
        
        if (language == 'unknown') {
            if ((word.match(/[0-9a-zA-Z.;\-]/) || []).length > 0) {
                language = 'en';
            }
        }
        // 중국어라 감지되었지만, 중국어 사전이 꺼지고, 일본어 사전이 켜진 경우에는 일본어로 감지시키자.
        if (language == 'zh') {
            if (g_userOptions["enableChineseKor"] == "false" && g_userOptions["enableJapaneseKor"] == "true")
                language = 'ja';
        }
        var sentence = word;
        var regExp = /[\{\}\[\]\/?.,;:|\)*~`!^\-_+<>–@\#$%&\\\=\(\'\"]/gim;

        if (language == 'zh') {
            if (g_userOptions["enableChineseKor"] == "false") {
                $('#dicLayer').hide();
                g_foundWord = null;
                return;
            }
            
            word = word.replace(regExp, "");

            if (g_userOptions["enableHanja"] == true) {
                language = 'hanja';
                url = "https://hanja.dict.naver.com/search?query=" + encodeURIComponent(word);
                parser = parseHanjaKorean;
            }
            else {
                url = "https://zh.dict.naver.com/cndictApi/search/all?sLn=ko&mode=pc&pageNo=1&format=json&q=" + encodeURIComponent(word);
                parser = parseChineseKorean;
            }
        }
        else if (language == 'ja') {
            if (g_userOptions["enableJapaneseKor"] == "false") {
                $('#dicLayer').hide();
                g_foundWord = null;
                return;
            }

            word = word.replace(regExp, "");
            url = "https://ja.dict.naver.com/api3/jako/search?range=all&query=" + encodeURIComponent(word);
            parser = parseJapaneseKorean;
            
        }
        else if (language == 'ko') {
            if (g_userOptions["transKorAny"] == "false") {
                $('#dicLayer').hide();
                g_foundWord = null;
                return;
            }

            if (g_userOptions["transKorAny"] == 'ja') {
                word = word.replace(regExp, "");
                url = "https://ja.dict.naver.com/api3/jako/search?range=all&query=" + encodeURIComponent(word);
                parser = parseJapaneseKorean;
            }
            else if (g_userOptions["transKorAny"] == 'zh') {
                word = word.replace(regExp, "");

                if (g_userOptions["enableHanja"] == true) {
                    language = 'hanja';
                    url = "https://hanja.dict.naver.com/search?query=" + encodeURIComponent(word);
                    parser = parseHanjaKorean;
                }
                else {
                    url = "https://zh.dict.naver.com/cndictApi/search/all?sLn=ko&mode=pc&pageNo=1&format=json&q=" + encodeURIComponent(word);
                    parser = parseChineseKorean;
                }
            }
            else {
                url = "https://endic.naver.com/search.nhn?sLn=kr&query=" + encodeURIComponent(word);
                parser = parseKoreanEnglish; 
            }
            
            
        }        
        else if (language == 'en')
        {
            if (g_userOptions["enableEngKor"] == "false") {
                $('#dicLayer').hide();
                g_foundWord = null;
                return;
            }
 
            word = word.replace(regExp, "");
            word = word.replace(/[0-9]/gim, "");

            if (g_userOptions["enableEE"] == true)
            {
                url = "http://restapi.dictionary.com/v2/word.json/" + encodeURIComponent(word) + "/complete?api_key=sWq3tLz8ifndaTK&platform=Chrome&app_id=chromeExtension_1.1&clickSource=Popup";
                parser = parseEnglishEnglish;
            }
            else
            {
                url = "https://endic.naver.com/search.nhn?sLn=kr&query=" + encodeURIComponent(word);
                parser = parseKoreanEnglish;
            }
        }

        if (language == 'zh' || language == 'ja') {
		
            if (sentence.length > MaxSentenceLen) {
                sentence = sentence.substring(0, MaxSentenceLen - 1);
            }
        }
        
        if (word == null || word.length == 0 || g_foundWord == word || g_foundWord == sentence)
            return;
        
        g_loading = true;
        if (g_userOptions["visableLoading"] == "true") {
            $("#dicLayerLoader").addClass('dicLayerloader');
            $("#dicLayerLoader").css('top', g_mouseY + 'px');
            $("#dicLayerLoader").css('left', g_mouseX + 'px');
        }
        
        chrome.runtime.sendMessage({ url: url }, function (data) {
            
            var parsedData = convertRawDataToJson(word, language, language != 'ko' ? 'ko' : g_userOptions["transKorAny"], parser, data);
            
            if (parsedData != null) {
                var correctSearch = false;
                if (language == 'hanja')
                {
                    if (parsedData.meanings.length > 0)
                        correctSearch = true;
                }
                else
                {	
					correctSearch = hasWordInMeans(parsedData.meanings, word);
                    
					if (correctSearch == false && parsedData.basicWord != null)
					{
						if (0 <= parsedData.rawwords.search(new RegExp(parsedData.basicWord, "gi"))){
							correctSearch = true;
						}
					}

					if (correctSearch == false && parsedData.rawwords != null)
					{
						if (0 <= parsedData.rawwords.search(new RegExp(word, "gi"))){
							correctSearch = true;
						}
					}
                }                

                if (correctSearch == true) {
                    presentParsedDic(language, parsedData);
                    g_foundWord = word;
                    g_loading = false;
                    $("#dicLayerLoader").removeClass('dicLayerloader');
                    return;
                }
            }

            if (language == 'ko') {
                translateSentence(sentence, language, g_userOptions["transKorAny"]);
            }
            else
            {
                translateSentence(sentence, language, 'ko');
            }            
        });
       
    });
}

function hasWordInMeans(meanings, word)
{
	try
	{
		for (var i = 0; i < meanings.length; ++i) {
			if (0 <= meanings[i].search(new RegExp(word, "gi"))) {
				return true;
			}
		}
	}
	catch(err)
	{
	
	}
	
	return false;
}

function selectAllText( containerid ) {

    var node = document.getElementById( containerid );
    var range = null;
    if ( document.selection ) {
        range = document.body.createTextRange();
        range.moveToElementText( node  );
        range.select();
    } else if ( window.getSelection ) {
        range = document.createRange();
        range.selectNodeContents( node );
        window.getSelection().removeAllRanges();
        window.getSelection().addRange( range );
    }
}

function presentParsedDic(language, parsedData) {

    var soundTag = '<dicimg id="play" style="background-image: url(' + chrome.extension.getURL('play.gif') + ');" ></dicimg>';
	var copyTag = '<dicimg id="copy" title="copy" style="background-image: url(' + chrome.extension.getURL('copy.png') + ');" ></dicimg>';

    if (parsedData.soundUrl == null)
        soundTag = "";

    var eeTag = "";
    var eeCheckBox = false;
    var eeOptionName = null;
    var eeLableName = null;
    if (language == "en") {
        eeOptionName = "enableEE";
        eeLableName = "Eng";
        if (g_userOptions[eeOptionName] == true)
            eeCheckBox = true;        
    }
    else if (language == "ja" || language == "zh" || language == "hanja") {
        eeOptionName = "enableHanja";
        eeLableName = "Hanja";
        if (g_userOptions[eeOptionName] == true)
            eeCheckBox = true;
    }
    
    if (eeLableName != null)
    {
        if (eeCheckBox == true)
            eeTag = '  <input type="checkbox" id="ee" checked>' + eeLableName + '</input>';
        else
            eeTag = '  <input type="checkbox" id="ee">' + eeLableName + '</input>';
    }
    
    var htmlData = dicWordTagBegin + parsedData.word + parsedData.phoneticSymbol + dicWordTagEnd + dicWordTagBegin + soundTag + eeTag + copyTag +dicWordTagEnd +
                         brDoubleTag + brDoubleTag;

    for (var meaningCount in parsedData.meanings) {
        htmlData += parsedData.meanings[meaningCount];
        
    }
    
    var dicLayer = $("#dicLayer");
    try{
        $("#dicLayerContents").html(htmlData);
    }
    catch (e)
    {
        var doc = g_domParser.parseFromString(htmlData, 'text/html');
        var result = new XMLSerializer().serializeToString(doc);
        result = $(result).find('body').html();
        result = result.replace(/xmlns/gi, "dicns");
        $("#dicLayerContents").html(result);
    }

    if (parsedData.isSentence)
    {
        if (g_userOptions["enablePronunciation"] == "true")
            chrome.runtime.sendMessage({ soundUrl: parsedData.soundUrl, volume: g_userOptions["volume"] }, function (data) { });
    }
    else
    {
        if (g_userOptions["enablePronunciation"] == "true" || g_userOptions["enablePronunciation"] == "onlyWord")
            chrome.runtime.sendMessage({ soundUrl: parsedData.soundUrl, volume: g_userOptions["volume"] }, function (data) { });
    }

    $("#dicLayer #play").click(function () {
        chrome.runtime.sendMessage({ soundUrl: parsedData.soundUrl, volume: g_userOptions["volume"] }, function (data) { });
    });

	$("#dicLayer #copy").click(function () {
		selectAllText("dicLayerContents");
		document.execCommand("copy");
    });

	$("#dicLayer .autolink").click(function (e) {        
		var ele = e.target;
		var url = ele.getAttribute("url");
		chrome.runtime.sendMessage({ url: url }, function (data) { 
			var rect = ele.getBoundingClientRect();
			var dicLayerSub = document.getElementById('dicLayerSub');
			dicLayerSub.style.left=rect.left + 'px';
			dicLayerSub.style.top=rect.top + 'px';
			dicLayerSub.innerHTML = $(data).find('dt:first').text();
			$(data).find('dl[class]').each(function (){				
				
				dicLayerSub.innerHTML+=  brTag + "<b>" + $(this).find('dt').text()+"</b>";
				
				dicLayerSub.innerHTML+=  brTag + $(this).find('dd').text();
				dicLayerSub.innerHTML+=  brTag;
			});
			
		});
		
    });
    
    $("#dicLayer #ee").click(function () {
        g_userOptions[eeOptionName] = $(this).is(":checked");
            
        if (language == "en") {
            chrome.storage.local.set({ "enableEE": g_userOptions[eeOptionName] }, function () {

            });
        }
        else if (language == "zh" || language == "hanja") {
            chrome.storage.local.set({ "enableHanja": g_userOptions[eeOptionName] }, function () {

            });
        }

        
        
    });

    var x = g_mouseX;
    var y = g_mouseY;
    var gabHeight = 20;

    if (g_pageWidth < dicLayer.width() + x) {
        x = g_pageWidth - dicLayer.width();
    }
    
    if (g_userOptions["popupOrientation"] == "1") {
        y = g_mouseY - dicLayer.height() - gabHeight - ArrowSize * 3;   
    }

    if (g_pageHeight < dicLayer.height() + y + gabHeight) {
        y -= dicLayer.height() + y + gabHeight - g_pageHeight;   
    }

    if (y < 0)
    {
        y = g_mouseY;
    }

    // top-right
    if (g_userOptions["popupFixed"] == "1") {
        y = 0;
        x = g_pageWidth - dicLayer.width()-65;
    }
    // bottom-right
    else if (g_userOptions["popupFixed"] == "2") {
        y = g_pageHeight - dicLayer.height()-45;
        x = g_pageWidth - dicLayer.width()-65;
    }    
    
    dicLayer.css("left", x + 'px');
    dicLayer.css("top", (y + gabHeight) + 'px');

    if (g_userOptions["enableTranslate"] == "true") {        
        dicLayer.show();
		hideDicLayerSub();
        dicLayer.scrollTop(0);
    }
}

function hideDicLayerSub()
{
	var myLayerSub = document.getElementById('dicLayerSub');
	if (myLayerSub == null)
		return;

	myLayerSub.innerHTML = null;
	myLayerSub.style.top=null;
	myLayerSub.style.left=null;
}

function createDicionaryLayer() {
    
    var myLayer = document.createElement('div');
    myLayer.id = 'dicLayer';
    document.body.appendChild(myLayer);

    function scroll(e) {
        var delta = (e.type === "mousewheel") ? e.wheelDelta : e.detail * -40;
        if (delta < 0 && (this.scrollHeight - this.offsetHeight - this.scrollTop) <= 0) {
            this.scrollTop = this.scrollHeight;
            e.preventDefault();
        } else if (delta > 0 && delta > this.scrollTop) {
            this.scrollTop = 0;
            e.preventDefault();
        }
    }
    myLayer.addEventListener("mousewheel", scroll);
    myLayer.addEventListener("DOMMouseScroll", scroll);

    var myLayerContents = document.createElement('div');
    myLayerContents.id = 'dicLayerContents';
    myLayer.appendChild(myLayerContents);
    

	var myLayerSub = document.createElement('div');
    myLayerSub.id = 'dicLayerSub';
    myLayer.appendChild(myLayerSub);

	myLayerSub.addEventListener("mousewheel", scroll);
    myLayerSub.addEventListener("DOMMouseScroll", scroll);
	myLayerSub.addEventListener("click", function(event){
		event.stopPropagation();
	});
	myLayer.addEventListener("click", function(event){
		hideDicLayerSub();		
	});

} 

function createDicionaryRawData() {
    var myLayer = document.createElement('div');
    myLayer.id = 'dicRawData';
    myLayer.style.display = 'none';

    document.body.appendChild(myLayer);

    
}

function createLoader() {
    var myLayerLoader = document.createElement('div');
    myLayerLoader.id = 'dicLayerLoader';
    document.body.appendChild(myLayerLoader);
}

function createLogDiv() {
    var myLayer = document.createElement('div');
    myLayer.id = 'ylog';
    document.body.appendChild(myLayer);
}

function InDicLayer(target)
{
    if (target == null)
        return false;

    if (target.attributes && target.attributes.getNamedItem("id") && target.attributes.getNamedItem("id").value &&
        (target.attributes.getNamedItem("id").value.indexOf("dicLayer") == 0)
    ) {        
        return true;
    }
        
    return InDicLayer(target.parentNode);
}

function getWordUnderMouse(x, y, target) {

    if (g_forceShowToolTip == true)
        return g_foundWord;

    if (target == null)
        return null;

    if (InDicLayer(target))
        return g_foundWord;

    /*
    var range = document.createRange();
    range.setStartBefore(target);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);*/

    var selWord = getSelectedWord().toString();    
    if (g_userOptions["detectWordType"] == 1 || selWord.length) {        
        return selWord;
    }

    if (g_contextSelectionWord)
    {
        return g_contextSelectionWord;
    }
    
    return getWordUnderCursor(x, y);
}

function hideWordToolTip() {
    

    if (InDicLayer(g_mouseTarget))
        return;

    if (new Date().getTime() - g_startTootipTime < g_userOptions["tooltipDownDelayTime"])
        return;

    var word = getWordUnderMouse(g_mouseX, g_mouseY, g_mouseTarget);
    
    //var hidden = (word == null || word.length == 0 || (g_loading == false));
    var hidden = (word == null || word.length == 0);
    /*if (word != null && g_foundWord != word)
    {        
        hidden = true;
    }*/
    
    if (hidden == true)
    {
        $('#dicLayer').hide();
        
        if (window.getSelection && InDicLayer(window.getSelection().anchorNode))
        {
            if (window.getSelection)
                window.getSelection().removeAllRanges();
        }
        g_foundWord = null;
    }
}

function showWordToolTipCore(x, y, word, timeDelay)
{
    g_wordForDebug = word;
   
    if (word) {
        word = word.trim();
        
        loadWordMeaningFromWeb(word);
        
        g_startTootipTime = new Date().getTime() + timeDelay;
    }
    else {
        //$('#dicLayer').hide();
    }
}

function showWordToolTip() {
    var x = g_mouseX,
        y = g_mouseY
    target = g_mouseTarget;
    
    if (g_userOptions["enableTranslate"] == "false")
        return;

    if (g_userOptions["popupKey"] != 0 && !g_pressKey[g_userOptions["popupKey"]])
        return;

    if (g_mousePressed > 0)
        return;
   
    var word = getWordUnderMouse(x, y, target);    
    showWordToolTipCore(x, y, word, 0);
}

function loadOptions() {
    var keys = ["fontSize", "fontType", "fontBold"
                     , "fontColor", "backColor1"
                     , "backColor2", "tooltipUpDelayTime", "tooltipDownDelayTime", "volume"
        , "enableEngKor", "transKorAny", "enableJapaneseKor", "enableChineseKor"
                    , "enablePronunciation"
                   , "enableTranslate"
        , "popupKey", "detectWordType", "sentenceTranslatorType", "popupOrientation", "visableLoading", "popupFixed", "enableEE", "enableHanja"
        , "popupWidth", "popupHeight", "privateDictUrl"];  // 불러올 항목들의 이름


    chrome.storage.local.get(keys, function (options) {
        
        $.each(options, function (key, data) {
			if (data == null || data == "")
                return;
            g_userOptions[key] = data;
        });

		if (g_userOptions["privateDictUrl"] != null)
			loadPrivateDic(g_userOptions["privateDictUrl"]);
        
		if (g_userOptions["sentenceTranslatorType"] == "1")
			MaxSentenceLen = 5000;

        var dicLayer = $("#dicLayer");
		
        dicLayer.css('color', '#' + options['fontColor']);
        dicLayer.css('font-size', options["fontSize"] + 'px');
        dicLayer.css('font-family', options["fontType"]);
        dicLayer.css('background', '-webkit-linear-gradient(bottom, ' + '#' + options['backColor2'] + ', ' + '#' + options['backColor1'] + ')');
        dicLayer.width(g_userOptions["popupWidth"] + 'px');
        dicLayer.height(g_userOptions["popupHeight"] + 'px');

        setInterval(function () {
            
            if (g_mouseX != g_oldMouseX || g_mouseY != g_oldMouseY)
                g_mouseHoverElapsedTime = 0;
            else
                g_mouseHoverElapsedTime += 100;

            g_oldMouseX = g_mouseX;
            g_oldMouseY = g_mouseY;
            
            if (g_mouseHoverElapsedTime >= g_userOptions['tooltipUpDelayTime'])
                showWordToolTip();
            },
        100);

        setInterval(function () { hideWordToolTip(); }, g_userOptions['tooltipDownDelayTime']);
    });
}

function loadPrivateDic(url) {
    
    chrome.runtime.sendMessage({ url: url }, function (data) {
        if (data != null)
		{		
			g_privateDic = new Map();
			var idx = 0;
			$(data).find("tr").each(function(){    	
				var tdtag = $(this).find("td");
				g_privateDic.set(tdtag.eq(0).text().toUpperCase(), tdtag.eq(1).html());
			});
		}         
    });
}

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}


$(document).ready(function () {

    createDicionaryLayer();
    createDicionaryRawData();
    createLoader();
    
    if (g_debug == true)
        createLogDiv();

    loadOptions();

    $(document).keyup(function (e) {
       
        // alt + F1
        if (g_pressKey[18] == true && e.which == 112) {
            if (g_userOptions["enableTranslate"] == "true")
                enableMouseDrag();
        }
        // esc
        else if (e.which == 27) {
            g_mouseTarget = null;
        }
        
        g_pressKey[e.which] = false;
    });

    $(document).keydown(function (e) {        
        g_pressKey[e.which] = true;
        if (g_userOptions["popupKey"] != 0)
            showWordToolTip();
    });
    
    $(document).mousedown(function (e) {
        
        if (e.which == 3) {
            g_rMouseX = g_mouseX;
            g_rMouseY = g_mouseY;
            return true;
        }

        if (e.which == 1) {
            g_contextSelectionWord = null;            
        }
        return true;
    });

function enableMouseDrag(el) {
    el || (el = document);
    el.addEventListener("contextmenu", bringBackDefault, true);
    el.addEventListener("dragstart", bringBackDefault, true);
    el.addEventListener("selectstart", bringBackDefault, true);
    // el.addEventListener("mousedown", bringBackDefault, true);
    // el.addEventListener("mouseup", bringBackDefault, true);
  }
  function disableRightClick(el) {
    el || (el = document);
    el.removeEventListener("contextmenu", bringBackDefault, true);
    el.removeEventListener("dragstart", bringBackDefault, true);
    el.removeEventListener("selectstart", bringBackDefault, true);
    // el.removeEventListener("mousedown", bringBackDefault, true);
    // el.removeEventListener("mouseup", bringBackDefault, true);
  }
  function bringBackDefault(event) {
    event.returnValue = true;
    event.stopPropagation();
    event.cancelBubble = true;
  }
    
});