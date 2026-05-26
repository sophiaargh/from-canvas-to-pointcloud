// Lightweight HTML include system.
//
// Each top-level page section lives in ./sections/*.html and is pulled in at
// runtime via <div data-include="..."></div> placeholders in index.html.
//
(function () {
  "use strict";

  // Re-create <script> elements so the browser actually executes them.
  function runScripts(container) {
    container.querySelectorAll("script").forEach(function (oldScript) {
      var newScript = document.createElement("script");
      for (var i = 0; i < oldScript.attributes.length; i++) {
        var attr = oldScript.attributes[i];
        newScript.setAttribute(attr.name, attr.value);
      }
      newScript.textContent = oldScript.textContent;
      oldScript.parentNode.replaceChild(newScript, oldScript);
    });
  }

  function loadInclude(el) {
    var url = el.getAttribute("data-include");
    return fetch(url)
      .then(function (res) {
        if (!res.ok) {
          throw new Error("Failed to load " + url + " (" + res.status + ")");
        }
        return res.text();
      })
      .then(function (html) {
        el.innerHTML = html;
        el.removeAttribute("data-include");
        runScripts(el);
      })
      .catch(function (err) {
        console.error(err);
        el.innerHTML = "<!-- include failed: " + url + " -->";
      });
  }

  function typesetMath() {
    if (!window.MathJax) return;
    if (window.MathJax.startup && window.MathJax.startup.promise) {
      window.MathJax.startup.promise.then(function () {
        window.MathJax.typeset();
      });
    } else if (typeof window.MathJax.typeset === "function") {
      window.MathJax.typeset();
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    var placeholders = Array.prototype.slice.call(
      document.querySelectorAll("[data-include]")
    );
    Promise.all(placeholders.map(loadInclude)).then(function () {
      // Fragments are in the DOM now — let the rest of the page wire up.
      document.dispatchEvent(new CustomEvent("includes:loaded"));
      typesetMath();
    });
  });
})();
