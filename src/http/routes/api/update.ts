import { Request, Response } from "express";
import { update } from "../../../updater.js";
import { APIResponseCode, APIResponsePayload } from "../../../types.js";
import { FastifyInstance, FastifyRequest } from "fastify";
import { devAuth } from "../../middleware/auth.js";

export default async function (fastify: FastifyInstance, opts: Object) {
	fastify.post(
		"/update",
		{
			schema: {
				body: {
					type: "object",
					required: ["file"],
					properties: {
						file: { type: "string" },
					},
				},
			},
		},
		async (req: FastifyRequest<{ Body: { file: string } }>, res) => {
			if (!devAuth(req, res)) {
				return;
			}
			const file = req.body.file;
			if (!file) return res.status(400);
			const success = await update(Buffer.from(file), false);
			if (success) {
				setTimeout(() => {
					process.exit();
				}, 5000);
				return new APIResponsePayload(APIResponseCode.Success);
			} else {
				res.status(500);
				return new APIResponsePayload(APIResponseCode.FailedToUpdate);
			}
		},
	);
}
