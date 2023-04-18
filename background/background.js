import generateAnswer from "./gptrequst.js"

const API_KEY = '';
const API_URL = 'https://api.openai.com/v1/chat/completions';

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'fetchChatGptResponse') {
        fetchChatGptResponse(request, sendResponse);
    }else if(request.action === 'fetchOjisan'){
        fetchOjisan(request, sendResponse);
    }
    return true;
});

function fetchChatGptResponse(request, sendResponse) { // web版を無料で使う場合
    console.log(request);
    chrome.storage.local.get({
        apiKey: "",
        replys: [
            "日本語で答えてください。「:tweet:」というツイートに対して80文字以内で論理的に反論してください。",
            "日本語で答えてください。「:tweet:」という話と全く関係のない話を80文字以内で作成してください。",
            "日本語で答えてください。「:tweet:」という文章中にある不謹慎なことがらについて、80文字以内で強く指摘及び注意して。語尾は「しろ」など強い命令形にして。",
            "日本語で答えてください。:tweet:という文章内のとある単語から連想し、文章の内容自体とは関係していない、「といえば」を含んだ身の上話を80文字以内でしてください"
        ]
    }, function (items) {
        const sendContent = (items.replys[request.query.mode]).replace(/:tweet:/g, request.query.tweet).replace(/:user:/g, request.query.user).replace(/:beforeTweet:/g, request.query.beforeTweet);
        console.log(sendContent);
        generateAnswer(sendContent).then(answer => {
            console.log({answer: answer});
            sendResponse(answer);
        });
    });
}


function fetchChatGptResponseByAPI(request, sendResponse) { // 有料APIを使う場合→ボツ
    console.log(request);
    chrome.storage.local.get({
        apiKey: "",
        replys: [
            "日本語で答えてください。「:tweet:」というツイートに対して80文字以内で論理的に反論してください。",
            "日本語で答えてください。「:tweet:」という話と全く関係のない話を80文字以内で作成してください。",
            "日本語で答えてください。「:tweet:」という文章中にある不謹慎なことがらについて、80文字以内で強く指摘及び注意して。語尾は「しろ」など強い命令形にして。",
            "日本語で答えてください。:tweet:という文章内のとある単語から連想し、文章の内容自体とは関係していない、「といえば」を含んだ身の上話を80文字以内でしてください"
        ]
    }, function (items) {
        const sendContent = (items.replys[request.query.mode]).replace(/:tweet:/g, request.query.tweet).replace(/:user:/g, request.query.user).replace(/:beforeTweet:/g, request.query.beforeTweet);
        console.log(sendContent);
        const data = {
            'model': "gpt-3.5-turbo",
            messages: [
                {
                    "role": "system",
                    "content": "answer in Japanese.返答は必要最低限で行ってください。"
                },
                {
                    "role": "user",
                    "content": sendContent
                },
            ],
            'max_tokens': 140,
            'temperature': 0.5,
            'top_p': 1,
            'frequency_penalty': 0,
            'presence_penalty': 0
        };

        fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${items.apiKey}`
            },
            body: JSON.stringify(data)
        })
            .then(response => response.json())
            .then(data => {
                console.log('Success:', data);
                sendResponse(data.choices[0].message.content);
            })
            .catch((error) => {
                console.error('Error:', error);
                sendResponse({ error: true });
            });
    });
}


function fetchOjisan(request, sendResponse) {
    const postData = new FormData();
    postData.append("name", request.query.user);
    postData.append("emoji_level", 5);
    postData.append("punctuation_level", 1);

    fetch("https://ojichat.appspot.com/post", {
        method: "POST",
        headers: {
            "Accept-Language": "ja,en-US;q=0.9,en;q=0.8",
            "Content-Length": "39"
        },
        body: postData
    })
        .then(response => {
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            return response.json();
        })
        .then(data => {
            console.log(data);
            sendResponse(data);
        })
        .catch(error => {
            console.error("There was a problem with the fetch operation:", error);
            sendResponse({ error: true });
        });
}