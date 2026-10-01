/* ==========================================================================
   denkidan.com — DONNÉES DU SITE
   C'est le seul fichier à modifier pour changer le contenu.

   AJOUTER UN PROJET
   1. Mettre les images dans /assets/img/<slug>/ en trois tailles + un aperçu :
      nom-1000.webp/.jpg, nom-1800.webp/.jpg, nom-2576.webp/.jpg, nom-preview.webp/.jpg
   2. Copier le dossier /china/ en /<slug>/ et changer data-slug + le <title>.
   3. Ajouter un bloc dans PROJECTS ci-dessous (même forme que "china").

   SÉQUENCE D'UN PROJET (dans l'ordre de lecture)
   { type: "image", src: "nom", size: "xs|s|m|l|xl|full", align: "left|center|right", marginTop: "30vh", caption: "" }
   { type: "pair", images: ["a", "b"], size: "l", gap: "small|large", align: "center", valign: "start|center|end", marginTop: "40vh" }
   { type: "fullBleed", src: "nom", marginTop: "50vh" }
   { type: "spacer", height: "40vh" }
   { type: "text", align: "left|center|right", marginTop: "20vh", paragraphs: ["…"] }
   { type: "bascule", height: "55vh", mark: { src: "titre", width: "46vw", left: "62vw", split: 0.32 } }
     → ferme le champ de couleur ; le lettrage de couverture est posé à cheval sur la limite

   Options communes : field: "rouge" (le bloc est posé dans un champ rouge bord à bord ;
   les blocs rouges qui se suivent partagent le même champ), meta: "01 — Lieu" (repère en marge).

   Tailles : XS 18vw · S 28vw · M 42vw · L 60vw · XL 78vw · FULL 100vw
   Une image verticale ne dépasse jamais 88 % de la hauteur de l'écran.
   ========================================================================== */

window.SITE = {
  name: "Lucas Talarn",
  email: "lucastalarn@gmail.com",
  portrait: { src: "/assets/img/site/portrait", w: 672, h: 895, alt: "Lucas Talarn, portrait au photomaton, yeux fermés" }
};

window.PROJECTS = [
  {
    slug: "china",
    index: "01",
    title: "我真他妈喜欢中国",
    lang: "zh-Hans",
    base: "/assets/img/china/",

    // Images du projet : nom → dimensions d'origine + texte alternatif
    images: {
      "accroupi":    { w: 2576, h: 1717, alt: "Un petit garçon accroupi seul sur un large trottoir, la tête dans les mains, près d’un platane" },
      "vendeuse":    { w: 2576, h: 1717, alt: "Une femme assise devant un portail noir, à côté de pancartes de rachat de tickets de gâteaux de lune" },
      "banc":        { w: 2576, h: 1717, alt: "Un homme en chemise bleu clair dort sur un banc, les bras sur le visage, la tête sur un sac plastique, un téléphone posé sur le ventre" },
      "matelas":     { w: 2576, h: 1718, alt: "Un homme pieds nus allongé sur un matelas neuf au bord de la rue, entouré d’hommes qui discutent" },
      "torse":       { w: 2576, h: 1717, alt: "Un homme à la chemise ouverte assis au bord d’une haie, à côté d’un homme sur un scooter" },
      "cartes":      { w: 2576, h: 1717, alt: "Des hommes jouent aux cartes assis sur des seaux devant un bâtiment administratif" },
      "cigarette":   { w: 2576, h: 1932, alt: "Des mains croisées dans le dos sur une blouse rouge, une cigarette allumée" },
      "fenetre":     { w: 2576, h: 1717, alt: "Une femme regarde à travers un trou découpé dans un mur de contreplaqué rouge" },
      "echafaudage": { w: 2576, h: 1717, alt: "Des ouvriers dans un échafaudage jaune, l’un d’eux regarde l’objectif" },
      "polystyrene": { w: 2576, h: 1717, alt: "Une femme trie une montagne de caisses en polystyrène blanc devant une porte" },
      "tricycle":    { w: 2576, h: 1718, alt: "Un enfant dépasse d’un tricycle à ordures vert, un homme en tenue à carreaux se tient à côté" },
      "cartons":     { w: 2576, h: 1717, alt: "Un triporteur chargé d’une haute pile de cartons traverse un carrefour à côté d’un scooter" },
      "peches":      { w: 2576, h: 1717, alt: "Des pêches et des mandarines en vitrine sous des étiquettes de prix jaunes écrites à la main" },
      "mere-bebe":   { w: 2576, h: 1718, alt: "Une femme en tablier porte un bébé en robe jaune dans une rue commerçante" },
      "mur-rose":    { w: 2576, h: 1717, alt: "Un homme en chemise blanche et cravate, debout dans le coin d’un immense mur rose" }
    },

    // Aperçus de l'accueil : une image différente à chaque nouveau survol, dans cet ordre
    previews: ["mur-rose", "accroupi", "fenetre", "matelas", "echafaudage"],

    // Montage de la page projet — chemin de fer validé (editing 02). Ne pas modifier sans nouvel editing.
    sequence: [
      // Ouverture dans le rouge de l'accueil
      { type: "image", src: "cigarette",   size: "l",  align: "center", field: "rouge", meta: "01 — Shanghai",
        marginTop: "max(6vh, calc((100svh - 45vw) / 2))" },
      { type: "image", src: "fenetre",     size: "xl", align: "left",   field: "rouge",
        marginTop: "calc(max(6vh, calc((100svh - 45vw) / 2)) + 55vh)" },

      // Bascule rouge / crème : le lettrage de la couverture à cheval sur la limite
      { type: "bascule", height: "55vh",
        mark: { src: "titre", width: "46vw", left: "62vw", split: 0.32, widthMobile: "34vw", leftMobile: "70vw" } },

      { type: "image", src: "accroupi",    size: "l",  align: "left",   marginTop: "30vh" },
      { type: "image", src: "vendeuse",    size: "xl", align: "right",  marginTop: "45vh" },
      { type: "pair",  images: ["banc", "matelas"], size: "xl", gap: "large", marginTop: "35vh" },
      { type: "image", src: "torse",       size: "m",  align: "left",   marginTop: "50vh" },
      { type: "image", src: "cartes",      size: "xl", align: "center", marginTop: "18vh", meta: "02 — Jing’an" },

      { type: "fullBleed", src: "echafaudage", marginTop: "60vh" },
      { type: "pair",  images: ["polystyrene", "cartons"], size: "xl", gap: "small", marginTop: "20vh" },
      { type: "image", src: "tricycle",    size: "l",  align: "right",  marginTop: "15vh" },

      { type: "image", src: "peches",      size: "m",  align: "left",   marginTop: "85vh" },
      { type: "image", src: "mere-bebe",   size: "l",  align: "center", marginTop: "40vh" },
      { type: "image", src: "mur-rose",    size: "xl", align: "center", marginTop: "70vh" },
      { type: "spacer", height: "40vh" }
    ],

    // Section INFO, en fin de projet
    info: [
      "Photographies, Chine.",
      "Livre — 80 pages, 22 × 26,6 cm, reliure cousue, tiré à 100 exemplaires. Couvertures de plusieurs couleurs, envoyées au hasard ; le rose est l’édition principale."
    ],
    book: { label: "Réserver un exemplaire", subject: "Livre 我真他妈喜欢中国" }
  }
];
