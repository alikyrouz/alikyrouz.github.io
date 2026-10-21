(() => {
  // <stdin>
  window.searchFunc = function(path, searchId, contentId) {
    const input = document.getElementById(searchId);
    const result = document.getElementById(contentId);
    const noResult = document.querySelector(".search-no-result");
    if (!input || !result) return;
    const documentsPromise = fetch(path).then((response) => {
      if (!response.ok) {
        throw new Error(`Search index request failed: ${response.status}`);
      }
      return response.json();
    });
    input.addEventListener("input", function() {
      const query = this.value.trim().toLowerCase();
      const terms = query.split(/\s+/).filter(Boolean);
      result.replaceChildren();
      if (noResult) noResult.style.display = query ? "" : "none";
      if (!terms.length) return;
      documentsPromise.then((documents) => {
        if (input.value.trim().toLowerCase() !== query) return;
        const matches = documents.map((document2, order) => {
          const parsedContent = new DOMParser().parseFromString(
            document2.content || "",
            "text/html"
          );
          parsedContent.querySelectorAll("style, script, figure").forEach((element) => element.remove());
          const content = (parsedContent.body.textContent || "").replace(/\s+/g, " ").trim();
          const title = (document2.title || "Untitled").trim();
          const titleLower = title.toLowerCase();
          const contentLower = content.toLowerCase();
          const foundTerms = terms.filter(
            (term) => titleLower.includes(term) || contentLower.includes(term)
          );
          return {
            document: document2,
            title,
            content,
            foundTerms,
            score: foundTerms.length + (titleLower.includes(query) ? terms.length : 0),
            order
          };
        }).filter((match) => match.foundTerms.length).sort((a, b) => b.score - a.score || a.order - b.order);
        if (!matches.length) return;
        const list = document.createElement("ul");
        list.className = "search-result-list";
        const highlightPattern = new RegExp(
          terms.slice().sort((a, b) => b.length - a.length).map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|"),
          "gi"
        );
        matches.forEach((match) => {
          const item = document.createElement("li");
          const link = document.createElement("a");
          link.className = "search-result-title";
          link.href = match.document.url;
          link.textContent = match.title;
          item.appendChild(link);
          const firstPosition = match.foundTerms.reduce((first, term) => {
            const position = match.content.toLowerCase().indexOf(term);
            return position >= 0 && (first < 0 || position < first) ? position : first;
          }, -1);
          if (firstPosition >= 0) {
            const start = Math.max(0, firstPosition - 20);
            const snippet = match.content.slice(start, start + 100);
            const paragraph = document.createElement("p");
            paragraph.className = "search-result";
            let previousIndex = 0;
            snippet.replace(highlightPattern, (keyword, offset) => {
              paragraph.appendChild(
                document.createTextNode(snippet.slice(previousIndex, offset))
              );
              const highlighted = document.createElement("em");
              highlighted.className = "search-keyword";
              highlighted.textContent = keyword;
              paragraph.appendChild(highlighted);
              previousIndex = offset + keyword.length;
              return keyword;
            });
            paragraph.appendChild(
              document.createTextNode(snippet.slice(previousIndex))
            );
            item.appendChild(paragraph);
          }
          list.appendChild(item);
        });
        result.appendChild(list);
        if (noResult) noResult.style.display = "none";
      }).catch((error) => {
        console.error("Unable to load the search index.", error);
      });
    });
  };
})();
