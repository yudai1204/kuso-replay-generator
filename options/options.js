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
・敬称は「ﾁｬﾝ」にしなさい。`
];
const btns = [
    "正論パンチ",
    "無関係の話",
    "不謹慎を指摘",
    "自分語り",
    "おじさん構文"
];


document.getElementById("save").addEventListener("click", function() {
    chrome.storage.local.set({
        // apiKey: document.getElementById("openai_api_key").value,
        replys: [
            document.getElementById("reply1").value,
            document.getElementById("reply2").value,
            document.getElementById("reply3").value,
            document.getElementById("reply4").value,
            document.getElementById("reply5").value
        ],
        btns: [
            document.getElementById("reply1_title").value,
            document.getElementById("reply2_title").value,
            document.getElementById("reply3_title").value,
            document.getElementById("reply4_title").value,
            document.getElementById("reply5_title").value
        ]
    }, function() {
        alert("Saved");
    })
});

chrome.storage.local.get({
    apiKey: "",
    replys: replys,
    btns: btns
},function(items) {
    // document.getElementById("openai_api_key").value = items.apiKey;
    document.getElementById("reply1").value = items.replys[0];
    document.getElementById("reply2").value = items.replys[1];
    document.getElementById("reply3").value = items.replys[2];
    document.getElementById("reply4").value = items.replys[3];
    document.getElementById("reply5").value = items.replys[4];
    document.getElementById("reply1_title").value = items.btns[0];
    document.getElementById("reply2_title").value = items.btns[1];
    document.getElementById("reply3_title").value = items.btns[2];
    document.getElementById("reply4_title").value = items.btns[3];
    document.getElementById("reply5_title").value = items.btns[4];
});

document.getElementById("reset").addEventListener("click", function () {
    if(confirm("Are you sure you want to reset?") == false) return;
    chrome.storage.local.set({
        replys: replys,
        btns: btns
    }, function () {
        alert("Reset done.");
        location.reload();
    })
});