import { Elysia } from "elysia";
import { bearer } from "@elysiajs/bearer";
import { jwt } from "@elysiajs/jwt";

export const authService = new Elysia({ name: "auth/service" })
	.use(jwt({ name: "jwt", secret: process.env.JWT_SECRET as string }))
	.use(bearer())
	.state({ user: {} as Record<string, string> })
	.macro(({ onBeforeHandle }) => ({
		requiresAuthentication(enabled: true) {
			if (!enabled) return;

			onBeforeHandle(({ jwt, error, bearer, store: { user } }) => {
				console.log("bearer ->", bearer);
				if (!bearer)
					return error(401, { success: false, message: "Unauthorized" });

				const token = jwt.verify(bearer);

				console.log("token ->", token);

				// const username = user[token as unknown as number];

				// if (!username)
				// 	return error(401, {
				// 		success: false,
				// 		message: "Unauthorized",
				// 	});
			});
		},
	}));
