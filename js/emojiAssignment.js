//Considering only 2 smilies.

var emojiContainer = {
	":)" : "https://static.xx.fbcdn.net/images/emoji.php/v9/zeb/2/16/1f642.png",
	"<3" : "https://static.xx.fbcdn.net/images/emoji.php/v9/zed/2/16/2764.png"
};

var chatDetailText = document.getElementById('chatDetailText');

chatDetailText.addEventListener("keydown", function (e) {
  //to perform the action based on pressing space bar (32) or enter (13).
  var keydown = e.which || e.keyCode;

  //to get the pointer location and modify to place to the end if needed
  var selectionInfo = getSelectionTextInfo(this); 

  //to get the complete text extered by the user.
  var input = chatDetailText.innerHTML;

  //to cover the cases in which user enters <3 and gets interpreted as &lt
  var textEntered = decodeHtml(input);

  //To split the text entered and to get the location of the emoji for conversion
  var last_word = textEntered.split(/\s{1}/);

  //After splitting contains the emoji and now can be accessed.
  last_word = last_word[last_word.length-1];


  //space bar is pressed and the smiley is just inserted
  if (keydown === 32 && selectionInfo.atEnd){
    //if the emoji is available in our database, it'll replace the same using the Facebook url which is currently used.
    if(emojiContainer[last_word]){

      var emojiImg = "<img src='"+emojiContainer[last_word]+"' >";

      textEntered = textEntered.replace(last_word, emojiImg);
      chatDetailText.innerHTML = textEntered;

      elemIterate = document.getElementById('chatDetailText');//This is the element to move the caret to the end of
      setEndOfContenteditable(elemIterate);
    }
    //Enter key is pressed after typing the emoji
  }else if (keydown === 13) {
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