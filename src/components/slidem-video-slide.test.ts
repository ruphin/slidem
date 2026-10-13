import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { SlidemVideoSlide } from "./slidem-video-slide.js";

beforeAll(() => {
  customElements.define("test-video-slide", SlidemVideoSlide);
});

afterEach(() => {
  document.body.replaceChildren();
});

async function mount(attributes = ""): Promise<SlidemVideoSlide> {
  const template = document.createElement("template");
  template.innerHTML = `<test-video-slide ${attributes}></test-video-slide>`;
  document.body.append(template.content.cloneNode(true));
  const slide = document.querySelector("test-video-slide") as SlidemVideoSlide;
  await slide.updateComplete;
  return slide;
}

function video(slide: SlidemVideoSlide): HTMLVideoElement {
  return slide.shadowRoot!.querySelector("video")!;
}

describe("SlidemVideoSlide", () => {
  it("renders a video element in the content box", async () => {
    const slide = await mount();
    expect(video(slide).parentElement?.id).toBe("content");
    expect(slide.shadowRoot!.querySelector("#content slot")).toBeNull();
  });

  it("reflects the video and muted attributes onto the video element", async () => {
    const slide = await mount('video="/clip.mp4" muted');
    expect(video(slide).getAttribute("src")).toBe("/clip.mp4");
    expect(video(slide).muted).toBe(true);
    expect(slide.video).toBe("/clip.mp4");
    expect(slide.muted).toBe(true);
    slide.muted = false;
    slide.video = "/other.mp4";
    await slide.updateComplete;
    expect(video(slide).muted).toBe(false);
    expect(video(slide).getAttribute("src")).toBe("/other.mp4");
  });

  it("plays while active and pauses otherwise", async () => {
    const slide = await mount('video="/clip.mp4"');
    const play = vi
      .spyOn(video(slide), "play")
      .mockImplementation(() => Promise.resolve());
    const pause = vi.spyOn(video(slide), "pause").mockImplementation(() => {});

    slide.setAttribute("active", "");
    await slide.updateComplete;
    expect(play).toHaveBeenCalledOnce();
    slide.removeAttribute("active");
    await slide.updateComplete;
    expect(pause).toHaveBeenCalledOnce();
  });
});
