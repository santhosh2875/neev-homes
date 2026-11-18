(() => {
  "use strict";

  const data = window.NEEV;
  const DIR = "assets/house";
  const IMAGE_TYPES = ["jpg", "png", "webp", "jpeg"];
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const $ = (id) => document.getElementById(id);
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  const smooth = (t) => t * t * (3 - 2 * t);
  const make = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };

  /* ================= Pictures ================= */

  // A picture may be saved as .jpg, .png or .webp: try each in turn.
  function find(name) {
    return new Promise((resolve) => {
      if (!name) return resolve(null);
      const attempt = (n) => {
        if (n >= IMAGE_TYPES.length) return resolve(null);
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => attempt(n + 1);
        img.src = `${DIR}/${name}.${IMAGE_TYPES[n]}`;
      };
      attempt(0);
    });
  }

  // Show a picture as an element's background. Until the file exists, the
  // element says which file it is waiting for.
  function picture(el, name) {
    el.classList.add("pic");
    find(name).then((img) => {
      if (img) {
        el.style.backgroundImage = `url("${img.src}")`;
      } else {
        el.classList.add("is-empty");
        el.dataset.file = `${name}.jpg`;
      }
    });
  }

  /* ================= Money ================= */

  // Amounts are in lakh rupees. 100 lakh = 1 crore.
  const crore = (lakh) => (lakh / 100).toFixed(2);
  const rangeText = ([lo, hi]) => `₹${crore(lo)} – ${crore(hi)} Cr`;
  const addText = ([lo, hi]) => (hi === 0 ? "Included" : `+ ₹${lo} – ${hi} L`);

  const picks = {}; // room id -> the number of the chosen option
  data.rooms.forEach((room) => { picks[room.id] = 0; });

  function total() {
    let [lo, hi] = data.base;
    data.rooms.forEach((room) => {
      const option = room.options[picks[room.id]];
      lo += option.add[0];
      hi += option.add[1];
    });
    return [lo, hi];
  }

  /* ================= Words from config.js ================= */

  $("brand").textContent = data.brand;
  $("brandSub").textContent = data.sub;
  $("footMark").textContent = data.brand;
  $("footCity").textContent = `${data.brand} ${data.sub}, ${data.city}`;
  $("startTitle").textContent = data.start.title;
  $("startText").textContent = data.start.text;
  $("startButton").textContent = data.start.button;
  $("barStart").textContent = data.start.button;
  $("startPhone").textContent = data.phone;
  $("startPhone").href = `tel:${data.phone.replace(/[^+\d]/g, "")}`;
  $("startEmail").textContent = data.email;
  $("startEmail").href = `mailto:${data.email}`;
  data.promises.forEach((p, i) => {
    const li = make("li");
    li.append(make("span", "tag", String(i + 1).padStart(2, "0")), make("h3", "", p.title), make("p", "", p.text));
    $("promises").append(li);
  });

  /* ================= Kitchen and garden: pick a finish ================= */

  const roomParts = data.rooms.map((room) => {
    const section = make("section", "room");
    section.id = room.id;
    section.setAttribute("aria-labelledby", `${room.id}Title`);

    // One picture per option, stacked. Only the chosen one shows.
    const pics = make("div", "room-pics");
    const layers = room.options.map((option) => {
      const el = make("div");
      picture(el, option.file);
      pics.append(el);
      return el;
    });

    const head = make("div", "room-head");
    const title = make("h2", "display", room.title);
    title.id = `${room.id}Title`;
    head.append(make("p", "tag", room.label), title);

    const group = make("div", "options");
    group.setAttribute("role", "group");
    group.setAttribute("aria-label", `${room.name} options`);
    const buttons = room.options.map((option, i) => {
      const button = make("button", "option");
      button.type = "button";
      const swatch = make("span", "swatch");
      swatch.style.background = option.swatch;
      const words = make("span", "option-words");
      words.append(make("b", "", option.name), make("small", "", addText(option.add)));
      button.append(swatch, words);
      button.addEventListener("click", () => choose(room.id, i));
      group.append(button);
      return button;
    });

    // What the chosen option is, in a sentence, and the way on.
    const pick = make("div", "pick");
    const pickText = make("p", "pick-text");
    pickText.setAttribute("aria-live", "polite");
    const next = make("a", "pick-next", room.next.text);
    next.href = room.next.href;
    pick.append(pickText, next);

    const foot = make("div", "room-foot");
    foot.append(group, pick);
    section.append(pics, make("div", "room-shade"), head, foot);
    $("rooms").append(section);
    return { room, layers, buttons, pickText };
  });

  function choose(id, i) {
    picks[id] = i;
    render();
  }

  function render() {
    roomParts.forEach(({ room, layers, buttons, pickText }) => {
      const chosen = picks[room.id];
      layers.forEach((el, k) => el.classList.toggle("is-on", k === chosen));
      buttons.forEach((b, k) => b.setAttribute("aria-pressed", String(k === chosen)));
      pickText.textContent = room.options[chosen].text;
    });

    const sum = total();
    $("estValue").textContent = rangeText(sum);

    // The sheet: the house, each choice, and the total.
    const sheet = $("sheet");
    sheet.textContent = "";
    const row = (label, detail, amount, className) => {
      const div = make("div", className);
      const dt = make("dt");
      dt.append(make("b", "", label), make("span", "", detail));
      div.append(dt, make("dd", "", amount));
      sheet.append(div);
    };
    row(data.house.name, data.house.line, rangeText(data.base));
    data.rooms.forEach((room) => {
      const option = room.options[picks[room.id]];
      row(room.name, option.name, addText(option.add));
    });
    row("Estimate", "House, kitchen and garden", rangeText(sum), "sheet-total");
  }

  render();

  // The estimate in the header gives a small nod each time it changes.
  const est = $("est");
  let nods = 0;
  const nod = () => {
    if (reducedMotion || !nods++) return;
    est.classList.remove("is-new");
    void est.offsetWidth;
    est.classList.add("is-new");
  };
  new MutationObserver(nod).observe($("estValue"), { childList: true, characterData: true, subtree: true });
  nod();

  /* ================= The opening: a house going up ================= */

  const stages = data.stages;
  const LAST = stages.length - 1;
  const WEEKS = stages[LAST].weekNo;
  const STRETCH = 1.3;   // screens of scrolling per stage
  const HOLD = 0.18;     // share of each stretch, at both ends, where the picture rests
  const GLIDE_MS = 130;  // how quickly the picture catches up with the scroll position

  const build = $("top");
  const staff = $("staff");
  const canvas = $("film");
  const ctx = canvas.getContext("2d");
  // The next stage is drawn here first, then laid over the current one.
  const layer = document.createElement("canvas");
  const layerCtx = layer.getContext("2d");
  build.style.setProperty("--n", stages.length);
  build.style.setProperty("--stretch", STRETCH);
  staff.style.setProperty("--ticks", Math.round(WEEKS / 4));
  $("staffOf").textContent = `of ${WEEKS}`;

  // Colours shown in place of pictures that are not in the folder yet.
  const TINTS = ["#8a6a52", "#7b8087", "#9a5a41", "#cfc9bb"];
  const frames = stages.map(() => null);
  let ready = 0;
  stages.forEach((stage, i) => {
    find(stage.file).then((img) => {
      frames[i] = img;
      ready += 1;
      drawn = -1;
      requestFrame();
    });
  });

  function paint(c, i, W, H) {
    const img = frames[i];
    if (img) {
      cover(c, img, W, H);
      return;
    }
    c.fillStyle = TINTS[i % TINTS.length];
    c.fillRect(0, 0, W, H);
    if (ready < stages.length || !stages[i].file) return;
    c.fillStyle = "rgba(19, 28, 38, 0.75)";
    c.textAlign = "center";
    c.font = `${Math.round(Math.max(W / 46, 15))}px Archivo, system-ui, sans-serif`;
    c.fillText(`Add ${stages[i].file}.jpg to ${DIR}`, W / 2, H * 0.3);
  }

  /* ----- The build film (optional) ----- */

  // If assets/film/manifest.json exists, the opening plays those frames as
  // you scroll: a film of the house going up. Without it, the plot and the
  // finished house are used instead, the house rising over the plot.
  const FILM = "assets/film/";
  let film = null; // array of frames (empty slots until each has loaded)

  function startFilm(count) {
    film = new Array(count);
    // Fetch a thin spread of frames first so every part of the film has
    // something to show, then fill in the rest.
    const order = [];
    for (const stride of [16, 8, 4, 2, 1]) {
      for (let i = 0; i < count; i += stride) if (!order.includes(i)) order.push(i);
    }
    let next = 0;
    const pump = () => {
      if (next >= order.length) return;
      const i = order[next++];
      const img = new Image();
      img.onload = () => {
        film[i] = img;
        drawn = -1;
        requestFrame();
        pump();
      };
      img.onerror = pump;
      img.src = `${FILM}f-${String(i + 1).padStart(4, "0")}.jpg`;
    };
    for (let k = 0; k < 6; k++) pump();
  }

  fetch(`${FILM}manifest.json`)
    .then((res) => (res.ok ? res.json() : null))
    .then((manifest) => {
      if (manifest && manifest.count > 1) startFilm(manifest.count);
    })
    .catch(() => {});

  // How far between two stages a scroll position is, with a short rest on each stage.
  const REST = 0.1;
  const between = (position) => {
    const from = Math.min(Math.floor(position), LAST - 1);
    return { from, t: clamp((position - from - REST) / (1 - 2 * REST), 0, 1) };
  };

  // How far through the film a scroll position is.
  function filmFraction(position) {
    const { from, t } = between(position);
    const a = stages[from].at ?? from / LAST;
    const b = stages[from + 1].at ?? (from + 1) / LAST;
    return a + (b - a) * t;
  }

  // The loaded frame closest to index `want` (the film may still be arriving).
  function nearestFrame(want) {
    for (let d = 0; d < film.length; d++) {
      if (film[want - d]) return film[want - d];
      if (film[want + d]) return film[want + d];
    }
    return null;
  }

  function cover(c, img, W, H) {
    const scale = Math.max(W / img.naturalWidth, H / img.naturalHeight);
    const w = img.naturalWidth * scale;
    const h = img.naturalHeight * scale;
    c.drawImage(img, (W - w) / 2, (H - h) / 2, w, h);
  }

  // Scroll positions usually fall between two frames. Blending the two makes
  // slow scrolling smooth. Returns false if no frame has loaded yet.
  function drawFilmFrames(position, W, H) {
    const exact = filmFraction(position) * (film.length - 1);
    const index = Math.floor(exact);
    const base = nearestFrame(index);
    if (!base) return false;
    cover(ctx, base, W, H);
    const next = film[index] === base ? film[index + 1] : null;
    if (next && !reducedMotion) {
      ctx.globalAlpha = exact - index;
      cover(ctx, next, W, H);
      ctx.globalAlpha = 1;
    }
    return true;
  }

  // position: 0 = first stage, LAST = last. With the film, the frames play.
  // Without it, the house rises from the ground up with a soft edge.
  function drawFilm(position) {
    const W = canvas.width;
    const H = canvas.height;
    if (!W || !H) return;
    if (film && drawFilmFrames(position, W, H)) return;
    // Only the first and last stage pictures are needed. Any in between are
    // used if they are in the folder; the rise runs between whichever exist.
    const keys = stages.map((_, i) => i).filter((i) => i === 0 || i === LAST || frames[i]);
    let k = 0;
    while (k < keys.length - 2 && position >= keys[k + 1]) k += 1;
    const from = keys[k];
    const to = keys[k + 1];
    const t = clamp((position - from) / (to - from), 0, 1);
    paint(ctx, from, W, H);
    const risen = smooth(clamp((t - HOLD / (to - from)) / (1 - (2 * HOLD) / (to - from)), 0, 1));
    if (risen <= 0) return;

    const feather = H * 0.24;
    const edge = H - risen * (H + feather); // above this line the next stage is not there yet
    layerCtx.globalCompositeOperation = "source-over";
    layerCtx.clearRect(0, 0, W, H);
    paint(layerCtx, to, W, H);
    const fade = layerCtx.createLinearGradient(0, edge, 0, edge + feather);
    fade.addColorStop(0, "rgba(0, 0, 0, 0)");
    fade.addColorStop(1, "rgba(0, 0, 0, 1)");
    layerCtx.globalCompositeOperation = "destination-in";
    layerCtx.fillStyle = fade;
    layerCtx.fillRect(0, 0, W, H);
    ctx.drawImage(layer, 0, 0);
  }

  // Captions: one per stage, stacked in the same place; only the current one shows.
  const two = (n) => String(n).padStart(2, "0");
  const captions = stages.map((stage, i) => {
    const box = make("div", "caption");
    box.append(
      make("p", "tag", `${two(i + 1)} / ${two(stages.length)} · Week ${stage.weekNo} · ${stage.name}`),
      make(i === 0 ? "h1" : "h2", "", stage.title),
      make("p", "caption-text", stage.text),
    );
    if (stage.button) {
      const link = make("a", "btn btn-big", stage.button);
      link.href = `#${data.rooms[0].id}`;
      // Reached by keyboard while another stage is showing: bring its stage up.
      link.addEventListener("focus", () => { if (current !== i) goTo(i); });
      box.append(link);
    }
    $("captions").append(box);
    return box;
  });

  // The stops on the staff. Each one jumps to its stage.
  const stops = stages.map((stage, i) => {
    const li = make("li");
    li.style.bottom = `${(stage.weekNo / WEEKS) * 100}%`;
    const button = make("button");
    button.type = "button";
    button.append(make("span", "stop-name", stage.name), make("span", "tag", `Week ${stage.weekNo}`));
    button.addEventListener("click", () => { stopWatching(); goTo(i); });
    li.append(button);
    $("stops").append(li);
    return li;
  });

  const stageTop = (i) => build.getBoundingClientRect().top + window.scrollY + i * STRETCH * window.innerHeight;

  function goTo(i) {
    window.scrollTo({ top: stageTop(i), behavior: reducedMotion ? "auto" : "smooth" });
  }

  let current = -1;
  function setStage(i) {
    if (i === current) return;
    current = i;
    captions.forEach((box, k) => box.classList.toggle("is-on", k === i));
    stops.forEach((li, k) => {
      li.classList.toggle("is-done", k <= i);
      if (k === i) li.setAttribute("aria-current", "step");
      else li.removeAttribute("aria-current");
    });
  }

  /* ----- Watch the build: the page scrolls itself through the film ----- */

  const watch = $("watch");
  const SECONDS_PER_STAGE = 4.5;
  let watching = 0;

  function stopWatching() {
    if (!watching) return;
    cancelAnimationFrame(watching);
    watching = 0;
    watch.classList.remove("is-playing");
    $("watchText").textContent = "Watch the build";
  }

  watch.addEventListener("click", () => {
    if (watching) return stopWatching();
    const start = stageTop(0);
    const end = stageTop(LAST);
    // From where the page is now; from the beginning if it is already at the end.
    const from = window.scrollY >= end - 4 ? start : clamp(window.scrollY, start, end);
    if (reducedMotion) return window.scrollTo(0, end);
    const duration = Math.max(1200, ((end - from) / (STRETCH * window.innerHeight)) * SECONDS_PER_STAGE * 1000);
    let began = 0;
    watch.classList.add("is-playing");
    $("watchText").textContent = "Pause";
    const step = (now) => {
      if (!began) began = now;
      const t = clamp((now - began) / duration, 0, 1);
      window.scrollTo(0, from + (end - from) * t);
      if (t < 1) watching = requestAnimationFrame(step);
      else stopWatching();
    };
    watching = requestAnimationFrame(step);
  });

  // Any scrolling of the visitor's own takes the page back from the film.
  ["wheel", "touchstart"].forEach((type) => window.addEventListener(type, stopWatching, { passive: true }));
  window.addEventListener("keydown", (event) => { if (event.target !== watch) stopWatching(); });

  /* ================= Scroll ================= */

  // The picture is never tied straight to the scroll position, because a
  // mouse wheel moves the page in steps. It has a place it should be (target)
  // and glides towards it a little every frame (shown).
  let target = 0;
  let shown = 0;
  let drawn = -1;
  let raf = 0;
  let lastFrame = 0;

  function measure() {
    const box = build.getBoundingClientRect();
    target = clamp(-box.top / (STRETCH * window.innerHeight), 0, LAST);
  }

  function frame(now) {
    const elapsed = reducedMotion ? Infinity : lastFrame ? Math.min(now - lastFrame, 50) : 16;
    lastFrame = now;
    const next = shown + (target - shown) * (1 - Math.exp(-elapsed / GLIDE_MS));
    shown = Math.abs(target - next) < 0.0008 ? target : next;
    if (shown !== drawn) {
      drawn = shown;
      drawFilm(shown);
      // The staff: the week the build has reached.
      const { from, t } = between(shown);
      const week = stages[from].weekNo + (stages[from + 1].weekNo - stages[from].weekNo) * t;
      staff.style.setProperty("--level", (week / WEEKS).toFixed(4));
      $("staffWeek").textContent = Math.round(week);
      $("buildBar").style.transform = `scaleX(${(shown / LAST).toFixed(4)})`;
      setStage(Math.round(shown));
    }
    if (shown === target) {
      raf = 0;
      lastFrame = 0;
    } else {
      raf = requestAnimationFrame(frame);
    }
  }

  function requestFrame() {
    if (!raf) raf = requestAnimationFrame(frame);
  }

  function onScroll() {
    measure();
    requestFrame();
  }

  function onResize() {
    // Sharp on high-density screens, but never bigger than the pictures themselves.
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const shrink = Math.min(1, 1920 / (canvas.clientWidth * ratio));
    canvas.width = layer.width = Math.round(canvas.clientWidth * ratio * shrink);
    canvas.height = layer.height = Math.round(canvas.clientHeight * ratio * shrink);
    measure();
    shown = target;
    drawn = -1;
    lastFrame = 0;
    requestFrame();
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onResize);
  window.addEventListener("load", onResize);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(onResize);
  onResize();

  /* ================= Start my build ================= */

  const form = $("startForm");
  const status = $("formStatus");
  const required = [
    { input: $("fName"), error: $("fNameErr"), check: (v) => (v ? "" : "Enter your name.") },
    { input: $("fPhone"), error: $("fPhoneErr"), check: (v) => (!v ? "Enter your phone number." : v.replace(/\D/g, "").length >= 8 ? "" : "Enter a phone number with at least 8 digits.") },
  ];

  required.forEach(({ input, error, check }) => {
    input.addEventListener("input", () => {
      if (check(input.value.trim())) return;
      input.setAttribute("aria-invalid", "false");
      error.textContent = "";
    });
  });

  // There is no server behind this page: the request opens the visitor's own
  // email app with the message, and their choices, written out.
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    status.textContent = "";
    let firstInvalid = null;
    required.forEach(({ input, error, check }) => {
      const problem = check(input.value.trim());
      input.setAttribute("aria-invalid", String(Boolean(problem)));
      error.textContent = problem;
      if (problem && !firstInvalid) firstInvalid = input;
    });
    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }
    const fields = new FormData(form);
    const lines = [
      `Name: ${fields.get("name").trim()}`,
      `Phone: ${fields.get("phone").trim()}`,
      `Plot: ${fields.get("plot").trim() || "Not given"}`,
      "",
      `House: ${data.house.name}`,
      ...data.rooms.map((room) => `${room.name}: ${room.options[picks[room.id]].name}`),
      `Estimate: ${rangeText(total())}`,
    ];
    if (fields.get("note").trim()) lines.push("", fields.get("note").trim());
    status.textContent = "Your email app should now open with the request written out. Press send there to finish.";
    window.location.href = `mailto:${data.email}?subject=${encodeURIComponent(`Start my build: ${data.house.name}`)}&body=${encodeURIComponent(lines.join("\n"))}`;
  });
})();
