import { Request, Response } from "express";
import { database } from "../../../../../fembot.js";
import { APIResponseCode, APIResponsePayload } from "../../../../../types.js";
import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { auth } from "../../../../middleware/auth.js";

export default async function (fastify: FastifyInstance, opts: Object) {
	fastify.get(
		"/",
		async (
			req: FastifyRequest<{ Params: { id: string } }>,
			reply: FastifyReply,
		) => {
			if (!auth(req, reply)) {
				return;
			}
			const userdb = await database.user.findUnique({
				where: {
					id:
						req.params.id == "me"
							? req.session.user.discord_id
							: req.params.id,
				},
			});
			let user = {
				session: req.session.user,
				user: userdb,
			};
			return new APIResponsePayload(APIResponseCode.Success, user);
		},
	);
}
