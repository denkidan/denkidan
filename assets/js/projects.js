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

   Images réglées par la hauteur ou la largeur (projet 02) :
   { type: "image", src: "nom", height: 82, align: "center", mobile: "76vw" }   → 82 % de la hauteur d'écran
   { type: "image", src: "nom", width: "88vw", mobile: "full" }                 → largeur fixe, bord à bord sur téléphone
   { type: "pair", images: ["a", "b"], width: "63vw", gap: "tight" }            → paire serrée (1vw entre les deux)
   Au niveau du projet : numbering: true → numéros gris en marge (01, 02…).

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
      { type: "spacer", height: "50vh" }
    ]
  },

  {
    slug: "portraits-at-home",
    index: "02",
    title: "Portraits at home",
    lang: "en",
    base: "/assets/img/portraits-at-home/",
    numbering: true,          // numéros gris 01 à 16 en marge, comptés depuis la séquence

    images: {
      "shoot-11":     { w: 1932, h: 2576, alt: "Une jeune femme aux longs cheveux clairs, de profil, sur fond noir" },
      "4-2":          { w: 2576, h: 2576, alt: "Une femme aux cheveux attachés, en pull noir, tourne la tête et regarde hors champ" },
      "4-3":          { w: 2576, h: 2576, alt: "La même femme, les yeux fermés, les mains jointes levées contre le front" },
      "olo-3":        { w: 1932, h: 2576, alt: "Une femme en débardeur blanc, assise, le menton posé sur la main, regarde l’objectif" },
      "j-9":          { w: 2576, h: 2576, alt: "Un homme se frotte les yeux avec les deux mains" },
      "en-rapide-11": { w: 2576, h: 2576, alt: "Un homme en t-shirt gris, la tête renversée en arrière, les yeux fermés" },
      "en-rapide-18": { w: 2576, h: 2576, alt: "Le même homme, la main plongée dans les cheveux, le visage baissé" },
      "chloe-9":      { w: 2576, h: 2576, alt: "Dans un miroir, une personne en chemise et cravate se recoiffe en regardant son reflet" },
      "chloe-14":     { w: 2576, h: 2576, alt: "La même personne de dos au premier plan ; dans le miroir, son reflet se touche la paupière" },
      "ivan-2":       { w: 2576, h: 2576, alt: "Un homme tourne la tête, le visage effacé par le flou du mouvement" },
      "nolik-3":      { w: 2061, h: 2576, alt: "Un homme tatoué se couvre le visage avec un débardeur blanc" },
      "ivan-6":       { w: 2576, h: 2576, alt: "Un tatoueur penché sur le dos d’un client, la machine à la main" },
      "def":          { w: 2061, h: 2576, alt: "Une femme de profil en blouse transparente, des clous collés sur les paupières, sous une lumière orange" },
      "les-colo-10":  { w: 2061, h: 2576, alt: "La même femme, la tête renversée en arrière ; seuls le visage et le cou sont éclairés, en orange" },
      "shoot-26":     { w: 1932, h: 2576, alt: "Un jeune homme assis au sol, une cigarette aux lèvres, la main sous le menton" },
      "test":         { w: 2576, h: 2576, alt: "Portrait flou d’une femme aux cheveux mi-longs, la tête légèrement inclinée" }
    },

    previews: ["shoot-11", "olo-3", "ivan-2", "les-colo-10", "test"],

    // Montage validé (chemin de fer Portraits, editing 02, sans cobalt). Ne pas modifier sans nouvel editing.
    // height = part de la hauteur d'écran (svh) ; mobile = largeur sur téléphone (84vw par défaut).
    sequence: [
      // I · Le portrait
      { type: "image", src: "shoot-11",    height: 82, align: "center", marginTop: "9vh" },
      { type: "pair",  images: ["4-2", "4-3"], width: "63vw", gap: "tight", align: "center", marginTop: "24vh" },
      { type: "image", src: "olo-3",       height: 88, align: "right",  marginTop: "30vh" },
      // II · Le retrait
      { type: "image", src: "j-9",         height: 56, align: "left",   marginTop: "60vh", mobile: "76vw" },
      { type: "pair",  images: ["en-rapide-11", "en-rapide-18"], width: "63vw", gap: "tight", align: "right", marginTop: "22vh" },
      // III · Le miroir (paire empilée)
      { type: "image", src: "chloe-9",     height: 45, align: "center", marginTop: "55vh", mobile: "76vw" },
      { type: "image", src: "chloe-14",    height: 45, align: "center", marginTop: "3vh",  mobile: "76vw" },
      // IV · La dissolution : la seule image plus grande que l'écran
      { type: "image", src: "ivan-2",      width: "88vw", align: "center", marginTop: "80vh", mobile: "full" },
      // V · Le corps
      { type: "image", src: "nolik-3",     height: 82, align: "center", marginTop: "80vh" },
      { type: "image", src: "ivan-6",      height: 86, align: "left",   marginTop: "26vh" },
      // VI · La couleur
      { type: "image", src: "def",         height: 86, align: "right",  marginTop: "80vh" },
      { type: "image", src: "les-colo-10", height: 96, align: "center", marginTop: "70vh", mobile: "88vw" },
      // VII · Le retour
      { type: "image", src: "shoot-26",    height: 84, align: "left",   marginTop: "80vh" },
      { type: "image", src: "test",        height: 80, align: "right",  marginTop: "32vh" },
      { type: "spacer", height: "50vh" }
    ]
  }
];
