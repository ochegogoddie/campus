function rewritePath(pathname: string) {
  if (!pathname.startsWith("/uploads/")) {
    return pathname;
  }

  return `/api/uploads/${pathname.slice("/uploads/".length)}`;
}

export function resolveUploadUrl(url?: string | null) {
  if (!url) return undefined;

  if (url.startsWith("/")) {
    return rewritePath(url);
  }

  try {
    const parsed = new URL(url);
    parsed.pathname = rewritePath(parsed.pathname);
    return parsed.toString();
  } catch {
    return url;
  }
}

