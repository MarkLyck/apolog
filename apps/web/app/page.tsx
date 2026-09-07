import { corpusLabel } from "@apolog/shared";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  FiArrowDown,
  FiArrowRight,
  FiArrowUpRight,
  FiBookOpen,
  FiCompass,
  FiFeather,
  FiGitPullRequest,
  FiMessageCircle,
  FiSearch,
  FiShield,
} from "react-icons/fi";

import { ArticleCard } from "@/components/article-card";
import { ContradictionCard } from "@/components/contradiction-card";
import { getPageCorpus } from "@/lib/corpus";
import type { PageSearchParams } from "@/lib/corpus";
import { getFeatured } from "@/lib/data";

export const metadata: Metadata = {
  description:
    "A little curiosity. A closer look. Explore Biblical and Quranic claims through passages, evidence, and thoughtful analysis.",
  title: "Room for better questions",
};

const collections = [
  {
    description:
      "Put historical and factual claims to the test. See what holds up.",
    href: "/debunked",
    label: "Debunked",
    detail: "Look beyond the claim",
    icon: FiSearch,
  },
  {
    description:
      "Difficult passages deserve an honest look at the ethics behind them.",
    href: "/immoral",
    label: "Immoral",
    detail: "Ask the harder questions",
    icon: FiShield,
  },
  {
    description: "Follow the methods of science, archaeology, and history.",
    href: "/evidence",
    label: "Evidence",
    detail: "Let the sources lead",
    icon: FiCompass,
  },
  {
    description:
      "Talking animals. Strange miracles. Some stories invite a second look.",
    href: "/silly",
    label: "Silly",
    detail: "Keep your curiosity",
    icon: FiFeather,
  },
];

export default async function Home({
  searchParams,
}: {
  searchParams: PageSearchParams;
}) {
  const corpusKey = await getPageCorpus(searchParams);
  const featured = await getFeatured(corpusKey);
  const label = corpusLabel(corpusKey);

  return (
    <div className="landing-page">
      <section className="landing-hero" aria-labelledby="hero-title">
        <Image
          alt=""
          className="landing-landscape"
          src="/images/apolog-mountains.webp"
          fill
          preload
          sizes="100vw"
        />
        <div className="landing-hero-shade" />
        <div className="landing-hero-content">
          <div className="landing-eyebrow">
            <span /> A little curiosity. A closer look.
          </div>
          <h1 id="hero-title">
            Give your questions
            <br />
            <em>room to go deeper.</em>
          </h1>
          <p>
            Explore faith, question the claims, and follow the evidence.
            <br className="landing-desktop-break" /> A source-led library for an
            open mind.
          </p>
          <div className="landing-actions">
            <Link
              className="landing-button landing-button-primary"
              href="#explore"
            >
              Explore the library <FiArrowRight aria-hidden="true" />
            </Link>
            <Link
              className="landing-button landing-button-glass"
              href={`/evidence?text=${corpusKey}`}
            >
              <FiCompass aria-hidden="true" /> Follow the evidence
            </Link>
          </div>
          <div className="landing-hero-note">
            <FiBookOpen aria-hidden="true" /> Two texts. Many perspectives. Your
            conclusions.
          </div>
        </div>
        <div className="landing-hero-bottom">
          <span>AN OPEN INVITATION TO THINK</span>
          <a href="#explore" aria-label="Scroll to explore the library">
            <FiArrowDown aria-hidden="true" />
          </a>
          <span>
            <span className="landing-status-dot" /> EXPLORING THE{" "}
            {label.toUpperCase()}
          </span>
        </div>
      </section>

      <div className="landing-method-bar">
        <span>Inquiry, with a little more care.</span>
        <span>
          <FiBookOpen aria-hidden="true" /> Sources you can trace
        </span>
        <span>
          <FiGitPullRequest aria-hidden="true" /> Context kept intact
        </span>
        <span>
          <FiMessageCircle aria-hidden="true" /> Room for uncertainty
        </span>
      </div>

      <div className="landing-library">
        <section
          className="landing-section"
          id="explore"
          aria-labelledby="explore-title"
        >
          <div className="landing-section-heading">
            <div>
              <p className="landing-kicker">THE LIBRARY</p>
              <h2 id="explore-title">
                Where does your
                <br />
                <em>curiosity take you?</em>
              </h2>
            </div>
            <p>
              Start with a question. Read the passage.
              <br />
              Find a perspective you haven’t considered.
            </p>
          </div>
          <div className="landing-collections">
            <Link
              className="landing-collection landing-collection-featured"
              href={`/contradictions?text=${corpusKey}`}
            >
              <div className="landing-collection-top">
                <FiGitPullRequest aria-hidden="true" />
                <FiArrowUpRight aria-hidden="true" />
              </div>
              <div>
                <span className="landing-kicker">
                  TWO ACCOUNTS. ONE QUESTION.
                </span>
                <h3>Contradictions</h3>
                <p>
                  When the passages don’t agree, put them side by side. Examine
                  the context and weigh the strongest responses.
                </p>
                <span className="landing-collection-link">
                  Compare the accounts <FiArrowRight aria-hidden="true" />
                </span>
              </div>
            </Link>
            {collections.map(
              ({ href, label: title, description, detail, icon: Icon }) => (
                <Link
                  className="landing-collection"
                  href={`${href}?text=${corpusKey}`}
                  key={href}
                >
                  <div className="landing-collection-top">
                    <Icon aria-hidden="true" />
                    <FiArrowUpRight aria-hidden="true" />
                  </div>
                  <div>
                    <h3>{title}</h3>
                    <p>{description}</p>
                    <span className="landing-collection-detail">{detail}</span>
                  </div>
                </Link>
              )
            )}
          </div>
        </section>
      </div>

      {featured.contradictions.length > 0 ? (
        <section
          className="landing-section landing-featured"
          aria-labelledby="featured-title"
        >
          <div className="landing-section-heading">
            <div>
              <p className="landing-kicker">A CLOSER LOOK</p>
              <h2 id="featured-title">
                Read both sides.
                <br />
                <em>Think for yourself.</em>
              </h2>
            </div>
            <Link
              className="landing-text-link"
              href={`/contradictions?text=${corpusKey}`}
            >
              All contradictions <FiArrowUpRight aria-hidden="true" />
            </Link>
          </div>
          <div className="landing-article-grid">
            {featured.contradictions.map((article) => (
              <ContradictionCard
                article={article}
                corpusKey={corpusKey}
                key={article.slug}
              />
            ))}
          </div>
        </section>
      ) : null}

      {featured.articles.length > 0 ? (
        <section
          className="landing-section landing-evidence"
          aria-labelledby="evidence-title"
        >
          <div className="landing-section-heading">
            <div>
              <p className="landing-kicker">FOLLOW THE THREAD</p>
              <h2 id="evidence-title">Evidence before argument.</h2>
            </div>
            <Link
              className="landing-text-link"
              href={`/evidence?text=${corpusKey}`}
            >
              Explore the evidence <FiArrowUpRight aria-hidden="true" />
            </Link>
          </div>
          <div className="landing-article-grid">
            {featured.articles.map((article) => (
              <ArticleCard
                article={article}
                corpusKey={corpusKey}
                key={article.slug}
              />
            ))}
          </div>
        </section>
      ) : null}

      <section
        className="landing-invitation"
        aria-labelledby="invitation-title"
      >
        <FiMessageCircle
          className="landing-invitation-icon"
          aria-hidden="true"
        />
        <p className="landing-kicker">THINK IT THROUGH</p>
        <h2 id="invitation-title">
          A good question
          <br />
          is only <em>the beginning.</em>
        </h2>
        <p>
          Bring a claim. Explore the arguments.
          <br />
          Build a response with sources you can return to.
        </p>
        <Link
          className="landing-button landing-button-primary"
          href={`/debate?text=${corpusKey}`}
        >
          Start a conversation <FiArrowUpRight aria-hidden="true" />
        </Link>
      </section>
    </div>
  );
}
