import type { Metadata } from "next";

import { operatorContactUrl, privacyPolicyUpdated } from "@/lib/privacy";

export const metadata: Metadata = {
  description:
    "What personal data Apolog processes, why, who receives it, how long it is kept, and the rights you have over it.",
  title: "Privacy policy",
};

const updatedLabel = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "long",
  timeZone: "UTC",
}).format(new Date(privacyPolicyUpdated));

export default function PrivacyPage() {
  return (
    <article className="article-reader page-container">
      <header className="reader-header">
        <div className="reader-heading">
          <span className="text-xs font-semibold text-[var(--accent-strong)]">
            Policy
          </span>
          <h1 className="mt-4 max-w-4xl text-4xl leading-[1.08] text-pretty sm:text-5xl lg:text-6xl">
            Privacy policy
          </h1>
          <p className="mt-4 max-w-3xl text-lg leading-relaxed text-[var(--muted)] sm:mt-5 sm:text-xl">
            You can read Apolog without an account. We run no analytics,
            advertising or third-party trackers, and we do not sell or share
            personal information. This page lists the personal data the site
            does process and why.
          </p>
        </div>
      </header>
      <div className="max-w-3xl pt-8 sm:pt-10">
        <p className="mb-8 text-sm font-medium text-[var(--muted)]">
          Last updated{" "}
          <time dateTime={privacyPolicyUpdated}>{updatedLabel}</time>
        </p>
        <div className="prose-apolog">
          <h2>Who is responsible</h2>
          <p>
            Apolog is run by the owner of the Apolog source repository, who is
            the controller of the personal data described here. Send privacy
            questions and requests to the owner through{" "}
            <a href={operatorContactUrl}>{operatorContactUrl}</a>. Do not put
            personal data in a public issue. We have not appointed a Data
            Protection Officer.
          </p>

          <h2>What we collect and why</h2>
          <ul>
            <li>
              <strong>Page requests.</strong> To deliver pages, our hosting
              providers receive your IP address, browser user agent and the URL
              you request, including any search terms you type, because search
              sends them in the URL. The Apolog code does not write its own
              request logs.
            </li>
            <li>
              <strong>Reading preferences.</strong> If you choose the Bible or
              Quran library, or switch between light and dark themes, your
              browser stores that choice so the next page renders the same way.
            </li>
            <li>
              <strong>Debate assistant messages.</strong> When you send a
              message, our server forwards the conversation in that browser tab
              (up to 24 messages and 16,000 characters), the active library and
              summaries of matching Apolog articles to an AI model so it can
              write a reply. We do not store the conversation. It stays in your
              browser tab and is gone when you reload or close it. Do not enter
              personal data you do not want an AI provider to process.
            </li>
            <li>
              <strong>Abuse protection for the debate assistant.</strong> The
              assistant accepts 12 messages per visitor every 10 minutes. To
              count them, we combine a random identifier from the{" "}
              <code>apolog-session</code> cookie with your IP address and hash
              the pair with a secret key and the current date. We store only
              that hash and a counter. We never store your IP address itself.
            </li>
            <li>
              <strong>Accounts.</strong> Accounts are optional and are used to
              sign in, for example to edit articles. We store your email
              address, a salted hash of your password (never the password), your
              role, your sign-in sessions and a count of failed sign-in attempts
              used to slow down password guessing.
            </li>
          </ul>

          <h2>Lawful basis</h2>
          <p>
            Where the GDPR or UK GDPR applies, we rely on these bases under
            Article 6:
          </p>
          <ul>
            <li>
              Accounts and debate assistant replies are a service you ask for,
              so we process that data to perform it (Article 6(1)(b)).
            </li>
            <li>
              Page delivery, the debate rate limit and failed sign-in counters
              rest on our legitimate interest in keeping the site available and
              protecting it from abuse (Article 6(1)(f)).
            </li>
            <li>
              Reading preferences are stored because you asked for them by
              choosing a library or theme.
            </li>
          </ul>

          <h2>Recipients and processors</h2>
          <p>
            We share personal data only with the processors that run the site.
            We do not sell it, share it for advertising or give it to data
            brokers.
          </p>
          <ul>
            <li>
              <strong>Vercel</strong> hosts the website and runs its server
              code. Its AI Gateway relays debate assistant messages to the model
              provider.
            </li>
            <li>
              <strong>Convex</strong> hosts the database and sign-in service
              that hold accounts, sessions and rate-limit counters.
            </li>
            <li>
              <strong>The AI model provider</strong> selected through Vercel AI
              Gateway receives debate assistant messages. Unless the operator
              configures another model, this is xAI (Grok).
            </li>
          </ul>
          <p>
            These providers are based in the United States, so your data may be
            processed outside the EU and UK. Those transfers rely on the
            safeguards in each provider&apos;s data processing terms, such as
            Standard Contractual Clauses.
          </p>

          <h2>Retention</h2>
          <ul>
            <li>
              Rate-limit hashes and counters expire 10 minutes after the window
              opens. A cleanup job deletes expired records every hour.
            </li>
            <li>
              Debate conversations are not stored by Apolog. Vercel and the
              model provider retain what they receive under their own terms.
            </li>
            <li>
              Sign-in sessions expire after 30 days. Account records are kept
              until you ask us to delete your account.
            </li>
            <li>
              Hosting request logs are kept by Vercel and Convex under their own
              log retention periods.
            </li>
            <li>
              Cookies last for the periods listed below, or until you clear
              them.
            </li>
          </ul>

          <h2>Cookies and browser storage</h2>
          <p>
            Every cookie Apolog sets supports a feature you use. None are for
            analytics or advertising, so the site does not show a consent
            banner.
          </p>
          <ul>
            <li>
              <code>__Host-__convexAuthJWT</code> and{" "}
              <code>__Host-__convexAuthRefreshToken</code> are set when you sign
              in and keep you signed in. Your browser cannot read them from
              scripts, and they are sent only over HTTPS.
            </li>
            <li>
              <code>apolog-session</code> is set when you send a debate
              assistant message. It holds a random identifier used only for the
              rate limit above, and lasts 30 days.
            </li>
            <li>
              <code>apolog-text</code> is set when you choose the Bible or Quran
              library and lasts one year.
            </li>
            <li>
              <code>apolog-theme</code> is set when you change the theme. It
              lasts one year as a cookie, with a copy in local storage until you
              clear it.
            </li>
          </ul>

          <h2>Global Privacy Control</h2>
          <p>
            We honour Global Privacy Control (GPC). Apolog does not sell or
            share personal information and loads no advertising or tracking
            scripts, so every visitor already gets the opted-out experience. A
            browser that sends the <code>Sec-GPC: 1</code> signal changes
            nothing because there is nothing left to switch off. The same
            statement is published for tools at{" "}
            <code>/.well-known/gpc.json</code>.
          </p>

          <h2>Your rights</h2>
          <p>
            Depending on where you live, you have the right to access the
            personal data we hold about you, to have it corrected or erased, to
            restrict or object to its processing, and to receive it in a
            portable format. Californian residents also have the right to know,
            delete and correct their data and to opt out of its sale or sharing,
            which we do not do. To use any of these rights, contact the owner at
            the address above. You can also lodge a complaint with your local
            data protection authority, such as the ICO in the UK or the
            supervisory authority in your EU country.
          </p>
          <p>
            You can remove reading preferences and the debate session identifier
            yourself by clearing this site&apos;s cookies and storage in your
            browser.
          </p>

          <h2>Changes to this policy</h2>
          <p>
            When this policy changes, we update the date at the top of the page.
          </p>
        </div>
      </div>
    </article>
  );
}
