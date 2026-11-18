/* The Leonida Herald site builder.
   node build.js <content.json> <outDir>
   buildSite(content) returns { "<path>": "<html or text>" }. */
function buildSite(content) {
  const SITE = "https://leonidaherald.com/";
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const longDate = d => { const [y,m,dd] = d.split("-").map(Number); return months[m-1] + " " + dd + ", " + y; };
  const dayName = d => { const [y,m,dd] = d.split("-").map(Number); return days[new Date(Date.UTC(y, m-1, dd)).getUTCDay()]; };
  const arts = content.articles.slice().sort((a,b) => b.date.localeCompare(a.date));
  const bySection = s => content.articles.filter(a => a.section === s);
  const initials = t => t.replace(/\(.*?\)/g, "").split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join("").toUpperCase();

  const SECTIONS = [
    { id: "front", file: "index.html", name: "Front Page" },
    { id: "whos-who", file: "whos-who.html", name: "Who's Who", blurb: "The characters of GTA VI: who they are, who they work with and where they fit in the story. Spoiler-free unless you tap to reveal." },
    { id: "crime-beat", file: "crime-beat.html", name: "Crime Beat", blurb: "Mission walkthroughs for every story job, in order, with objectives, tips and rewards." },
    { id: "around-town", file: "around-town.html", name: "Around Town", blurb: "Leonida's regions, plus side quests and things to do in each one." },
    { id: "classifieds", file: "classifieds.html", name: "Classifieds", blurb: "Shops, businesses and places to spend your money, with what they sell and where to find them." },
    { id: "advice", file: "advice-column.html", name: "Advice Column", blurb: "Strategy guides, buying advice and tips for getting the most out of Leonida." }
  ];
  const secById = Object.fromEntries(SECTIONS.map(s => [s.id, s]));

  const favicon = "data:image/svg+xml," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="#0E7C7B"/><circle cx="46" cy="18" r="10" fill="#FFD23F"/><path d="M14 50V14h8v14h12V14h8v36h-8V36H22v14z" fill="#EDF0EB"/><rect x="10" y="54" width="44" height="4" fill="#E8418F"/></svg>');

  const css = `
:root{--paper:#EDF0EB;--paper2:#E1E7E1;--ink:#12282B;--ink2:#3E5457;--teal:#0E7C7B;--pink:#E8418F;--pinkdeep:#B8246B;--sun:#FFD23F;--rule:#0E7C7B;
--head:"Big Shoulders Display",Impact,"Arial Narrow",sans-serif;--body:Newsreader,Georgia,"Times New Roman",serif}
*{box-sizing:border-box}html,body{margin:0}
body{background:var(--paper);color:var(--ink);font-family:var(--body);font-size:19px;line-height:1.6;-webkit-font-smoothing:antialiased}
a{color:var(--teal);text-underline-offset:3px}a:hover{color:var(--pinkdeep)}
:focus-visible{outline:3px solid var(--pink);outline-offset:2px}
.wrap{max-width:1140px;margin:0 auto;padding:0 22px}
.skip{position:absolute;left:-999px}.skip:focus{left:12px;top:12px;background:var(--sun);color:var(--ink);padding:8px 12px;z-index:9}
/* masthead */
.mast{padding:22px 0 0}
.mast .ears{display:flex;justify-content:space-between;align-items:flex-end;gap:16px;font-size:14.5px;color:var(--ink2)}
.mast .ears p{margin:0}
.mast .ears p:first-child{white-space:nowrap}
.mast .title{display:block;text-decoration:none;color:var(--ink);text-align:center;margin:6px 0 4px}
.mast .title b{display:block;font:900 clamp(54px,11.2vw,138px)/.86 var(--head);letter-spacing:-.01em;text-transform:none}
.mast .title b span{color:var(--pink)}
.mast .strap{border-top:6px solid var(--teal);border-bottom:2px solid var(--teal);display:flex;justify-content:space-between;gap:14px;flex-wrap:wrap;padding:6px 0;font-size:15px;margin-top:10px}
.mast .strap em{font-style:italic;color:var(--ink2)}
nav.sections{border-bottom:6px solid var(--teal)}
nav.sections ul{list-style:none;margin:0;padding:0;display:flex;flex-wrap:wrap;justify-content:center}
nav.sections a{display:block;font:700 19px/1 var(--head);letter-spacing:.02em;text-decoration:none;color:var(--ink);padding:13px 15px}
nav.sections a:hover{color:var(--pinkdeep)}
nav.sections a[aria-current="page"]{background:var(--ink);color:var(--paper)}
/* shared */
.flag{display:inline-block;font:800 17px/1 var(--head);background:var(--pink);color:#fff;padding:6px 9px 5px;text-decoration:none;letter-spacing:.02em}
a.flag:hover{background:var(--pinkdeep);color:#fff}
h1,h2,h3{font-family:var(--head);font-weight:900;line-height:.98;letter-spacing:-.005em;margin:0;text-wrap:balance}
.dek{font-size:21px;line-height:1.45;color:var(--ink2);margin:12px 0 0;max-width:46ch}
.byline{font-size:15px;color:var(--ink2);margin-top:14px}
.byline b{color:var(--ink);font-weight:600}
footer.site{margin-top:64px;border-top:6px solid var(--teal);padding:20px 0 48px;font-size:15px;color:var(--ink2)}
footer.site .cols{display:grid;grid-template-columns:2fr 1fr;gap:28px}
footer.site p{margin:0 0 8px;max-width:64ch}
footer.site .fmast{font:900 30px/1 var(--head);color:var(--ink);margin-bottom:8px}
footer.site ul{list-style:none;margin:0;padding:0}footer.site li{margin-bottom:4px}
@media (max-width:720px){footer.site .cols{grid-template-columns:1fr}.mast .ears{display:none}}
`;

  const frontCss = `
.banner{background:var(--sun);border-bottom:2px solid var(--ink);text-align:center;font:800 18px/1.2 var(--head);letter-spacing:.02em;padding:9px 12px}
.banner a{color:var(--ink)}
.lead{display:grid;grid-template-columns:1.65fr 1fr;gap:0;border-bottom:2px solid var(--teal);margin-top:28px}
.lead .main{padding:0 30px 30px 0;border-right:2px solid var(--teal)}
.lead .main h2{font-size:clamp(46px,7.4vw,96px);margin-top:14px}
.lead .main h2 a{color:var(--ink);text-decoration:none}.lead .main h2 a:hover{color:var(--pinkdeep)}
.lead .main .dek{font-size:23px}
.lead .side{padding:0 0 30px 30px;display:flex;flex-direction:column;gap:24px}
.lead .side h3{font-size:36px;margin-top:10px}.lead .side h3 a{color:var(--ink);text-decoration:none}.lead .side h3 a:hover{color:var(--pinkdeep)}
.lead .side p{margin:8px 0 0;font-size:17px;color:var(--ink2)}
.notice{border:2px solid var(--ink);padding:16px 18px;background:#fff}
.notice h3{font-size:28px}
.notice p{margin:8px 0 0}
.facts-strip{display:grid;grid-template-columns:repeat(4,1fr);border-bottom:2px solid var(--teal)}
.facts-strip div{padding:16px 18px;border-right:2px solid var(--teal)}.facts-strip div:last-child{border-right:0}
.facts-strip b{display:block;font:900 32px/1 var(--head)}
.facts-strip span{font-size:15px;color:var(--ink2)}
.block{margin-top:40px}
.block > header{display:flex;align-items:baseline;justify-content:space-between;gap:12px;border-bottom:6px solid var(--ink);padding-bottom:6px;margin-bottom:18px}
.block > header h2{font-size:clamp(40px,5vw,58px)}
.block > header a{font-size:16px}
.poi{display:grid;grid-template-columns:repeat(4,1fr);gap:22px 22px}
.poi a{display:grid;grid-template-columns:76px 1fr;gap:14px;text-decoration:none;color:var(--ink);align-items:start}
.mug{width:76px;height:92px;background:var(--teal);color:var(--paper);display:grid;place-items:center;font:900 34px/1 var(--head);position:relative}
.mug::after{content:"";position:absolute;left:0;right:0;bottom:12px;height:2px;background:rgba(237,240,235,.45);box-shadow:0 -14px 0 rgba(237,240,235,.25),0 -28px 0 rgba(237,240,235,.15)}
.poi a:nth-child(even) .mug{background:var(--pink)}
.poi b{display:block;font:800 23px/1 var(--head)}
.poi span{display:block;font-size:15px;line-height:1.4;color:var(--ink2);margin-top:5px}
.poi a:hover b{color:var(--pinkdeep)}
.town{display:grid;grid-template-columns:1fr 1.15fr;gap:32px;align-items:start}
.town ol{list-style:none;margin:0;padding:0;border-top:2px solid var(--teal)}
.town li{border-bottom:2px solid var(--teal)}
.town li a{display:block;padding:12px 2px;text-decoration:none;color:var(--ink)}
.town li b{font:800 26px/1 var(--head)}.town li span{display:block;font-size:16px;color:var(--ink2);margin-top:4px}
.town li a:hover b{color:var(--pinkdeep)}
.ads{display:grid;grid-template-columns:repeat(3,1fr);gap:0;border:2px solid var(--ink)}
.ads div{padding:14px 16px;border-right:2px solid var(--ink)}.ads div:last-child{border-right:0}
@media (max-width:900px){.lead{grid-template-columns:1fr}.lead .main{border-right:0;padding-right:0;border-bottom:2px solid var(--teal)}.lead .side{padding:24px 0}.poi{grid-template-columns:repeat(2,1fr)}.town{grid-template-columns:1fr}.facts-strip{grid-template-columns:repeat(2,1fr)}.facts-strip div:nth-child(2){border-right:0}.facts-strip div:nth-child(-n+2){border-bottom:2px solid var(--teal)}}
@media (max-width:560px){.poi{grid-template-columns:1fr}.ads{grid-template-columns:1fr}.ads div{border-right:0;border-bottom:2px solid var(--ink)}.ads div:last-child{border-bottom:0}}
`;

  const mapCss = `
.map{background:#fff;border:2px solid var(--ink);padding:10px 10px 6px}
.map svg{display:block;width:100%;height:auto}
.map .land{fill:var(--paper2);stroke:var(--ink);stroke-width:2}
.map .lake{fill:#BFE0DD;stroke:var(--teal);stroke-width:1.5}
.map a .pin{fill:var(--pink);stroke:#fff;stroke-width:2.5}
.map a text{font:800 17px var(--head);fill:var(--ink)}
.map a:hover text,.map a:focus text{fill:var(--pinkdeep);text-decoration:underline}
.map a:hover .pin{fill:var(--pinkdeep)}
.map figcaption{font-size:13.5px;color:var(--ink2);padding:6px 4px 2px}
`;

  const leonidaMap = () => {
    const pins = [
      ["mount-kalaga-national-park", 236, 70, "Mount Kalaga", "below"],
      ["port-gellhorn", 168, 166, "Port Gellhorn", "end"],
      ["ambrosia", 266, 198, "Ambrosia", "start"],
      ["grassrivers", 272, 278, "Grassrivers", "below"],
      ["vice-city", 340, 300, "Vice City", "start"],
      ["leonida-keys", 214, 386, "Leonida Keys", "end"]
    ];
    const label = (x, y, anchor) => anchor === "end" ? [x - 14, y + 6] : anchor === "start" ? [x + 20, y + 6] : [x, y + 28];
    return `<figure class="map"><svg viewBox="0 0 440 430" role="img" aria-labelledby="maptitle">
<title id="maptitle">Schematic map of Leonida's six regions</title>
<path class="land" d="M18 40 H392 V96 C372 132 360 196 354 256 C349 316 330 352 300 364 C274 372 258 352 244 324 C224 284 210 236 190 190 C178 160 166 128 136 116 C104 104 52 104 18 94 Z"/>
<ellipse class="lake" cx="268" cy="168" rx="26" ry="20"/>
${[[262,392,9,4],[244,400,8,3.5],[226,406,8,3.5],[208,410,7,3],[190,412,6,3],[172,413,5,2.5]].map(([cx,cy,rx,ry]) => `<ellipse class="land" cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}"/>`).join("")}
${pins.map(([slug, x, y, name, anchor]) => { const [lx, ly] = label(x, y, anchor); return `<a href="${slug}.html"><circle class="pin" cx="${x}" cy="${y}" r="8"/><text x="${lx}" y="${ly}" text-anchor="${anchor === "below" ? "middle" : anchor}">${esc(name)}</text></a>`; }).join("\n")}
</svg><figcaption>Schematic only: rough positions from Rockstar's descriptions, not the in-game map. Tap a region to read about it.</figcaption></figure>`;
  };

  const articleCss = `
.article{display:grid;grid-template-columns:minmax(0,1fr) 300px;gap:44px;margin-top:30px}
.article header h1{font-size:clamp(44px,6.6vw,84px);margin-top:14px}
.article .body{max-width:68ch;margin-top:26px}
.article .body h2{font-size:34px;margin:34px 0 10px}
.article .body p{margin:0 0 18px}
.article .body ul{margin:0 0 18px;padding-left:24px}.article .body li{margin-bottom:8px}
.article .body li::marker{color:var(--pink)}
aside.glance{align-self:start;position:sticky;top:18px}
.glance .box{border-top:6px solid var(--pink);border-bottom:2px solid var(--ink);padding:14px 0 6px;background:transparent}
.glance h2{font-size:30px;margin-bottom:8px}
.glance dl{margin:0}
.glance dt{font:700 15px/1.2 var(--head);letter-spacing:.03em;color:var(--teal);margin-top:12px}
.glance dd{margin:2px 0 0;font-size:17px;line-height:1.4}
.glance .mug{width:100%;height:150px;font-size:72px;margin-bottom:6px}
.checklist{border:2px solid var(--ink);background:#fff;padding:16px 20px;margin:4px 0 24px}
.checklist h2{font-size:30px!important;margin:0 0 8px!important}
.checklist ul{list-style:none;padding:0!important;margin:0!important}
.checklist li{margin:0!important;border-bottom:1px solid var(--paper2)}
.checklist label{display:flex;gap:12px;align-items:flex-start;padding:10px 0;cursor:pointer;font-size:18px}
.checklist input{width:22px;height:22px;margin:3px 0 0;accent-color:var(--pink);flex:none}
.checklist input:checked + span{text-decoration:line-through;color:var(--ink2)}
.checklist .progress{font:800 18px var(--head);margin-top:10px;color:var(--teal)}
.sources{margin-top:30px;border-top:2px solid var(--teal);padding-top:12px;font-size:16px}
.sources h2{font-size:26px!important;margin:0 0 6px!important}
.sources ul{padding-left:20px!important}
.more{margin-top:44px}
.more > h2{font-size:40px;border-bottom:6px solid var(--ink);padding-bottom:6px;margin-bottom:14px}
.more ul{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(3,1fr);gap:18px}
.more a{display:block;text-decoration:none;color:var(--ink);border-top:2px solid var(--teal);padding-top:10px}
.more a b{display:block;font:800 24px/1.02 var(--head)}.more a span{display:block;font-size:15.5px;color:var(--ink2);margin-top:6px}
.more a:hover b{color:var(--pinkdeep)}
.crumbs{font-size:15px;margin-top:22px;color:var(--ink2)}
@media (max-width:900px){.article{grid-template-columns:1fr;gap:10px}aside.glance{position:static;order:-1}.glance .mug{display:none}.more ul{grid-template-columns:1fr}}
`;

  const sectionCss = `
.sechead{margin-top:30px;border-bottom:6px solid var(--ink);padding-bottom:16px}
.sechead h1{font-size:clamp(56px,9vw,112px)}
.sechead p{font-size:21px;color:var(--ink2);margin:10px 0 0;max-width:56ch}
.list{list-style:none;margin:0;padding:0}
.list li{border-bottom:2px solid var(--teal)}
.list a{display:grid;grid-template-columns:92px 1fr;gap:20px;padding:18px 0;text-decoration:none;color:var(--ink);align-items:start}
.list .mug{width:92px;height:110px;font-size:40px}
.list li:nth-child(even) .mug{background:var(--pink)}
.list b{display:block;font:900 36px/1 var(--head)}
.list span{display:block;font-size:18px;color:var(--ink2);margin-top:8px;max-width:62ch}
.list a:hover b{color:var(--pinkdeep)}
.list.plain a{grid-template-columns:1fr}
.split{display:grid;grid-template-columns:1fr 1fr;gap:36px;align-items:start;margin-top:26px}
.empty{border:2px dashed var(--teal);padding:22px 24px;margin-top:26px;background:#fff}
.empty h2{font-size:38px}
.empty p{margin:10px 0 0;max-width:62ch}
.empty ul{margin:10px 0 0;padding-left:22px}
.classified{display:grid;grid-template-columns:repeat(3,1fr);border-top:2px solid var(--ink);border-left:2px solid var(--ink);margin-top:26px}
.ad{border-right:2px solid var(--ink);border-bottom:2px solid var(--ink);padding:16px 18px;background:#fff}
.ad h2{font-size:28px}
.ad .where{font-size:15px;color:var(--teal);font-weight:600;margin-top:4px}
.ad .tag{display:inline-block;font:800 14px/1 var(--head);letter-spacing:.03em;padding:4px 7px;margin-top:10px;border:2px solid var(--ink)}
.ad .tag.ue{background:var(--sun)}.ad .tag.po{background:var(--pink);color:#fff;border-color:var(--pink)}
.ad p{margin:10px 0 0;font-size:16.5px;line-height:1.45}
@media (max-width:900px){.split{grid-template-columns:1fr}.classified{grid-template-columns:repeat(2,1fr)}}
@media (max-width:560px){.classified{grid-template-columns:1fr}.list a{grid-template-columns:64px 1fr;gap:14px}.list .mug{width:64px;height:78px;font-size:28px}.list b{font-size:30px}}
`;

  const edition = content.edition;
  const head = (title, desc, path, extra) => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${SITE}${path === "index.html" ? "" : path}">
<meta property="og:site_name" content="The Leonida Herald">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${SITE}${path === "index.html" ? "" : path}">
<meta name="twitter:card" content="summary">
<meta name="theme-color" content="#0E7C7B">
<link rel="icon" type="image/svg+xml" href="${favicon}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@700;800;900&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,600;1,6..72,400&display=swap" rel="stylesheet">
${extra || ""}`;

  const masthead = current => `<a class="skip" href="#main">Skip to content</a>
<header class="mast"><div class="wrap">
  <div class="ears"><p>Guides to Grand Theft Auto VI, written for players.</p><p style="text-align:right">Spoiler-free unless you tap to reveal.</p></div>
  <a class="title" href="index.html" aria-label="The Leonida Herald, home"><b>The Leonida <span>Herald</span></b></a>
  <div class="strap"><span>Vice City edition</span><em>${dayName(edition)}, ${longDate(edition)}</em><span>Independent fan guide</span></div>
</div></header>
<nav class="sections" aria-label="Sections"><div class="wrap"><ul>${SECTIONS.map(s => `<li><a href="${s.file}"${s.id === current ? ' aria-current="page"' : ""}>${esc(s.name)}</a></li>`).join("")}</ul></div></nav>`;

  const footer = `<footer class="site"><div class="wrap cols">
  <div><div class="fmast">The Leonida Herald</div>
  <p>An independent fan guide to Grand Theft Auto VI. We're not affiliated with or endorsed by Rockstar Games or Take-Two Interactive. Game names, characters and places belong to their owners.</p>
  <p>Everything here is written by us from official information and public reporting, with sources linked on every page. Found a mistake? Corrections are part of the job; see <a href="about.html">About</a>.</p></div>
  <div><ul>${SECTIONS.map(s => `<li><a href="${s.file}">${esc(s.name)}</a></li>`).join("")}<li><a href="about.html">About the Herald</a></li></ul></div>
</div></footer>`;

  const renderBody = body => {
    const out = []; let list = null;
    for (const raw of body.split("\n")) {
      const line = raw.trim();
      if (!line) continue;
      if (line.startsWith("- ")) { (list = list || []).push(`<li>${esc(line.slice(2))}</li>`); continue; }
      if (list) { out.push(`<ul>${list.join("")}</ul>`); list = null; }
      out.push(line.startsWith("## ") ? `<h2>${esc(line.slice(3))}</h2>` : `<p>${esc(line)}</p>`);
    }
    if (list) out.push(`<ul>${list.join("")}</ul>`);
    return out.join("\n");
  };

  const page = (path, title, desc, current, extraCss, mainHtml, extraHead, script) =>
    head(title, desc, path, extraHead) + `
<style>${css}${extraCss || ""}</style>
</head>
<body>
${masthead(current)}
<main id="main" class="wrap">
${mainHtml}
</main>
${footer}
${script || ""}
</body>
</html>
`;

  const files = {};

  // Article pages
  for (const a of content.articles) {
    const sec = secById[a.section];
    const related = bySection(a.section).filter(x => x.slug !== a.slug).slice(0, 3);
    const fill = arts.filter(x => x.section !== a.section && !related.includes(x));
    const more = related.concat(fill).slice(0, 3);
    const ld = { "@context": "https://schema.org", "@type": "Article", headline: a.title, description: a.dek, datePublished: a.date, dateModified: a.date, articleSection: sec.name, mainEntityOfPage: SITE + a.slug + ".html", author: { "@type": "Organization", name: "The Leonida Herald" }, publisher: { "@type": "Organization", name: "The Leonida Herald" } };
    const crumbsLd = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Front Page", item: SITE }, { "@type": "ListItem", position: 2, name: sec.name, item: SITE + sec.file }, { "@type": "ListItem", position: 3, name: a.title, item: SITE + a.slug + ".html" }] };
    const titleTag = a.kind === "character" ? `${a.title} in GTA 6: who they are | The Leonida Herald` : a.kind === "region" ? `${a.title}, GTA 6: region guide | The Leonida Herald` : `${a.title} | The Leonida Herald`;
    const checklist = a.checklist ? `<section class="checklist" aria-labelledby="cl-${a.slug}" data-key="lh-check-${a.slug}"><h2 id="cl-${a.slug}">Launch-night checklist</h2><ul>${a.checklist.map((c, i) => `<li><label><input type="checkbox" data-i="${i}"><span>${esc(c)}</span></label></li>`).join("")}</ul><div class="progress" aria-live="polite"></div></section>` : "";
    const checklistJs = a.checklist ? `<script>
(function(){
  var box = document.querySelector(".checklist"); if (!box) return;
  var key = box.getAttribute("data-key"), inputs = box.querySelectorAll("input"), prog = box.querySelector(".progress"), saved = [];
  try { saved = JSON.parse(localStorage.getItem(key) || "[]"); } catch (e) {}
  function update(){ var done = 0; inputs.forEach(function(i){ if (i.checked) done++; }); prog.textContent = done + " of " + inputs.length + " done" + (done === inputs.length ? ". You're ready for Leonida." : ""); }
  inputs.forEach(function(i){
    i.checked = saved.indexOf(Number(i.getAttribute("data-i"))) > -1;
    i.addEventListener("change", function(){
      var s = []; inputs.forEach(function(x){ if (x.checked) s.push(Number(x.getAttribute("data-i"))); });
      try { localStorage.setItem(key, JSON.stringify(s)); } catch (e) {}
      update();
    });
  });
  update();
})();
</script>` : "";
    const bodyHtml = a.checklist ? renderBody(a.body) + checklist : renderBody(a.body);
    files[a.slug + ".html"] = page(a.slug + ".html", titleTag, a.dek, a.section, articleCss, `
<div class="crumbs"><a href="index.html">Front Page</a> / <a href="${sec.file}">${esc(sec.name)}</a></div>
<div class="article">
  <article>
    <header>
      <a class="flag" href="${sec.file}">${esc(sec.name)}</a>
      <h1>${esc(a.title)}</h1>
      <p class="dek">${esc(a.dek)}</p>
      <div class="byline">By <b>The Leonida Herald</b>, ${longDate(a.date)}</div>
    </header>
    <div class="body">
${bodyHtml}
      <section class="sources" aria-label="Sources"><h2>Sources</h2><ul>${a.sources.map(s => `<li><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.name)}</a></li>`).join("")}</ul></section>
    </div>
  </article>
  <aside class="glance" aria-label="At a glance">
    ${a.kind === "character" ? `<div class="mug" aria-hidden="true">${esc(initials(a.title))}</div>` : ""}
    <div class="box"><h2>At a glance</h2><dl>${(a.facts || []).map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join("")}</dl></div>
  </aside>
</div>
<section class="more" aria-label="More from the Herald"><h2>More from the Herald</h2><ul>${more.map(m => `<li><a href="${m.slug}.html"><b>${esc(m.title)}</b><span>${esc(m.dek)}</span></a></li>`).join("")}</ul></section>`,
      `<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, "\\u003c")}</script>\n<script type="application/ld+json">${JSON.stringify(crumbsLd).replace(/</g, "\\u003c")}</script>`, checklistJs);
  }

  // Section pages
  const listItems = (list, withMug) => `<ul class="list${withMug ? "" : " plain"}">${list.map(a => `<li><a href="${a.slug}.html">${withMug ? `<div class="mug" aria-hidden="true">${esc(initials(a.title))}</div>` : ""}<div><b>${esc(a.title)}</b><span>${esc(a.dek)}</span></div></a></li>`).join("")}</ul>`;
  const secHead = s => `<div class="sechead"><h1>${esc(s.name)}</h1><p>${esc(s.blurb)}</p></div>`;

  const ww = secById["whos-who"];
  files[ww.file] = page(ww.file, "GTA 6 characters: every confirmed character | The Leonida Herald", "Who's who in GTA VI: Jason Duval, Lucia Caminos and every other character Rockstar has confirmed, explained without spoilers.", ww.id, sectionCss, secHead(ww) + listItems(bySection("whos-who"), true));

  const cb = secById["crime-beat"];
  files[cb.file] = page(cb.file, "GTA 6 mission walkthroughs | The Leonida Herald", "GTA VI mission walkthroughs: every story mission in order, with objectives, tips and rewards. Coverage starts at launch on November 19, 2026.", cb.id, sectionCss, secHead(cb) + `
<div class="empty"><h2>The mission desk opens Thursday, November 19</h2>
<p>GTA VI isn't out yet, so there are no missions to walk through. Rather than guess, we'll publish walkthroughs as the story is played after launch. Each mission page will cover:</p>
<ul><li>How the mission unlocks and who gives it</li><li>Objectives, step by step</li><li>Tips for the tricky parts, and any choices that matter</li><li>Rewards and what it unlocks next</li></ul>
<p>Story spoilers will sit behind a tap, and each page will say clearly whether its details are confirmed. Until then, get to know <a href="whos-who.html">the cast</a> and <a href="around-town.html">the map</a>.</p></div>`);

  const at = secById["around-town"];
  files[at.file] = page(at.file, "GTA 6 map and regions of Leonida | The Leonida Herald", "A guide to Leonida, GTA VI's state: Vice City, the Leonida Keys, Grassrivers, Port Gellhorn, Ambrosia and Mount Kalaga National Park.", at.id, sectionCss + mapCss, secHead(at) + `
<div class="split"><div>${listItems(bySection("around-town"), false)}</div><div>${leonidaMap()}</div></div>
<div class="empty"><h2>Side quests start at launch</h2><p>Strangers, odd jobs and side activities will be listed here region by region once the game is out on November 19.</p></div>`);

  const cl = secById["classifieds"];
  const tagClass = s => s === "Ultimate Edition" ? "ue" : s === "Pre-order bonus" ? "po" : "";
  files[cl.file] = page(cl.file, "GTA 6 shops and businesses | The Leonida Herald", "Every GTA VI shop, garage and business confirmed so far, from the Ultimate Edition stores to Vice City's cruise port. Prices and stock added at launch.", cl.id, sectionCss, secHead(cl) + `
<p style="margin:22px 0 0;max-width:64ch">These are the shops and businesses confirmed before launch. Stock lists, prices and exact locations will be added once the game is out.</p>
<div class="classified">${content.shops.map(s => `<div class="ad"><h2>${esc(s.name)}</h2><div class="where">${esc(s.where)}</div><span class="tag ${tagClass(s.status)}">${esc(s.status)}</span><p>${esc(s.note)}</p></div>`).join("")}</div>
<section class="sources" aria-label="Sources" style="margin-top:26px;border-top:2px solid var(--teal);padding-top:12px;font-size:16px"><b>Sources:</b> ${content.shopSources.map(s => `<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.name)}</a>`).join(", ")}</section>`);

  const ad = secById["advice"];
  files[ad.file] = page(ad.file, "GTA 6 guides and tips | The Leonida Herald", "GTA VI strategy guides, buying advice and tips, from launch-day prep to which edition to buy.", ad.id, sectionCss, secHead(ad) + listItems(bySection("advice"), false) + `
<div class="empty"><h2>Strategy guides after launch</h2><p>Making money, losing a wanted level, the best cars and weapons, and a beginner's guide will follow once the game is in players' hands.</p></div>`);

  files["about.html"] = page("about.html", "About The Leonida Herald", "The Leonida Herald is an independent, spoiler-conscious fan guide to Grand Theft Auto VI.", "", sectionCss, `
<div class="sechead"><h1>About the Herald</h1><p>An independent guide to Grand Theft Auto VI, written for players.</p></div>
<div class="article" style="grid-template-columns:minmax(0,1fr)"><div class="body" style="margin-top:20px">
<p>The Leonida Herald covers GTA VI the way a local paper covers its town: who's who, what's happening and where to go. Guides are written by us, in our own words, from Rockstar's official information and public reporting, and every page lists its sources.</p>
<h2 style="font:900 34px/1 var(--head);margin:30px 0 10px">How we handle spoilers</h2>
<p>Character and region pages stay spoiler-free. Once missions are covered, story twists will be hidden until you tap to reveal them, and mission pages will say whether their details are confirmed.</p>
<h2 style="font:900 34px/1 var(--head);margin:30px 0 10px">Not affiliated</h2>
<p>We're a fan site. We aren't affiliated with or endorsed by Rockstar Games or Take-Two Interactive, and all game names, characters and places belong to their owners.</p>
</div></div>`);

  // Front page
  const lead = content.articles.find(a => a.slug === "gta-6-launch-day-guide");
  const second = content.articles.find(a => a.slug === "gta-6-standard-vs-ultimate-edition");
  const cast = bySection("whos-who");
  const regions = bySection("around-town");
  const frontLd = { "@context": "https://schema.org", "@type": "WebSite", name: "The Leonida Herald", url: SITE, description: "Independent guides to Grand Theft Auto VI." };
  files["index.html"] = head("The Leonida Herald: GTA 6 guides, characters, map and walkthroughs", "Independent, spoiler-conscious guides to Grand Theft Auto VI: characters, the map of Leonida, shops, launch guides and mission walkthroughs.", "index.html",
    `<script type="application/ld+json">${JSON.stringify(frontLd)}</script>`) + `
<style>${css}${frontCss}${mapCss}</style>
</head>
<body>
${masthead("front")}
<div class="banner">GTA VI is out Thursday, November 19 on PS5 and Xbox Series X|S. <a href="${lead.slug}.html">Read our launch guide</a></div>
<main id="main" class="wrap">
  <section class="lead" aria-label="Top stories">
    <div class="main">
      <a class="flag" href="advice-column.html">Advice Column</a>
      <h2><a href="${lead.slug}.html">Two days to Leonida: your launch-night guide</a></h2>
      <p class="dek">${esc(lead.dek)}</p>
      <div class="byline">By <b>The Leonida Herald</b>, ${longDate(lead.date)}</div>
    </div>
    <div class="side">
      <div><a class="flag" href="advice-column.html">Advice Column</a><h3><a href="${second.slug}.html">Standard or Ultimate? What the extra $20 gets you</a></h3><p>${esc(second.dek)}</p></div>
      <div class="notice"><h3>Mission walkthroughs start Thursday</h3><p>The Crime Beat opens at launch, with every story mission in order and spoilers hidden until you tap. <a href="crime-beat.html">How it will work</a></p></div>
    </div>
  </section>
  <section class="facts-strip" aria-label="Launch facts">
    <div><b>Nov 19</b><span>Release day, 2026</span></div>
    <div><b>PS5 &amp; Xbox</b><span>Series X|S only. No PC yet</span></div>
    <div><b>212 GB</b><span>Largest download size</span></div>
    <div><b>$79.99</b><span>Standard Edition price</span></div>
  </section>
  <section class="block" aria-labelledby="poi-h">
    <header><h2 id="poi-h">Persons of interest</h2><a href="whos-who.html">All characters in Who's Who</a></header>
    <div class="poi">${cast.map(c => `<a href="${c.slug}.html"><div class="mug" aria-hidden="true">${esc(initials(c.title))}</div><div><b>${esc(c.title.replace(/ \(.*\)/, ""))}</b><span>${esc(c.dek.split(/[:.]/)[0])}</span></div></a>`).join("")}</div>
  </section>
  <section class="block" aria-labelledby="town-h">
    <header><h2 id="town-h">Around town</h2><a href="around-town.html">The full regional guide</a></header>
    <div class="town"><ol>${regions.map(r => `<li><a href="${r.slug}.html"><b>${esc(r.title)}</b><span>${esc(r.dek.split(/[.:]/)[0])}</span></a></li>`).join("")}</ol>${leonidaMap()}</div>
  </section>
  <section class="block" aria-labelledby="ads-h">
    <header><h2 id="ads-h">From the classifieds</h2><a href="classifieds.html">Every shop confirmed so far</a></header>
    <div class="ads">${content.shops.slice(0, 3).map(s => `<div><b style="font:800 24px/1 var(--head)">${esc(s.name)}</b><p style="margin:8px 0 0;font-size:16px">${esc(s.note)}</p></div>`).join("")}</div>
  </section>
</main>
${footer}
</body>
</html>
`;

  // SEO files
  const pages = ["index.html", ...SECTIONS.slice(1).map(s => s.file), "about.html", ...content.articles.map(a => a.slug + ".html")];
  const lastmod = p => { const a = content.articles.find(x => x.slug + ".html" === p); return a ? a.date : edition; };
  files["sitemap.xml"] = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages.map(p => `  <url><loc>${SITE}${p === "index.html" ? "" : p}</loc><lastmod>${lastmod(p)}</lastmod></url>`).join("\n")}\n</urlset>\n`;
  files["robots.txt"] = `User-agent: *\nAllow: /\nSitemap: ${SITE}sitemap.xml\n`;
  files["CNAME"] = "leonidaherald.com\n";
  files[".nojekyll"] = "";
  return files;
}

if (typeof module !== "undefined" && require.main === module) {
  const fs = require("fs"), path = require("path");
  const [src, out] = process.argv.slice(2);
  const files = buildSite(JSON.parse(fs.readFileSync(src, "utf8")));
  fs.mkdirSync(out, { recursive: true });
  for (const [f, c] of Object.entries(files)) fs.writeFileSync(path.join(out, f), c);
  console.log(Object.keys(files).length + " files written to " + out);
}
