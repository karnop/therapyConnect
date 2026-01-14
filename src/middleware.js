import { NextResponse } from "next/server";

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get("appwrite-session");

  // 1. Define Protected Routes (Login required)
  const protectedRoutes = [
    "/dashboard",
    "/therapist",
    "/book",
    "/profile/edit",
  ];

  // 2. Define Auth Routes (Guest only)
  // Added forgot-password and reset-password here so logged-in users are redirected to dashboard
  const authRoutes = [
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
  ];

  // Check path matches
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // CASE A: Guest tries to access protected route
  if (isProtectedRoute && !sessionCookie) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // CASE B: Logged-in User tries to access auth route (login/signup/reset)
  // We redirect them to dashboard because they are already authenticated.
  if (isAuthRoute && sessionCookie) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
