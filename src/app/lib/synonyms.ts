/**
 * Query-expansion knowledge base.
 *
 * The dataset stores program names in French only (e.g. "Langue et Litterature
 * Arabes"). Students search with many different phrasings, in Arabic or French,
 * and often add a role word like "استاذ" (teacher) or "دكتور" (doctor).
 *
 * Each CONCEPT identifies a family of programs via `match` (normalized French
 * substrings found in the program name) and injects every phrasing in `alias`
 * into that program's searchable text — so ANY of those phrasings will match.
 */
export interface Concept {
  match: string[]; // normalized (accent-free, lowercase) French substrings
  alias: string[]; // extra searchable phrasings (Arabic + French + slang)
}

export const CONCEPTS: Concept[] = [
  // ---- Languages ----
  {
    match: ["langue et litterature arab", "litterature arab", "langue arab"],
    alias: ["لغة عربية", "اللغة العربية", "أدب عربي", "لغة وأدب عربي", "عربية", "استاذ لغة عربية", "معلم لغة عربية", "تعليم العربية", "arabe", "lettres arabes"],
  },
  {
    match: ["langue francais", "litterature francais", "langue et litterature franc"],
    alias: ["لغة فرنسية", "اللغة الفرنسية", "فرنسية", "أدب فرنسي", "استاذ فرنسية", "معلم فرنسية", "francais", "lettres francaises"],
  },
  {
    match: ["langue anglais", "litterature anglais"],
    alias: ["لغة انجليزية", "اللغة الانجليزية", "انجليزية", "انكليزية", "استاذ انجليزية", "معلم انجليزية", "anglais", "english"],
  },
  {
    match: ["langue espagnol", "espagnol"],
    alias: ["لغة اسبانية", "اسبانية", "espagnol", "spanish"],
  },
  {
    match: ["langue allemand", "allemand"],
    alias: ["لغة المانية", "المانية", "allemand", "german"],
  },
  {
    match: ["langue et culture amazigh", "amazigh", "tamazight"],
    alias: ["امازيغية", "لغة امازيغية", "الامازيغية", "بربرية", "tamazight", "berbere"],
  },
  {
    match: ["traduction"],
    alias: ["ترجمة", "الترجمة", "مترجم", "traduction", "interpretariat"],
  },
  // ---- Health ----
  {
    match: ["medecine dentaire"],
    alias: ["طب اسنان", "طب الاسنان", "اسنان", "جراحة الاسنان", "dentaire", "dentiste"],
  },
  {
    match: ["medecine"],
    alias: ["طب", "الطب", "طبيب", "دكتور", "دراسة الطب", "medecine", "medecin", "docteur"],
  },
  {
    match: ["pharmacie"],
    alias: ["صيدلة", "الصيدلة", "صيدلي", "pharmacie", "pharmacien"],
  },
  {
    match: ["veterinaire"],
    alias: ["بيطرة", "طب بيطري", "بيطري", "veterinaire"],
  },
  {
    match: ["sciences infirmieres", "science de la sante", "sante publique"],
    alias: ["تمريض", "ممرض", "شبه طبي", "صحة", "علوم التمريض", "infirmier", "sante"],
  },
  // ---- Engineering & Tech ----
  {
    match: ["informatique", "systemes d information"],
    alias: ["اعلام الي", "الاعلام الالي", "اعلام آلي", "معلوماتية", "حاسوب", "كمبيوتر", "برمجة", "informatique", "info", "computer", "software", "it"],
  },
  {
    match: ["mathematiques"],
    alias: ["رياضيات", "الرياضيات", "math", "maths"],
  },
  {
    match: ["architecture"],
    alias: ["هندسة معمارية", "معمار", "عمارة", "الهندسة المعمارية", "architecture", "architecte"],
  },
  {
    match: ["genie civil"],
    alias: ["هندسة مدنية", "الهندسة المدنية", "بناء", "genie civil", "batiment"],
  },
  {
    match: ["genie mecanique", "mecanique"],
    alias: ["هندسة ميكانيكية", "ميكانيك", "الميكانيك", "genie mecanique", "mecanique"],
  },
  {
    match: ["electrotechnique", "electronique", "electromecanique", "genie electrique", "automatique", "telecommunication"],
    alias: ["كهرباء", "الكترونيك", "الكهروتقنية", "هندسة كهربائية", "الية", "اتصالات", "electrique", "electronique", "telecom"],
  },
  {
    match: ["genie des procedes"],
    alias: ["هندسة الطرائق", "هندسة كيميائية", "genie des procedes"],
  },
  {
    match: ["genie industriel"],
    alias: ["هندسة صناعية", "الهندسة الصناعية", "genie industriel"],
  },
  {
    match: ["hydraulique"],
    alias: ["ري", "هيدروليك", "الري", "hydraulique"],
  },
  {
    match: ["aeronautique"],
    alias: ["طيران", "الطيران", "aeronautique"],
  },
  {
    match: ["genie minier", "mines"],
    alias: ["مناجم", "هندسة المناجم", "mines"],
  },
  {
    match: ["sciences et technologies"],
    alias: ["علوم وتكنولوجيا", "علوم و تكنولوجيا", "تكنولوجيا", "هندسة", "technologie", " st"],
  },
  {
    match: ["biotechnologie"],
    alias: ["تكنولوجيا حيوية", "بيوتكنولوجيا", "biotechnologie"],
  },
  // ---- Natural / exact sciences ----
  {
    match: ["sciences de la nature et de la vie", "biologie"],
    alias: ["بيولوجيا", "علوم الطبيعة والحياة", "احياء", "علوم الطبيعه", "biologie", "bio", "snv"],
  },
  {
    match: ["sciences de la matiere"],
    alias: ["علوم المادة", "علوم الماده", "matiere", "sm"],
  },
  {
    match: ["chimie"],
    alias: ["كيمياء", "الكيمياء", "chimie"],
  },
  {
    match: ["physique"],
    alias: ["فيزياء", "الفيزياء", "physique"],
  },
  {
    match: ["sciences de la terre", "geologie"],
    alias: ["جيولوجيا", "علوم الارض", "جيولوجية", "geologie"],
  },
  {
    match: ["sciences agronomiques", "agronomie"],
    alias: ["فلاحة", "زراعة", "هندسة زراعية", "علوم فلاحية", "agronomie", "agriculture"],
  },
  // ---- Economics / Law / Politics ----
  {
    match: ["droit"],
    alias: ["حقوق", "الحقوق", "قانون", "محاماة", "شريعة وقانون", "droit", "law", "juriste"],
  },
  {
    match: ["sciences politiques"],
    alias: ["علوم سياسية", "العلوم السياسية", "سياسة", "sciences politiques"],
  },
  {
    match: ["sciences economiques", "economie", "gestion", "commercial", "comptabilite", "finance"],
    alias: ["اقتصاد", "الاقتصاد", "تسيير", "تجارة", "علوم تجارية", "محاسبة", "مالية", "ادارة اعمال", "economie", "gestion", "commerce", "finance"],
  },
  // ---- Human & social sciences ----
  {
    match: ["psychologie"],
    alias: ["علم النفس", "نفس", "psychologie"],
  },
  {
    match: ["sociologie"],
    alias: ["علم الاجتماع", "اجتماع", "sociologie"],
  },
  {
    match: ["histoire"],
    alias: ["تاريخ", "التاريخ", "histoire"],
  },
  {
    match: ["geographie", "amenagement du territoire"],
    alias: ["جغرافيا", "الجغرافيا", "geographie"],
  },
  {
    match: ["philosophie"],
    alias: ["فلسفة", "الفلسفة", "philosophie"],
  },
  {
    match: ["sciences islamiques"],
    alias: ["علوم اسلامية", "العلوم الاسلامية", "شريعة", "دراسات اسلامية", "sciences islamiques"],
  },
  {
    match: ["sciences humaines"],
    alias: ["علوم انسانية", "العلوم الانسانية"],
  },
  {
    match: ["sciences sociales"],
    alias: ["علوم اجتماعية", "العلوم الاجتماعية"],
  },
  {
    match: ["information et communication", "journalisme", "communication"],
    alias: ["اعلام", "صحافة", "علوم الاعلام والاتصال", "اتصال", "journalisme", "media"],
  },
  {
    match: ["bibliotheconomie", "bibliothe"],
    alias: ["مكتبات", "علم المكتبات", "توثيق"],
  },
  // ---- Sport & arts ----
  {
    match: ["education physique et sportive", "activites physiques", "staps"],
    alias: ["تربية بدنية", "التربية البدنية والرياضية", "رياضة", "علوم رياضية", "sport", "staps"],
  },
  {
    match: ["arts", "beaux arts", "musique", "design"],
    alias: ["فنون", "فنون جميلة", "موسيقى", "تصميم", "arts"],
  },
];

/**
 * Establishment-based tags. Programs at "Ecole Normale Superieure" (ENS) are
 * teacher-training tracks, so we inject teacher role words — this lets
 * "استاذ لغة عربية" (Arabic teacher) match the Arabic program at an ENS.
 */
export const ETB_TAGS: { etbMatch: string[]; alias: string[] }[] = [
  {
    etbMatch: ["normale superieure", "e.n.s", "ens"],
    alias: ["استاذ", "معلم", "تعليم", "استاذية", "تربية", "enseignant", "professeur", "prof"],
  },
];
