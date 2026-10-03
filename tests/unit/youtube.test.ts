import { describe, it, expect } from "vitest";
import { toYouTubeEmbed } from "@/lib/youtube";

const EMBED = "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ";

describe("YouTube link parser", () => {
  it("handles normal watch links", () => {
    expect(toYouTubeEmbed("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe(EMBED);
  });

  it("handles short youtu.be links", () => {
    expect(toYouTubeEmbed("https://youtu.be/dQw4w9WgXcQ")).toBe(EMBED);
  });

  it("handles Shorts links", () => {
    expect(toYouTubeEmbed("https://youtube.com/shorts/dQw4w9WgXcQ")).toBe(EMBED);
  });

  it("rejects non-YouTube links", () => {
    expect(toYouTubeEmbed("https://vimeo.com/12345")).toBeNull();
  });

  it("rejects empty or broken input", () => {
    expect(toYouTubeEmbed("")).toBeNull();
    expect(toYouTubeEmbed(null)).toBeNull();
    expect(toYouTubeEmbed("not a link")).toBeNull();
  });
});
