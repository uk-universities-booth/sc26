---
layout: splash
permalink: /
title: ""
search: false
---

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&display=swap">
<link rel="stylesheet" href="{{ '/assets/css/booth.css' | relative_url }}">
<script>document.documentElement.classList.add("kiosk");</script>

<main class="stage" data-sheet="peek">
  <aside class="side">
    <header class="brand">
      <h1>Study HPC, AI and data in the UK</h1>
      <p class="lead">Tap a numbered circle to see a university's programmes. <span class="lead-2">The number shows how many match your search.</span></p>
    </header>
    <div class="search">
      <input id="q" type="search" placeholder="Search programmes, topics or careers" aria-label="Search programmes" enterkeyhint="search" autocomplete="off" autocapitalize="off" spellcheck="false">
    </div>
    <!-- Desktop: a normal sidebar. Phone and iPad portrait: a bottom drawer you can drag. -->
    <section class="drawer" id="drawer" data-state="peek" aria-label="Results">
      <div class="grab" id="grab">
        <span class="pill" aria-hidden="true"></span>
        <div class="bar">
          <div class="status">
            <p id="tally" aria-live="polite"></p>
            <button id="reset" type="button" hidden>Clear</button>
          </div>
          <button class="fbtn" id="fbtn" type="button" aria-expanded="false" aria-controls="filters">Filters<span class="badge" id="fcount" hidden></span></button>
          <button class="lbtn" id="lbtn" type="button" aria-expanded="false" aria-controls="dbody">Show list</button>
        </div>
      </div>
      <div class="dbody" id="dbody">
        <div class="filters" id="filters">
          <p class="flabel">Level</p>
          <div class="chips" id="quals" role="group" aria-label="Qualification"></div>
          <p class="flabel">Subject</p>
          <div class="chips" id="topics" role="group" aria-label="Subject area"></div>
        </div>
        <div class="results" id="results"></div>
        <a class="cake" id="cake" href="https://www.cake.ac.uk/" target="_blank" rel="noopener">
          <strong>CAKE · Computational Abilities Knowledge Exchange</strong>
          <span>A showcase of UK digital research infrastructure (DRI) projects. Explore more at cake.ac.uk →</span>
        </a>
      </div>
    </section>
  </aside>

  <div class="mapcol">
    <section class="mapwrap">
      <div class="map" id="map">
        <img src="https://github.com/mzhc13/uk-universities-map/blob/main/assets/images/map-ucl.png?raw=true" alt="Map of UK universities">
      </div>
    </section>
    <p class="mapnote">
      <span><strong>SC26 UK Universities booth only.</strong> Not all UK universities are shown.</span>
      <button type="button" id="mapinfo">About this map</button>
    </p>
  </div>
</main>

<div class="mdl" id="mdl" role="dialog" aria-modal="true" aria-labelledby="m-name" hidden>
  <div class="sheet" id="sheet">
    <header class="m-head" id="m-head">
      <img class="m-logo" id="m-logo" src="" alt="">
      <div class="m-title"><h2 id="m-name"></h2><p id="m-loc"></p></div>
      <button class="m-close" id="m-close" type="button">Close</button>
    </header>
    <div class="m-body">
      <nav class="m-list" id="m-list" aria-label="Programmes"></nav>
      <article class="m-detail" id="m-detail"></article>
    </div>
  </div>
</div>

<div class="mdl" id="about" role="dialog" aria-modal="true" aria-labelledby="about-title" hidden>
  <div class="sheet about">
    <header class="a-head">
      <h2 id="about-title">About this map</h2>
      <button class="m-close" id="about-close" type="button">Close</button>
    </header>
    <div class="a-body">
      <section>
        <h3>How to use it</h3>
        <ul class="a-list">
          <li><span class="mini-dot">3</span><span>Each numbered circle is a university. The number is how many of its programmes match your search and filters.</span></li>
          <li><span class="mini-dot off"></span><span>A faded grey circle has no matching programmes.</span></li>
          <li><span class="mini-dot tap">+</span><span>Tap a circle, or a programme in the list, to open its details.</span></li>
        </ul>
      </section>
      <section class="a-warn">
        <h3>Not every UK university is shown</h3>
        <p>This map only includes the universities that took part in the <strong>UK Universities booth at SC26</strong>. A university that does not appear here may still offer HPC, AI and data programmes.</p>
      </section>
      <section class="a-cake">
        <h3>Explore more with CAKE</h3>
        <p><strong>CAKE (Computational Abilities Knowledge Exchange)</strong> is a showcase of UK digital research infrastructure (DRI) projects.</p>
        <div class="qr" id="about-qr" hidden><p>Scan to open cake.ac.uk</p></div>
        <a class="bt" href="https://www.cake.ac.uk/" target="_blank" rel="noopener">Visit cake.ac.uk</a>
      </section>
    </div>
  </div>
</div>

<script>
window.UNIVERSITIES = {{ site.data.universities | jsonify }};
window.COURSES = {
{% for item in site.data.universities %}{% assign cid = item[0] %}{% assign clist = site.data.courses[cid] | default: site.data[cid] %}"{{ cid }}": {{ clist | jsonify }}{% unless forloop.last %},{% endunless %}
{% endfor %}};
</script>
<script src="https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.js"></script>
<script src="{{ '/assets/js/booth.js' | relative_url }}"></script>