const articlePath = /^\/articles\/(?<slug>[^/]+)(?<!\.md)$/u;

export function articleSlugFromPathname(pathname: string) {
  const encoded = articlePath.exec(pathname)?.groups?.slug;
  if (!encoded) {
    return null;
  }
  try {
    return decodeURIComponent(encoded);
  } catch {
    return null;
  }
}
