import { Elysia, getSchemaValidator, t, type Static } from "elysia";
import { bearer } from "@elysiajs/bearer";
import { jwt } from "@elysiajs/jwt";

const jwtSchema = t.Object({
	iat: t.Optional(t.Number()),
	expires: t.String(),
	user: t.Object({
		name: t.String(),
		userId: t.String(),
		publicKey: t.String(),
		image: t.String(),
		credentialId: t.String(),
		credentialPublicKey: t.String(),
		ethAccounts: t.Array(
			t.Object({
				address: t.String(),
				type: t.String(),
				inboxId: t.String(),
				isXmtpV3Enabled: t.Nullable(t.Boolean()),
			}),
		),
	}),
});

type JwtToken = Static<typeof jwtSchema>;

const validator = getSchemaValidator(jwtSchema);

export const authService = new Elysia({ name: "auth/service" })
	.use(
		jwt({
			name: "jwt",
			secret: process.env.JWT_SECRET as string,
			// schema: jwtSchema, // fails on our schema for some reason just manually validating
		}),
	)
	.use(bearer())
	.state({ user: {} as Record<string, JwtToken["user"]> })
	.macro(({ onBeforeHandle }) => ({
		requiresAuthentication(enabled: true) {
			if (!enabled) return;

			onBeforeHandle(async ({ jwt, error, bearer, store }) => {
				if (!bearer)
					return error(401, { success: false, message: "Unauthorized" });

				// ! the in-built schema vaildation is not working for we assign and check for ourselves
				const token = (await jwt.verify(bearer)) as false | JwtToken;

				if (!token || !validator.Check(token)) {
					for (const err of validator.Errors(token)) console.log("errors", err);
					return error(401, { success: false, message: "Unauthorized" });
				}

				store.user[token.user.userId] = token.user;
			});
		},
	}));

export const getAuthedUser = new Elysia()
	.use(authService)
	.guard({ as: "scoped", requiresAuthentication: true })
	.resolve({ as: "scoped" }, async ({ jwt, bearer }) => {
		// ! this type assignment is fine because this runs after the `onBeforeHandle` and we have validated the token
		const token = (await jwt.verify(bearer)) as unknown as JwtToken;
		return { user: token.user, token };
	});
