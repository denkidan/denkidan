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

  // Version des images : à changer quand les fichiers sont régénérés, pour que les navigateurs ne gardent pas l'ancienne
  var VIMG = "?c=srgb";
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
      var src = (supporteWebp ? base + ".webp" : base + ".jpg") + VIMG;
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
      return (supporteWebp ? base + ".webp" : base + ".jpg") + VIMG;
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

    // Rail : ancien gabarit (titre seul) si une page l'utilise encore
    var t = document.querySelector("[data-titre]");
    if (t) t.appendChild(etiquette(p));

    // Séquence. Les blocs marqués field: "rouge" qui se suivent sont regroupés dans un même champ de couleur.
    var seq = document.querySelector("[data-sequence]");
    var champ = null, premiere = true, compte = 0;
    var deux = function (n) { return ("0" + n).slice(-2); };
    if (seq) (p.sequence || []).forEach(function (b) {
      // Numérotation grise (numbering: true) : une image = un numéro, une paire = deux, comptés depuis les données
      var label = null;
      if (p.numbering && b.type === "image") label = deux(++compte);
      if (p.numbering && b.type === "pair") { label = deux(compte + 1) + " · " + deux(compte + 2); compte += 2; }
      var n = bloc(p, b, premiere && b.type === "image", label);
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

    // Edito : un tirage du diptyque se rapproche au survol, au focus ou au toucher
    tirage(p);

    // Menu coupé net par la limite du champ de couleur, comme le lettrage :
    // une copie claire au-dessus de la limite, le menu habituel en dessous.
    var limite = function () {
      var ch = document.querySelector(".b-cheval img");
      if (ch) {
        var r = ch.getBoundingClientRect();
        var part = parseFloat(getComputedStyle(ch.closest(".b-cheval")).getPropertyValue("--cheval")) || 0.32;
        return r.top + r.height * part;
      }
      var champs = document.querySelectorAll(".champ, .b-bascule");
      return champs.length ? champs[champs.length - 1].getBoundingClientRect().bottom : null;
    };
    if (limite() !== null) {
      var paires = [].map.call(document.querySelectorAll(".page-projet .rail"), function (r) {
        var c = r.cloneNode(true);
        c.classList.add("rail-clair");
        c.setAttribute("aria-hidden", "true");
        c.removeAttribute("aria-label");
        c.querySelectorAll("a").forEach(function (a) { a.setAttribute("tabindex", "-1"); });
        r.parentNode.insertBefore(c, r.nextSibling);
        return [r, c];
      });
      var majRails = function () {
        var lim = limite();
        paires.forEach(function (pc) {
          var b = pc[0].getBoundingClientRect();
          var haut = Math.min(Math.max(lim - b.top, 0), b.height);   // part du menu au-dessus de la limite
          pc[0].style.clipPath = haut > 0 ? "inset(" + haut + "px 0 0 0)" : "";
          pc[1].style.clipPath = "inset(0 0 " + (b.height - haut) + "px 0)";
        });
      };
      var attente = false;
      window.addEventListener("scroll", function () {
        if (attente) return; attente = true;
        requestAnimationFrame(function () { attente = false; majRails(); });
      }, { passive: true });
      window.addEventListener("resize", majRails);
      window.addEventListener("load", majRails);
      majRails();
    }

    // Fin : retour au menu à gauche, projet suivant à droite (le dernier renvoie au premier)
    var fin = document.querySelector("[data-suivant]");
    fin.appendChild(el("a", { class: "lnk", href: "/", text: "Menu" }));
    var nxt = PROJECTS[(pos + 1) % PROJECTS.length];
    if (nxt !== p) {
      var a = el("a", { class: "lnk", href: "/" + nxt.slug + "/" });
      a.appendChild(el("span", { text: "Next /" }));
      a.appendChild(etiquette(nxt));
      fin.appendChild(a);
    }

    requestAnimationFrame(function () { document.body.classList.add("pret"); });
  }

  var LARGEURS = [1000, 1800, 2576];
  var MAX_JPG = 1800;   // le grand format n'existe qu'en WebP (tous les navigateurs actuels) ; le JPG de secours s'arrête à 1800
  var TAILLES = { xs: "18vw", s: "28vw", m: "42vw", l: "60vw", xl: "78vw", full: "100vw" };
  var TAILLES_TEL = { xs: "42vw", s: "56vw", m: "74vw", l: "92vw", xl: "92vw", full: "100vw" };

  function image(p, cle, taille, premiere, tailles) {
    var d = p.images[cle];
    if (!d) return null;
    var sizes = tailles || "(max-width: 760px) " + TAILLES_TEL[taille] + ", " + TAILLES[taille];
    var set = function (ext) {
      return LARGEURS.filter(function (w) { return w <= d.w && (ext === "webp" || w <= MAX_JPG); })
        .map(function (w) { return p.base + cle + "-" + w + "." + ext + VIMG + " " + w + "w"; }).join(", ");
    };
    var dispo = LARGEURS.filter(function (w) { return w <= d.w && w <= MAX_JPG; });
    var repli = dispo.length ? dispo[dispo.length - 1] : LARGEURS[0];
    var img = el("img", {
      fetchpriority: premiere ? "high" : null,
      src: p.base + cle + "-" + repli + ".jpg" + VIMG, srcset: set("jpg"), sizes: sizes,
      width: d.w, height: d.h, alt: d.alt || "", decoding: "async",
      loading: premiere ? "eager" : "lazy",
      style: "--ar:" + (d.w / d.h).toFixed(4)
    });
    return el("picture", {}, [el("source", { type: "image/webp", srcset: set("webp"), sizes: sizes }), img]);
  }

  // Repère documentaire en marge (meta) : il prend la hauteur du haut de l'image, à droite de la page
  function repere(b) { return b.meta ? el("span", { class: "meta", text: b.meta }) : null; }

  var LETTRAGES = { titre: { ratio: 2641 / 1256, label: "我真他妈喜欢中国" } };

  function numero(label) { return label ? el("span", { class: "nb", "aria-hidden": "true", text: label }) : null; }

  function bloc(p, b, premiere, label) {
    var mt = b.marginTop ? "--mt:" + b.marginTop : "";
    var tel = b.mobile && b.mobile !== "full" ? ";--wm:" + b.mobile : "";
    switch (b.type) {
      case "image":
        // Réglée par la hauteur (height: 82 → 82svh) ou par la largeur (width: "88vw")
        if (b.height || b.width) {
          var d = p.images[b.src], ar = d ? (d.w / d.h).toFixed(4) : 1;
          var mobile = b.mobile === "full" ? "100vw" : (b.mobile || "84vw");
          var cls = "b " + (b.height ? "b-h" : "b-w") + " al-" + (b.align || "center") + (b.mobile === "full" ? " m-full" : "") +
            (b.cheval != null ? " b-cheval" : "") + (p.numeros === "dessous" ? " proof" : "");
          // cheval : la limite du champ de couleur passe derrière la photo, à cette part de sa hauteur
          var st = mt + (b.height ? ";--h:" + b.height + "svh" : ";--w:" + b.width) + tel + (b.cheval != null ? ";--cheval:" + b.cheval : "");
          var sz = "(max-width: 760px) " + mobile + ", " + (b.height ? "calc(" + b.height + "vh * " + ar + ")" : b.width);
          return el("figure", { class: cls, style: st }, [numero(label), repere(b), image(p, b.src, "m", premiere, sz)]);
        }
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
        if (b.width) {
          // Paire de largeur fixe (width: "63vw", gap: "tight") : une seule phrase en deux images
          var szp = "(max-width: 760px) " + (b.mobile || "76vw") + ", calc((" + b.width + " - 1vw) / 2)";
          return el("div", { class: "b b-pair b-wv al-" + (b.align || "center") + " gap-" + (b.gap || "tight") + " va-" + (b.valign || "start"), style: mt + ";--w:" + b.width + tel },
            // numeros: "dessous" (Edito) : chaque image du diptyque garde son propre numéro, sous elle
            p.numeros === "dessous" && label
              ? (b.images || []).map(function (c, i) {
                  var no = label.split(" · ")[i], d = p.images[c] || {};
                  return el("figure", { class: "b-pair__img proof proof--leve", tabindex: "0", role: "button", "data-cle": c, "data-no": no,
                    "aria-label": "Agrandir la photo " + no + " : " + (d.alt || "") }, [image(p, c, "m", false, szp), numero(no)]);
                })
              : [numero(label), repere(b)].concat((b.images || []).map(function (c) { return el("figure", { style: "margin:0" }, [image(p, c, "m", false, szp)]); })));
        }
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

  /* ======================= TIRAGE RAPPROCHÉ (Edito) ======================= */
  // Un seul calque fixe pour toute la page. Le même tirage (papier, marges, numéro) en plus grand ;
  // ses marges grandissent dans la même proportion que la photo. La vignette ne bouge pas.
  function tirage(p) {
    var ov = document.querySelector("[data-proof-preview]");
    var leves = [].slice.call(document.querySelectorAll(".proof--leve"));
    if (!ov || !leves.length) return;
    var papier = ov.querySelector(".proof"), img = ov.querySelector(".proof-preview__img"),
        ancien = ov.querySelector(".proof-preview__old"), no = ov.querySelector("[data-proof-no]");
    var actif = null, fermeture = null, cache = {};
    var tel = window.matchMedia("(max-width: 760px)");

    function grande(cle) { return p.base + cle + "-1800" + (supporteWebp ? ".webp" : ".jpg") + VIMG; }

    function poser(f) {
      var v = f.querySelector("img"), d = p.images[f.dataset.cle], cs = getComputedStyle(f);
      var t = parseFloat(cs.paddingTop), s = parseFloat(cs.paddingLeft), b = parseFloat(cs.paddingBottom);
      var w0 = v.getBoundingClientRect().width, ar = d.w / d.h;
      var maxW = innerWidth * (tel.matches ? 0.92 : 0.82), maxH = innerHeight * (tel.matches ? 0.78 : 0.80);
      // k : agrandissement du tirage entier (photo et papier), pour tenir dans maxW x maxH
      var k = Math.min(maxW / (w0 + 2 * s), maxH / (w0 / ar + t + b));
      var W = Math.round(w0 * k), H = Math.round(w0 * k / ar);
      papier.style.padding = (t * k).toFixed(1) + "px " + (s * k).toFixed(1) + "px " + (b * k).toFixed(1) + "px";
      img.style.width = W + "px"; img.style.height = H + "px";
      var nbs = getComputedStyle(f.querySelector(".nb"));
      no.style.left = (s * k).toFixed(1) + "px";
      no.style.bottom = (parseFloat(nbs.bottom) * k).toFixed(1) + "px";
      no.style.fontSize = (parseFloat(nbs.fontSize) * Math.min(k, 1.6)).toFixed(1) + "px";
      no.textContent = f.dataset.no;
      // d'abord l'image déjà chargée de la vignette, puis la grande dès qu'elle est prête
      img.src = v.currentSrc || v.src; img.alt = "";
      var u = grande(f.dataset.cle);
      if (!cache[u]) { cache[u] = new Image(); cache[u].src = u; }
      var g = cache[u];
      var mettre = function () { if (actif === f) img.src = u; };
      if (g.complete && g.naturalWidth) mettre(); else g.addEventListener("load", mettre, { once: true });
    }

    function montrer(f) {
      clearTimeout(fermeture);
      if (f === actif) return;
      var ouvert = ov.classList.contains("is-on");
      if (ouvert && img.getAttribute("src")) {            // déjà ouvert : petit fondu d'une photo à l'autre
        ancien.src = img.currentSrc || img.src;
        ancien.classList.remove("is-gone"); void ancien.offsetWidth; ancien.classList.add("is-gone");
      }
      actif = f;
      poser(f);
      ov.classList.add("is-on");
    }
    function cacher() {
      clearTimeout(fermeture);
      actif = null;
      ov.classList.remove("is-on", "par-toucher");
      ov.setAttribute("aria-hidden", "true");
    }

    leves.forEach(function (f) {
      // souris : rien ne s'ouvre au survol ni au clic (retiré à la demande de Lucas)
      // toucher : premier appui = ouvrir
      f.addEventListener("click", function (e) {
        if (e.pointerType === "mouse" && matchMedia("(hover: hover)").matches) return;
        ov.classList.add("par-toucher");
        montrer(f);
      });
      // clavier : Entrée ou Espace ouvre et referme ; Échap ferme
      f.addEventListener("keydown", function (e) {
        if (e.key !== "Enter" && e.key !== " ") return;
        e.preventDefault();
        if (actif === f) cacher(); else montrer(f);
      });
      // clavier : si un tirage est ouvert, Tab vers l'image voisine change de photo sans refermer
      f.addEventListener("focus", function () { if (actif && actif !== f && !ov.classList.contains("par-toucher")) montrer(f); });
      f.addEventListener("blur", function (e) { if (!ov.classList.contains("par-toucher") && leves.indexOf(e.relatedTarget) < 0) cacher(); });
    });
    // toucher : appui hors du tirage = fermer ; appui sur une autre vignette (sous le calque) = changer
    ov.addEventListener("click", function (e) {
      if (papier.contains(e.target)) return;
      var sous = document.elementsFromPoint(e.clientX, e.clientY).filter(function (n) { return n.classList && n.classList.contains("proof--leve"); })[0];
      if (sous) montrer(sous); else cacher();
    });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") cacher(); });
    window.addEventListener("resize", function () { if (actif) poser(actif); });
    window.addEventListener("pagehide", cacher);
  }

  /* ======================= CONTACT ======================= */
  // Le formulaire est envoyé à Netlify, qui transmet chaque message par e-mail : l'adresse n'apparaît nulle part sur le site.
  function contact() {
    var f = document.querySelector("[data-contact]");
    if (!f || !window.fetch || !window.URLSearchParams) return;
    var etat = document.querySelector("[data-contact-etat]");
    var bouton = f.querySelector("button[type=submit]");
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      bouton.disabled = true; bouton.textContent = "Envoi…";
      etat.textContent = "";
      fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(new FormData(f)).toString()
      }).then(function (r) {
        if (!r.ok) throw new Error(r.status);
        f.hidden = true;
        etat.textContent = "Merci, votre message est bien envoyé.";
        etat.focus();
      }).catch(function () {
        bouton.disabled = false; bouton.textContent = "Envoyer";
        etat.textContent = "L’envoi n’a pas abouti. Réessayez dans un instant, ou écrivez-moi sur Instagram.";
      });
    });
  }

  /* ======================= DÉMARRAGE ======================= */
  var supporteWebp = (function () {
    try { return document.createElement("canvas").toDataURL("image/webp").indexOf("data:image/webp") === 0; }
    catch (_) { return false; }
  })();

  // Projets dans le rail (pages projet, contact, 404) sans aperçu ; le projet ouvert est marqué
  var slugCourant = document.body.dataset.slug || null;
  document.querySelectorAll("[data-projets-simples]").forEach(function (ul) {
    PROJECTS.forEach(function (p) {
      var a = el("a", { class: "lnk v", href: "/" + p.slug + "/", "aria-current": p.slug === slugCourant ? "page" : null });
      a.appendChild(etiquette(p));
      ul.appendChild(el("li", {}, [a]));
    });
  });

  if (document.body.classList.contains("page-accueil")) accueil();
  if (document.body.classList.contains("page-projet")) projet();
  if (document.body.classList.contains("page-contact")) contact();
})();
