const assert = require("assert");
const { describe, it } = require("mocha");

const AI = require("../src/index");
const { expectStream } = require("./utils");

describe("llm", function () {
    this.timeout(10000);
    this.slow(2500);

    describe("openai", function () {
        it("string", async function () {
            const response = await AI("the color of the sky is");
            assert(response.toLowerCase().indexOf("blue") !== -1);
        });

        it("array", async function () {
            const messages = [{ role: "user", content: "the codeword is blue, remember it" }];
            const ai = new AI(messages, { stream: true });
            const stream = await ai.chat("what is the codeword?");
            assert(await expectStream(stream, "blue"));
        });

        it("streaming", async function () {
            const stream = await AI("the color of the sky is", { stream: true });
            assert(await expectStream(stream, "blue"));
        });

        it("custom temperature", async function () {
            const response = await AI("the color of the sky is", { temperature: 0 });
            assert.equal(response, "blue during the day and black at night. However, during sunrise and sunset, the sky can take on a range of colors including shades of pink, orange, and purple.");
        });

        it("max tokens", async function () {
            const response = await AI("the color of the sky is", { temperature: 0, max_tokens: 1 });
            assert.equal(response, "blue");
        });
    });

    describe("anthropic", function () {
        it("string", async function () {
            const response = await AI("the color of the sky is", { service: "anthropic" });
            assert(response.toLowerCase().indexOf("blue") !== -1);
        });

        it("array", async function () {
            const messages = [{ role: "user", content: "2+2=" }];
            const ai = new AI(messages, { service: "anthropic", stream: true });
            const stream = await ai.send();
            assert(await expectStream(stream, "4"));
        });

        it("streaming", async function () {
            const stream = await AI("the color of the sky is", { service: "anthropic", stream: true });
            assert(await expectStream(stream, "blue"));
        });

        it("custom temperature", async function () {
            const response = await AI("the color of the sky is frequently", { service: "anthropic", temperature: 0 });
            assert.equal(response, "Blue. The color of the sky is frequently blue.");
        });

        it("max tokens", async function () {
            const response = await AI("the color of the sky is frequently", { service: "anthropic", temperature: 0, max_tokens: 1 });
            assert.equal(response, "Blue");
        });
    });
});