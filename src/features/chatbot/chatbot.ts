import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources";

interface History {
    [sessionId: string]: ChatCompletionMessageParam[]
}

export default class Chatbot {
    llmClient: OpenAI
    history: History
    addToHistory(sessionId: string, ...messages: ChatCompletionMessageParam[]) {
        if (!this.history[sessionId]) this.history[sessionId] = [];
        this.history[sessionId].concat(messages);
    }
    async answer(sessionId: string, question: string) {
        let messages = this.history[sessionId] || [];
        messages.push({ role: "user", content: question });
        const completion = await this.llmClient.chat.completions.create({
            model: "deepseek-r1-distill-llama-8b-q4_k_m",
            messages: messages
        });
        const assistantReply: ChatCompletionMessageParam = { role: "assistant", content: completion.choices[0].message.content };
        this.addToHistory(sessionId, { role: "user", content: question }, assistantReply);
        return completion;
    }
    constructor(llmClient: OpenAI, history: History) {
        this.llmClient = llmClient;
        this.history = history;
    }
}