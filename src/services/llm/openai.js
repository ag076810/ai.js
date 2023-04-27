const log = require("debug")("ai.js:llm:openai");
function createAPI() {
    const { Configuration, OpenAIApi } = require("openai");
    if (!process.env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is not set.");
    const configuration = new Configuration({ apiKey: process.env.OPENAI_API_KEY });
    return new OpenAIApi(configuration);
}

let openai = null;
async function completion(messages, options = {}) {
    if (!openai) openai = createAPI();
    if (!options) options = {};
    if (!options.model) options.model = completion.defaultModel;
    if (!Array.isArray(messages)) throw new Error(`openai.completion() expected array of messages`);

    let networkOptions = {};
    if (options.stream) networkOptions.responseType = "stream";

    log(`hitting openai chat completion API with ${messages.length} messages (model: ${options.model}, stream: ${options.stream})`)


    const response = await openai.createChatCompletion({
        messages,
        model: options.model,
        stream: options.stream,
    }, networkOptions);

    if (options.stream) {
        const parser = options.parser || completion.parseStream;
        return parser(response, options.streamCallback);
    } else {
        const content = response.data.choices[0].message.content.trim();
        if (options.parser) {
            return options.parser(content);
        }

        return content;
    }
}

completion.parseStream = async function* (response, callback = null) {
    let content = "";
    for await (const chunk of response.data) {
        const lines = chunk
            .toString("utf8")
            .split("\n")
            .filter((line) => line.trim().startsWith("data: "));

        for (const line of lines) {
            const message = line.replace(/^data: /, "");
            if (message === "[DONE]") {
                if (callback) {
                    callback(content);
                }
                return content;
            }

            const json = JSON.parse(message);
            const token = json.choices[0].delta.content;
            if (!token) continue;

            content += token;
            yield token;
        }
    }
};

completion.defaultModel = "gpt-3.5-turbo";

module.exports = completion;