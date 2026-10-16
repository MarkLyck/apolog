import type { CorpusKey } from "@apolog/shared";
import * as Effect from "effect/Effect";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { FiArrowRight, FiPlus } from "react-icons/fi";

import { ArticleCard } from "@/components/article-card";
import { ContradictionCard } from "@/components/contradiction-card";
import { HomeHero } from "@/components/home-hero";
import { corpusPageMetadata, getPageCorpus } from "@/lib/corpus";
import type { PageSearchParams } from "@/lib/corpus";
import { getFeatured } from "@/lib/data";
import { collections, questions, steps } from "@/lib/home-content";

export const generateMetadata = corpusPageMetadata("/", {
  description:
    "Examine Biblical and Quranic claims. Compare passages, investigate the evidence, and work through the arguments with Apolog.",
  title: "Beliefs deserve a closer look",
});

async function FeaturedContradictions({
  featuredPromise,
  corpusKey,
}: {
  featuredPromise: Promise<Effect.Success<ReturnType<typeof getFeatured>>>;
  corpusKey: CorpusKey;
}) {
  const featured = await featuredPromise;
  return featured.contradictions.length > 0 ? (
    <section className="landing-section" aria-labelledby="featured-title">
      <div className="landing-section-heading">
        <p className="landing-kicker">A CLOSER LOOK</p>
        <h2 id="featured-title">Two accounts. Read both sides.</h2>
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
      <Link
        className="landing-text-link"
        href={`/contradictions?text=${corpusKey}`}
      >
        All contradictions <FiArrowRight aria-hidden="true" />
      </Link>
    </section>
  ) : null;
}

async function FeaturedArticles({
  featuredPromise,
  corpusKey,
}: {
  featuredPromise: Promise<Effect.Success<ReturnType<typeof getFeatured>>>;
  corpusKey: CorpusKey;
}) {
  const featured = await featuredPromise;
  return featured.articles.length > 0 ? (
    <section className="landing-section" aria-labelledby="evidence-title">
      <div className="landing-section-heading">
        <p className="landing-kicker">FOLLOW THE SOURCES</p>
        <h2 id="evidence-title">Evidence before argument.</h2>
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
      <Link className="landing-text-link" href={`/evidence?text=${corpusKey}`}>
        Explore the evidence <FiArrowRight aria-hidden="true" />
      </Link>
    </section>
  ) : null;
}

function FeaturedLoading({ title }: { title: string }) {
  return (
    <section className="landing-section" aria-busy="true">
      <div className="landing-section-heading">
        <p className="landing-kicker">
          <output>Loading the library…</output>
        </p>
        <h2>{title}</h2>
      </div>
      <div className="landing-article-grid" aria-hidden="true">
        {[0, 1, 2].map((item) => (
          <div className="skeleton h-80" key={item} />
        ))}
      </div>
    </section>
  );
}

export default async function Home({
  searchParams,
}: {
  searchParams: PageSearchParams;
}) {
  const corpusKey = await getPageCorpus(searchParams);
  const featured = Effect.runPromise(getFeatured(corpusKey));

  return (
    <div className="landing-page">
      <HomeHero corpusKey={corpusKey} />

      <section className="landing-statement" aria-label="Our approach">
        <p>
          A belief worth holding is worth examining. Read the original passages,
          question the claims, and consider the strongest arguments.{" "}
          <span>Make up your own mind.</span>
        </p>
      </section>

      <section
        className="landing-section"
        id="explore"
        aria-labelledby="explore-title"
      >
        <div className="landing-section-heading">
          <p className="landing-kicker">THE LIBRARY</p>
          <h2 id="explore-title">A place for your harder questions</h2>
        </div>
        <div className="landing-collections">
          {collections.map(({ label, href, description }, index) => (
            <Link
              className="landing-collection"
              href={`${href}?text=${corpusKey}`}
              key={href}
            >
              <span className="landing-number">0{index + 1}</span>
              <h3>{label}</h3>
              <p>{description}</p>
              <FiArrowRight aria-hidden="true" />
            </Link>
          ))}
        </div>
      </section>

      <Suspense
        fallback={<FeaturedLoading title="Two accounts. Read both sides." />}
      >
        <FeaturedContradictions
          featuredPromise={featured}
          corpusKey={corpusKey}
        />
      </Suspense>

      <section
        className="landing-section"
        id="approach"
        aria-labelledby="approach-title"
      >
        <div className="landing-section-heading">
          <p className="landing-kicker">THE APPROACH</p>
          <h2 id="approach-title">
            From a difficult question
            <br />
            to an informed perspective
          </h2>
          <p>
            You do not need to have the answer before you start.
            <br />
            Take the argument one step at a time.
          </p>
        </div>
        <ol className="landing-steps">
          {steps.map(({ title, description }, index) => (
            <li key={title}>
              <span className="landing-number">0{index + 1}</span>
              <h3>{title}</h3>
              <p>{description}</p>
            </li>
          ))}
        </ol>
      </section>

      <Suspense
        fallback={<FeaturedLoading title="Evidence before argument." />}
      >
        <FeaturedArticles featuredPromise={featured} corpusKey={corpusKey} />
      </Suspense>

      <section
        className="landing-section landing-faq"
        id="questions"
        aria-labelledby="questions-title"
      >
        <div>
          <p className="landing-kicker">FAQ</p>
          <h2 id="questions-title">
            Common
            <br />
            questions
          </h2>
        </div>
        <div>
          {questions.map(({ title, answer }) => (
            <details key={title}>
              <summary>
                {title}
                <FiPlus aria-hidden="true" />
              </summary>
              <p>{answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section
        className="landing-invitation"
        aria-labelledby="invitation-title"
      >
        <Image
          alt=""
          src="/images/exalt-hero-sky.webp"
          fill
          sizes="100vw"
          className="landing-invitation-landscape"
        />
        <p className="landing-kicker">LET&apos;S THINK IT THROUGH</p>
        <h2 id="invitation-title">
          Have a question
          <br />
          you keep coming back to?
        </h2>
        <p>
          Bring a claim, a passage, or a doubt.
          <br />
          Explore the arguments and see where the evidence takes you.
        </p>
        <Link
          className="landing-button landing-button-primary"
          href={`/debate?text=${corpusKey}`}
        >
          Start a conversation
        </Link>
      </section>
    </div>
  );
}
