import { afterEach, beforeAll, describe, expect, it } from "vitest";
import { SlidemSlideBase } from "./slidem-slide-base.js";

// Tests register under a private tag so the pure module stays side-effect free.
beforeAll(() => {
  customElements.define("test-slide-base", SlidemSlideBase);
});

afterEach(() => {
  document.body.replaceChildren();
});

async function mount(html: string): Promise<SlidemSlideBase> {
  const template = document.createElement("template");
  template.innerHTML = `<test-slide-base>${html}</test-slide-base>`;
  document.body.append(template.content.cloneNode(true));
  const slide = document.querySelector("test-slide-base") as SlidemSlideBase;
  await slide.updateComplete;
  return slide;
}

describe("SlidemSlideBase", () => {
  it("renders a content box with the default slot", async () => {
    const slide = await mount("<p>Hello</p>");
    expect(slide.shadowRoot?.querySelector("#content > slot")).not.toBeNull();
  });

  it("numbers reveal elements as steps and marks the element before them", async () => {
    const slide = await mount(`
      <p id="intro">Intro</p>
      <p reveal id="a">A</p>
      <p reveal id="b">B</p>
    `);
    expect(slide.steps).toBe(2);
    expect(slide.querySelector("#intro")?.getAttribute("step")).toBe("1");
    expect(slide.querySelector("#a")?.getAttribute("step")).toBe("2");
    expect(slide.querySelector("#b")?.getAttribute("step")).toBe("3");
  });

  it("marks steps as current and past when the step changes", async () => {
    const slide = await mount(
      `<p id="intro">Intro</p><p reveal id="a">A</p><p reveal id="b">B</p>`,
    );
    const intro = slide.querySelector("#intro")!;
    const a = slide.querySelector("#a")!;
    const b = slide.querySelector("#b")!;

    slide.step = 2;
    await slide.updateComplete;
    expect(slide.getAttribute("step")).toBe("2");
    expect(intro.hasAttribute("past")).toBe(true);
    expect(a.hasAttribute("current")).toBe(true);
    expect(b.hasAttribute("current")).toBe(false);

    slide.step = 3;
    await slide.updateComplete;
    expect(a.hasAttribute("past")).toBe(true);
    expect(a.hasAttribute("current")).toBe(false);
    expect(b.hasAttribute("current")).toBe(true);

    slide.setAttribute("step", "1");
    await slide.updateComplete;
    expect(slide.step).toBe(1);
    expect(intro.hasAttribute("past")).toBe(false);
    expect(a.hasAttribute("current")).toBe(false);
  });

  it("clamps the step to one past the last reveal", async () => {
    const slide = await mount(`<p reveal>A</p>`);
    slide.step = 10;
    expect(slide.step).toBe(2);
    slide.step = 0;
    expect(slide.step).toBe(1);
  });

  it("defaults to step 1", async () => {
    const slide = await mount("");
    expect(slide.step).toBe(1);
  });

  it("accepts steps defined imperatively", async () => {
    const slide = await mount("");
    const steps = [
      document.createElement("div"),
      document.createElement("div"),
    ];
    slide.defineSteps(steps);
    expect(slide.steps).toBe(2);
    expect(steps[1]?.getAttribute("step")).toBe("3");
    slide.step = 3;
    await slide.updateComplete;
    expect(steps[1]?.hasAttribute("current")).toBe(true);
  });

  it("reads the auto interval with a default", async () => {
    const slide = await mount("");
    expect(slide.auto).toBe(false);
    slide.setAttribute("auto", "");
    expect(slide.auto).toBe(5000);
    slide.auto = 250;
    await slide.updateComplete;
    expect(slide.getAttribute("auto")).toBe("250");
    expect(slide.auto).toBe(250);
    slide.auto = false;
    await slide.updateComplete;
    expect(slide.hasAttribute("auto")).toBe(false);
  });

  it("reads active, previous and next from their attributes", async () => {
    const slide = await mount("");
    slide.setAttribute("active", "");
    expect(slide.active).toBe(true);
    slide.next = true;
    await slide.updateComplete;
    expect(slide.hasAttribute("next")).toBe(true);
    expect(slide.previous).toBe(false);
  });

  it("scales the content box to fit the window", async () => {
    const slide = await mount("");
    const scale = Number(
      document.documentElement.style.getPropertyValue("--slidem-content-scale"),
    );
    expect(scale).toBeGreaterThan(0);
    expect(scale).toBeLessThanOrEqual(1);
    expect(slide.contentScale).toBe(scale);
    const content = slide.shadowRoot!.querySelector<HTMLElement>("#content")!;
    expect(content.style.scale).toBe(String(scale));
  });

  it("lets a subclass render its own content", async () => {
    class CustomSlide extends SlidemSlideBase {
      protected override renderContent() {
        return "custom";
      }
    }
    customElements.define("test-custom-slide", CustomSlide);
    const slide = new CustomSlide();
    document.body.append(slide);
    await slide.updateComplete;
    expect(slide.shadowRoot!.querySelector("#content")!.textContent).toContain(
      "custom",
    );
  });
});
