var firebase_config = {
    apiKey: "AIzaSyAHpZD_40b20YZF6SfdJEDX35qWFUpgP60",
    authDomain: "dodo-acticle-chat.firebaseapp.com",
    databaseURL: "https://dodo-acticle-chat.firebaseio.com",
    projectId: "dodo-acticle-chat",
    storageBucket: "dodo-acticle-chat.appspot.com",
    messagingSenderId: "993245061372"
};
firebase.initializeApp(firebase_config);

// get DOM
let chatButton = document.getElementById('chat-btn');
let chatContent = document.getElementById('chat-content');
let messageInput = document.getElementById('message-input');
let sendButton = document.getElementById('send-button');
let loading = document.getElementById('loading');
let uploadInput = document.getElementById('upload');
let progressNumber = document.getElementById('prograssNumber');


let user = document.querySelector('.member-box > a').text.match(/\S+/g) || [] ;
let userName = user[0] || '';
let userTitle = user[2].slice(5) || '';

let currentPath = window.location.pathname;

let url;
let articleRef;
let article_id = currentPath.split('/')[3] || 'noArticleID';
let storageRef;

articleRef = firebase.database().ref(article_id);
storageRef = firebase.storage().ref("/file/");
// get database data
articleRef.on('value', function(snap){
    chatContent.innerHTML = '';
    const val = snap.val();
    //console.log('val:', val);
    loading.classList.toggle('hide');
    for(let key in val) {
        //console.log(val[key]);
        let block = document.createElement('div');
        let item = val[key];
        block.setAttribute('class', 'msg');
        if (Boolean(item.type) === false || item.type === 'text') {
            // avoid xss
            block.innerHTML = `<span title='${item.userTitle}'>${item.name}</span><p title='${item.time}'></p>`;
            block.children[1].innerText = item.message;
        } else if (item.type === 'image') {
            block.innerHTML = `<span title='${item.userTitle}'>${item.name}</span><img src="${item.message}" title='${item.time}'>`;
        } else if (item.type === 'file') {
            block.innerHTML = `<span title='${item.userTitle}'>${item.name}</span><p title='${item.time}'><a href="${item.message}" target='_blank'>${item.filename}</a></p>`;
        }
        chatContent.appendChild(block);
    }
    chatContent.scrollTop = chatContent.scrollHeight;
    if (chatContent.innerText.length !== 0) {
        if (document.querySelector('#chat-room').classList.contains('hide')) {
            show_chat_room();
        }
    }
});

sendButton.addEventListener('click', function(e){
    let inputMessage = messageInput.value;
    if(inputMessage.length === 0){      
      e.preventDefault();
      return false;
    }
    articleRef.push({
      name: userName,
      type: 'text',
      message: inputMessage,
      userTitle: userTitle || '',
      time: getTime()
    });
    messageInput.value = '';
  });

uploadInput.addEventListener('change', function (e) {
    // console.log('onchange');
    // console.log(e);
    const file = e.target.files[0];
    const size = file.size / 1024 / 1024;
    if (size > 10) {
        // 10MB 的大小限制
        alert(`${size.toFixed(2)}MB 太大了啦，想辦法弄小一點，或用其他方式傳`);
        e.preventDefault();
        return false;
    }
    const filename = Date.now() + `_${file.name}`;
    const metadata = {
        contentType: 'file/*'
    };
    const prograssBar = document.getElementById('prograssBar');
    const uploadTask = storageRef.child(filename).put(file, metadata);
    // upload status
    uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED, 
        // 上傳進度
        function (snap) {
        progressNumber.style.display = 'inherit';
        let progress = Math.floor((snap.bytesTransferred / snap.totalBytes) * 100);
        if (progress < 100) {
            progressNumber.innerText = `uploading... ${progress}%`;
        }
        },
        // 錯誤處理
        function (error) {
        console.log('error', error);
        },
        // 結束處理
        function () {
        uploadTask.snapshot.ref.getDownloadURL()
        .then( (url) => {
            articleRef.push({
            name: userName,
            type: 'file',
            message: url,
            userTitle: userTitle || '',
            filename: file.name,
            time: getTime()
            });
        });
        progressNumber.style.display = 'none';
        }
    );
});
  
function getTime() {
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();
    const month = now.getMonth()+1;
    const date = now.getDate();
    const year = now.getFullYear();
    const second = now.getSeconds();
    return `${year}/${month<10?'0'+month:month}/${date<10?'0'+date:date}-${hour<10?'0'+hour:hour}:${minute<10?'0'+minute:minute}:${second<10?'0'+second:second}`;
} // end of getTime()
  

chatButton.addEventListener('click', show_chat_room);

function show_chat_room () {
    document.getElementById('chat-room').classList.toggle('hide');
    chatContent.scrollTop = chatContent.scrollHeight;
} // end of show_chat_room

// setting emoji picker
$(function() {
    // Initializes and creates emoji set from sprite sheet
    window.emojiPicker = new EmojiPicker({
      emojiable_selector: '[emojiable=true]',
      assetsPath: 'https://yubintw.github.io/embed-chat-room/lib/img/',
      popupButtonClasses: 'fa fa-smile-o'
    });
    // Finds all elements with `emojiable_selector` and converts them to rich emoji input fields
    // You may want to delay this step if you have dynamically created input fields that appear later in the loading process
    // It can be called as many times as necessary; previously converted input fields will not be converted again
    window.emojiPicker.discover();
});