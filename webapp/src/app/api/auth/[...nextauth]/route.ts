import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { z } from "zod";
import { client } from "@/app/lib/prisma";
import { compare } from "bcrypt";

const authOptions: NextAuthOptions = {
    pages: {
        signIn: "/login",
        newUser: "/register",
    },
    debug: true,
    session: {
        strategy: "jwt",
    },
    callbacks: {
        jwt: async ({ token, user }) => {
            if (user) token.role = (user as any).role;
            return token;
        }
    },
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "email", type: "text" },
                password: { label: "password", type: "password" },
            },
            async authorize(credentials) {
                const parsedCredentials = z
                    .object({
                        email: z.string().email(),
                        password: z.string().min(3)
                    })
                    .safeParse(credentials);

                if (!parsedCredentials.success) {
                    console.log(parsedCredentials.error);
                    return null;
                }

                ///////////////////////
                // Encapsulate this in @/lib
                ///////////////////////
                const { email, password } = parsedCredentials.data;
                const user = await client.user.findUnique({
                    where: {
                        email: email
                    }
                });

                if (!user) {
                    return null;
                }

                // Compare password
                const passwordsMatch = await compare(password, user.password);

                if (!passwordsMatch) {
                    return null;
                }
                ///////////////////////

                return user
            }
        })
    ],
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
