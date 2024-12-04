import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export function middleware(request) {
  const token = request.cookies.get("accessToken"); // Read token from cookies

  const url = request.nextUrl.clone();

  if (!token) {
    // Redirect to login if no token is present
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check user role and redirect
    if (decoded.role === "admin") {
      url.pathname = "/admin/dashboard"; // Admin dashboard
      return NextResponse.rewrite(url);
    } else if (decoded.role === "user") {
      url.pathname = "/user/dashboard"; // User dashboard
      return NextResponse.rewrite(url);
    } else if (decoded.role === "manager") {
      url.pathname = "/manager/dashboard"; // Manager dashboard
      return NextResponse.rewrite(url);
    }

    // Redirect to login if role is invalid
    url.pathname = "/login";
    return NextResponse.redirect(url);
  } catch (error) {
    console.error("Token verification failed:", error);
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }
}

// Run middleware on specific routes
export const config = {
  matcher: ["/admin/:path*", "/user/:path*", "/manager/:path*"],
};
