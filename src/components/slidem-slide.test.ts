import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { SlidemSlide } from "./slidem-slide.js";

beforeAll(() => {
  customElements.define("test-slide", SlidemSlide);
});

afterEach(() => {
  document.body.replaceChildren();
});

async function mount(html: string, attributes = ""): Promise<SlidemSlide> {
  const template = document.createElement("template");
  template.innerHTML = `<test-slide ${attributes}>${html}</test-slide>`;
  document.body.replaceChildren(template.content.cloneNode(true));
  const slide = document.querySelector("test-slide") as SlidemSlide;
  await slide.updateComplete;
  return slide;
}

describe("SlidemSlide", () => {
  it("applies the inline styling attributes to content", async () => {
    const slide = await mount(`
      <p id="p" uppercase bold italic underline center font-size="40px" line-height="1.5" color="red">x</p>
      <h1 id="h" color="--primary">y</h1>
      <div id="d" center></div>
    `);
    const p = slide.querySelector<HTMLElement>("#p")!;
    expect(p.style.textTransform).toBe("uppercase");
    expect(p.style.fontWeight).toBe("bold");
    expect(p.style.fontStyle).toBe("italic");
    expect(p.style.textDecoration).toBe("underline");
    expect(p.style.textAlign).toBe("center");
    expect(p.style.fontSize).toBe("40px");
    expect(p.style.lineHeight).toBe("1.5");
    expect(p.style.color).toBe("red");
    expect(slide.querySelector<HTMLElement>("#h")!.style.color).toBe(
      "var(--primary)",
    );
    const div = slide.querySelector<HTMLElement>("#d")!;
    expect(div.style.display).toBe("flex");
    expect(div.style.justifyContent).toBe("center");
  });

  it("sets the background from a colour, a custom property or an image", async () => {
    expect((await mount("", 'background="black"')).style.background).toBe(
      "black",
    );
    expect((await mount("", 'background="--primary"')).style.background).toBe(
      "var(--primary)",
    );
    const image = await mount(
      "",
      'background="/bg.jpg" darken-background=".5"',
    );
    expect(image.background).toBe("/bg.jpg");
    expect(image.darkenBackground).toBe(".5");
    expect(image.style.backgroundImage).toMatch(/url\("?\/bg\.jpg"?\)/);
    expect(image.style.backgroundImage).toContain("rgba(0,0,0,.5)");
  });

  it("updates the background when the attribute changes", async () => {
    const slide = await mount("");
    slide.setAttribute("background", "blue");
    await slide.updateComplete;
    expect(slide.style.background).toBe("blue");
    slide.background = "red";
    await slide.updateComplete;
    expect(slide.style.background).toBe("red");
  });

  it("dispatches activated when it becomes active", async () => {
    const slide = await mount("");
    const onActivated = vi.fn();
    slide.addEventListener("activated", onActivated);
    slide.setAttribute("active", "");
    await slide.updateComplete;
    slide.removeAttribute("active");
    await slide.updateComplete;
    expect(onActivated).toHaveBeenCalledOnce();
  });
});
