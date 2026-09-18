(function () {
  function init() {
    const mermaidPres = [];
    document
      .querySelectorAll('pre code[data-lang="mermaid"], pre[data-lang="mermaid"] code, pre.mermaid code, pre[data-lang="mermaid"]')
      .forEach((el) => {
        const pre = el.tagName.toLowerCase() === "pre" ? el : el.closest("pre");
        if (pre && !mermaidPres.includes(pre)) {
          mermaidPres.push(pre);
        }
      });

    if (mermaidPres.length === 0) {
      return; // No diagrams on this page; 0 bytes downloaded
    }

    let mermaidModule = null;
    let mermaidLoading = null;
    const renderedCharts = [];

    function getThemeConfig() {
      const isDark = document.documentElement.getAttribute("data-theme") === "dark";
      return {
        startOnLoad: false,
        theme: "base",
        securityLevel: "loose",
        suppressErrorRendering: true,
        themeVariables: isDark
          ? {
              fontFamily: 'Pretendard Variable, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              fontSize: "14px",
              primaryColor: "#262626",
              primaryTextColor: "#f4f4f5",
              primaryBorderColor: "#404040",
              nodeBorder: "#404040",
              lineColor: "#71717a",
              arrowheadColor: "#71717a",
              edgeLabelBackground: "#181818",
              textColor: "#e4e4e7",
              clusterBkg: "#1a1a1a",
              clusterBorder: "#2e2e2e",
              titleColor: "#a1a1aa",
              secondaryColor: "#2c2c2e",
              secondaryBorderColor: "#404040",
              secondaryTextColor: "#f4f4f5",
              tertiaryColor: "#1a1a1a",
              tertiaryBorderColor: "#2e2e2e",
              tertiaryTextColor: "#a1a1aa",
              mainBkg: "#262626",
            }
          : {
              fontFamily: 'Pretendard Variable, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              fontSize: "14px",
              primaryColor: "#ffffff",
              primaryTextColor: "#18181b",
              primaryBorderColor: "#e4e4e7",
              nodeBorder: "#e4e4e7",
              lineColor: "#71717a",
              arrowheadColor: "#71717a",
              edgeLabelBackground: "#ffffff",
              textColor: "#27272a",
              clusterBkg: "#fafafa",
              clusterBorder: "#e4e4e7",
              titleColor: "#52525b",
              secondaryColor: "#f4f4f5",
              secondaryBorderColor: "#e4e4e7",
              secondaryTextColor: "#18181b",
              tertiaryColor: "#fafafa",
              tertiaryBorderColor: "#e4e4e7",
              tertiaryTextColor: "#52525b",
              mainBkg: "#ffffff",
            },
      };
    }

    async function loadMermaid() {
      if (mermaidModule) return mermaidModule;
      if (mermaidLoading) return mermaidLoading;

      mermaidLoading = import("https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs")
        .then((m) => {
          mermaidModule = m.default;
          mermaidModule.initialize(getThemeConfig());
          return mermaidModule;
        })
        .catch((err) => {
          mermaidLoading = null;
          console.error("Failed to load Mermaid.js:", err);
          throw err;
        });

      return mermaidLoading;
    }

    async function renderDiagram(chartDiv, code) {
      const mermaid = await loadMermaid();
      const uniqueId = "mmd_" + Math.random().toString(36).substring(2, 9);
      const { svg, bindFunctions } = await mermaid.render(uniqueId, code);
      chartDiv.innerHTML = svg;
      if (bindFunctions) {
        bindFunctions(chartDiv);
      }
    }

    async function setupDiagram(pre) {
      const codeEl = pre.querySelector("code") || pre;
      const rawCode = codeEl.textContent.trim();
      if (!rawCode) return;

      const wrap = document.createElement("div");
      wrap.className = "mermaid-wrap";

      const chartDiv = document.createElement("div");
      chartDiv.className = "mermaid";
      chartDiv.dataset.mermaidCode = rawCode;
      wrap.appendChild(chartDiv);

      pre.replaceWith(wrap);
      renderedCharts.push(chartDiv);

      try {
        await renderDiagram(chartDiv, rawCode);
      } catch (err) {
        console.error("Mermaid render error:", err);
        chartDiv.innerHTML = `<pre class="mermaid-error"><code>${rawCode}</code></pre>`;
      }
    }

    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              observer.unobserve(entry.target);
              setupDiagram(entry.target);
            }
          });
        },
        { rootMargin: "300px 0px" }
      );

      mermaidPres.forEach((pre) => observer.observe(pre));
    } else {
      mermaidPres.forEach((pre) => setupDiagram(pre));
    }

    const themeObserver = new MutationObserver(async (mutations) => {
      for (const m of mutations) {
        if (m.attributeName === "data-theme" && mermaidModule && renderedCharts.length > 0) {
          mermaidModule.initialize(getThemeConfig());
          for (const chartDiv of renderedCharts) {
            const code = chartDiv.dataset.mermaidCode;
            if (code) {
              try {
                await renderDiagram(chartDiv, code);
              } catch (err) {
                console.error("Mermaid theme re-render failed:", err);
              }
            }
          }
        }
      }
    });

    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
