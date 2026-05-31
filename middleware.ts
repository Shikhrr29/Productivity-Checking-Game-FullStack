import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getSupabaseConfig } from "@/lib/supabase/env";

const protectedPrefixes = ["/dashboard", "/check-in", "/history", "/billing", "/settings", "/onboarding"];

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });
  type CookieToSet = { name: string; value: string; options?: Parameters<typeof response.cookies.set>[2] };
  const needsAuth = protectedPrefixes.some((prefix) => request.nextUrl.pathname.startsWith(prefix));

  if (!needsAuth) return response;

  const { url: supabaseUrl, anonKey, isConfigured } = getSupabaseConfig();
  if (!isConfigured) {
    const url = request.nextUrl.clone();
    url.pathname = "/setup";
    url.searchParams.set("missing", "supabase");
    return NextResponse.redirect(url);
  }

  const supabase = createServerClient(
    supabaseUrl!,
    anonKey!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        }
      }
    }
  );

  const { data } = await supabase.auth.getUser();
  if (!data.user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ["/dashboard/:path*", "/check-in/:path*", "/history/:path*", "/billing/:path*", "/settings/:path*", "/onboarding/:path*"]
};
