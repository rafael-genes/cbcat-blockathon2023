import { client } from "./prisma";

export async function getUserDb(email: string) {
    try {
        const user = await client.user.findUnique({
            select: {
                email: true,
                role: true,
                password: false,
            },
            where: {
                email: email,
            },
        })
        return user
    } catch (error) {
        console.error('Failed to get user:', error);
        throw new Error('Failed to get user.');
    }
}

export async function createUserDb({
    email: email,
    password: password,
    address: address,
}: {
    email: string;
    password: string;
    address: string;
}) {
    try {
        const user = await client.user.create({
            data: {
                email: email,
                password: password,
                address: address,
            }
        })
        return user
    } catch (error) {
        console.error('Failed to create user:', error);
        throw new Error('Failed to create user.');
    }
}
