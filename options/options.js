document.getElementById("save").addEventListener("click", function() {
    chrome.storage.local.set({
        // apiKey: document.getElementById("openai_api_key").value,
        replys: [
            document.getElementById("reply1").value,
            document.getElementById("reply2").value,
            document.getElementById("reply3").value,
            document.getElementById("reply4").value
        ]
    }, function() {
        alert("Saved");
    })
});

chrome.storage.local.get({
    apiKey: "",
    replys:[
        "日本語で答えてください。「:tweet:」というツイートに対して80文字以内で論理的に反論してください。",
        "日本語で答えてください。「:tweet:」という話と全く関係のない話を80文字以内で作成してください。",
        "日本語で答えてください。「:tweet:」という文章にある不謹慎なことがらについて、80文字以内で強く指摘及び注意して。語尾は「しろ」など強い命令形にして。",
        "日本語で答えてください。:tweet:という文章内のとある単語から連想し、文章の内容自体とは関係していない、「といえば」を含んだ身の上話を80文字以内でしてください"
    ]
},function(items) {
    // document.getElementById("openai_api_key").value = items.apiKey;
    document.getElementById("reply1").value = items.replys[0];
    document.getElementById("reply2").value = items.replys[1];
    document.getElementById("reply3").value = items.replys[2];
    document.getElementById("reply4").value = items.replys[3];
});