import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";

/**
 * Middleware function to handle authentication and route protection.
 * It checks for valid JWT tokens and injects user identity into headers.
 */
export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isPublicRoute =
    pathname.startsWith("/v1/auth") || pathname.startsWith("/api/auth");

  if (isPublicRoute) {
    return NextResponse.next();
  }

  const token = req.cookies.get("auth_token")?.value;

  if (!token) {
    if (pathname.startsWith("/api/protected")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.redirect(new URL("/v1/auth/login", req.url));
  }

  let user: { role?: string };

  try {
    user = verifyToken(token);
  } catch {
    if (pathname.startsWith("/api/protected")) {
      return NextResponse.json(
        { message: "Invalid or expired token" },
        { status: 401 },
      );
    }

    return NextResponse.redirect(new URL("/v1/auth/login", req.url));
  }

  const role = user.role || "";
  const isManagerRoute = pathname.startsWith("/v1/manager");
  const isEmployeeRoute = pathname.startsWith("/v1/employees");

  if (isManagerRoute && role !== "MANAGER" && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/v1/employees/dashboard", req.url));
  }

  if (isEmployeeRoute && role === "MANAGER") {
    return NextResponse.redirect(new URL("/v1/manager/dashboard", req.url));
  }

  return NextResponse.next();
}

/**
 * Configuration to define which paths this middleware should run on.
 * It uses a matcher pattern to filter traffic.
 */
export const config = {
  matcher: [
    "/v1/manager/:path*",
    "/v1/employees/:path*",
    "/v1/auth/:path*",
    "/api/protected/:path*",
  ],
};
