/**
 * Sample Multi-Language Content Seeding
 * 
 * This file contains sample content for the new multi-language content system.
 * These SQL statements can be run after migration 031 to populate the tables with example data.
 * 
 * This demonstrates the new content architecture with:
 * - Language-agnostic content units
 * - Multiple translations per content unit
 * - Curriculum alignments
 * - Learning paths
 */

-- ============================================================================
-- Sample Content Units (Language-Agnostic)
-- ============================================================================

-- Physics - Newton's Laws
INSERT INTO public.content_units (universal_id, domain, subject, topic, educational_levels, difficulty_score, tags, is_featured, published_at) VALUES
('physics-newton-laws', 'stem', 'physics', 'mechanics', ARRAY['middle-school', 'high-school', 'university'], 5, ARRAY['forces', 'motion', 'newton'], true, NOW())
ON CONFLICT (universal_id) DO NOTHING;

-- Mathematics - Quadratic Equations
INSERT INTO public.content_units (universal_id, domain, subject, topic, educational_levels, difficulty_score, tags, is_featured, published_at) VALUES
('math-quadratic-equations', 'stem', 'mathematics', 'algebra', ARRAY['high-school', 'university'], 6, ARRAY['equations', 'parabolas', 'factoring'], true, NOW())
ON CONFLICT (universal_id) DO NOTHING;

-- Biology - Cell Structure
INSERT INTO public.content_units (universal_id, domain, subject, topic, educational_levels, difficulty_score, tags, is_featured, published_at) VALUES
('biology-cell-structure', 'stem', 'biology', 'cells', ARRAY['middle-school', 'high-school'], 4, ARRAY['cells', 'organelles', 'membrane'], true, NOW())
ON CONFLICT (universal_id) DO NOTHING;

-- History - World War II
INSERT INTO public.content_units (universal_id, domain, subject, topic, educational_levels, difficulty_score, tags, is_featured, published_at) VALUES
('history-wwii', 'humanities', 'history', 'world-wars', ARRAY['high-school', 'university'], 5, ARRAY['war', 'alliances', 'treaties'], true, NOW())
ON CONFLICT (universal_id) DO NOTHING;

-- ============================================================================
-- Sample Content Translations (Dutch)
-- ============================================================================

-- Newton's Laws - Dutch
INSERT INTO public.content_translations (content_unit_id, language_code, title, description, content, examples, cultural_context, translation_status)
SELECT 
  id,
  'nl',
  'Wetten van Newton',
  'De drie fundamentele wetten die de relatie tussen kracht en beweging beschrijven',
  'Isaac Newton formuleerde drie wetten die de basis vormen van de klassieke mechanica. De eerste wet is de wet van inertie, de tweede wet relateert kracht aan versnelling, en de derde wet beschrijft actie en reactie.',
  jsonb_build_array(
    jsonb_build_object('concept', 'Inertie', 'text', 'Een object in rust blijft in rust tenzij er een kracht op wordt uitgeoefend'),
    jsonb_build_object('concept', 'F = ma', 'text', 'Kracht is gelijk aan massa maal versnelling'),
    jsonb_build_object('concept', 'Actie-reactie', 'text', 'Elke actie heeft een gelijke en tegenovergestelde reactie')
  ),
  jsonb_build_object(
    'example', 'Fiets op een helling',
    'text',
    'Wanneer je een fiets op een helling duwt, voel je de weerstand van de zwaartekracht'
  ),
  'published',
  NOW()
FROM public.content_units
WHERE universal_id = 'physics-newton-laws'
ON CONFLICT (content_unit_id, language_code) DO NOTHING;

-- Quadratic Equations - Dutch
INSERT INTO public.content_translations (content_unit_id, language_code, title, description, content, examples, cultural_context, translation_status)
SELECT 
  id,
  'nl',
  'Kwadratische Vergelijkingen',
  'Vergelijkingen van de vorm ax² + bx + c = 0 en methoden om ze op te lossen',
  'Kwadratische vergelijkingen zijn een belangrijk onderdeel van algebra. Je kunt ze oplossen door te factoriseren, de kwadratische formule te gebruiken, of het completeren van het kwadraat.',
  jsonb_build_array(
    jsonb_build_object('concept', 'Factoriseren', 'text', 'Schrijven als product van twee factoren'),
    jsonb_build_object('concept', 'Kwadraat-formule', 'text', 'x = (-b ± √(b²-4ac)) / 2a'),
    jsonb_build_object('concept', 'Completeren', 'text', 'x² + 6x + 9 = (x+3)²')
  ),
  jsonb_build_object(
    'example', 'Parabool vliegen',
    'text',
    'De baan van een geworpen bal is een parabool'
  ),
  'published',
  NOW()
FROM public.content_units
WHERE universal_id = 'math-quadratic-equations'
ON CONFLICT (content_unit_id, language_code) DO NOTHING;

-- Cell Structure - Dutch
INSERT INTO public.content_translations (content_unit_id, language_code, title, description, content, examples, cultural_context, translation_status)
SELECT 
  id,
  'nl',
  'Celstructuur',
  'De basisbouw van biologische cellen en hun organellen',
  'Cellen zijn de basisbouwsteen van al het leven. Ze hebben een celmembane, cytoplasma, en verschillende organellen zoals de celkern, mitochondriën, en ribosomen die specifieke functies vervullen.',
  jsonb_build_array(
    jsonb_build_object('concept', 'Celmembraan', 'text', 'Beschermt de cel en regelt wat er in en uit gaat'),
    jsonb_build_object('concept', 'Celkern', 'text', 'Bevat het DNA en controleert celactiviteiten'),
    jsonb_build_object('concept', 'Mitochondriën', 'text', 'De energiecentrales van de cel')
  ),
  jsonb_build_object(
    'example', 'Rode bloedcel',
    'text',
    'Rode bloedcellen transporteren zuurstof door het lichaam'
  ),
  'published',
  NOW()
FROM public.content_units
WHERE universal_id = 'biology-cell-structure'
ON CONFLICT (content_unit_id, language_code) DO NOTHING;

-- World War II - Dutch
INSERT INTO public.content_translations (content_unit_id, language_code, title, description, content, examples, cultural_context, translation_status)
SELECT 
  id,
  'nl',
  'Tweede Wereldoorlog',
  'De wereldwijde conflicten van 1939-1945 en hun gevolgen',
  'De Tweede Wereldoorlog was een grootschalig conflict dat vele landen betrok. Het ontstond toen nazi-Duitsland Polen binnenviel in 1939 en escaleerde tot een wereldoorlog die tot 1945 duurde.',
  jsonb_build_array(
    jsonb_build_object('concept', 'Allianties', 'text', 'Geallieerde machten: VS, VK, USSR, China'),
    jsonb_build_object('concept', 'Holocaust', 'text', 'De systematische moord op zes miljoen Joden'),
    jsonb_build_object('concept', 'D-Day', 'text', 'De geallieerde invasie van Normandië op 6 juni 1944')
  ),
  jsonb_build_object(
    'example', 'Nederland',
    'text',
    'Nederland werd bezet in mei 1940 en bevrijd in mei 1945'
  ),
  'published',
  NOW()
FROM public.content_units
WHERE universal_id = 'history-wwii'
ON CONFLICT (content_unit_id, language_code) DO NOTHING;

-- ============================================================================
-- Sample Content Translations (English)
-- ============================================================================

-- Newton's Laws - English
INSERT INTO public.content_translations (content_unit_id, language_code, title, description, content, examples, cultural_context, translation_status)
SELECT 
  id,
  'en',
  'Newton''s Laws',
  'The three fundamental laws describing the relationship between force and motion',
  'Isaac Newton formulated three laws that form the foundation of classical mechanics. The first law is the law of inertia, the second law relates force to acceleration, and the third law describes action and reaction.',
  jsonb_build_array(
    jsonb_build_object('concept', 'Inertia', 'text', 'An object at rest stays at rest unless acted upon by a force'),
    jsonb_build_object('concept', 'F = ma', 'text', 'Force equals mass times acceleration'),
    jsonb_build_object('concept', 'Action-Reaction', 'text', 'Every action has an equal and opposite reaction')
  ),
  jsonb_build_object(
    'example', 'Car on a hill',
    'text',
    'When you push a car up a hill, you feel the resistance of gravity'
  ),
  'published',
  NOW()
FROM public.content_units
WHERE universal_id = 'physics-newton-laws'
ON CONFLICT (content_unit_id, language_code) DO NOTHING;

-- Quadratic Equations - English
INSERT INTO public.content_translations (content_unit_id, language_code, title, description, content, examples, cultural_context, translation_status)
SELECT 
  id,
  'en',
  'Quadratic Equations',
  'Equations of the form ax² + bx + c = 0 and methods to solve them',
  'Quadratic equations are an important part of algebra. You can solve them by factoring, using the quadratic formula, or completing the square.',
  jsonb_build_array(
    jsonb_build_object('concept', 'Factoring', 'text', 'Writing as a product of two factors'),
    jsonb_build_object('concept', 'Quadratic Formula', 'text', 'x = (-b ± √(b²-4ac)) / 2a'),
    jsonb_build_object('concept', 'Completing the Square', 'text', 'x² + 6x + 9 = (x+3)²')
  ),
  jsonb_build_object(
    'example', 'Projectile motion',
    'text',
    'The path of a thrown ball is a parabola'
  ),
  'published',
  NOW()
FROM public.content_units
WHERE universal_id = 'math-quadratic-equations'
ON CONFLICT (content_unit_id, language_code) DO NOTHING;

-- Cell Structure - English
INSERT INTO public.content_translations (content_unit_id, language_code, title, description, content, examples, cultural_context, translation_status)
SELECT 
  id,
  'en',
  'Cell Structure',
  'The basic structure of biological cells and their organelles',
  'Cells are the building blocks of all life. They have a cell membrane, cytoplasm, and various organelles like the nucleus, mitochondria, and ribosomes that perform specific functions.',
  jsonb_build_array(
    jsonb_build_object('concept', 'Cell Membrane', 'text', 'Protects the cell and regulates what goes in and out'),
    jsonb_build_object('concept', 'Nucleus', 'text', 'Contains DNA and controls cell activities'),
    jsonb_build_object('concept', 'Mitochondria', 'text', 'The powerhouses of the cell')
  ),
  jsonb_build_object(
    'example', 'Red blood cell',
    'text',
    'Red blood cells transport oxygen throughout the body'
  ),
  'published',
  NOW()
FROM public.content_units
WHERE universal_id = 'biology-cell-structure'
ON CONFLICT (content_unit_id, language_code) DO NOTHING;

-- World War II - English
INSERT INTO public.content_translations (content_unit_id, language_code, title, description, content, examples, cultural_context, translation_status)
SELECT 
  id,
  'en',
  'World War II',
  'The global conflicts of 1939-1945 and their consequences',
  'World War II was a massive conflict that involved many nations. It began when Nazi Germany invaded Poland in 1939 and escalated into a world war that lasted until 1945.',
  jsonb_build_array(
    jsonb_build_object('concept', 'Alliances', 'text', 'Allied powers: US, UK, USSR, China'),
    jsonb_build_object('concept', 'Holocaust', 'text', 'The systematic murder of six million Jews'),
    jsonb_build_object('concept', 'D-Day', 'text', 'The Allied invasion of Normandy on June 6, 1944')
  ),
  jsonb_build_object(
    'example', 'Netherlands',
    'text',
    'The Netherlands was occupied in May 1940 and liberated in May 1945'
  ),
  'published',
  NOW()
FROM public.content_units
WHERE universal_id = 'history-wwii'
ON CONFLICT (content_unit_id, language_code) DO NOTHING;

-- ============================================================================
-- Sample Content Translations (Spanish)
-- ============================================================================

-- Newton's Laws - Spanish
INSERT INTO public.content_translations (content_unit_id, language_code, title, description, content, examples, cultural_context, translation_status)
SELECT 
  id,
  'es',
  'Leyes de Newton',
  'Las tres leyes fundamentales que describen la relación entre fuerza y movimiento',
  'Isaac Newton formuló tres leyes que forman la base de la mecánica clásica. La primera ley es la ley de inercia, la segunda ley relaciona la fuerza con la aceleración, y la tercera ley describe la acción y reacción.',
  jsonb_build_array(
    jsonb_build_object('concept', 'Inercia', 'text', 'Un objeto en reposo permanece en reposo a menos que actúe una fuerza'),
    jsonb_build_object('concept', 'F = ma', 'text', 'La fuerza es igual a la masa por la aceleración'),
    jsonb_build_object('concept', 'Acción-Reacción', 'text', 'Cada acción tiene una reacción igual y opuesta')
  ),
  jsonb_build_object(
    'example', 'Coche en una pendiente',
    'text',
    'Cuando empujas un coche cuesta arriba, sientes la resistencia de la gravedad'
  ),
  'published',
  NOW()
FROM public.content_units
WHERE universal_id = 'physics-newton-laws'
ON CONFLICT (content_unit_id, language_code) DO NOTHING;

-- ============================================================================
-- Sample Curriculum Alignments (Dutch VWO)
-- ============================================================================

-- Newton's Laws - Dutch VWO
INSERT INTO public.curriculum_alignments (content_unit_id, country_code, curriculum_system, educational_level, chapter_unit, lesson_number, exam_weight, related_topics)
SELECT 
  id,
  'NL',
  'nl-vwo',
  'high-school',
  'Beweging',
  2,
  5,
  ARRAY['krachten', 'versnelling', 'zwaartekracht']
FROM public.content_units
WHERE universal_id = 'physics-newton-laws'
ON CONFLICT (content_unit_id, country_code, curriculum_system, educational_level) DO NOTHING;

-- Quadratic Equations - Dutch VWO
INSERT INTO public.curriculum_alignments (content_unit_id, country_code, curriculum_system, educational_level, chapter_unit, lesson_number, exam_weight, related_topics)
SELECT 
  id,
  'NL',
  'nl-vwo',
  'high-school',
  'Vergelijkingen',
  3,
  8,
  ARRAY['lineaire vergelijkingen', 'grafieken', 'factoriseren']
FROM public.content_units
WHERE universal_id = 'math-quadratic-equations'
ON CONFLICT (content_unit_id, country_code, curriculum_system, educational_level) DO NOTHING;

-- ============================================================================
-- Sample Curriculum Alignments (US AP Physics)
-- ============================================================================

-- Newton's Laws - US AP Physics
INSERT INTO public.curriculum_alignments (content_unit_id, country_code, curriculum_system, educational_level, chapter_unit, lesson_number, exam_weight, related_topics)
SELECT 
  id,
  'US',
  'us-ap-physics',
  'high-school',
  'Dynamics',
  2,
  10,
  ARRAY['kinematics', 'energy', 'momentum']
FROM public.content_units
WHERE universal_id = 'physics-newton-laws'
ON CONFLICT (content_unit_id, country_code, curriculum_system, educational_level) DO NOTHING;

-- ============================================================================
-- Sample Learning Path
-- ============================================================================

-- Physics Fundamentals
INSERT INTO public.learning_paths (universal_id, title, description, domain, educational_level, estimated_hours, skill_tags, is_certified, created_at)
VALUES
('physics-fundamentals', 'Physics Fundamentals', 'Learn the core concepts of physics including motion, forces, and energy', 'stem', 'high-school', 40, ARRAY['mechanics', 'thermodynamics', 'waves'], false, NOW())
ON CONFLICT (universal_id) DO NOTHING;

-- Add steps to Physics Fundamentals path
INSERT INTO public.learning_path_steps (learning_path_id, content_unit_id, step_order, is_mandatory, estimated_minutes)
SELECT 
  lp.id,
  cu.id,
  1,
  true,
  60
FROM public.learning_paths lp
CROSS JOIN public.content_units cu
WHERE lp.universal_id = 'physics-fundamentals'
AND cu.universal_id = 'physics-newton-laws'
ON CONFLICT (learning_path_id, step_order) DO NOTHING;

-- ============================================================================
-- Notes
-- ============================================================================
-- 
-- This SQL file demonstrates the new multi-language content architecture.
-- 
-- Key features demonstrated:
-- 1. Content units are language-agnostic (stored once per concept)
-- 2. Multiple translations per content unit (Dutch, English, Spanish examples)
-- 3. Curriculum alignments for different countries/levels (NL-VWO, US-AP-Physics)
-- 4. Learning paths that combine multiple content units
-- 5. Cultural context in examples (localized for each country)
-- 
-- To add more content:
-- 1. Insert into content_units (language-agnostic)
-- 2. Insert into content_translations (for each language)
-- 3. Insert into curriculum_alignments (for each country/level)
-- 
-- To query content for a user:
-- SELECT cu.*, ct.title, ct.content, ct.language_code
-- FROM content_units cu
-- JOIN content_translations ct ON cu.id = ct.content_unit_id
-- WHERE ct.language_code = 'nl'
-- AND 'high-school' = ANY(cu.educational_levels);
