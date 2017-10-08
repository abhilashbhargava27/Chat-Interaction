//Considering only 2 smilies.

var emojiContainer = {
  ":)" : "http://www.funny-emoticons.com/files/smileys-emoticons/cute-emoticons/0.png",
  "<3" : "http://www.iconsdb.com/icons/preview/red/hearts-xxl.png"
};

var chatDetailText = document.getElementById('chatDetailText');

chatDetailText.addEventListener("keyup", function (e) {

  //to perform the action based on pressing space bar (32) or enter (13).
  var keyup = e.which || e.keyCode;

  //to get the pointer location and modify to place to the end if needed
  var selectionInfo = getSelectionTextInfo(this); 

  //to get the complete text extered by the user.
  var input = chatDetailText.innerHTML;

  //to cover the cases in which user enters <3 and gets interpreted as &lt
  var textEntered = decodeHtml(input);

  //To split the text entered and to get the location of the emoji for conversion
  var last_word = textEntered.split(/\s{1}/);

  //space bar is pressed and the smiley is just inserted
  if (keyup === 32 && selectionInfo.atEnd){
    //if the emoji is available in our database, it'll replace the same using the Facebook url which is currently used.
    
    for(var i=0 ; i < last_word.length ; i++){
      
      if(emojiContainer[last_word[i]]){
        var emojiImg = "<img src='"+emojiContainer[last_word[i]]+"' >";

        textEntered = textEntered.replace(last_word[i], emojiImg);
        chatDetailText.innerHTML = textEntered;

        elemIterate = document.getElementById('chatDetailText');//This is the element to move the caret to the end of
        setEndOfContenteditable(elemIterate);
      }
    }
  
  }else if (keyup === 32 && !selectionInfo.atEnd){
    //if the emoji is available in our database, and the pointer location is not in end.
    
    for(var i=0 ; i < last_word.length ; i++){
      
      if(emojiContainer[last_word[i]]){
        doSave();
        var emojiImg = "<img src='"+emojiContainer[last_word[i]]+"' >";

        textEntered = textEntered.replace(last_word[i], emojiImg);
        chatDetailText.innerHTML = textEntered;

        doRestore();

      }
    }
  }else if (keyup === 13) {
    //Enter key is pressed after typing the emoji    
    //The below will remove the <div><br></div> inserted when taking innerHTML
    last_word = last_word[last_word.length-1].substring(0, last_word[last_word.length-1].indexOf("<div>"));
    console.log(last_word,"enter pressed")
    // To avoid extra line insertion in div.
    e.preventDefault();

    //if the emoji is available in our database it'll replaced. Currently using   the Facebook url for both the emoji's. 
    if(emojiContainer[last_word]){

      var emojiImg = document.createElement("img");
      emojiImg.src = emojiContainer[last_word];
      emojiImg.className = "emojiIcon";

      var divChatElement = document.createElement('div');
      divChatElement.className = "chatConatiner";

      var spanChatElement = document.createElement("span");
      var precedingChatContent = textEntered.split(/\s{1}/);

      precedingChatContent.pop(); //To pop the last smiley found

      document.getElementById('submitText').appendChild(divChatElement);
      
      if(precedingChatContent.length !=0){
        precedingChatContent = precedingChatContent.join(" ");
        spanChatElement.innerHTML = precedingChatContent;
        divChatElement.appendChild(spanChatElement);
      }
      
      divChatElement.appendChild(emojiImg);
      document.getElementById('chatDetailText').innerHTML = '';
    }else{
      console.log("div creation box")
      //If no Smiley found, just the plain text it'll automatically display the text in a div
      var divChatElement = document.createElement('div');
      //chatDetailSeperator.className = "aClassName"; To add class name for div
      divChatElement.innerHTML = textEntered;

      document.getElementById('submitText').appendChild(divChatElement);
      document.getElementById('chatDetailText').innerHTML = ''; 
    }
  }
}, false);

function decodeHtml(decodeValue) {
  var textAreaElement = document.createElement("textarea");
  textAreaElement.innerHTML = decodeValue;
  return textAreaElement.value;
}

var saveSelection, restoreSelection;
var savedSelection;

if (window.getSelection && document.createRange) {
  saveSelection = function(containerEl) {
    var range = window.getSelection().getRangeAt(0);
    var preSelectionRange = range.cloneRange();
    preSelectionRange.selectNodeContents(containerEl);
    preSelectionRange.setEnd(range.startContainer, range.startOffset);
    var start = preSelectionRange.toString().length;

    return {
      start: start,
      end: start + (range.toString().length-2)
    };
  };

  restoreSelection = function(containerEl, savedSel) {
    var charIndex = 0, range = document.createRange();
    range.setStart(containerEl, 0);
    range.collapse(true);
    var nodeStack = [containerEl], node, foundStart = false, stop = false;

    while (!stop && (node = nodeStack.pop())) {
      if (node.nodeType == 3) {
        var nextCharIndex = charIndex + node.length;
        if (!foundStart && savedSel.start >= charIndex && savedSel.start <= nextCharIndex) {
          range.setStart(node, savedSel.start - charIndex);
          foundStart = true;
        }
        if (foundStart && savedSel.end >= charIndex && savedSel.end <= nextCharIndex) {
          range.setEnd(node, savedSel.end - charIndex);
          stop = true;
        }
        charIndex = nextCharIndex;
      } else {
        var i = node.childNodes.length;
        while (i--) {
          nodeStack.push(node.childNodes[i]);
        }
      }
    }

    var sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  }
} else if (document.selection) {
  saveSelection = function(containerEl) {
    var selectedTextRange = document.selection.createRange();
    var preSelectionTextRange = document.body.createTextRange();
    preSelectionTextRange.moveToElementText(containerEl);
    preSelectionTextRange.setEndPoint("EndToStart", selectedTextRange);
    var start = preSelectionTextRange.text.length;

    return {
      start: start,
      end: start + selectedTextRange.text.length
    }
  };

  restoreSelection = function(containerEl, savedSel) {
    var textRange = document.body.createTextRange();
    textRange.moveToElementText(containerEl);
    textRange.collapse(true);
    textRange.moveEnd("character", savedSel.end);
    textRange.moveStart("character", savedSel.start);
    textRange.select();
  };
}

function doSave() {
  savedSelection = saveSelection( document.getElementById("chatDetailText") );
}

function doRestore() {
  if (savedSelection) {
    restoreSelection(document.getElementById("chatDetailText"), savedSelection);
  }
}

//To check if the pointer is at the end.
function getSelectionTextInfo(contentEditableElement) {
  var atEnd = false;
  var selectionRange, testRange;
  if (window.getSelection) {
    var windowSelection = window.getSelection();
    if (windowSelection.rangeCount) {
      selectionRange = windowSelection.getRangeAt(0);
      testRange = selectionRange.cloneRange();

      testRange.selectNodeContents(contentEditableElement);
      testRange.setStart(selectionRange.endContainer, selectionRange.endOffset);
      atEnd = (testRange.toString() == "");
    }
  }else if (document.selection && document.selection.type != "Control") {
    selectionRange = document.selection.createRange();
    testRange = selectionRange.duplicate();

    testRange.moveToElementText(contentEditableElement);
    testRange.setEndPoint("StartToEnd", selectionRange);
    atEnd = (testRange.text == "");
  }
  return { atEnd: atEnd };
}

//To send the pointer to the end of the div.
function setEndOfContenteditable(contentEditableElement){
  var range,selection;
  if(document.createRange)//Firefox, Chrome, Opera, Safari, IE 9+
  {
    range = document.createRange();//Create a range (a range is like the selection but invisible)
    range.selectNodeContents(contentEditableElement);//Select the entire contents of the element with the range
    range.collapse(false);//collapse the range to the end point. false means collapse to end rather than the start
    selection = window.getSelection();//get the selection object (allows you to change selection)
    selection.removeAllRanges();//remove any selections already made
    selection.addRange(range);//make the range you have just created the visible selection
  }
  else if(document.selection)//IE 8 and lower
  { 
    range = document.body.createTextRange();//Create a range (a range is like the selection but invisible)
    range.moveToElementText(contentEditableElement);//Select the entire contents of the element with the range
    range.collapse(false);//collapse the range to the end point. false means collapse to end rather than the start
    range.select();//Select the range (make it the visible selection
  }
}