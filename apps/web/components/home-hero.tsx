import { corpusLabel } from "@apolog/shared";
import type { CorpusKey } from "@apolog/shared";
import Image, { getImageProps } from "next/image";
import Link from "next/link";

export function HomeHero({ corpusKey }: { corpusKey: CorpusKey }) {
  const mobile = getImageProps({
    alt: "",
    src: "/images/exalt-hero-sky-mobile.webp",
    fill: true,
    sizes: "max(100vw, 384px, 54svh)",
  }).props;
  const desktop = getImageProps({
    alt: "",
    src: "/images/exalt-hero-sky.webp",
    fill: true,
    sizes: "max(100vw, 1280px, 178svh)",
  }).props;
  return (
    <section className="landing-hero" aria-labelledby="hero-title">
      <link
        rel="preload"
        as="image"
        fetchPriority="high"
        media="(max-width: 480px)"
        imageSrcSet={mobile.srcSet}
        imageSizes={mobile.sizes}
      />
      <link
        rel="preload"
        as="image"
        fetchPriority="high"
        media="(min-width: 481px)"
        imageSrcSet={desktop.srcSet}
        imageSizes={desktop.sizes}
      />
      <picture>
        <source
          media="(max-width: 480px)"
          srcSet={mobile.srcSet}
          sizes={mobile.sizes}
        />
        <Image
          alt=""
          className="landing-landscape"
          src="/images/exalt-hero-sky.webp"
          fill
          loading="eager"
          fetchPriority="high"
          sizes={desktop.sizes}
        />
      </picture>
      <div className="landing-hero-content">
        <p className="landing-kicker">A CLOSER LOOK AT THE BIBLE &amp; QURAN</p>
        <h1 id="hero-title">
          You have questions.
          <br />
          Take a closer look.
        </h1>
        <p className="landing-hero-description">
          Explore the passages, test the claims, and follow the evidence. A
          research library for understanding what you believe, and why.
        </p>
        <div className="landing-actions">
          <Link
            className="landing-button landing-button-primary"
            href="#explore"
          >
            Explore the library
          </Link>
          <Link
            className="landing-button landing-button-glass"
            href={`/debate?text=${corpusKey}`}
          >
            Start a conversation
          </Link>
        </div>
      </div>
      <div className="landing-hero-bottom">
        <span className="landing-kicker">
          CURRENTLY EXPLORING THE {corpusLabel(corpusKey).toUpperCase()}
        </span>
        <Link href="#explore">
          Follow your curiosity <span aria-hidden="true">↓</span>
        </Link>
      </div>
    </section>
  );
}
