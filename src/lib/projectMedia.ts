/**
 * Dynamic project media loader using Vite's import.meta.glob
 * This allows us to load all images from a project's folder without manual listing.
 */

// Import all images from src/assets/projects eagerly
const projectMedia = import.meta.glob('/src/assets/projects/**/*.{png,jpg,jpeg,webp,gif}', { eager: true });

export interface ProjectImage {
  src: string;
  caption: string;
}

/**
 * Gets all images for a specific project based on its ID.
 * Folder structure: src/assets/projects/[projectId]/*.{png,jpg,etc}
 */
export function getProjectMedia(projectId: string): ProjectImage[] {
  const prefix = `/src/assets/projects/${projectId}/`;
  
  return Object.entries(projectMedia)
    .filter(([path]) => path.includes(prefix))
    .map(([path, module]) => {
      // Get filename without extension and replace underscores/dashes with spaces
      const filename = path.split('/').pop()?.split('.')[0] || '';
      
      // Clean up the filename to create a readable caption
      const caption = filename
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, (l) => l.toUpperCase());

      return {
        src: (module as any).default,
        caption
      };
    });
}
