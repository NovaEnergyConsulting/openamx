import { describe, expect, it } from "bun:test";
import { parseDocument } from "../src/parser/parseDocument";
import { evaluateDocument } from "../src/runtime/evaluateDocument";
import { renderHtml } from "../src/renderer/renderHtml";

describe("V0.2 canonical examples", () => {
  it("renders the basic example without executing its ordinary fence", async () => {
    const path = "examples/hello-world.amx";
    const document = await parseDocument(path);
    expect(evaluateDocument(document, path)).toEqual({
      assetName: "Transformer TX-001",
      riskScore: 15
    });
    const html = renderHtml(document, path);
    expect(html).toContain("<title>Hello OpenAMX</title>");
    expect(html).toContain("The calculated risk score is 15.");
    expect(html).toContain('class="language-amx"');
    expect(html).toContain("let ignored = 999");
    expect(await Bun.file("examples/hello-world.html").text()).toBe(html);
  });

  it("evaluates transformer failure modes and renders the final adjusted score", async () => {
    const path = "examples/transformer-strategy.amx";
    const document = await parseDocument(path);
    expect(evaluateDocument(document, path)).toEqual({
      assetName: "TX-001 <north>",
      severity: [8, 6, 9],
      occurrence: 3,
      modeScores: [24, 18, 27],
      totalScore: 60,
      action: "Inspect cooling system",
      remainingScore: 60
    });
    const html = renderHtml(document, path);
    expect(html).toContain("<title>Power Transformer Failure Mode Analysis</title>");
    expect(html).toContain("<h2>Screening result</h2>");
    expect(html).toContain("<li>Cooling: severity 8</li>");
    expect(html).toContain("TX-001 &lt;north&gt;");
    expect(html).toContain("the mode scores are 24, 18, 27 and the adjusted\naggregate is 60");
    expect(html).toContain("The remaining score is 60");
    expect(html).toContain('class="language-amx"');
    expect(html).toContain("let assetName = &quot;TX-001 &lt;north&gt;&quot;");
    expect(html).toContain("  case 69 =&gt; ");
    expect(html).not.toContain('<north>');
    expect(await Bun.file("examples/transformer-strategy.html").text()).toBe(html);
  });

  it("evaluates fleet risk and leaves ordinary code and bare declarations inert", async () => {
    const path = "examples/asset-fleet-risk-analysis.amx";
    const document = await parseDocument(path);
    expect(evaluateDocument(document, path)).toEqual({
      fleetName: "North & South fleet",
      exposures: [1, 2, 3],
      riskPoints: [5, 10, 15],
      fleetScore: 35,
      decision: "Schedule review"
    });
    const html = renderHtml(document, path);
    expect(html).toContain("<title>Asset Fleet Risk Analysis</title>");
    expect(html).toContain("<h2>Portfolio decision</h2>");
    expect(html).toContain("<strong>Schedule review</strong>");
    expect(html).toContain("The final fleet score is 35 across 1, 2, 3 exposure levels.");
    expect(html).toContain("<pre><code class=\"language-amx\">fleetScore += 5");
    expect(html).toContain("  default =&gt; ");
    expect(html).toContain("let ignored = 1000");
    expect(html).toContain("let narrativeOnly = 999");
    expect(html).not.toContain("1000 exposure levels");
    expect(await Bun.file("examples/asset-fleet-risk-analysis.html").text()).toBe(html);
  });
});