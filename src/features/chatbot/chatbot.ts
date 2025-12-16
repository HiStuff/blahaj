import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources";

interface History {
	[sessionId: string]: ChatCompletionMessageParam[];
}

export default class Chatbot {
	llmClient: OpenAI;
	llmClientFallback?: OpenAI;
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
	async answer(sessionId: string, systemPrompt: string, question: string, useFallback?: boolean) {
		let messages = this.history[sessionId] || [];
		let completion;
		try {
			completion = await this.llmClient.chat.completions.create({
				model: (await this.llmClient.models.list()).data[0].id,
				messages: messages.concat(messages, { role: "user", content: question }, { role: "system", content: systemPrompt }),
			});
		} catch(err) {
			if (this.llmClientFallback) {
				completion = await this.llmClientFallback.chat.completions.create({
					model: (await this.llmClientFallback.models.list()).data[0].id,
					messages: messages.concat(messages, { role: "user", content: question }, { role: "system", content: systemPrompt }),
				});
			} else {
				throw new Error("An error occured while trying to generate response using the main LLM server and there was no fallback LLM server defined.");
			}
		}
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
	constructor(llmClient: OpenAI, llmClientFallback: OpenAI, history: History) {
		this.llmClient = llmClient;
		this.llmClientFallback = llmClientFallback
		this.history = history;
	}
}
