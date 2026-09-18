document.addEventListener("DOMContentLoaded", () => {
  const searchBox = document.getElementById("search-box");
  const searchInput = document.getElementById("search");
  const searchToggle = document.getElementById("search-toggle");
  const searchClose = document.getElementById("search-close");
  const resultsDiv = document.getElementById("search-results");
  if (!searchInput || !resultsDiv) return;

  let index = null;
  function initIndex() {
    if (!index && window.elasticlunr && window.searchIndex) {
      // Register language-specific pipeline functions to prevent "Cannot load un-registered function" error
      const pipelineFuncs = ["trimmer-en", "stopWordFilter-en", "stemmer-en"];
      pipelineFuncs.forEach((fnName) => {
        try {
          elasticlunr.Pipeline.get(fnName);
        } catch {
          elasticlunr.Pipeline.registerFunction(function(token) { return token; }, fnName);
        }
      });
      index = elasticlunr.Index.load(window.searchIndex);
    }
  }

  function openSearch() {
    if (searchBox) {
      searchBox.classList.add("is-active");
      initIndex();
      setTimeout(() => {
        searchInput.focus();
      }, 50);
    }
  }

  function closeSearch() {
    if (searchBox) {
      searchBox.classList.remove("is-active");
      resultsDiv.style.display = "none";
      resultsDiv.innerHTML = "";
      searchInput.value = "";
    }
  }

  if (searchToggle) {
    searchToggle.addEventListener("click", openSearch);
  }

  if (searchClose) {
    searchClose.addEventListener("click", (e) => {
      e.stopPropagation();
      closeSearch();
    });
  }

  function renderResults() {
    initIndex();
    const query = searchInput.value.trim();
    if (!query || !index) {
      resultsDiv.style.display = "none";
      resultsDiv.innerHTML = "";
      return;
    }

    const results = index.search(query, {
      fields: {
        title: { boost: 2 },
        body: { boost: 1 }
      },
      expand: true
    });

    if (results.length === 0) {
      resultsDiv.innerHTML = '<div class="search-no-results">No results found.</div>';
      resultsDiv.style.display = "block";
      return;
    }

    resultsDiv.innerHTML = results.slice(0, 8).map(res => {
      const doc = res.doc;
      let href = doc.id;
      try {
        const u = new URL(doc.id);
        href = u.pathname + u.search + u.hash;
      } catch {
        href = doc.id;
      }
      const snippet = (doc.body || "").replace(/\s+/g, " ").trim().substring(0, 90);
      return `<div class="search-result-item">
        <a href="${href}">${doc.title || "Untitled"}</a>
        ${snippet ? `<small>${snippet}...</small>` : ""}
      </div>`;
    }).join("");
    resultsDiv.style.display = "block";
  }

  searchInput.addEventListener("input", renderResults);

  searchInput.addEventListener("focus", () => {
    if (searchInput.value.trim()) {
      renderResults();
    }
  });

  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      resultsDiv.style.display = "none";
      if (window.innerWidth <= 768) {
        closeSearch();
      }
    }
  });

  document.addEventListener("click", (e) => {
    if (searchBox && !searchBox.contains(e.target)) {
      resultsDiv.style.display = "none";
      if (window.innerWidth <= 768) {
        closeSearch();
      }
    }
  });
});
