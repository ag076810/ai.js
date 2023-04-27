const LLM = require("../index.js");

(async function () {
    const llm = new LLM([
        { role: "user", content: "I am going to tell you the secret codeword, remember it. The codeword is blue." },
        { role: "user", content: "what is the secret codeword I just told you?" },
    ], { stream: true });

    const stream = await llm.fetch();
    for await (const message of stream) {
        process.stdout.write(message); // real-time blue
    }

    // console.log(llm.messages); // 3
})();