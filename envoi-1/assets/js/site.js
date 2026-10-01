/* denkidan.com — comportements (pas de dépendance) */
(function () {
  "use strict";

  var SITE = window.SITE, PROJECTS = window.PROJECTS || [];
  var reduit = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var FONDU = reduit ? 0 : 220;

  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    for (var k in attrs || {}) {
      if (attrs[k] == null) continue;
      if (k === "class") n.className = attrs[k];
      else if (k === "text") n.textContent = attrs[k];
      else if (k === "style") n.setAttribute("style", attrs[k]);
      else n.setAttribute(k, attrs[k]);
    }
    (kids || []).forEach(function (c) { if (c) n.appendChild(c); });
    return n;
  }

  // Étiquette de projet : numéro + titre, un seul élément
  function etiquette(p) {
    var f = document.createDocumentFragment();
    f.appendChild(el("span", { class: "idx", text: p.index }));
    f.appendChild(el("span", { class: /[㐀-鿿]/.test(p.title) ? "zh" : "", lang: p.lang || null, text: p.title }));
    return f;
  }

  function apercuSrc(p, cle) { return p.base + cle + "-preview"; }
  function cleSession(slug) { return "denkidan:apercu:" + slug; }

  /* ======================= ACCUEIL ======================= */
  function accueil() {
    var liste = document.querySelector("[data-projets]");
    var calques = document.querySelectorAll(".apercu img");
    var actif = 0, courant = null, defaut = calques[0].getAttribute("src");
    var suivant = {};               // prochaine position dans le cycle de chaque projet
    var dernier = {};               // dernière position affichée
    var cache = {};

    PROJECTS.forEach(function (p) {
      var a = el("a", { class: "lnk v", href: "/" + p.slug + "/", "data-slug": p.slug });
      a.appendChild(etiquette(p));
      liste.appendChild(el("li", {}, [a]));
      suivant[p.slug] = 0;
      precharger(apercuSrc(p, p.previews[0]));   // premier aperçu prêt d'avance
    });

    function precharger(base) {
      var src = supporteWebp ? base + ".webp" : base + ".jpg";
      if (!cache[src]) { cache[src] = new Image(); cache[src].src = src; }
      return cache[src];
    }

    function afficher(src) {
      if (src === courant) return;
      courant = src;
      var img = new Image();
      img.onload = function () {
        if (src !== courant) return;
        var dessous = calques[actif], dessus = calques[1 - actif];
        dessus.src = src;
        dessus.alt = "";
        dessus.classList.add("on");
        dessous.classList.remove("on");
        actif = 1 - actif;
      };
      img.src = src;
    }

    // avancer = true : survol, on passe à l'image suivante du cycle
    // avancer = false : clavier, on montre l'image courante sans avancer
    function aperçuDe(p, avancer) {
      var i;
      if (avancer) { i = suivant[p.slug] % p.previews.length; suivant[p.slug] = i + 1; dernier[p.slug] = i; }
      else { i = dernier[p.slug] != null ? dernier[p.slug] : suivant[p.slug] % p.previews.length; }
      var base = apercuSrc(p, p.previews[i]);
      precharger(apercuSrc(p, p.previews[(i + 1) % p.previews.length]));
      return supporteWebp ? base + ".webp" : base + ".jpg";
    }

    var survole = null;
    liste.addEventListener("pointerover", function (e) {
      var a = e.target.closest("a[data-slug]");
      if (!a || a === survole) return;
      survole = a;
      var p = PROJECTS.find(function (x) { return x.slug === a.dataset.slug; });
      liste.querySelectorAll("a").forEach(function (x) { x.classList.toggle("is-on", x === a); });
      afficher(aperçuDe(p, true));
    });
    liste.addEventListener("pointerleave", function () {
      survole = null;
      liste.querySelectorAll("a").forEach(function (x) { x.classList.remove("is-on"); });
      afficher(defaut);
    });
    liste.addEventListener("focusin", function (e) {
      var a = e.target.closest("a[data-slug]");
      if (!a) return;
      var p = PROJECTS.find(function (x) { return x.slug === a.dataset.slug; });
      afficher(aperçuDe(p, false));
    });
    liste.addEventListener("focusout", function (e) {
      if (!liste.contains(e.relatedTarget)) afficher(defaut);
    });

    // Clic : les textes partent, l'image reste, puis la page change
    liste.addEventListener("click", function (e) {
      var a = e.target.closest("a[data-slug]");
      if (!a || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
      e.preventDefault();
      var p = PROJECTS.find(function (x) { return x.slug === a.dataset.slug; });
      var attente = 0;
      var srcProjet = courant;
      if (!srcProjet || srcProjet.indexOf(p.base) !== 0) {   // l'image affichée n'appartient pas à ce projet
        srcProjet = aperçuDe(p, true);
        afficher(srcProjet);
        attente = FONDU;
      }
      try { sessionStorage.setItem(cleSession(p.slug), srcProjet); } catch (_) {}
      document.body.classList.add("depart");
      setTimeout(function () { location.href = a.href; }, reduit ? 0 : attente + 160);
    });

    window.addEventListener("pageshow", function (e) {
      if (e.persisted) { document.body.classList.remove("depart"); afficher(defaut); }
    });
  }

  /* ======================= PROJET ======================= */
  function projet() {
    var slug = document.body.dataset.slug;
    var p = PROJECTS.find(function (x) { return x.slug === slug; });
    if (!p) return;
    var pos = PROJECTS.indexOf(p);

    // Rail : numéro + titre (élément courant)
    var t = document.querySelector("[data-titre]");
    t.appendChild(etiquette(p));

    // Séquence. Les blocs marqués field: "rouge" qui se suivent sont regroupés dans un même champ de couleur.
    var seq = document.querySelector("[data-sequence]");
    var champ = null, premiere = true;
    p.sequence.forEach(function (b) {
      var n = bloc(p, b, premiere && b.type === "image");
      if (!n) return;
      if (b.type === "image") premiere = false;
      if (b.field) {
        if (!champ || champ.dataset.field !== b.field) {
          champ = el("div", { class: "champ champ-" + b.field, "data-field": b.field });
          seq.appendChild(champ);
        }
        champ.appendChild(n);
      } else {
        champ = null;
        seq.appendChild(n);
      }
    });

    // Rails lisibles sur le rouge : crème au-dessus de la limite, comportement habituel en dessous
    var rails = document.querySelectorAll(".page-projet .rail");
    var rouges = document.querySelectorAll(".champ-rouge, .b-bascule");
    if (rouges.length) {
      var majRails = function () {
        var lim = rouges[rouges.length - 1].getBoundingClientRect().bottom;
        rails.forEach(function (r) {
          var b = r.getBoundingClientRect();
          r.classList.toggle("sur-rouge", (b.top + b.bottom) / 2 < lim);
        });
      };
      var attente = false;
      window.addEventListener("scroll", function () {
        if (attente) return; attente = true;
        requestAnimationFrame(function () { attente = false; majRails(); });
      }, { passive: true });
      window.addEventListener("resize", majRails);
      majRails();
    }

    // Info
    var info = document.querySelector("[data-info]");
    info.appendChild(el("h2", { class: "zh", lang: p.lang || null, text: p.title }));
    (p.info || []).forEach(function (txt) { info.appendChild(el("p", { text: txt })); });
    if (p.book) {
      var mail = "mailto:" + SITE.email + "?subject=" + encodeURIComponent(p.book.subject || p.title);
      info.appendChild(el("p", {}, [el("a", { href: mail, text: p.book.label + " →" })]));
    }

    // Fin : projet suivant ou retour à l'index
    var fin = document.querySelector("[data-suivant]");
    var nxt = PROJECTS[pos + 1];
    if (nxt) {
      var a = el("a", { class: "lnk", href: "/" + nxt.slug + "/" });
      a.appendChild(el("span", { text: "Next /" }));
      a.appendChild(etiquette(nxt));
      fin.appendChild(a);
    } else {
      fin.appendChild(el("a", { class: "lnk", href: "/", text: "Index" }));
    }

    requestAnimationFrame(function () { document.body.classList.add("pret"); });
  }

  var LARGEURS = [1000, 1800, 2576];
  var MAX_JPG = 1800;   // le grand format n'existe qu'en WebP (tous les navigateurs actuels) ; le JPG de secours s'arrête à 1800
  var TAILLES = { xs: "18vw", s: "28vw", m: "42vw", l: "60vw", xl: "78vw", full: "100vw" };
  var TAILLES_TEL = { xs: "42vw", s: "56vw", m: "74vw", l: "92vw", xl: "92vw", full: "100vw" };

  function image(p, cle, taille, premiere) {
    var d = p.images[cle];
    if (!d) return null;
    var sizes = "(max-width: 760px) " + TAILLES_TEL[taille] + ", " + TAILLES[taille];
    var set = function (ext) {
      return LARGEURS.filter(function (w) { return w <= d.w && (ext === "webp" || w <= MAX_JPG); })
        .map(function (w) { return p.base + cle + "-" + w + "." + ext + " " + w + "w"; }).join(", ");
    };
    var dispo = LARGEURS.filter(function (w) { return w <= d.w && w <= MAX_JPG; });
    var repli = dispo.length ? dispo[dispo.length - 1] : LARGEURS[0];
    var img = el("img", {
      fetchpriority: premiere ? "high" : null,
      src: p.base + cle + "-" + repli + ".jpg", srcset: set("jpg"), sizes: sizes,
      width: d.w, height: d.h, alt: d.alt || "", decoding: "async",
      loading: premiere ? "eager" : "lazy",
      style: "--ar:" + (d.w / d.h).toFixed(4)
    });
    return el("picture", {}, [el("source", { type: "image/webp", srcset: set("webp"), sizes: sizes }), img]);
  }

  // Repère documentaire en marge (meta) : il prend la hauteur du haut de l'image, à droite de la page
  function repere(b) { return b.meta ? el("span", { class: "meta", text: b.meta }) : null; }

  var LETTRAGES = { titre: { ratio: 2641 / 1256, label: "我真他妈喜欢中国" } };

  function bloc(p, b, premiere) {
    var mt = b.marginTop ? "--mt:" + b.marginTop : "";
    switch (b.type) {
      case "image":
        return el("figure", { class: "b s-" + (b.size || "m") + " al-" + (b.align || "center"), style: mt },
          [repere(b), image(p, b.src, b.size || "m", premiere), b.caption ? el("figcaption", { text: b.caption }) : null]);
      case "fullBleed":
        return el("figure", { class: "b b-full", style: mt },
          [repere(b), image(p, b.src, "full", premiere), b.caption ? el("figcaption", { text: b.caption }) : null]);
      case "bascule":
        // Fin du champ rouge, avec le lettrage de la couverture à cheval sur la limite :
        // crème au-dessus (dans le rouge), rouge en dessous (dans le crème).
        var m = b.mark || {}, lt = LETTRAGES[m.src || "titre"];
        var vars = "--h:" + (b.height || "50vh") + ";--w:" + (m.width || "46vw") + ";--l:" + (m.left || "62vw") +
          ";--wm:" + (m.widthMobile || m.width || "46vw") + ";--lm:" + (m.leftMobile || m.left || "62vw") +
          ";--split:" + (m.split != null ? m.split : 0.32) + ";--ratio:" + lt.ratio.toFixed(4);
        var base = "/assets/img/site/" + (m.src || "titre");
        return el("div", { class: "b-bascule", style: vars, role: "img", "aria-label": lt.label }, [
          el("img", { class: "lettrage lettrage-haut", src: base + "-creme.svg", alt: "", width: 1256, height: 2641 }),
          el("img", { class: "lettrage lettrage-bas", src: base + "-rouge.svg", alt: "", width: 1256, height: 2641 })
        ]);
      case "pair":
        var demi = { xs: "xs", s: "xs", m: "s", l: "s", xl: "m", full: "m" }[b.size || "l"];
        return el("div", { class: "b b-pair s-" + (b.size || "l") + " al-" + (b.align || "center") + " gap-" + (b.gap || "small") + " va-" + (b.valign || "end"), style: mt },
          [repere(b)].concat((b.images || []).map(function (c) { return el("figure", { style: "margin:0" }, [image(p, c, demi)]); })));
      case "spacer":
        return el("div", { "aria-hidden": "true", style: "height:" + (b.height || "20vh") });
      case "text":
        return el("div", { class: "b b-text al-" + (b.align || "left"), style: mt },
          (b.paragraphs || []).map(function (t) { return el("p", { text: t }); }));
    }
    return null;
  }

  /* ======================= DÉMARRAGE ======================= */
  var supporteWebp = (function () {
    try { return document.createElement("canvas").toDataURL("image/webp").indexOf("data:image/webp") === 0; }
    catch (_) { return false; }
  })();

  // Projets dans le rail (contact, 404) sans aperçu
  document.querySelectorAll("[data-projets-simples]").forEach(function (ul) {
    PROJECTS.forEach(function (p) {
      var a = el("a", { class: "lnk v", href: "/" + p.slug + "/" });
      a.appendChild(etiquette(p));
      ul.appendChild(el("li", {}, [a]));
    });
  });

  if (document.body.classList.contains("page-accueil")) accueil();
  if (document.body.classList.contains("page-projet")) projet();
})();
