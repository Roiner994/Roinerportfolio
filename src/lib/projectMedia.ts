/**
 * Project media loader using Vite's import.meta.glob.
 * Images live in src/assets/projects/[projectId]/*.{png,jpg,...}.
 *
 * Only the URLs are resolved eagerly (`query: "?url"`); the image bytes are
 * fetched by the browser when an image is actually shown (or preloaded as a
 * neighbour of the visible one), never all at once.
 */
const projectMedia = import.meta.glob<string>(
  "/src/assets/projects/**/*.{png,jpg,jpeg,webp,gif}",
  { eager: true, query: "?url", import: "default" },
);

export interface ProjectImage {
  src: string;
  caption: string;
}

export interface ProjectMediaCaption {
  file: string;
  caption: string;
}

/** File name with any whitespace (incl. macOS narrow no-break spaces) as "_". */
export function normalizeMediaFileName(name: string): string {
  return name.replace(/\s+/g, "_");
}

/**
 * Images for a project. With `captions`, returns exactly those files, in that
 * order, with their curated captions (files not listed are left out).
 * Without it, falls back to every image in the folder, uncaptioned.
 */
export function getProjectMedia(
  projectId: string,
  captions?: ProjectMediaCaption[],
): ProjectImage[] {
  const prefix = `/src/assets/projects/${projectId}/`;
  const byName = new Map<string, string>();
  for (const [path, url] of Object.entries(projectMedia)) {
    if (!path.startsWith(prefix)) continue;
    byName.set(normalizeMediaFileName(path.slice(prefix.length)), url as string);
  }

  if (captions && captions.length > 0) {
    return captions.flatMap(({ file, caption }) => {
      const src = byName.get(normalizeMediaFileName(file));
      return src ? [{ src, caption }] : [];
    });
  }

  return [...byName.values()].map((src) => ({ src, caption: "" }));
}
