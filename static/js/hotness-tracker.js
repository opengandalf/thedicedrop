/* hotness-tracker.js — Dashboard view of BGG Hotness over time */
(function () {
  "use strict";

  var BASE = "/data/";
  var COLORS = [
    "#c88400", "#ff6432", "#ff4500", "#05ce78", "#50a0ff",
    "#c83232", "#ffc832", "#9a6600", "#8b5cf6", "#ec4899",
  ];
  var PLACEHOLDER_THUMB = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 48 48'%3E%3Crect width='48' height='48' fill='%23f5f0e8'/%3E%3Ctext x='50%25' y='54%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='18' fill='%23c88400'%3E%3F%3C/text%3E%3C/svg%3E";

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

  function escHtml(s) {
    var d = document.createElement("div");
    d.appendChild(document.createTextNode(s));
    return d.innerHTML;
  }

  function formatDate(iso) {
    if (!iso) return "—";
    var d = new Date(iso);
    var months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    return months[d.getMonth()] + " " + d.getDate() + ", " + d.getFullYear();
  }

  /* ── Stats bar ──────────────────────────────────────────────────── */

  function renderStats(hotness, history) {
    var updatedEl = document.getElementById("ht-stat-updated");
    var gamesEl = document.getElementById("ht-stat-games");
    var daysEl = document.getElementById("ht-stat-days");
    var topEl = document.getElementById("ht-stat-top");

    if (hotness) {
      if (updatedEl) updatedEl.textContent = formatDate(hotness.updated);
      if (gamesEl) gamesEl.textContent = hotness.games ? hotness.games.length : "0";
      if (topEl && hotness.games && hotness.games.length) {
        topEl.textContent = hotness.games[0].name;
      }
    }
    if (history && daysEl) {
      daysEl.textContent = history.length;
    }
  }

  /* ── Chart ──────────────────────────────────────────────────────── */

  function renderChart(history) {
    var canvas = document.getElementById("hotness-chart");
    if (!canvas || !history || !history.length) return;

    var dates = history.map(function (h) { return h.date; });

    var gameMap = {};
    history.forEach(function (snap) {
      snap.games.forEach(function (g) {
        if (!gameMap[g.name]) gameMap[g.name] = {};
        gameMap[g.name][snap.date] = g.rank;
      });
    });

    var latest = history[history.length - 1];
    var topNames = latest.games.slice(0, 10).map(function (g) { return g.name; });

    var datasets = topNames.map(function (name, idx) {
      return {
        label: name,
        data: dates.map(function (d) {
          return gameMap[name] && gameMap[name][d] !== undefined ? gameMap[name][d] : null;
        }),
        borderColor: COLORS[idx % COLORS.length],
        backgroundColor: COLORS[idx % COLORS.length] + "22",
        tension: 0.3,
        pointRadius: 3,
        spanGaps: true,
      };
    });

    new Chart(canvas, {
      type: "line",
      data: { labels: dates, datasets: datasets },
      options: {
        responsive: true,
        plugins: {
          legend: { position: "bottom", labels: { boxWidth: 12, font: { size: 11 } } },
          title: { display: true, text: "BGG Hotness — Position Over Time", font: { size: 16 } },
        },
        scales: {
          y: { reverse: true, min: 1, title: { display: true, text: "Rank" }, ticks: { stepSize: 1 } },
          x: { title: { display: true, text: "Date" } },
        },
      },
    });
  }

  /* ── Movement calculation ───────────────────────────────────────── */

  function getMovement(history, currentGames) {
    if (!history || history.length < 2 || !currentGames) return {};
    var prev = history[history.length - 2];
    if (!prev || !prev.games) return {};

    var prevMap = {};
    prev.games.forEach(function (g) { prevMap[g.id] = g.rank; });

    var moves = {};
    currentGames.forEach(function (g) {
      var prevRank = prevMap[g.id];
      if (prevRank === undefined) {
        moves[g.id] = { type: "new" };
      } else if (prevRank > g.rank) {
        moves[g.id] = { type: "up", delta: prevRank - g.rank };
      } else if (prevRank < g.rank) {
        moves[g.id] = { type: "down", delta: g.rank - prevRank };
      } else {
        moves[g.id] = { type: "same" };
      }
    });
    return moves;
  }

  function movementHtml(move) {
    if (!move) return "";
    switch (move.type) {
      case "up":
        return '<span class="ht-move ht-move-up" title="Up ' + move.delta + '">&#9650; ' + move.delta + "</span>";
      case "down":
        return '<span class="ht-move ht-move-down" title="Down ' + move.delta + '">&#9660; ' + move.delta + "</span>";
      case "new":
        return '<span class="ht-move ht-move-new" title="New entry">NEW</span>';
      default:
        return '<span class="ht-move ht-move-same" title="No change">&#9644;</span>';
    }
  }

  /* ── Table ──────────────────────────────────────────────────────── */

  function renderTable(hotness, moves) {
    var el = document.getElementById("hotness-table-container");
    if (!el) return;
    if (!hotness || !hotness.games || !hotness.games.length) {
      el.innerHTML = "<p>No data available.</p>";
      return;
    }

    var html = '<table class="hotness-table"><thead><tr>' +
      '<th class="ht-col-rank">#</th>' +
      '<th class="ht-col-move"></th>' +
      '<th class="ht-col-thumb"></th>' +
      '<th class="ht-col-name">Game</th>' +
      '<th class="ht-col-year">Year</th>' +
      "</tr></thead><tbody>";

    hotness.games.forEach(function (g) {
      var thumb = g.thumbnail || PLACEHOLDER_THUMB;
      var bggUrl = "https://boardgamegeek.com/boardgame/" + g.id;
      var move = moves[g.id];
      var yearText = g.year || "—";

      html += "<tr>" +
        '<td class="ht-col-rank"><span class="ht-rank-badge">' + g.rank + "</span></td>" +
        "<td>" + movementHtml(move) + "</td>" +
        '<td><img src="' + escHtml(thumb) + '" alt="" class="ht-thumb" loading="lazy" onerror="this.src=\'' + PLACEHOLDER_THUMB + '\'"></td>' +
        '<td><a href="' + escHtml(bggUrl) + '" target="_blank" rel="noopener">' + escHtml(g.name) + "</a></td>" +
        "<td>" + escHtml(yearText) + "</td>" +
        "</tr>";
    });

    html += "</tbody></table>";
    el.innerHTML = html;
  }

  /* ── Init ───────────────────────────────────────────────────────── */

  var _hotness = null;
  var _history = null;

  function tryRender() {
    if (_hotness && _history) {
      renderStats(_hotness, _history);
      renderChart(_history);
      var moves = getMovement(_history, _hotness.games);
      renderTable(_hotness, moves);
    }
  }

  fetchJSON("hotness_history.json", function (err, data) {
    if (!err && data) { _history = data; tryRender(); }
  });
  fetchJSON("hotness.json", function (err, data) {
    if (!err && data) { _hotness = data; tryRender(); }
  });
})();
