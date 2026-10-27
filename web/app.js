/* Kids Coding Studio — client (local only, no external chat) */
const App = (() => {
  const COLORS = {
    WHEN: "#f59e0b", DO: "#2563eb", IF: "#0d9488", CHOICE: "#db2777",
    SAY: "#0f766e", SHOW: "#ea580c", PLAY: "#ca8a04", MOVE: "#16a34a",
    ASK_AI: "#b45309", END: "#78716c",
  };
  const LANE_LABELS = {
    setup: "Setup lane",
    path_a: "Path A · main / choice 1",
    path_b: "Path B · alternate / choice 2",
    wrap: "Wrap · ending",
  };

  let state = null;
  let route = "home";
  let kid = null; // 'kida' | 'kidb'
  let projectId = null;
  let selectedBlockId = null;

  async function api(path, opts) {
    const res = await fetch(path, {
      headers: { "Content-Type": "application/json" },
      ...opts,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || res.statusText);
    return data;
  }

  async function boot() {
    state = await api("/api/state");
    window.addEventListener("hashchange", onHash);
    document.querySelectorAll(".nav [data-route]").forEach((btn) => {
      btn.addEventListener("click", () => go(btn.dataset.route));
    });
    onHash();
  }

  function onHash() {
    const raw = (location.hash || "#/home").replace(/^#\/?/, "");
    const parts = raw.split("/").filter(Boolean);
    route = parts[0] || "home";
    if (route === "kid") {
      kid = parts[1] || null;
      projectId = null;
    } else if (route === "studio") {
      kid = parts[1] || null;
      projectId = parts[2] || null;
    } else {
      // keep kid context for briefs start-from
    }
    render();
  }

  function go(r, a, b) {
    let h = "#/" + r;
    if (a) h += "/" + a;
    if (b) h += "/" + b;
    location.hash = h;
  }

  function toast(msg) {
    const el = document.getElementById("toast");
    el.textContent = msg;
    el.hidden = false;
    clearTimeout(toast._t);
    toast._t = setTimeout(() => { el.hidden = true; }, 2600);
  }

  function askParent() {
    document.getElementById("parent-gate").showModal();
  }

  function profile(id) {
    return state.profiles[id];
  }

  function projectsFor(id) {
    return Object.values(state.projects)
      .filter((p) => p.owner === id)
      .sort((a, b) => (b.updated || "").localeCompare(a.updated || ""));
  }

  function brief(id) {
    return state.briefs[id];
  }

  function fmtWhen(iso) {
    if (!iso) return "—";
    try {
      const d = new Date(iso);
      return d.toLocaleString("en-US", {
        timeZone: "America/New_York",
        month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
      }) + " ET";
    } catch {
      return iso;
    }
  }

  function setNav() {
    document.querySelectorAll(".nav [data-route]").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.route === route ||
        (route === "kid" && btn.dataset.route === "home") ||
        (route === "studio" && btn.dataset.route === "home"));
    });
  }

  function render() {
    setNav();
    const view = document.getElementById("view");
    if (route === "home") view.innerHTML = viewHome();
    else if (route === "briefs") view.innerHTML = viewBriefs();
    else if (route === "parent") view.innerHTML = viewParent();
    else if (route === "kid" && kid) view.innerHTML = viewKid(kid);
    else if (route === "studio" && kid && projectId) view.innerHTML = viewStudio(kid, projectId);
    else view.innerHTML = viewHome();
    bindView();
  }

  function viewHome() {
    return `
      <section class="hero">
        <div class="card">
          <h1>Build stories. Learn by making.</h1>
          <p class="muted">An Inkwright-shaped coding studio for Kid A and Kid B.
          Snap blocks into lanes to tell stories that teach logic, art, music, robots, and kind AI prompts —
          not a homework tutor.</p>
          <div class="safety-banner">Age-safe mode on · no external chat · AI helper off until a parent enables it · Ask a Parent anytime</div>
          <div class="stats">
            <div class="stat"><b>${Object.keys(state.briefs).length}</b><span class="muted tiny">starter briefs</span></div>
            <div class="stat"><b>2</b><span class="muted tiny">kid shelves</span></div>
            <div class="stat"><b>${state.ai_helper_enabled ? "ON" : "OFF"}</b><span class="muted tiny">AI helper</span></div>
          </div>
        </div>
        <div class="card hero-tip">
          <h2>Tonight's studio tip</h2>
          <p>Start from a brief, drag blocks into Setup → Path A/B → Wrap, then hit <b>Play Story</b>.
          Remix is the point — not finishing a worksheet.</p>
          <button class="primary" onclick="App.go('briefs')">Browse briefs</button>
        </div>
      </section>
      <div class="kid-grid">
        ${kidCard("kida")}
        ${kidCard("kidb")}
      </div>
    `;
  }

  function kidCard(id) {
    const p = profile(id);
    const shelf = projectsFor(id);
    const active = state.projects[p.active_project_id] || shelf[0];
    return `
      <button type="button" class="card kid-card ${id}" onclick="App.go('kid','${id}')">
        <span class="badge">${p.short_name} · ${p.grade}</span>
        <h2 style="margin-top:.6rem">${p.display_name}</h2>
        <p class="muted">${p.bio}</p>
        <div class="pill-row">
          <span class="pill">Active: ${active ? active.title : "—"}</span>
          <span class="pill">${shelf.length} on shelf</span>
          <span class="pill">Last: ${fmtWhen(p.last_session && p.last_session.at)}</span>
        </div>
      </button>`;
  }

  function viewKid(id) {
    const p = profile(id);
    const shelf = projectsFor(id);
    const sugg = brief(p.suggested_next);
    return `
      <div class="section-title">
        <div>
          <button class="ghost" onclick="App.go('home')">← Home</button>
          <h2>${p.display_name}'s shelf</h2>
          <p class="muted">${p.bio}</p>
        </div>
        <button class="primary" onclick="App.go('briefs')">+ Start from brief</button>
      </div>
      <div class="card" style="margin-bottom:1rem">
        <div class="domain">Suggested next</div>
        <h3>${sugg ? sugg.emoji + " " + sugg.title : "Pick any brief"}</h3>
        <p class="muted">${sugg ? sugg.tagline : ""}</p>
        ${sugg ? `<button class="primary" onclick="App.startBrief('${id}','${sugg.id}')">Start for ${p.short_name}</button>` : ""}
      </div>
      <div class="shelf">
        ${shelf.map((proj) => `
          <button type="button" class="card project-tile" onclick="App.go('studio','${id}','${proj.id}')">
            <div class="status">${proj.status}</div>
            <h3>${proj.title}</h3>
            <p class="muted tiny">${proj.domain} · ${ (proj.blocks || []).length } blocks · updated ${fmtWhen(proj.updated)}</p>
          </button>`).join("") || `<p class="empty">Shelf is empty — grab a brief.</p>`}
      </div>`;
  }

  function viewBriefs() {
    const list = Object.values(state.briefs);
    const domains = [...new Set(list.map((b) => b.domain))];
    return `
      <div class="section-title">
        <div>
          <h2>Project briefs</h2>
          <p class="muted">${list.length} starters across ${domains.join(", ")}. Each has steps, a success checklist, and a parent blurb.</p>
        </div>
      </div>
      <div class="brief-grid">
        ${list.map((b) => `
          <article class="card brief-card" data-brief="${b.id}">
            <div class="mark" aria-hidden="true">${(b.domain || "?").slice(0,1).toUpperCase()}</div>
            <div class="domain">${b.domain} · ages ${b.age_band} · ~${b.minutes}m</div>
            <h3>${b.title}</h3>
            <p class="muted" style="flex:1">${b.tagline}</p>
            <div class="pill-row">
              <button onclick="event.stopPropagation();App.startBrief('kida','${b.id}')">Kid A</button>
              <button onclick="event.stopPropagation();App.startBrief('kidb','${b.id}')">Kid B</button>
              <button class="ghost" onclick="event.stopPropagation();App.showBrief('${b.id}')">Details</button>
            </div>
          </article>`).join("")}
      </div>
      <div id="brief-detail"></div>`;
  }

  function showBrief(id) {
    const b = brief(id);
    if (!b) return;
    const el = document.getElementById("brief-detail");
    if (!el) return;
    el.innerHTML = `
      <div class="card" style="margin-top:1rem">
        <h2>${b.emoji} ${b.title}</h2>
        <p>${b.tagline}</p>
        <h3>Steps</h3>
        <ol>${b.steps.map((s) => `<li>${esc(s)}</li>`).join("")}</ol>
        <h3>Success checklist</h3>
        <ul class="checklist">${b.success.map((s) => `<li>☐ ${esc(s)}</li>`).join("")}</ul>
        <h3>For parents</h3>
        <p class="muted">${esc(b.parent_blurb)}</p>
      </div>`;
    el.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  async function startBrief(kidId, briefId) {
    try {
      const res = await api("/api/projects/new", {
        method: "POST",
        body: JSON.stringify({ owner: kidId, brief_id: briefId }),
      });
      state.projects[res.project.id] = res.project;
      state.profiles[kidId].active_project_id = res.project.id;
      toast(`Started “${res.project.title}” for ${profile(kidId).short_name}`);
      go("studio", kidId, res.project.id);
    } catch (e) {
      toast(e.message);
    }
  }

  function viewStudio(kidId, pid) {
    const p = profile(kidId);
    const proj = state.projects[pid];
    if (!proj) return `<div class="card">Project missing. <button onclick="App.go('kid','${kidId}')">Back</button></div>`;
    const br = brief(proj.brief_id);
    const selected = (proj.blocks || []).find((b) => b.id === selectedBlockId);
    return `
      <div class="toolbar">
        <button class="ghost" onclick="App.go('kid','${kidId}')">← ${p.short_name}'s shelf</button>
        <strong>${esc(proj.title)}</strong>
        <span class="pill">${proj.domain}</span>
        <span class="pill">${(proj.blocks || []).length} blocks</span>
        <button class="primary" onclick="App.playStory()">Play Story</button>
        <button onclick="App.saveProject()">Save</button>
        <button onclick="App.touchSession()">Log session</button>
      </div>
      <div class="studio-grid">
        <aside class="card">
          <h3>Block tray</h3>
          <p class="muted tiny">Click a chip to drop it on Setup.</p>
          <div class="palette">
            ${(state.block_palette || []).map((bp) => `
              <button class="block-chip" style="background:${bp.color}" onclick="App.addBlock('${bp.type}')">
                ${bp.type}<small>${bp.hint}</small>
              </button>`).join("")}
          </div>
        </aside>
        <section>
          <div class="lanes">
            ${["setup","path_a","path_b","wrap"].map((lane) => laneHTML(proj, lane)).join("")}
          </div>
          <div class="card" style="margin-top:.8rem">
            <h3>Stage</h3>
            <div class="play-stage" id="stage">Press Play Story to run the lanes…</div>
          </div>
        </section>
        <aside class="card side-panel">
          <h3>Inspector</h3>
          ${selected ? inspectorHTML(selected) : `<p class="empty">Select a block in a lane.</p>`}
          <hr style="border-color:var(--line);margin:1rem 0">
          <h3>Brief checklist</h3>
          <ul class="checklist">
            ${(br ? br.success : Object.keys(proj.checklist || {})).map((item) => {
              const on = !!(proj.checklist || {})[item];
              return `<li><input type="checkbox" ${on ? "checked" : ""} onchange="App.toggleCheck(${JSON.stringify(item)}, this.checked)"> <span>${esc(item)}</span></li>`;
            }).join("")}
          </ul>
          ${br ? `<p class="muted tiny" style="margin-top:.8rem"><b>Parent:</b> ${esc(br.parent_blurb)}</p>` : ""}
          <div class="safety-banner">SAY / ASK_AI text is checked locally. No creepy personal questions. Tap Ask a Parent if stuck.</div>
        </aside>
      </div>`;
  }

  function laneHTML(proj, lane) {
    const ids = (proj.lanes && proj.lanes[lane]) || [];
    const byId = Object.fromEntries((proj.blocks || []).map((b) => [b.id, b]));
    return `
      <div class="lane" data-lane="${lane}" ondragover="event.preventDefault()" ondrop="App.dropOnLane(event,'${lane}')">
        <div class="lane-label">${LANE_LABELS[lane]}</div>
        <div class="lane-blocks">
          ${ids.map((id) => {
            const b = byId[id];
            if (!b) return "";
            const meta = blockMeta(b);
            return `<div class="block" draggable="true" data-id="${b.id}"
              style="background:${COLORS[b.type] || "#a8a29e"}"
              ondragstart="App.dragBlock(event,'${b.id}')">
              <button type="button" class="block-hit" onclick="App.selectBlock('${b.id}')">
                ${b.type} · ${esc(b.label || "")}
                <span class="meta">${esc(meta)}</span>
              </button>
              <button type="button" class="x" onclick="App.removeBlock('${b.id}')" title="Remove">×</button>
            </div>`;
          }).join("") || `<span class="empty">Drop or add blocks</span>`}
        </div>
      </div>`;
  }

  function blockMeta(b) {
    const a = b.args || {};
    return a.text || a.prompt || a.scene || a.sound || a.condition || a.event || a.action || a.dir || "";
  }

  function inspectorHTML(b) {
    const a = b.args || {};
    return `
      <label>Type</label><input value="${b.type}" disabled>
      <label>Label</label><input id="ins-label" value="${escAttr(b.label || "")}">
      ${b.type === "SAY" || b.type === "ASK_AI" ? `
        <label>${b.type === "ASK_AI" ? "Safe prompt" : "Line"}</label>
        <textarea id="ins-text">${esc(a.text || a.prompt || "")}</textarea>
        <button onclick="App.checkSafety()">Safety check</button>
        <p class="muted tiny" id="ins-safety"></p>` : ""}
      ${b.type === "SHOW" ? `<label>Scene id</label><input id="ins-scene" value="${escAttr(a.scene || "")}">` : ""}
      ${b.type === "PLAY" ? `<label>Sound</label><input id="ins-sound" value="${escAttr(a.sound || "")}">` : ""}
      ${b.type === "IF" ? `<label>Condition</label><input id="ins-cond" value="${escAttr(a.condition || "")}">` : ""}
      ${b.type === "MOVE" ? `<label>Direction</label><input id="ins-dir" value="${escAttr(a.dir || "forward")}">` : ""}
      <button class="primary" style="margin-top:.8rem" onclick="App.applyInspector()">Apply</button>
    `;
  }

  function viewParent() {
    const kids = ["kida", "kidb"].map((id) => {
      const p = profile(id);
      const shelf = projectsFor(id);
      const active = state.projects[p.active_project_id] || shelf[0];
      const sugg = brief(p.suggested_next);
      const ls = p.last_session || {};
      return `
        <article class="card">
          <span class="badge-soft" style="background:${id === "kida" ? "rgba(228,87,46,.12)" : "rgba(42,157,143,.14)"};color:${id === "kida" ? "#b33c16" : "#1b6f64"}">${p.short_name}</span>
          <h2>${p.display_name} · ${p.grade}</h2>
          <p><b>Working on:</b> ${active ? esc(active.title) : "—"} (${active ? active.status : ""})</p>
          <p><b>Last session:</b> ${fmtWhen(ls.at)} · ${ls.minutes || 0} min</p>
          <p class="muted">${esc(ls.note || "")}</p>
          <p><b>Suggested next:</b> ${sugg ? sugg.emoji + " " + sugg.title : "—"}</p>
          <p class="muted tiny">${sugg ? sugg.parent_blurb : ""}</p>
          <div class="pill-row">
            <span class="pill">${shelf.length} projects</span>
            <span class="pill">${active ? (active.blocks || []).length + " blocks" : "0 blocks"}</span>
          </div>
          <div class="toolbar" style="margin-top:.8rem">
            <button onclick="App.go('kid','${id}')">Open shelf</button>
            ${active ? `<button class="primary" onclick="App.go('studio','${id}','${active.id}')">Open active</button>` : ""}
          </div>
        </article>`;
    }).join("");
    const helperOn = !!state.ai_helper_enabled;
    const helperMode = state.helper_mode || (helperOn ? "local" : "off");
    return `
      <div class="section-title">
        <div>
          <h2>Parent overview</h2>
          <p class="muted">For parents · what each kid is building, last session, suggested next. Separate from Kid A Tutor / Kid B Tutor.</p>
        </div>
      </div>
      <div class="card" style="margin-bottom:1rem">
        <h3>Safety controls</h3>
        <p class="muted">AI helper is <b>${helperOn ? "enabled" : "disabled"}</b>
          · mode <b>${esc(helperMode)}</b>.
          Classifiers and story blocks stay on this machine. See SAFETY.md
          (folded from Agent Brief Forge <b>brief-006</b>).</p>
        <div class="toolbar">
          <button class="primary" onclick="App.setAI(true)">Enable AI helper</button>
          <button onclick="App.setAI(false)">Disable AI helper</button>
          <button class="ask-parent" onclick="App.askParent()">Ask-a-Parent escape</button>
        </div>
      </div>
      <div class="card portable-controls" style="margin-bottom:1rem">
        <h3>Age-safe portable controls</h3>
        <p class="muted tiny">Household defaults from brief-006. Practical engineering / parenting controls — <b>not legal advice</b>.</p>
        <ul class="control-list">
          <li><b>Helper OFF by default</b> — cold start never silently enables AI.</li>
          <li><b>Parent-only gate</b> — kids who tap ASK_AI while off get Ask-a-Parent, not a model.</li>
          <li><b>Craft, not companion</b> — local story-block help; never “secret friend” UX.</li>
          <li><b>Social-engineering filter</b> — identity / meetup / jailbreak phrases fail closed on save. Regex is layer-0 only (incomplete vs paraphrase).</li>
          <li><b>No outbound tools</b> — no email, chat SDKs, browse, or payments from kid sessions.</li>
          <li><b>On-device vs cloud</b> — v1 has no model. Local model only after parent enable. Cloud only with explicit parent Apply + zero-retention posture (not wired tonight).</li>
        </ul>
        <div class="safety-banner">Weekly 5 min: confirm helper still off (or intentionally on) · skim each shelf · ask “what should you never type into a helper?”</div>
      </div>
      <div class="kid-grid">${kids}</div>`;
  }

  function bindView() {
    // no-op placeholder for future view bindings
  }

  function uid(prefix) {
    return prefix + Math.random().toString(36).slice(2, 8);
  }

  function addBlock(type) {
    const proj = state.projects[projectId];
    if (!proj) return;
    if (type === "ASK_AI" && !state.ai_helper_enabled) {
      toast("AI helper is off — a parent can enable it on the Parent page.");
      askParent();
      return;
    }
    const id = uid("b");
    const block = {
      id,
      type,
      label: defaultLabel(type),
      args: defaultArgs(type),
    };
    proj.blocks = proj.blocks || [];
    proj.blocks.push(block);
    proj.lanes = proj.lanes || { setup: [], path_a: [], path_b: [], wrap: [] };
    proj.lanes.setup.push(id);
    selectedBlockId = id;
    render();
  }

  function defaultLabel(type) {
    return ({
      WHEN: "When something happens",
      DO: "Do a thing",
      IF: "If…",
      CHOICE: "Choose a path",
      SAY: "Say a line",
      SHOW: "Show a scene",
      PLAY: "Play a sound",
      MOVE: "Move",
      ASK_AI: "Ask for a scene idea",
      END: "The end",
    })[type] || type;
  }

  function defaultArgs(type) {
    if (type === "SAY") return { text: "Once upon a pixel…" };
    if (type === "ASK_AI") return { prompt: "Suggest a cozy forest setting for a short adventure. No real people." };
    if (type === "SHOW") return { scene: "forest-clearing", palette: "warm-day" };
    if (type === "PLAY") return { sound: "soft-drums", tempo: "chill" };
    if (type === "IF") return { condition: "choice == A" };
    if (type === "MOVE") return { dir: "forward", steps: 1 };
    if (type === "WHEN") return { event: "start" };
    if (type === "DO") return { action: "wave" };
    if (type === "CHOICE") return { options: ["Path A", "Path B"] };
    return {};
  }

  function selectBlock(id) {
    selectedBlockId = id;
    render();
  }

  function removeBlock(id) {
    const proj = state.projects[projectId];
    proj.blocks = (proj.blocks || []).filter((b) => b.id !== id);
    Object.keys(proj.lanes || {}).forEach((lane) => {
      proj.lanes[lane] = (proj.lanes[lane] || []).filter((x) => x !== id);
    });
    if (selectedBlockId === id) selectedBlockId = null;
    render();
  }

  let dragId = null;
  function dragBlock(ev, id) {
    dragId = id;
    ev.dataTransfer.setData("text/plain", id);
  }
  function dropOnLane(ev, lane) {
    ev.preventDefault();
    const id = dragId || ev.dataTransfer.getData("text/plain");
    const proj = state.projects[projectId];
    if (!id || !proj) return;
    Object.keys(proj.lanes).forEach((l) => {
      proj.lanes[l] = (proj.lanes[l] || []).filter((x) => x !== id);
    });
    proj.lanes[lane] = proj.lanes[lane] || [];
    proj.lanes[lane].push(id);
    dragId = null;
    render();
  }

  function applyInspector() {
    const proj = state.projects[projectId];
    const b = (proj.blocks || []).find((x) => x.id === selectedBlockId);
    if (!b) return;
    const labelEl = document.getElementById("ins-label");
    if (labelEl) b.label = labelEl.value.slice(0, 80);
    b.args = b.args || {};
    const textEl = document.getElementById("ins-text");
    if (textEl) {
      if (b.type === "ASK_AI") b.args.prompt = textEl.value;
      else b.args.text = textEl.value;
    }
    const scene = document.getElementById("ins-scene");
    if (scene) b.args.scene = scene.value;
    const sound = document.getElementById("ins-sound");
    if (sound) b.args.sound = sound.value;
    const cond = document.getElementById("ins-cond");
    if (cond) b.args.condition = cond.value;
    const dir = document.getElementById("ins-dir");
    if (dir) b.args.dir = dir.value;
    render();
  }

  async function checkSafety() {
    const textEl = document.getElementById("ins-text");
    const out = document.getElementById("ins-safety");
    if (!textEl || !out) return;
    try {
      const res = await api("/api/safety/check", {
        method: "POST",
        body: JSON.stringify({ text: textEl.value }),
      });
      out.textContent = res.message + (res.ok ? " ✓" : " ✗");
      out.style.color = res.ok ? "#157a6e" : "#b91c1c";
      if (res.ask_parent) askParent();
    } catch (e) {
      out.textContent = e.message;
    }
  }

  function toggleCheck(item, on) {
    const proj = state.projects[projectId];
    proj.checklist = proj.checklist || {};
    proj.checklist[item] = !!on;
  }

  async function saveProject() {
    const proj = state.projects[projectId];
    try {
      // client-side sweep first
      for (const b of proj.blocks || []) {
        const t = (b.args && (b.args.text || b.args.prompt)) || "";
        if (t) {
          const res = await api("/api/safety/check", {
            method: "POST",
            body: JSON.stringify({ text: t }),
          });
          if (!res.ok) {
            toast(res.message);
            selectBlock(b.id);
            return;
          }
        }
      }
      const res = await api("/api/projects/save", {
        method: "POST",
        body: JSON.stringify(proj),
      });
      state.projects[proj.id] = res.project;
      toast("Saved to shelf");
      render();
    } catch (e) {
      toast(e.message);
    }
  }

  async function touchSession() {
    try {
      const res = await api("/api/session/touch", {
        method: "POST",
        body: JSON.stringify({
          kid,
          project_id: projectId,
          minutes: 15,
          note: "Built in Kids Coding Studio",
        }),
      });
      state.profiles[kid].last_session = res.last_session;
      toast("Session logged for parent overview");
    } catch (e) {
      toast(e.message);
    }
  }

  async function setAI(enabled) {
    try {
      const res = await api("/api/parent/ai-toggle", {
        method: "POST",
        body: JSON.stringify({ enabled }),
      });
      state.ai_helper_enabled = res.ai_helper_enabled;
      if (res.helper_mode) state.helper_mode = res.helper_mode;
      else state.helper_mode = enabled ? "local" : "off";
      toast(enabled ? "AI helper enabled (parent)" : "AI helper disabled");
      render();
    } catch (e) {
      toast(e.message);
    }
  }

  function playStory() {
    const proj = state.projects[projectId];
    const byId = Object.fromEntries((proj.blocks || []).map((b) => [b.id, b]));
    const lines = [];
    const runLane = (name) => {
      const ids = (proj.lanes && proj.lanes[name]) || [];
      ids.forEach((id) => {
        const b = byId[id];
        if (!b) return;
        const a = b.args || {};
        switch (b.type) {
          case "WHEN": lines.push(`⚡ WHEN ${a.event || b.label}`); break;
          case "SHOW": lines.push(`🖼  SHOW ${a.scene || b.label}${a.palette ? " [" + a.palette + "]" : ""}`); break;
          case "SAY": lines.push(`💬 ${a.text || b.label}`); break;
          case "PLAY": lines.push(`🎵 PLAY ${a.sound || "sound"} (${a.tempo || "tempo"})`); break;
          case "IF": lines.push(`◇ IF ${a.condition || "…"}`); break;
          case "CHOICE": lines.push(`🔀 CHOICE ${(a.options || []).join(" | ")}`); break;
          case "MOVE": lines.push(`➜ MOVE ${a.dir || "forward"} ×${a.steps || 1}`); break;
          case "DO": lines.push(`▶ DO ${a.action || b.label}`); break;
          case "ASK_AI": lines.push(`AI ASK_AI (local craft): ${a.prompt || ""}`); break;
          case "END": lines.push(`■ END`); break;
          default: lines.push(`· ${b.type} ${b.label}`);
        }
      });
    };
    lines.push(`—— ${proj.title} ——`);
    ["setup", "path_a", "path_b", "wrap"].forEach((ln) => {
      lines.push(`\n[${LANE_LABELS[ln]}]`);
      runLane(ln);
    });
    const stage = document.getElementById("stage");
    if (stage) stage.textContent = lines.join("\n");
  }

  function esc(s) {
    return String(s ?? "").replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    })[c]);
  }
  function escAttr(s) { return esc(s).replace(/\n/g, " "); }

  // public
  return {
    boot, go, askParent, startBrief, showBrief, addBlock, selectBlock,
    removeBlock, dragBlock, dropOnLane, applyInspector, checkSafety,
    toggleCheck, saveProject, touchSession, setAI, playStory,
  };
})();

document.addEventListener("DOMContentLoaded", () => App.boot());
