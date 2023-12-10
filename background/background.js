import generateAnswer from "./gptrequst.js";

const replys = [
  "日本語で答えてください。「:tweet:」というツイートに対して80文字以内で論理的に反論してください。",
  "日本語で答えてください。「:tweet:」という話と全く関係のない話を80文字以内で作成してください。",
  "日本語で答えてください。「:tweet:」という文章にある不謹慎なことがらについて、80文字以内で強く指摘及び注意して。語尾は「しろ」など強い命令形にして。",
  "日本語で答えてください。:word:についての何気ない身の上話を80文字以内でしてください",
  `<sentence1>は「桃希」という人物に対する返答です。
<sentence2>は「うらん」という人物に対する返答です。
<sentence3>は「ひろえ」という人物に対する返答です。

<sentence1>
あれ😱💦(-_-;)(^_^;桃希ちゃん、朝と夜間違えたのかな❗❓（￣ー￣?）✋❓小生はまだ起きてますよ〜(^з<)今日は青森30度超えるんだって^^;暑いね〜^^;(^▽^;)(￣Д￣；；(T_T)こんな日は小生と裸のお付き合い（笑）(^o^)しよ😃✋(^з<)なんてね(^_^)
</sentence1>
<sentence2>
うらんﾁｬﾝ、オッハー💗😄(^_^)(^o^)今日は晴れだけどなにするのかナ⁉✋❓（￣ー￣?）😜⁉️よく頑張ったね😃♥ えらいえライ(^з<)
</sentence2>
<sentence3>
ひろえﾁｬﾝ、久しぶり🎵ひろえﾁｬﾝも今日も2時までお仕事カナ✋❓😜⁉️（￣ー￣?）❗❓僕は、すごく心配だよ😰(T_T)(^_^;(￣Д￣；；そんなときは、美味しいもの食べて、元気出さなきゃだネ😚😃♥
</sentence3>

文章の特徴として、カタカナとひらがなを交互に使う、句読点が多い、馴れ馴れしいなどの特徴があります。
これを元にして「:user:」という人物の「:word:」に関する話に対しての返答を以下の制約を守りながら80文字程度で書きなさい。
・敬語は使わずに馴れ馴れしくする。
・絵文字の直前の単語や語尾は50%の確率でカタカナにしなさい。(例: 今日は晴れだけどなにするのかナ😂😂)
・敬称は「ﾁｬﾝ」にしなさい。`,
];
const API_URL = "https://api.openai.com/v1/chat/completions";

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "fetchChatGptResponse") {
    chrome.storage.local.get(
      {
        useApi: false,
      },
      function (items) {
        if (items.useApi) {
          fetchChatGptResponseByAPI(request, sendResponse);
        } else {
          fetchChatGptResponse(request, sendResponse);
        }
      }
    );
  } else if (request.action === "fetchOjisan") {
    fetchOjisan(request, sendResponse);
  }
  return true;
});

function fetchChatGptResponse(request, sendResponse) {
  // web版を無料で使う場合
  console.log(request);
  chrome.storage.local.get(
    {
      apiKey: "",
      replys: replys,
    },
    function (items) {
      const sendContent = items.replys[request.query.mode]
        .replace(/:tweet:/g, request.query.tweet)
        .replace(/:user:/g, request.query.user)
        .replace(/:beforeTweet:/g, request.query.beforeTweet);
      console.log(sendContent);
      //特徴的な単語を取得する
      if (items.replys[request.query.mode].includes(":word:")) {
        generateAnswer(
          `「${request.query.tweet.replace(
            /\s+/,
            " "
          )}」という文章から特徴的な単語を1つ選び、単語名だけを返してください。\n以下の形に添って返してください。\n\n特徴的な単語:「〇〇」`
        ).then((answer) => {
          if (answer == "CLOUDFLARE/UNAUTHORIZED") {
            sendResponse("CLOUDFLARE/UNAUTHORIZED");
            return;
          } else if (answer == "UNKNOWNERROR") {
            sendResponse("UNKNOWNERROR");
            return;
          }
          const word = answer
            .replace(/特徴的な単語:「/g, "")
            .replace(/」/g, "")
            .replace(/s+/g, "");
          console.log({ word: word });
          generateAnswer(sendContent.replace(/:word:/g, word)).then(
            (answer) => {
              console.log({ answer: answer });
              sendResponse(answer);
            }
          );
        });
      } else {
        generateAnswer(sendContent).then((answer) => {
          console.log({ answer: answer });
          sendResponse(answer);
        });
      }
    }
  );
}

function fetchChatGptResponseByAPI(request, sendResponse) {
  // 有料APIを使う場合→ボツ
  console.log(request);
  chrome.storage.local.get(
    {
      apiKey: "",
      replys: replys,
    },
    function (items) {
      const sendContent = items.replys[request.query.mode]
        .replace(/:tweet:/g, request.query.tweet)
        .replace(/:user:/g, request.query.user)
        .replace(/:beforeTweet:/g, request.query.beforeTweet);
      console.log(sendContent);
      const data = {
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "answer in Japanese.返答は必要最低限で行ってください。",
          },
          {
            role: "user",
            content: sendContent,
          },
        ],
        max_tokens: 140,
        temperature: 0.5,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      };

      fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${items.apiKey}`,
        },
        body: JSON.stringify(data),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("Success:", data);
          sendResponse(data.choices[0].message.content);
        })
        .catch((error) => {
          console.error("Error:", error);
          sendResponse({ error: true });
        });
    }
  );
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
      "Content-Length": "39",
    },
    body: postData,
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      console.log(data);
      sendResponse(data);
    })
    .catch((error) => {
      console.error("There was a problem with the fetch operation:", error);
      sendResponse({ error: true });
    });
}
