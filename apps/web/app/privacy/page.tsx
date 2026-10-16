import type { Metadata } from "next";
import Link from "next/link";

import { PageIntro } from "@/components/page-intro";
import { siteInfoRoutes } from "@/lib/public-routes";

export const metadata: Metadata = {
  alternates: { canonical: siteInfoRoutes.privacy },
  description:
    "What Apolog stores in your browser, what the debate assistant sends to an AI model, and what the site keeps in its database.",
  title: "Privacy",
};

export default function Page() {
  return (
    <>
      <PageIntro
        description="This page describes what the site's code stores and sends when you read, search, or use the debate assistant."
        eyebrow="Privacy"
        title="What Apolog does with your data."
      />
      <div className="page-container">
        <div className="prose-apolog max-w-3xl">
          <p>Last updated 16 October 2026.</p>

          <h2>In short</h2>
          <p>
            You can read and search Apolog without an account. The site runs no
            analytics, advertising, or tracking scripts. It stores a few
            preferences in cookies on your device. The debate assistant sends
            your conversation to an AI model to write a reply, and Apolog does
            not save that conversation.
          </p>

          <h2>Cookies and browser storage</h2>
          <ul>
            <li>
              <code>apolog-text</code> remembers whether you chose the Bible or
              the Quran library. It is set when you use the switch in the header
              and lasts one year.
            </li>
            <li>
              <code>apolog-theme</code> remembers whether you chose the light or
              dark theme. It is set as a cookie and in your browser&apos;s local
              storage when you change the theme, and the cookie lasts one year.
            </li>
            <li>
              <code>apolog-session</code> holds a random, signed identifier that
              is not linked to your name or any account. It is set when you send
              a message to the debate assistant, lasts 30 days, and is used only
              for rate limiting. Scripts in the page cannot read it.
            </li>
            <li>
              If you sign in, Convex Auth, the sign-in service, sets cookies
              whose names contain <code>__convexAuthJWT</code> and{" "}
              <code>__convexAuthRefreshToken</code> to keep you signed in.
            </li>
          </ul>

          <h2>Search</h2>
          <p>
            When you search, your search text goes to the Apolog server and its
            database to find matching articles. Apolog does not save your
            searches in its database.
          </p>

          <h2>The debate assistant</h2>
          <p>
            When you send a message, your browser sends the whole conversation
            so far, up to 24 messages and 16,000 characters, along with the
            library you chose. The server searches the published library with
            your latest message. It then sends your conversation, the titles and
            summaries of matching articles, and its own instructions to an AI
            model through the Vercel AI Gateway. The gateway and the model
            provider receive your messages so the model can write the reply.
          </p>
          <p>
            The conversation exists only in your open browser tab. Apolog does
            not write it to its database, and reloading the page clears it. Do
            not type personal details into the assistant that you would not want
            an AI provider to receive.
          </p>

          <h2>Rate limiting</h2>
          <p>
            To limit abuse, the debate assistant allows 12 messages per
            10-minute window. To count them, the server combines your{" "}
            <code>apolog-session</code> identifier, your IP address, and the
            current date, and turns them into a keyed SHA-256 hash using a
            secret only the server holds. The database stores only that hash, a
            message count, and timestamps. It never stores your IP address. The
            hash changes every day, and an hourly job deletes records once their
            window has expired.
          </p>

          <h2>Accounts</h2>
          <p>
            Sign-in exists for the people who edit the library. You do not need
            an account to read it. If you create one, the database stores your
            email address in lowercase, a hash of your password rather than the
            password itself, your account role, and records of your sign-in
            sessions.
          </p>

          <h2>Hosting</h2>
          <p>
            The website runs on Vercel, and its database runs on Convex. Their
            servers process your requests in order to deliver the site.
          </p>

          <h2>Questions</h2>
          <p>
            To ask about this page or how the site handles your data, use the
            channel on the{" "}
            <Link href={siteInfoRoutes.contact}>contact page</Link>.
          </p>
        </div>
      </div>
    </>
  );
}
