export interface MediaDTO {
  id: number;
  title: string;
  url: string;
  thumbnail: string | null;
  media_type: string;
}

export interface EntryItem {
  id: string;
  label: string;
  imageUrl: string;
}

export function mapMediaToEntry(dto: MediaDTO): EntryItem {
  // Use thumbnail if available, otherwise fallback to full URL, then a placeholder
  let imageUrl = "https://picsum.photos/200/300";
  
  try {
    const rawUrl = dto.thumbnail || dto.url;
    if (rawUrl) {
      // Basic URL validation
      new URL(rawUrl);
      imageUrl = rawUrl;
    }
  } catch {
    console.warn(`Invalid URL for entry ${dto.id}, using placeholder.`);
  }

  return {
    id: String(dto.id),
    label: dto.title || "Untitled Entry",
    imageUrl,
  };
}
