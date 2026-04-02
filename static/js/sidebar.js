/* sidebar.js — Fetch JSON and render all 4 sidebar widgets */
(function () {
  "use strict";

  var BASE = "/data/";

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

  /* ── BGG Hotness Top 10 ── */
  function renderHotness(err, data) {
    var el = document.getElementById("hotness-list");
    if (!el) return;
    if (err || !data || !data.games || !data.games.length) {
      el.innerHTML = "<p>Could not load hotness data.</p>";
      return;
    }
    var html = '<ol class="hotness-ol">';
    var games = data.games.slice(0, 10);
    for (var i = 0; i < games.length; i++) {
      var g = games[i];
      var thumb = g.thumbnail
        ? '<img src="' + g.thumbnail + '" alt="" class="hotness-thumb" loading="lazy">'
        : "";
      html +=
        '<li class="hotness-item">' +
        '<span class="hotness-rank">' + g.rank + "</span>" +
        thumb +
        '<a href="https://boardgamegeek.com/boardgame/' + g.id + '" target="_blank" rel="noopener">' +
        escapeHTML(g.name) +
        "</a></li>";
    }
    html += "</ol>";
    el.innerHTML = html;
  }

  /* ── Crowdfunding Spotlight ── */
  function formatMoney(n, currency) {
    var sym = currency === "EUR" ? "€" : currency === "GBP" ? "£" : "$";
    if (n >= 1000000) return sym + (n / 1000000).toFixed(1) + "M";
    if (n >= 1000) return sym + (n / 1000).toFixed(0) + "K";
    return sym + Math.round(n);
  }

  function renderCrowdfunding(err, data) {
    var el = document.getElementById("crowdfunding-list");
    if (!el) return;
    if (err || !data || !data.items || !data.items.length) {
      el.innerHTML = "<p>No crowdfunding data available.</p>";
      return;
    }
    // Sort by pledged amount descending
    var sorted = data.items.slice().sort(function(a, b) {
      return (b.pledged || 0) - (a.pledged || 0);
    });
    var html = "";
    for (var i = 0; i < Math.min(sorted.length, 10); i++) {
      var c = sorted[i];
      var pct = Math.min(c.funding_percent || 0, 999);
      var barPct = Math.min(pct, 100);
      var cur = c.currency || "USD";
      var pledgedStr = c.pledged ? formatMoney(c.pledged, cur) : "";
      var goalStr = c.goal ? " of " + formatMoney(c.goal, cur) : "";
      var backerStr = c.backers ? " · " + c.backers.toLocaleString() + " backers" : "";
      var moneyLine = pledgedStr ? pledgedStr + goalStr + backerStr : "";
      html +=
        '<div class="cf-item">' +
        '<a href="' + escapeAttr(c.url) + '" target="_blank" rel="noopener" class="cf-name">' +
        escapeHTML(c.name) + "</a>" +
        (moneyLine ? '<div class="cf-money">' + moneyLine + '</div>' : '') +
        '<div class="cf-bar-bg"><div class="cf-bar" style="width:' + barPct + '%"></div></div>' +
        '<span class="cf-pct">' + (pct >= 999 ? "Flex goal" : pct + "% funded") + "</span>" +
        "</div>";
    }
    el.innerHTML = html;
  }

  /* ── Game of the Week ── */
  function renderGOTW(err, data) {
    var el = document.getElementById("gotw-card");
    if (!el) return;
    if (err || !data || !data.game) {
      el.innerHTML = "<p>No game selected this week.</p>";
      return;
    }
    var g = data.game;
    var img = g.image_url
      ? '<img src="' + escapeAttr(g.image_url) + '" alt="" class="gotw-img" loading="lazy">'
      : "";
    el.innerHTML =
      '<div class="gotw-card">' +
      img +
      '<h4 class="gotw-name"><a href="' + escapeAttr(g.url) + '" target="_blank" rel="noopener">' +
      escapeHTML(g.name) + "</a></h4>" +
      '<p class="gotw-desc">' + escapeHTML(g.description || "") + "</p>" +
      "</div>";
  }

  /* ── Helpers ── */
  function escapeHTML(s) {
    var d = document.createElement("div");
    d.appendChild(document.createTextNode(s));
    return d.innerHTML;
  }
  function escapeAttr(s) {
    return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  /* ── Init ── */
  fetchJSON("hotness.json", renderHotness);
  fetchJSON("crowdfunding.json", renderCrowdfunding);
  fetchJSON("game_of_week.json", renderGOTW);
})();
