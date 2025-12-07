import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources";

interface History {
	[sessionId: string]: ChatCompletionMessageParam[];
}

export default class Chatbot {
	llmClient: OpenAI;
	history: History;
	addToHistory(sessionId: string, ...messages: ChatCompletionMessageParam[]) {
		if (!this.history[sessionId]) this.history[sessionId] = [];
		this.history[sessionId] = this.history[sessionId].concat(messages);
	}
	getHistory(sessionId: string) {
	return this.history[sessionId];	
	}
	clearHistory(sessionId: string) {
		this.history[sessionId] = [];
	}
	async answer(sessionId: string, systemPrompt: string, question: string) {
		let messages = this.history[sessionId] || [];
		const completion = await this.llmClient.chat.completions.create({
			model: (await this.llmClient.models.list()).data[0].id,
			messages: messages.concat(messages, { role: "user", content: question }, { role: "system", content: systemPrompt }),
		});
		const assistantReply: ChatCompletionMessageParam = {
			role: "assistant",
			content: completion.choices[0].message.content,
		};
		this.addToHistory(
			sessionId,
			{ role: "user", content: question },
			assistantReply,
		);
		return completion;
	}
	constructor(llmClient: OpenAI, history: History) {
		this.llmClient = llmClient;
		this.history = history;
	}
}
