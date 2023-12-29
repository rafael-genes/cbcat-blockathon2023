import { withAuth } from "next-auth/middleware"
import { NextRequest, NextResponse } from "next/server";

const authMiddleware = withAuth(
    function onSuccess(req) {
        return
    },
    {
        callbacks: {
            authorized: ({ token }) => token != null
        },
        pages: {
            signIn: '/login',
            newUser: '/register',
        }
    }
);

export default function middleware(req: NextRequest) {
    if (
        req.nextUrl.pathname !== "/login" &&
        req.nextUrl.pathname !== "/register" &&
        req.nextUrl.pathname !== "/dashboard"
    ) {
        return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    // Check public pages
    if (req.nextUrl.pathname === "/login" || req.nextUrl.pathname === "/register") {
        return NextResponse.next()
    }

    return (authMiddleware as any)(req);
}


export const config = {
    matcher: ['/((?!api|_next|.*\\..*).*)']
};
