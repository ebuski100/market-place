import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

type GitHubUser = {
  id: number;
  login: string;
  name: string | null;
  avatar_url: string;
};

type GitHubEmail = {
  email: string;
  primary: boolean;
  verified: boolean;
};

export async function GET(request: Request) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  try {
    // ---------------------------------------
    // 1. Get OAuth parameters
    // ---------------------------------------

    const { searchParams } = new URL(request.url);

    const code = searchParams.get("code");
    const returnedState = searchParams.get("state");
    const oauthError = searchParams.get("error");

    // ---------------------------------------
    // 2. Handle GitHub OAuth errors
    // ---------------------------------------

    if (oauthError) {
      console.error("GitHub OAuth error:", oauthError);

      return NextResponse.redirect(`${appUrl}/login?error=github`);
    }

    // ---------------------------------------
    // 3. Make sure code and state exist
    // ---------------------------------------

    if (!code || !returnedState) {
      return NextResponse.redirect(`${appUrl}/login?error=github`);
    }

    // ---------------------------------------
    // 4. Get stored OAuth state
    // ---------------------------------------

    const cookieStore = await cookies();

    const storedState = cookieStore.get("github_oauth_state")?.value;

    const codeVerifier = cookieStore.get("github_oauth_code_verifier")?.value;

    if (!storedState || storedState !== returnedState || !codeVerifier) {
      console.error("GitHub OAuth state or PKCE verification failed");

      return NextResponse.redirect(`${appUrl}/login?error=github`);
    }

    cookieStore.delete("github_oauth_state");
    cookieStore.delete("github_oauth_code_verifier");
    // ---------------------------------------
    // 5. Verify OAuth state
    // ---------------------------------------

    if (!storedState || storedState !== returnedState) {
      console.error("GitHub OAuth state mismatch");

      return NextResponse.redirect(`${appUrl}/login?error=github`);
    }

    // ---------------------------------------
    // 6. State has been successfully verified
    //    Delete it immediately.
    // ---------------------------------------

    cookieStore.delete("github_oauth_state");

    // ---------------------------------------
    // 7. Get GitHub credentials
    // ---------------------------------------

    const clientId = process.env.GITHUB_CLIENT_ID;

    const clientSecret = process.env.GITHUB_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error("GitHub OAuth credentials are missing");
    }

    // ---------------------------------------
    // 8. Exchange code for access token
    // ---------------------------------------

    const tokenResponse = await fetch(
      "https://github.com/login/oauth/access_token",
      {
        method: "POST",

        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          code,
          redirect_uri: `${appUrl}/api/auth/github/callback`,
          code_verifier: codeVerifier,
        }),
      },
    );

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok || !tokenData.access_token) {
      console.error("GitHub token exchange failed:", tokenData);

      return NextResponse.redirect(`${appUrl}/login?error=github`);
    }

    const accessToken = tokenData.access_token;

    // ---------------------------------------
    // 9. Get GitHub user
    // ---------------------------------------

    const githubUserResponse = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github+json",
      },

      cache: "no-store",
    });

    if (!githubUserResponse.ok) {
      throw new Error("Failed to fetch GitHub user");
    }

    const githubUser: GitHubUser = await githubUserResponse.json();

    // ---------------------------------------
    // 10. Get GitHub emails
    // ---------------------------------------

    const emailResponse = await fetch("https://api.github.com/user/emails", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github+json",
      },

      cache: "no-store",
    });

    if (!emailResponse.ok) {
      throw new Error("Failed to fetch GitHub emails");
    }

    const emails: GitHubEmail[] = await emailResponse.json();

    // ---------------------------------------
    // 11. Find verified email
    // ---------------------------------------

    const primaryEmail =
      emails.find((email) => email.primary && email.verified)?.email ??
      emails.find((email) => email.verified)?.email;

    if (!primaryEmail) {
      return NextResponse.redirect(`${appUrl}/login?error=no-email`);
    }

    const normalizedEmail = primaryEmail.toLowerCase().trim();

    // ---------------------------------------
    // 12. Find existing GitHub account
    // ---------------------------------------

    const existingAccount = await prisma.account.findUnique({
      where: {
        provider_providerAccountId: {
          provider: "github",

          providerAccountId: String(githubUser.id),
        },
      },

      include: {
        user: true,
      },
    });

    let user;

    // ---------------------------------------
    // 13. Existing GitHub account
    // ---------------------------------------

    if (existingAccount) {
      user = existingAccount.user;
    }

    // ---------------------------------------
    // 14. No GitHub account yet
    // ---------------------------------------
    else {
      // Check whether an account with this
      // email already exists.

      const existingUser = await prisma.user.findUnique({
        where: {
          email: normalizedEmail,
        },
      });

      // -------------------------------------
      // Existing password account
      // -------------------------------------

      if (existingUser) {
        user = existingUser;

        // Link GitHub to existing user.

        const existingLinkedAccount = await prisma.account.findUnique({
          where: {
            provider_providerAccountId: {
              provider: "github",

              providerAccountId: String(githubUser.id),
            },
          },
        });

        if (!existingLinkedAccount) {
          await prisma.account.create({
            data: {
              userId: user.id,

              provider: "github",

              providerAccountId: String(githubUser.id),
            },
          });
        }
      }

      // -------------------------------------
      // Completely new user
      // -------------------------------------
      else {
        user = await prisma.user.create({
          data: {
            name: githubUser.name ?? githubUser.login,

            email: normalizedEmail,

            password: null,
          },
        });

        await prisma.account.create({
          data: {
            userId: user.id,

            provider: "github",

            providerAccountId: String(githubUser.id),
          },
        });
      }
    }

    // ---------------------------------------
    // 15. Check account status
    // ---------------------------------------

    if (!user.isActive) {
      return NextResponse.redirect(`${appUrl}/login?error=deactivated`);
    }

    // ---------------------------------------
    // 16. Create application session
    // ---------------------------------------

    const sessionId = randomBytes(32).toString("hex");

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await prisma.session.create({
      data: {
        id: sessionId,

        userId: user.id,

        expiresAt,
      },
    });

    // ---------------------------------------
    // 17. Set secure session cookie
    // ---------------------------------------

    cookieStore.set("sessionId", sessionId, {
      httpOnly: true,

      secure: process.env.NODE_ENV === "production",

      sameSite: "lax",

      expires: expiresAt,

      path: "/",
    });

    // ---------------------------------------
    // 18. Redirect home
    // ---------------------------------------

    return NextResponse.redirect(`${appUrl}/auth/oauth-success`);
    // } catch (error) {
    //   console.error("GitHub OAuth callback error:", error);

    //   return NextResponse.redirect(`${appUrl}/login?error=github`);
    // }
  } catch (error) {
    console.error("GitHub OAuth callback error:", error);

    const message =
      error instanceof Error ? error.message : "Unknown GitHub OAuth error";

    return NextResponse.redirect(
      `${appUrl}/login?error=github&reason=${encodeURIComponent(message)}`,
    );
  }
}
