import { Request, Response } from "express";
import config from "../../../../config.json" with { type: "json" };
import { database } from "../../../fembot.js";
import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

export default async function (fastify: FastifyInstance, opts: Object) {
	fastify.get(
		"/auth",
		async (
			req: FastifyRequest<{ Querystring: { code: string } }>,
			reply: FastifyReply,
		) => {
			const { code } = req.query;
			const redirect_uri = new URL(config.oauth2_link).searchParams.get(
				"redirect_uri",
			);
			if (code) {
				if (!redirect_uri) {
					return reply.redirect(config.oauth2_link);
				}
				let response = await fetch(
					"https://discord.com/api/oauth2/token",
					{
						method: "POST",
						body: new URLSearchParams({
							client_id: config.clientId,
							client_secret: config.clientSecret,
							code: code.toString(),
							grant_type: "authorization_code",
							redirect_uri: redirect_uri,
							scope: "identify",
						}).toString(),
						headers: {
							"Content-Type": "application/x-www-form-urlencoded",
						},
					},
				);
				const data = await response.json();
				if (!("access_token" in data && "token_type" in data))
					return reply.redirect(config.oauth2_link);
				response = await fetch("https://discord.com/api/users/@me", {
					headers: {
						authorization: `${data.token_type} ${data.access_token}`,
					},
				});
				const data_user = await response.json();
				if (response.status == 200) {
					const user = await database.user.findUnique({
						where: {
							id: data_user.id,
						},
					});
					req.session.user = {
						discord_access_token: `${data.token_type} ${data.access_token}`,
						discord_id: data_user.id,
						is_developer: user?.developer || false,
					};
					reply.redirect("/login?loggedIn=true");
				} else {
					reply.redirect(config.oauth2_link);
				}
			} else {
				reply.redirect(config.oauth2_link);
			}
		},
	);
}
