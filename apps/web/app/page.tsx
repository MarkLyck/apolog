import type { CorpusKey } from "@apolog/shared";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { FiArrowUpRight, FiPlus } from "react-icons/fi";

import { ArticleCard } from "@/components/article-card";
import { ContradictionCard } from "@/components/contradiction-card";
import { HomeHero } from "@/components/home-hero";
import { getPageCorpus } from "@/lib/corpus";
import type { PageSearchParams } from "@/lib/corpus";
import { getFeatured } from "@/lib/data";

export const metadata: Metadata = {
  description:
    "Examine Biblical and Quranic claims. Compare passages, investigate the evidence, and work through the arguments with Apolog.",
  title: "Beliefs deserve a closer look",
};

const collections = [
  {
    label: "Contradictions",
    href: "/contradictions",
    description:
      "Put conflicting passages side by side. Read the context and weigh the responses.",
  },
  {
    label: "Debunked",
    href: "/debunked",
    description:
      "Investigate historical and factual claims, and the evidence used to defend them.",
  },
  {
    label: "Immoral",
    href: "/immoral",
    description:
      "Examine difficult teachings and the moral questions they raise.",
  },
  {
    label: "Evidence",
    href: "/evidence",
    description:
      "Explore what science, archaeology, and history can tell us about the texts.",
  },
  {
    label: "Silly",
    href: "/silly",
    description:
      "Talking animals, strange miracles, and other stories worth a second look.",
  },
];

const steps = [
  {
    title: "Read",
    description:
      "Start with the passage itself. Check what comes before and after it.",
  },
  {
    title: "Compare",
    description:
      "Set related accounts alongside each other. Look for agreement and tension.",
  },
  {
    title: "Investigate",
    description:
      "Follow the citations. Consider the evidence and the strongest counterarguments.",
  },
  {
    title: "Discuss",
    description:
      "Bring your questions to the debate assistant and work through a response.",
  },
];

const questions = [
  {
    title: "What is Apolog?",
    answer:
      "Apolog is a research library for examining factual and moral claims in the Bible and Quran. It brings passages, analysis, and sources together so you can evaluate an argument for yourself.",
  },
  {
    title: "Can I explore both the Bible and Quran?",
    answer:
      "Yes. Use the Bible and Quran switch in the header. Your selection carries through the collections, search, and debate assistant.",
  },
  {
    title: "Where should I start?",
    answer:
      "Pick a collection that interests you. Contradictions puts accounts side by side; Evidence focuses on scientific, historical, and archaeological claims.",
  },
  {
    title: "Should I treat every article as a final answer?",
    answer:
      "No. Read the cited sources and check quotations in context. This is a developing library, and some demonstration content still needs editorial verification.",
  },
  {
    title: "How does the debate assistant work?",
    answer:
      "Bring a question or claim to the assistant. It uses the library to help you explore arguments and prepare a response. Check its citations and reasoning, as AI can make mistakes.",
  },
];

async function FeaturedContradictions({
  featuredPromise,
  corpusKey,
}: {
  featuredPromise: ReturnType<typeof getFeatured>;
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
        All contradictions <FiArrowUpRight aria-hidden="true" />
      </Link>
    </section>
  ) : null;
}

async function FeaturedArticles({
  featuredPromise,
  corpusKey,
}: {
  featuredPromise: ReturnType<typeof getFeatured>;
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
        Explore the evidence <FiArrowUpRight aria-hidden="true" />
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
  const featured = getFeatured(corpusKey);

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
              <FiArrowUpRight aria-hidden="true" />
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
