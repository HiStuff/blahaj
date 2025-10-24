import { NextFunction, Request, Response } from "express";
import { FastifyReply, FastifyRequest } from "fastify";

export function auth(req: FastifyRequest, reply: FastifyReply) {
	if (req.session.user) {
		return true;
	} else {
		reply.status(401).send("Unauthorized.");
		return false;
	}
}

export function devAuth(req: FastifyRequest, reply: FastifyReply) {
	if (req.session.user) {
		if (req.session.user.is_developer) {
			return true;
		} else {
			reply.status(401).send("Unauthorized.");
			return false;
		}
	} else {
		reply.status(401).send("Unauthorized.");
		return false;
	}
}
