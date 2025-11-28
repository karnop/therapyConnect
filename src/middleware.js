import { NextResponse } from "next/server";

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get("appwrite-session");

  // 1. Define Protected Routes
  // These are paths that require the user to be logged in
  const protectedRoutes = [
    "/dashboard",
    "/therapist",
    "/book",
    "/profile/edit",
  ];

  // 2. Define Auth Routes
  // These are paths that logged-in users shouldn't see (like Login/Signup)
  const authRoutes = ["/login", "/signup"];

  // Check if current path matches a protected route
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // --- LOGIC ---

  // CASE A: User is NOT logged in and tries to access protected route
  if (isProtectedRoute && !sessionCookie) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    // Save the intended destination to redirect back after login
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // CASE B: User IS logged in and tries to access login/signup
  if (isAuthRoute && sessionCookie) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  // CASE C: Allow request to proceed
  return NextResponse.next();
}

// Optimization: Only run middleware on specific paths to save resources
export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * 1. api (API routes)
     * 2. _next/static (static files)
     * 3. _next/image (image optimization files)
     * 4. favicon.ico (favicon file)
     * 5. public images (svg, png, jpg)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
