setInterval(() => {
    //ポップアップ返信画面
    if(location.href == "https://twitter.com/compose/tweet"){
        //返信ポップアップのツイート本文 
        const beforeTweet = document.querySelector('div[aria-labelledby="modal-header"] article[data-testid="tweet"] div > div > div > div > div > div[data-testid="tweetText"]');
        const maintweet = document.querySelector('div[aria-labelledby="modal-header"] article[data-testid="tweet"] div > div > div > div > div > div[data-testid="tweetText"]');
        if(maintweet){
            const username = document.querySelector('[data-testid="User-Name"]').innerText.split("\n")[0];
            insertBtns(beforeTweet, maintweet, username);
        }
    }
    //ツイート詳細画面
    else if(location.href.includes("/status/")){
        //詳細画面のトップツイート本文
        const beforeTweet = document.querySelector('article[data-testid="tweet"] div > div > div > div > div > div[data-testid="tweetText"]');
        const maintweet = document.querySelector('article[data-testid="tweet"][tabindex="-1"] div > div > div > div > div > div[data-testid="tweetText"]');
        if(maintweet){
            const username = document.querySelector('article[data-testid="tweet"][tabindex="-1"] [data-testid="User-Name"]').innerText.split("\n")[0];
            insertBtns(beforeTweet, maintweet, username);
        }
    }
}, 500);

const insertBtns = (beforeTweet, maintweet, username) => {
    //ツールバーにボタンを追加
    if(!document.getElementById("REPLAI_BUTTONS2") && document.querySelector('div[data-testid="toolBar"]')){
        document.querySelector('div[data-testid="toolBar"]').insertAdjacentHTML('beforebegin', 
        `
        <style>
        .replaiso-btn-style{
            border-radius: 9999px;
            border: 1.4px solid #1da1f2;
            color: #1da1f2;
            padding: 4px 8px;
            margin: 0 4px;
            cursor: pointer;
        }
        .ext-pointer-none {
            pointer-events: none;
            opacity: 0.5;
        }
        .replaiso-btn-style:hover{
            background-color: #1da1f222;
        }
        </style>
        <div id="REPLAI_BUTTONS2" class="REPLAI_BUTTONS" style="display: flex; flex-wrap: wrap; align-items: center; height: 100%; margin-top: 8px;">
        <div class="replaiso-btn-style ext-kusoripu-btn" data-index="0">正論パンチ</div>
        <div class="replaiso-btn-style ext-kusoripu-btn" data-index="1">無関係の話</div>
        <div class="replaiso-btn-style ojisan-koubun-btn" data-index="">おじさん構文</div>
        <div class="replaiso-btn-style ext-kusoripu-btn" data-index="2">不謹慎を指摘</div>
        <div class="replaiso-btn-style ext-kusoripu-btn" data-index="3">自分語り</div>
        `);
        document.querySelectorAll('.ext-kusoripu-btn').forEach((btn) => {
            btn.addEventListener('click', (e) => {
                console.log(e.target.innerText);
                document.querySelectorAll('.replaiso-btn-style').forEach((btn2) => {
                    btn2.classList.add("ext-pointer-none");
                });
                getGptResponse(maintweet.innerText, beforeTweet.innerText, username, e.target.getAttribute("data-index"));
            });
        });
        document.querySelector(".ojisan-koubun-btn").addEventListener('click', (e) => {
            console.log(e.target.innerText);
            document.querySelectorAll('.replaiso-btn-style').forEach((btn2) => {
                btn2.classList.add("ext-pointer-none");
            });
            chrome.runtime.sendMessage({
                action: "fetchOjisan",
                query: {
                    user: username
                }
            },(response) => {
                if(response.error){
                    alert("おじさん構文APIとの通信にエラーが発生しました。");
                    return;
                }else{
                    console.log(response);
                    //ツイート本文を入力
                    const n = document.querySelector('[data-testid="tweetTextarea_0"]'),i = new DataTransfer;
                    i.setData("text/plain", response.message), null == n || n.dispatchEvent(new ClipboardEvent("paste", { dataType: "text/plain", data: response, bubbles: !0, clipboardData: i, cancelable: !0 }))
                    //見た目を戻す
                    document.querySelectorAll('.ext-pointer-none').forEach((btn2) => {
                        btn2.classList.remove("ext-pointer-none");
                    });
                }
            });
        });
    }
};

const getGptResponse = (maintweet, beforeTweet, username, mode) => {
    //background.jsにメッセージを送信
    chrome.runtime.sendMessage(
        {
            action: 'fetchChatGptResponse', 
            query: {
                tweet: maintweet,
                user: username,
                beforeTweet: beforeTweet,
                mode: Number(mode)
            } 
        }, 
        (response) => {
            if(response.error){
                alert("ChatGPT APIとの通信にエラーが発生しました。");
                normalizeBtns();
                return;
            }else{
                console.log(response);
                if(response == "CLOUDFLARE/UNAUTHORIZED"){
                    alert("ChatGPTサイトにログインしてください。");
                    normalizeBtns();
                    return;
                }else if(response == "UNKNOWNERROR"){
                    alert("ChatGPT APIで不明なエラーが発生しました。");
                    normalizeBtns();
                    return;
                }
                const e = (response.startsWith("「") && response.endsWith("」")) ? response.slice(1, -1) : response;
                //ツイート本文を入力
                const n = document.querySelector('[data-testid="tweetTextarea_0"]'),i = new DataTransfer;
                i.setData("text/plain", e), null == n || n.dispatchEvent(new ClipboardEvent("paste", { dataType: "text/plain", data: e, bubbles: !0, clipboardData: i, cancelable: !0 }))
                //見た目を戻す
                normalizeBtns();
            }
        });
};


function normalizeBtns(){
    document.querySelectorAll('.ext-pointer-none').forEach((btn2) => {
        btn2.classList.remove("ext-pointer-none");
    });
}