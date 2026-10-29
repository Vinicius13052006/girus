(() => {
  // ===== CONFIGURE AQUI =====
  const WHATSAPP = "553799172100"; // DDI + DDD + número, só dígitos

  // Lista de shows. Para adicionar um show, copie uma linha.
  // foto: coloque a imagem na pasta img/ (ex.: "img/lucas-valente.jpg")
  // link: página de venda do ingresso (Sympla, Eventim, etc.)
  // esgotado: true mostra "Esgotado" e desativa o botão
  const SHOWS = [
    { artista: "Leo foguete", genero: "forró", data: "2026-11-13T22:00", foto: "leo.jpeg", preco: "a partir de R$ 60", link: "https://www.sympla.com.br/", esgotado: false },,
    { artista: "dino fonseca",   genero: "Rock",    data: "2026-11-01T23:59", foto: "show1.jpeg",   preco: "a partir de R$ 40", link: "https://www.sympla.com.br/", esgotado: false },
    { artista: "mariana fagundes",   genero: "sertanejo",    data: "2026-11-01T23:59", foto: "show2.jpeg",   preco: "a partir de R$ 40", link: "https://www.sympla.com.br/", esgotado: true },
  
  ];
  // ==========================

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  $("#ano").textContent = new Date().getFullYear();
  $("#wpp").href = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent("Olá! Gostaria de informações sobre a Girus.")}`;

  // Menu
  const nav = $("#nav"), menu = $("#menu"), burger = $("#burger");
  addEventListener("scroll", () => nav.classList.toggle("solid", scrollY > 40), { passive: true });
  burger.onclick = () => burger.setAttribute("aria-expanded", menu.classList.toggle("open"));
  $$("#menu a").forEach(a => a.onclick = () => { menu.classList.remove("open"); burger.setAttribute("aria-expanded", false); });

  // Shows futuros, em ordem de data
  const now = Date.now();
  const shows = SHOWS.filter(s => new Date(s.data).getTime() > now - 6 * 3600e3)
                     .sort((a, b) => new Date(a.data) - new Date(b.data));
  const list = $("#shows-list"), chips = $("#chips");

  function card(s) {
    const d = new Date(s.data);
    const dia = d.getDate();
    const mes = d.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "").toUpperCase();
    const sem = d.toLocaleDateString("pt-BR", { weekday: "long" });
    const hora = d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    const ini = s.artista.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
    return `<article class="show reveal ${s.esgotado ? "sold" : ""}" data-g="${esc(s.genero)}">
      <div class="photo" data-ini="${esc(ini)}">
        <img src="${esc(s.foto)}" alt="Foto de ${esc(s.artista)}" loading="lazy" onerror="this.remove()">
        <div class="date"><b>${dia}</b><span>${mes}</span></div>
        <span class="genre">${esc(s.genero)}</span>
        ${s.esgotado ? '<span class="stamp">Esgotado</span>' : ""}
      </div>
      <div class="info">
        <h3>${esc(s.artista)}</h3>
        <p>${sem} • ${hora}</p>
        <p class="price">${esc(s.preco)}</p>
        ${s.esgotado
          ? '<span class="btn off">Ingressos esgotados</span>'
          : `<a class="btn" href="${esc(s.link)}" target="_blank" rel="noopener">Comprar ingresso</a>`}
      </div>
    </article>`;
  }

  function render(filter = "Todos") {
    const f = shows.filter(s => filter === "Todos" || s.genero === filter);
    list.innerHTML = f.map(card).join("");
    $("#empty").hidden = f.length > 0;
    $$(".reveal", list).forEach((el, i) => { el.style.transitionDelay = (i % 3) * 90 + "ms"; io.observe(el); });
  }

  // Revelar ao rolar
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
  }), { threshold: .12 });
  $$(".reveal").forEach(el => io.observe(el));

  // Filtros por gênero
  ["Todos", ...new Set(shows.map(s => s.genero))].forEach((g, i) => {
    const b = document.createElement("button");
    b.textContent = g; if (!i) b.className = "on";
    b.onclick = () => { $$("button", chips).forEach(x => x.classList.toggle("on", x === b)); render(g); };
    chips.append(b);
  });
  render();



  // Vídeo do banner
  const hv = $("#hv");
  if (hv) {
    const srcs = $$("source", hv);
    const fail = () => hv.remove() || ($(".vctl") && $(".vctl").remove());
    srcs.forEach(sr => sr.addEventListener("error", () => { if (srcs.every(x => x.dataset.err)) fail(); else sr.dataset.err = 1; if (srcs.every(x => x.dataset.err)) fail(); }));
    $("#vplay").onclick = e => { hv.paused ? hv.play() : hv.pause(); e.target.textContent = hv.paused ? "▶" : "❚❚"; };
    $("#vmute").onclick = e => { hv.muted = !hv.muted; e.target.textContent = hv.muted ? "🔇" : "🔊"; };
    if (matchMedia("(prefers-reduced-motion:reduce)").matches) { hv.pause(); $("#vplay").textContent = "▶"; }
  }

  // Contadores
  const co = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target, end = +el.dataset.n, t0 = performance.now();
    const step = t => { const p = Math.min((t - t0) / 1500, 1); el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))).toLocaleString("pt-BR"); if (p < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step); co.unobserve(el);
  }), { threshold: .6 });
  $$("[data-n]").forEach(el => co.observe(el));

  // Depoimentos
  const qs = $$("#slider blockquote"), dots = $("#dots");
  let cur = 0, timer;
  qs.forEach((_, i) => { const d = document.createElement("button"); d.setAttribute("aria-label", "Depoimento " + (i + 1)); d.onclick = () => go(i); dots.append(d); });
  function go(i) {
    cur = i;
    qs.forEach((q, n) => q.classList.toggle("show", n === i));
    $$("button", dots).forEach((d, n) => d.classList.toggle("on", n === i));
    clearInterval(timer); timer = setInterval(() => go((cur + 1) % qs.length), 5500);
  }
  go(0);

  // Botões "Reservar" preenchem o assunto
  $$(".reserve").forEach(b => b.addEventListener("click", () => { $("#tipo").value = b.dataset.r; }));

  // Mapa (troque o endereço)
  $("#maps").href = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent("Girus Disco Show");

  // Formulário → WhatsApp
  $("#form").addEventListener("submit", e => {
    e.preventDefault();
    const f = new FormData(e.target), err = $("#err");
    if (!f.get("nome").trim() || !f.get("tipo")) { err.textContent = "Informe seu nome e o assunto."; return; }
    err.textContent = "";
    const txt = `Olá! Meu nome é ${f.get("nome")}.\nAssunto: ${f.get("tipo")}\nShow/data: ${f.get("show") || "a definir"}\nPessoas: ${f.get("pessoas") || "a definir"}\n${f.get("msg") || ""}`;
    open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(txt)}`, "_blank");
  });
})();
