-- Global curriculum catalog, demo content and production error logging.
-- This migration deliberately keeps personal data private: only rows with a
-- NULL user_id are global, and achievement unlocks stay in public.achievements.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Existing versions of AetherLearn modelled these as strictly user-owned.
-- NULL now denotes curated, platform-owned content. Personal rows retain their
-- original foreign key and RLS behaviour.
ALTER TABLE public.subjects ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.study_sets ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.calendar_events ALTER COLUMN user_id DROP NOT NULL;

ALTER TABLE public.subjects
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS color_hex TEXT,
  ADD COLUMN IF NOT EXISTS icon_name TEXT,
  ADD COLUMN IF NOT EXISTS is_core BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS is_system BOOLEAN NOT NULL DEFAULT FALSE;

CREATE UNIQUE INDEX IF NOT EXISTS subjects_global_slug_key
  ON public.subjects(slug) WHERE user_id IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS study_sets_global_slug_key
  ON public.study_sets(slug) WHERE user_id IS NULL;

DROP POLICY IF EXISTS "Anyone can view curated subjects" ON public.subjects;
CREATE POLICY "Anyone can view curated subjects" ON public.subjects
  FOR SELECT USING (user_id IS NULL OR is_system = TRUE);

DROP POLICY IF EXISTS "Anyone can view curated calendar events" ON public.calendar_events;
CREATE POLICY "Anyone can view curated calendar events" ON public.calendar_events
  FOR SELECT USING (user_id IS NULL);

-- Achievement definitions are global. public.achievements remains a record of
-- achievements unlocked by an individual user and is intentionally not seeded.
CREATE TABLE IF NOT EXISTS public.achievement_definitions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  requirement TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.achievement_definitions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read achievement definitions" ON public.achievement_definitions;
CREATE POLICY "Anyone can read achievement definitions" ON public.achievement_definitions
  FOR SELECT USING (TRUE);

-- Client-side and server-side exception records. The public insert policy only
-- accepts anonymous telemetry; querying it is restricted to the service role.
CREATE TABLE IF NOT EXISTS public.error_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  fingerprint TEXT,
  message TEXT NOT NULL,
  stack TEXT,
  route TEXT,
  context JSONB NOT NULL DEFAULT '{}'::jsonb,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS error_logs_created_at_idx ON public.error_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS error_logs_fingerprint_idx ON public.error_logs(fingerprint);
ALTER TABLE public.error_logs ENABLE ROW LEVEL SECURITY;

-- A small normalized digital hierarchy used by the subject explorer and admin.
CREATE TABLE IF NOT EXISTS public.subject_chapters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(subject_id, title)
);
CREATE TABLE IF NOT EXISTS public.subject_topics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chapter_id UUID NOT NULL REFERENCES public.subject_chapters(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(chapter_id, title)
);
ALTER TABLE public.subject_chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subject_topics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read subject chapters" ON public.subject_chapters;
CREATE POLICY "Anyone can read subject chapters" ON public.subject_chapters FOR SELECT USING (TRUE);
DROP POLICY IF EXISTS "Anyone can read subject topics" ON public.subject_topics;
CREATE POLICY "Anyone can read subject topics" ON public.subject_topics FOR SELECT USING (TRUE);

-- All VWO subject metadata. `color`/`icon` are retained for older clients;
-- color_hex/icon_name are the explicit catalog fields for new clients.
WITH seed(name, slug, color_hex, icon_name, description, is_core) AS (
  VALUES
  ('Nederlands','nederlands','#E76F51','BookOpen','Taalvaardigheid, literatuur en argumentatie.',true),
  ('Engels','engels','#457B9D','Languages','Engelse taalvaardigheid en literatuur.',true),
  ('Frans','frans','#6D597A','Languages','Franse woordenschat en communicatie.',false),
  ('Duits','duits','#264653','Languages','Duitse taalvaardigheid en grammatica.',false),
  ('Spaans','spaans','#E9C46A','Languages','Spaanse woordenschat en communicatie.',false),
  ('Wiskunde A','wiskunde-a','#3A86FF','Calculator','Statistiek, kansrekening en analyse.',true),
  ('Wiskunde B','wiskunde-b','#4361EE','Sigma','Functies, algebra en meetkunde.',true),
  ('Wiskunde C','wiskunde-c','#4CC9F0','ChartNoAxesCombined','Wiskunde voor maatschappijprofielen.',false),
  ('Wiskunde D','wiskunde-d','#7209B7','FunctionSquare','Verdiepende wiskunde.',false),
  ('Natuurkunde','natuurkunde','#0077B6','Atom','Kracht, energie, golven en elektriciteit.',true),
  ('Scheikunde','scheikunde','#2A9D8F','FlaskConical','Stoffen, reacties en evenwichten.',true),
  ('Biologie','biologie','#588157','Dna','Leven, cellen, ecologie en evolutie.',true),
  ('Geschiedenis','geschiedenis','#9B5DE5','Landmark','Historische processen en bronnen.',true),
  ('Economie','economie','#F4A261','TrendingUp','Markten, groei en overheidsbeleid.',true),
  ('Aardrijkskunde','aardrijkskunde','#2A9D8F','Globe2','Aarde, klimaat en ruimtelijke ontwikkeling.',true),
  ('Informatica','informatica','#118AB2','Code2','Programmeren, data en digitale systemen.',false),
  ('Filosofie','filosofie','#8338EC','Brain','Denken, kennis en ethiek.',false),
  ('Kunst Algemeen','kunst-algemeen','#FF006E','Palette','Kunstgeschiedenis en cultuur.',false)
)
INSERT INTO public.subjects (id, user_id, name, slug, level, color, icon, color_hex, icon_name, description, is_core, is_system)
SELECT uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8', 'aether:subject:' || slug), NULL, name, slug,
  'VWO', color_hex, icon_name, color_hex, icon_name, description, is_core, TRUE
FROM seed
ON CONFLICT (slug) WHERE user_id IS NULL DO UPDATE SET
  name = EXCLUDED.name, color = EXCLUDED.color, icon = EXCLUDED.icon,
  color_hex = EXCLUDED.color_hex, icon_name = EXCLUDED.icon_name,
  description = EXCLUDED.description, is_core = EXCLUDED.is_core, is_system = TRUE;

-- One chapter and paragraph per subject makes the catalog navigable immediately.
INSERT INTO public.subject_chapters (id, subject_id, title, description, sort_order)
SELECT uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8', 'aether:chapter:' || slug), id,
  'Basis en examentraining', 'Startpunt voor begrippen, oefenen en examentraining.', 1
FROM public.subjects WHERE user_id IS NULL
ON CONFLICT (subject_id, title) DO UPDATE SET description = EXCLUDED.description;
INSERT INTO public.subject_topics (id, chapter_id, title, description, sort_order)
SELECT uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8', 'aether:topic:' || s.slug), c.id,
  'Kernbegrippen', 'Belangrijke begrippen voor dit vak.', 1
FROM public.subjects s JOIN public.subject_chapters c ON c.subject_id = s.id
WHERE s.user_id IS NULL AND c.title = 'Basis en examentraining'
ON CONFLICT (chapter_id, title) DO UPDATE SET description = EXCLUDED.description;

-- Three public, Supabase-backed example sets for each subject. Flashcards are
-- generated from the subject-specific core prompts below; no filesystem data or
-- user account is involved. The seed keys make reruns safe.
WITH templates(kind, suffix, description) AS (
  VALUES ('begrippen','Kernbegrippen','Belangrijke definities en begrippen.'),
         ('oefenen','Oefenvragen','Korte actieve-herhalingsoefeningen.'),
         ('examen','Examentraining','Gerichte voorbereiding op toets en examen.')
), catalog AS (
  SELECT s.id AS subject_id, s.slug, s.name, t.kind, t.suffix, t.description
  FROM public.subjects s CROSS JOIN templates t WHERE s.user_id IS NULL
)
INSERT INTO public.study_sets (id, user_id, subject_id, title, description, slug, content_json, is_public)
SELECT uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8', 'aether:set:' || slug || ':' || kind),
  NULL, subject_id, name || ' — ' || suffix, description, slug || '-' || kind,
  jsonb_build_object('seed_key', slug || ':' || kind, 'system', true), TRUE
FROM catalog
ON CONFLICT (slug) WHERE user_id IS NULL DO UPDATE SET
  title = EXCLUDED.title, description = EXCLUDED.description, subject_id = EXCLUDED.subject_id,
  content_json = EXCLUDED.content_json, is_public = TRUE;

-- Ten meaningful study prompts per subject. The same reliable core bank is
-- available in each of the three modes of a subject so a freshly seeded catalog
-- always has 10 cards per set (570 cards in total).
/* Historical, more verbose card-bank draft retained below for migration context.
WITH bank(slug, prompts) AS (
  VALUES
  ('nederlands', '[ ["Wat is een standpunt?","De mening die iemand in een betoog verdedigt."],["Wat is een argument?","Een reden die een standpunt ondersteunt."],["Wat is een tegenargument?","Een argument tegen een ingenomen standpunt."],["Wat is een bron?","De herkomst van informatie die je gebruikt."],["Wat is een stijlfiguur?","Een bewuste taalkundige vorm voor extra effect."],["Wat is alliteratie?","Beginrijm: herhaling van dezelfde beginmedeklinker."],["Wat is een thema?","De centrale, abstracte gedachte in een tekst."],["Wat is perspectief?","Het gezichtspunt van waaruit een verhaal wordt verteld."],["Wat is een signaalwoord?","Een woord dat een tekstverband duidelijk maakt."],["Wat is een samenvatting?","Een korte weergave van alleen de hoofdpunten."] ]'::jsonb),
  ('engels', '[ ["although","hoewel"],["therefore","daarom"],["however","echter"],["to achieve","bereiken"],["evidence","bewijs"],["environment","milieu / omgeving"],["reliable","betrouwbaar"],["opportunity","kans / mogelijkheid"],["to improve","verbeteren"],["challenge","uitdaging"] ]'::jsonb),
  ('frans', '[ ["bonjour","goedendag"],["merci","dank je"],["toujours","altijd"],["pourquoi","waarom"],["aujourd’hui","vandaag"],["apprendre","leren"],["important","belangrijk"],["réussir","slagen"],["environnement","milieu"],["pourtant","toch"] ]'::jsonb),
  ('duits', '[ ["die Meinung","de mening"],["wichtig","belangrijk"],["deshalb","daarom"],["trotzdem","toch"],["verstehen","begrijpen"],["die Umwelt","het milieu"],["die Möglichkeit","de mogelijkheid"],["entscheiden","beslissen"],["erklären","uitleggen"],["während","terwijl"] ]'::jsonb),
  ('spaans', '[ ["hola","hallo"],["gracias","dank je"],["siempre","altijd"],["porque","omdat"],["aprender","leren"],["importante","belangrijk"],["lograr","bereiken"],["medio ambiente","milieu"],["oportunidad","kans"],["sin embargo","echter"] ]'::jsonb),
  ('wiskunde-a', '[ ["Gemiddelde","Som van alle waarden gedeeld door het aantal waarden."],["Mediaan","De middelste waarde in een geordende reeks."],["Standaardafwijking","Maat voor de spreiding rond het gemiddelde."],["Kans","De verhouding tussen gunstige en mogelijke uitkomsten."],["$P(A \\cap B)$","De kans dat A én B optreden."],["Normale verdeling","Symmetrische klokvormige kansverdeling."],["Boxplot","Diagram met kwartielen, mediaan en uitschieters."],["Correlatie","Mate waarin twee variabelen samenhangen."],["Regressielijn","Lijn die een verband tussen twee variabelen benadert."],["Procentuele verandering","$\\frac{nieuw-oud}{oud}\\times100\\%$."] ]'::jsonb),
  ('wiskunde-b', '[ ["Afgeleide","De helling van de raaklijn aan een grafiek."],["Integraal","Oppervlakte onder een grafiek of omgekeerde afgeleide."],["Nulpunt","x-waarde waarvoor $f(x)=0$."],["Kettingregel","De afgeleide van een samengestelde functie."],["Productregel","Regel voor de afgeleide van een product."],["Exponentiële functie","Functie met de variabele in de exponent."],["Logaritme","De exponent die nodig is om een grondtal tot een getal te verheffen."],["Raaklijn","Lijn met dezelfde helling als de grafiek in één punt."],["Asymptoot","Lijn die een grafiek steeds dichter nadert."],["Discriminant","$D=b^2-4ac$ bij $ax^2+bx+c=0$."] ]'::jsonb),
  ('wiskunde-c', '[ ["Procent","Een deel per honderd."],["Indexcijfer","Getal dat een verandering ten opzichte van een basisjaar weergeeft."],["Lineair verband","Verband met constante toename of afname."],["Grafiek lezen","Waarden en verbanden uit een assenstelsel aflezen."],["Schaalfactor","Factor waarmee alle lengtes worden vermenigvuldigd."],["Gemiddelde","Som gedeeld door het aantal waarden."],["Kans","Maat voor de waarschijnlijkheid van een uitkomst."],["Tabel","Overzicht van gegevens in rijen en kolommen."],["Formule","Voorschrift dat een verband beschrijft."],["Spreiding","Mate waarin gegevens uiteenliggen."] ]'::jsonb),
  ('wiskunde-d', '[ ["Complex getal","Getal van de vorm $a+bi$."],["Matrix","Rechthoekige rangschikking van getallen."],["Vector","Grootheid met richting en lengte."],["Recursie","Definitie waarbij een term afhangt van eerdere termen."],["Differentiaalvergelijking","Vergelijking met een functie en haar afgeleiden."],["Fourierreeks","Voorstelling als som van sinus- en cosinusfuncties."],["Eigenwaarde","Factor waarmee een eigenvector bij transformatie schaalt."],["Bewijs","Logische afleiding uit definities en stellingen."],["Modelleren","Een situatie beschrijven met wiskunde."],["Parametervoorstelling","Voorstelling met een of meer parameters."] ]'::jsonb),
  ('natuurkunde', '[ ["Kracht","Interactie die beweging of vorm kan veranderen."],["$F=m\\cdot a$","De tweede wet van Newton."],["Energiebehoud","Energie kan niet verdwijnen of ontstaan, alleen omzetten."],["Vermogen","Energie per tijdseenheid: $P=E/t$."],["Spanning","Energie per coulomb: $U=E/Q$."],["Stroomsterkte","Lading per seconde: $I=Q/t$."],["Weerstand","$R=U/I$ volgens de wet van Ohm."],["Frequentie","Aantal trillingen per seconde, in hertz."],["Golflengte","Afstand tussen twee opeenvolgende punten in gelijke fase."],["Impuls","Product van massa en snelheid: $p=mv$."] ]'::jsonb),
  ('scheikunde', '[ ["Mol","Hoeveelheid stof met $6{,}02\\times10^{23}$ deeltjes."],["Molaire massa","Massa van één mol stof."],["pH","Maat voor de zuurgraad van een oplossing."],["Oxidatie","Afstaan van elektronen."],["Reductie","Opnemen van elektronen."],["Katalysator","Stof die een reactie versnelt zonder zelf verbruikt te worden."],["Evenwicht","Toestand waarin heen- en terugreactie even snel verlopen."],["Concentratie","Hoeveelheid opgeloste stof per volume."],["Covalente binding","Binding door het delen van elektronen."],["Ionbinding","Elektrostatische aantrekking tussen positieve en negatieve ionen."] ]'::jsonb),
  ('biologie', '[ ["Cel","Kleinste levende bouwsteen van organismen."],["DNA","Molecuul dat erfelijke informatie bevat."],["Ecosysteem","Samenhang van organismen en hun omgeving."],["Natuurlijke selectie","Beter aangepaste organismen krijgen gemiddeld meer nakomelingen."],["Homeostase","Het constant houden van het interne milieu."],["Fotosynthese","Vorming van glucose uit koolstofdioxide en water met licht."],["Celademhaling","Vrijmaken van energie uit glucose."],["Enzym","Eiwit dat een reactie versnelt."],["Chromosoom","Opgerold DNA met genen."],["Populatie","Groep organismen van dezelfde soort in één gebied."] ]'::jsonb),
  ('geschiedenis', '[ ["Bron","Overblijfsel of getuigenis uit het verleden."],["Continuïteit","Elementen die over langere tijd gelijk blijven."],["Verandering","Ontwikkeling waardoor een situatie anders wordt."],["Historisch perspectief","Kijken vanuit de normen en kennis van een bepaalde tijd."],["Propaganda","Gerichte beïnvloeding van opvattingen."],["Industrialisatie","Overgang naar productie met machines in fabrieken."],["Nationalisme","Sterke verbondenheid met de eigen natie."],["Imperialisme","Uitbreiding van macht over andere gebieden."],["Democratie","Bestuur waarbij burgers invloed hebben op besluitvorming."],["Koude Oorlog","Spanning tussen de VS en Sovjet-Unie na 1945."] ]'::jsonb),
  ('economie', '[ ["Schaarste","Er zijn minder middelen dan behoeften."],["Marktwerking","Afstemming van vraag en aanbod via prijzen."],["Inflatie","Gemiddelde stijging van het prijspeil."],["BBP","Totale waarde van geproduceerde goederen en diensten."],["Vraag","Hoeveel consumenten willen kopen bij een prijs."],["Aanbod","Hoeveel producenten willen verkopen bij een prijs."],["Elasticiteit","Gevoeligheid van vraag of aanbod voor prijsverandering."],["Begroting","Overzicht van inkomsten en uitgaven."],["Rente","Vergoeding voor het lenen van geld."],["Conjunctuur","Schommelingen in economische groei."] ]'::jsonb),
  ('aardrijkskunde', '[ ["Platentektoniek","Beweging van platen in de aardkorst."],["Verwering","Uiteenvallen van gesteente door weer en klimaat."],["Erosie","Uitschuren en vervoeren van materiaal."],["Globalisering","Toenemende wereldwijde verbondenheid."],["Migratie","Verplaatsing van mensen over een grens."],["Demografische transitie","Verandering van geboorte- en sterftecijfers bij ontwikkeling."],["Klimaat","Gemiddeld weer over een lange periode."],["Waterkringloop","Kringloop van verdamping, condensatie en neerslag."],["Stedelijke spreiding","Verandering in de ruimtelijke verdeling van steden."],["Ruimtelijke ongelijkheid","Verschillen tussen gebieden in welvaart en kansen."] ]'::jsonb),
  ('informatica', '[ ["Algoritme","Stappenplan om een probleem op te lossen."],["Variabele","Naam die naar een veranderbare waarde verwijst."],["Database","Georganiseerde verzameling gegevens."],["Encryptie","Versleutelen van gegevens zodat alleen bevoegden ze lezen."],["API","Afspraak waarmee software met andere software communiceert."],["Boolean","Datatype met alleen waar of onwaar."],["Loop","Code die herhaald wordt uitgevoerd."],["Functie","Herbruikbaar blok code met een taak."],["Versiebeheer","Bijhouden van wijzigingen in broncode."],["Privacy","Controle over persoonlijke gegevens."] ]'::jsonb),
  ('filosofie', '[ ["Ethiek","Filosofie over goed handelen."],["Epistemologie","Filosofie over kennis."],["Metafysica","Onderzoek naar wat werkelijk bestaat."],["Argument","Reden ter ondersteuning van een conclusie."],["Dilemma","Keuze tussen twee lastige mogelijkheden."],["Autonomie","Zelf kunnen bepalen volgens eigen redelijke regels."],["Utilitarisme","Ethiek die het grootste geluk voor het grootste aantal nastreeft."],["Empirisme","Kennisleer die ervaring centraal stelt."],["Rationalisme","Kennisleer die rede centraal stelt."],["Socratische methode","Onderzoeken door kritische vragen te stellen."] ]'::jsonb),
  ('kunst-algemeen', '[ ["Compositie","Ordening van beeldelementen in een kunstwerk."],["Perspectief","Manier om ruimte en diepte weer te geven."],["Symboliek","Gebruik van beelden met een extra betekenis."],["Renaissance","Kunstperiode met herwaardering van de klassieke oudheid."],["Barok","Dramatische kunststijl met beweging en contrast."],["Modernisme","Verzameling vernieuwende kunststromingen uit de 20e eeuw."],["Architectuur","Kunst en techniek van het ontwerpen van gebouwen."],["Mise-en-scène","Alles wat in beeld wordt geplaatst bij film of toneel."],["Motief","Terugkerend element in een kunstwerk."],["Kunstbeschouwing","Systematisch kijken, beschrijven en interpreteren van kunst."] ]'::jsonb)
), target_sets AS (
  SELECT ss.id, bank.prompts
  FROM public.study_sets ss
  JOIN public.subjects s ON s.id = ss.subject_id
  JOIN bank ON bank.slug = s.slug
  WHERE ss.user_id IS NULL
)
DELETE FROM public.flashcards f USING target_sets t WHERE f.study_set_id = t.id;
*/
DELETE FROM public.flashcards f
USING public.study_sets ss
WHERE f.study_set_id = ss.id
  AND ss.user_id IS NULL
  AND ss.content_json->>'seed_key' IS NOT NULL;

WITH bank(slug, prompts) AS (
  SELECT slug, prompts FROM (VALUES
    ('nederlands','[["Standpunt","Mening die wordt verdedigd."],["Argument","Reden voor een standpunt."],["Thema","Centrale abstracte gedachte."],["Perspectief","Vertelstandpunt."],["Bron","Herkomst van informatie."],["Signaalwoord","Maakt tekstverband duidelijk."],["Alliteratie","Beginrijm."],["Samenvatting","Korte weergave van hoofdpunten."],["Tegenargument","Argument tegen een standpunt."],["Stijlfiguur","Bewuste taalvorm voor effect."]]'),
    ('engels','[["although","hoewel"],["therefore","daarom"],["however","echter"],["evidence","bewijs"],["reliable","betrouwbaar"],["opportunity","kans"],["challenge","uitdaging"],["environment","milieu"],["improve","verbeteren"],["achieve","bereiken"]]'),
    ('frans','[["bonjour","goedendag"],["merci","dank je"],["toujours","altijd"],["pourquoi","waarom"],["aujourd’hui","vandaag"],["apprendre","leren"],["important","belangrijk"],["réussir","slagen"],["environnement","milieu"],["pourtant","toch"]]'),
    ('duits','[["die Meinung","de mening"],["wichtig","belangrijk"],["deshalb","daarom"],["trotzdem","toch"],["verstehen","begrijpen"],["die Umwelt","het milieu"],["die Möglichkeit","de mogelijkheid"],["entscheiden","beslissen"],["erklären","uitleggen"],["während","terwijl"]]'),
    ('spaans','[["hola","hallo"],["gracias","dank je"],["siempre","altijd"],["porque","omdat"],["aprender","leren"],["importante","belangrijk"],["lograr","bereiken"],["medio ambiente","milieu"],["oportunidad","kans"],["sin embargo","echter"]]')
  ) AS language_bank(slug,prompts)
  UNION ALL
  SELECT slug, prompts FROM (VALUES
    ('wiskunde-a','[["Gemiddelde","Som gedeeld door aantal."],["Mediaan","Middelste geordende waarde."],["Standaardafwijking","Maat voor spreiding."],["Kans","Gunstig gedeeld door mogelijk."],["P(A ∩ B)","Kans op A én B."],["Normale verdeling","Klokvormige verdeling."],["Boxplot","Diagram met kwartielen."],["Correlatie","Mate van samenhang."],["Regressielijn","Benadert een verband."],["Procentuele verandering","(nieuw-oud)/oud × 100%."]]'),
    ('wiskunde-b','[["Afgeleide","Helling van de raaklijn."],["Integraal","Oppervlakte onder grafiek."],["Nulpunt","f(x)=0."],["Kettingregel","f’(g(x))g’(x)."],["Productregel","f’g+fg’."],["Exponentiële functie","Variabele in exponent."],["Logaritme","Gezochte exponent."],["Raaklijn","Zelfde helling in één punt."],["Asymptoot","Lijn die grafiek nadert."],["Discriminant","b²−4ac."]]'),
    ('wiskunde-c','[["Procent","Deel per honderd."],["Indexcijfer","Verandering t.o.v. basisjaar."],["Lineair verband","Constante toe- of afname."],["Grafiek","Visuele weergave van data."],["Schaalfactor","Factor voor alle lengtes."],["Gemiddelde","Som gedeeld door aantal."],["Kans","Waarschijnlijkheid."],["Tabel","Gegevens in rijen en kolommen."],["Formule","Beschrijft verband."],["Spreiding","Hoe gegevens uiteenliggen."]]'),
    ('wiskunde-d','[["Complex getal","a+bi."],["Matrix","Rechthoekige getallenrangschikking."],["Vector","Grootheid met richting en lengte."],["Recursie","Term hangt af van eerdere term."],["Differentiaalvergelijking","Vergelijking met afgeleiden."],["Fourierreeks","Som van sinus en cosinus."],["Eigenwaarde","Schaalfactor van eigenvector."],["Bewijs","Logische afleiding."],["Modelleren","Situatie beschrijven met wiskunde."],["Parameter","Variabele die een familie bepaalt."]]'),
    ('natuurkunde','[["Kracht","Verandert beweging of vorm."],["F=ma","Tweede wet van Newton."],["Energiebehoud","Energie wordt omgezet."],["Vermogen","Energie per seconde."],["Spanning","Energie per coulomb."],["Stroomsterkte","Lading per seconde."],["Weerstand","R=U/I."],["Frequentie","Trillingen per seconde."],["Golflengte","Afstand tussen gelijke fase."],["Impuls","p=mv."]]'),
    ('scheikunde','[["Mol","6,02×10²³ deeltjes."],["Molaire massa","Massa van één mol."],["pH","Maat voor zuurgraad."],["Oxidatie","Elektronen afstaan."],["Reductie","Elektronen opnemen."],["Katalysator","Versnelt reactie."],["Evenwicht","Heen- en terugreactie even snel."],["Concentratie","Hoeveelheid per volume."],["Covalente binding","Elektronen delen."],["Ionbinding","Aantrekking tussen ionen."]]'),
    ('biologie','[["Cel","Kleinste levende bouwsteen."],["DNA","Erfelijke informatie."],["Ecosysteem","Organismen plus omgeving."],["Natuurlijke selectie","Aangepasten krijgen meer nakomelingen."],["Homeostase","Intern milieu constant houden."],["Fotosynthese","Glucosevorming met licht."],["Celademhaling","Energie uit glucose."],["Enzym","Versnelt reactie."],["Chromosoom","Opgerold DNA met genen."],["Populatie","Zelfde soort in één gebied."]]'),
    ('geschiedenis','[["Bron","Getuigenis uit verleden."],["Continuïteit","Wat gelijk blijft."],["Verandering","Ontwikkeling die situatie anders maakt."],["Historisch perspectief","Kijken vanuit een tijd."],["Propaganda","Gerichte beïnvloeding."],["Industrialisatie","Productie met machines."],["Nationalisme","Verbondenheid met natie."],["Imperialisme","Macht over andere gebieden."],["Democratie","Burgers hebben invloed."],["Koude Oorlog","Spanning VS en Sovjet-Unie."]]'),
    ('economie','[["Schaarste","Minder middelen dan behoeften."],["Marktwerking","Vraag en aanbod via prijs."],["Inflatie","Stijging algemeen prijspeil."],["BBP","Waarde van productie."],["Vraag","Wat consumenten willen kopen."],["Aanbod","Wat producenten willen verkopen."],["Elasticiteit","Gevoeligheid voor prijs."],["Begroting","Inkomsten en uitgaven."],["Rente","Vergoeding voor lenen."],["Conjunctuur","Schommelingen in groei."]]'),
    ('aardrijkskunde','[["Platentektoniek","Beweging aardplaten."],["Verwering","Uiteenvallen gesteente."],["Erosie","Uitschuren en vervoer."],["Globalisering","Wereldwijde verbondenheid."],["Migratie","Verplaatsing over grens."],["Demografische transitie","Verandering geboorte en sterfte."],["Klimaat","Gemiddeld weer lange termijn."],["Waterkringloop","Verdamping, condensatie, neerslag."],["Stedelijke spreiding","Verdeling steden in ruimte."],["Ruimtelijke ongelijkheid","Verschillen tussen gebieden."]]'),
    ('informatica','[["Algoritme","Stappenplan voor probleem."],["Variabele","Naam voor veranderbare waarde."],["Database","Georganiseerde gegevens."],["Encryptie","Versleutelen van data."],["API","Afspraak tussen software."],["Boolean","Waar of onwaar."],["Loop","Herhaalde code."],["Functie","Herbruikbare taak."],["Versiebeheer","Wijzigingen bijhouden."],["Privacy","Controle over persoonsgegevens."]]'),
    ('filosofie','[["Ethiek","Goed handelen."],["Epistemologie","Kennisleer."],["Metafysica","Wat bestaat."],["Argument","Reden voor conclusie."],["Dilemma","Moeilijke keuze."],["Autonomie","Zelf bepalen volgens rede."],["Utilitarisme","Grootste geluk."],["Empirisme","Ervaring centraal."],["Rationalisme","Rede centraal."],["Socratische methode","Onderzoek met vragen."]]'),
    ('kunst-algemeen','[["Compositie","Ordening van beeldelementen."],["Perspectief","Ruimte en diepte weergeven."],["Symboliek","Beeld met extra betekenis."],["Renaissance","Herwaardering klassieke oudheid."],["Barok","Dramatiek en contrast."],["Modernisme","Vernieuwende stromingen."],["Architectuur","Ontwerpen van gebouwen."],["Mise-en-scène","Alles in beeld bij film/theater."],["Motief","Terugkerend element."],["Kunstbeschouwing","Kijken en interpreteren."]]')
  ) AS other_bank(slug,prompts)
), cards AS (
  SELECT ss.id AS study_set_id, card.value->>0 AS question, card.value->>1 AS answer,
    card.ordinality - 1 AS order_index
  FROM public.study_sets ss
  JOIN public.subjects s ON s.id = ss.subject_id
  JOIN bank b ON b.slug = s.slug
  CROSS JOIN LATERAL jsonb_array_elements(b.prompts::jsonb) WITH ORDINALITY AS card(value, ordinality)
  WHERE ss.user_id IS NULL
)
INSERT INTO public.flashcards (study_set_id, question, answer, number, difficulty, order_index)
SELECT study_set_id, question, answer, (order_index + 1)::text, 'medium', order_index FROM cards;

INSERT INTO public.calendar_events (id, user_id, title, description, event_type, event_date, is_completed)
VALUES
  (uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8','aether:event:toetsweek-start'),NULL,'Toetsweek: planning maken','Plan je leerwerk en rustmomenten.','toets',CURRENT_DATE + 7,FALSE),
  (uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8','aether:event:toetsweek-oefenen'),NULL,'Toetsweek: oefentoets','Maak een oefentoets onder tijdsdruk.','toets',CURRENT_DATE + 10,FALSE),
  (uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8','aether:event:toetsweek-evaluatie'),NULL,'Toetsweek: evaluatie','Kijk terug op je planning en resultaten.','toets',CURRENT_DATE + 14,FALSE)
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description, event_date = EXCLUDED.event_date;

INSERT INTO public.achievement_definitions (code, title, description, icon, requirement) VALUES
 ('eerste-stap','Eerste stap','Voltooi je eerste leersessie.','Sparkles','1 leersessie'),
 ('kaartkenner','Kaartkenner','Beantwoord 50 kaarten.','Layers','50 kaarten'),
 ('weekritme','Weekritme','Leer zeven dagen achter elkaar.','CalendarCheck','7 dagen'),
 ('foutendetective','Foutendetective','Voeg tien fouten toe aan je foutenlogboek.','Search','10 fouten'),
 ('focus','Focus','Voltooi een sessie van 30 minuten.','Timer','30 minuten'),
 ('toetsklaar','Toetsklaar','Rond een toetsweekplanning af.','GraduationCap','1 planning'),
 ('veelzijdig','Veelzijdig','Leer in vijf verschillende vakken.','Compass','5 vakken'),
 ('meester','Meester','Behaal 90% in een oefentoets.','Trophy','90% score'),
 ('bouwer','Bouwer','Maak je eerste eigen leerset.','NotebookPen','1 leerset'),
 ('doorzetter','Doorzetter','Voltooi 25 leersessies.','Flame','25 sessies')
ON CONFLICT (code) DO UPDATE SET title=EXCLUDED.title, description=EXCLUDED.description, icon=EXCLUDED.icon, requirement=EXCLUDED.requirement;
