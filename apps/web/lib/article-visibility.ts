import type { ArticleType, CorpusKey } from "@apolog/shared";

export function getArticleCorpusRedirect(
  article: { corpusKeys: readonly CorpusKey[] },
  corpusKey: CorpusKey,
  type: ArticleType
) {
  return article.corpusKeys.includes(corpusKey)
    ? null
    : `/${type}?text=${corpusKey}`;
}
