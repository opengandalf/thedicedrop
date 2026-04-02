---
title: "What Should I Play?"
layout: "single"
url: "/what-to-play/"
summary: "Find your next board game based on player count, weight, and time."
---

<p class="page-intro">Tell us what you're looking for and we'll suggest games from our curated collection of 50 modern classics.</p>

<div class="filter-controls">
  <div class="filter-group">
    <label for="filter-players">👥 Players</label>
    <select id="filter-players">
      <option value="any">Any</option>
      <option value="1">Solo (1)</option>
      <option value="2">2 players</option>
      <option value="3">3 players</option>
      <option value="4">4 players</option>
      <option value="5">5 players</option>
      <option value="6">6+ players</option>
    </select>
  </div>
  <div class="filter-group">
    <label for="filter-weight">⚖️ Complexity</label>
    <select id="filter-weight">
      <option value="any">Any</option>
      <option value="light">Light (easy to learn)</option>
      <option value="medium">Medium (some strategy)</option>
      <option value="heavy">Heavy (brain burner)</option>
    </select>
  </div>
  <div class="filter-group">
    <label for="filter-time">⏱️ Play Time</label>
    <select id="filter-time">
      <option value="any">Any</option>
      <option value="short">Quick (&lt;30 min)</option>
      <option value="medium">Standard (30–60 min)</option>
      <option value="long">Long (1–2 hours)</option>
      <option value="epic">Epic (2+ hours)</option>
    </select>
  </div>
</div>

<p id="results-count" class="results-count"></p>

<div id="game-results">
  <p>Loading…</p>
</div>

<script src="/js/what-to-play.js"></script>
