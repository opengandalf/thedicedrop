/* board-game-map.js — Source breakdown cards */
(function () {
  "use strict";

  var BASE = "/data/";

  var SOURCE_LABELS = {
    bgg: "BoardGameGeek",
    reddit: "Reddit",
    dnd: "D&D & RPG",
    digital: "Digital",
    kickstarter: "Crowdfunding",
    news: "News",
  };

  function fetchJSON(file, cb) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", BASE + file);
    xhr.onload = function () {
      if (xhr.status === 200) {
        try { cb(null, JSON.parse(xhr.responseText)); }
        catch (e) { cb(e); }
      } else { cb(new Error(xhr.status)); }
    };
    xhr.onerror = function () { cb(new Error("network")); };
    xhr.send();
  }

  function escapeHTML(s) {
    var d = document.createElement("div");
    d.appendChild(document.createTextNode(s));
    return d.innerHTML;
  }

  function render(err, data) {
    var container = document.getElementById("source-cards-container");
    if (!container) return;
    if (err || !data || !data.sources) {
      container.innerHTML = "<p>Could not load source data.</p>";
      return;
    }
    var html = '<div class="source-grid">';
    var keys = Object.keys(data.sources);
    keys.forEach(function (key) {
      var src = data.sources[key];
      var color = src.color || "#c88400";
      var label = SOURCE_LABELS[key] || src.label || key;
      html += '<div class="source-card" style="border-top:4px solid ' + color + '">';
      html += '<h3 class="source-card-title" style="color:' + color + '">' + escapeHTML(label) + "</h3>";
      if (src.items && src.items.length) {
        html += "<ul class=\"source-card-list\">";
        src.items.forEach(function (item) {
          var link = item.url
            ? '<a href="' + item.url + '" target="_blank" rel="noopener">' + escapeHTML(item.title) + "</a>"
            : escapeHTML(item.title);
          var score = item.score ? ' <span class="source-score">' + item.score + "</span>" : "";
          html += "<li>" + link + score + "</li>";
        });
        html += "</ul>";
      } else {
        html += "<p class=\"source-empty\">No items yet.</p>";
      }
      html += "</div>";
    });
    html += "</div>";
    container.innerHTML = html;
  }

  fetchJSON("source_map.json", render);
})();
