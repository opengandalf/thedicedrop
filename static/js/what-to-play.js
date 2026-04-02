/* what-to-play.js — Filter and display game recommendations */
(function () {
  "use strict";

  var BASE = "/data/";
  var allGames = [];

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

  function parsePlayerRange(s) {
    // "2-4" → [2,4], "1-5" → [1,5], "2" → [2,2]
    var parts = s.split("-").map(Number);
    return parts.length === 2 ? parts : [parts[0], parts[0]];
  }

  function matchesPlayers(game, filter) {
    if (!filter || filter === "any") return true;
    var target = parseInt(filter, 10);
    var range = parsePlayerRange(game.player_count);
    return target >= range[0] && target <= range[1];
  }

  function matchesWeight(game, filter) {
    if (!filter || filter === "any") return true;
    return game.weight === filter;
  }

  function matchesTime(game, filter) {
    if (!filter || filter === "any") return true;
    // play_time is like "30-60", "120-180"
    var parts = game.play_time.split("-").map(Number);
    var mid = (parts[0] + (parts[1] || parts[0])) / 2;
    switch (filter) {
      case "short": return mid <= 30;
      case "medium": return mid > 30 && mid <= 60;
      case "long": return mid > 60 && mid <= 120;
      case "epic": return mid > 120;
      default: return true;
    }
  }

  function filterGames() {
    var players = document.getElementById("filter-players").value;
    var weight = document.getElementById("filter-weight").value;
    var time = document.getElementById("filter-time").value;

    var results = allGames.filter(function (g) {
      return matchesPlayers(g, players) && matchesWeight(g, weight) && matchesTime(g, time);
    });

    renderResults(results);
  }

  function renderResults(games) {
    var el = document.getElementById("game-results");
    if (!el) return;

    var countEl = document.getElementById("results-count");
    if (countEl) countEl.textContent = games.length + " game" + (games.length !== 1 ? "s" : "") + " found";

    if (!games.length) {
      el.innerHTML = '<p class="no-results">No games match those filters. Try widening your criteria!</p>';
      return;
    }

    var html = '<div class="game-grid">';
    games.forEach(function (g) {
      var weightClass = "weight-" + g.weight;
      html +=
        '<div class="game-card ' + weightClass + '">' +
        '<h3 class="game-card-name"><a href="' + g.bgg_url + '" target="_blank" rel="noopener">' +
        escapeHTML(g.name) + "</a></h3>" +
        '<p class="game-card-desc">' + escapeHTML(g.description) + "</p>" +
        '<div class="game-card-meta">' +
        '<span class="meta-tag">👥 ' + escapeHTML(g.player_count) + " players</span>" +
        '<span class="meta-tag">⚖️ ' + escapeHTML(g.weight) + "</span>" +
        '<span class="meta-tag">⏱️ ' + escapeHTML(g.play_time) + " min</span>" +
        "</div></div>";
    });
    html += "</div>";
    el.innerHTML = html;
  }

  function init(err, data) {
    if (err || !data || !data.games) {
      var el = document.getElementById("game-results");
      if (el) el.innerHTML = "<p>Could not load game data.</p>";
      return;
    }
    allGames = data.games;

    // Wire up filter controls
    ["filter-players", "filter-weight", "filter-time"].forEach(function (id) {
      var sel = document.getElementById(id);
      if (sel) sel.addEventListener("change", filterGames);
    });

    // Initial render — show all
    filterGames();
  }

  fetchJSON("game_recommender.json", init);
})();
