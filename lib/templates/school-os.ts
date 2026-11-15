// School OS Template - Dutch Secondary Education System
// Structure: Inbox, Tasks, Subjects, Error log, Review queue, Tests & Deadlines, Projects

export const schoolOsTemplate = {
  name: 'School OS 2026-2027',
  description: 'Complete study system for Dutch secondary school students',
  structure: {
    pages: [
      {
        id: 'inbox',
        name: 'Inbox',
        type: 'page',
        icon: '📥',
        children: [],
      },
      {
        id: 'taken',
        name: 'Tasks',
        type: 'page',
        icon: '✅',
        children: [],
        databases: [
          {
            name: 'Tasks Database',
            properties: [
              { name: 'Task', type: 'text' },
              {
                name: 'Subject',
                type: 'select',
                options: [
                  'Wiskunde',
                  'Natuurkunde',
                  'Scheikunde',
                  'Biologie',
                  'Nederlands',
                  'Frans',
                  'Engels',
                  'Informatica',
                  'Geschiedenis',
                  'Aardrijkskunde',
                ],
              },
              {
                name: 'Type',
                type: 'select',
                options: ['Homework', 'Test', 'Project', 'Presentation'],
              },
              { name: 'Deadline', type: 'date' },
              { name: 'Status', type: 'select', options: ['Not started', 'In progress', 'Done'] },
              {
                name: 'Priority',
                type: 'select',
                options: ['Low', 'Medium', 'High', 'P1 Urgent'],
              },
              { name: 'Energy', type: 'select', options: ['Low', 'Medium', 'High'] },
              {
                name: 'Tijd',
                type: 'select',
                options: ['< 30min', '30-60min', '1-2 uur', '> 2 uur'],
              },
              { name: 'Test-relevant', type: 'checkbox' },
            ],
            views: [
              {
                name: 'Today',
                type: 'table',
                filters: [{ property: 'Deadline', operator: 'is', value: 'today' }],
              },
              {
                name: 'This week',
                type: 'table',
                filters: [{ property: 'Deadline', operator: 'is', value: 'this_week' }],
              },
              {
                name: 'P1 Urgent',
                type: 'table',
                filters: [{ property: 'Priority', operator: 'is', value: 'P1 Urgent' }],
              },
              { name: 'Test prep', type: 'kanban', groupBy: 'Subject' },
              {
                name: 'Backlog',
                type: 'table',
                filters: [
                  { property: 'Deadline', operator: 'before', value: 'today' },
                  { property: 'Status', operator: 'is_not', value: 'Done' },
                ],
              },
            ],
          },
        ],
      },
      {
        id: 'subjects',
        name: 'Subjects',
        type: 'page',
        icon: '📚',
        children: [
          {
            id: 'wiskunde-b',
            name: 'Wiskunde B',
            type: 'page',
            icon: '📐',
            children: [
              { id: 'wb-lopende', name: 'Current material', type: 'page' },
              { id: 'wb-homework', name: 'Homework', type: 'page' },
              { id: 'wb-tests', name: 'Tests', type: 'page' },
              { id: 'wb-formules', name: 'Key formulas/concepts', type: 'page' },
              { id: 'wb-active-recall', name: 'Active recall questions', type: 'page' },
              { id: 'wb-fouten', name: 'Error log', type: 'page' },
              { id: 'wb-hard', name: 'Moeilijke topics', type: 'page' },
              { id: 'wb-analyse', name: 'Laatste toetsanalyse', type: 'page' },
              { id: 'wb-questions', name: 'Wat moet ik questions aan docent?', type: 'page' },
            ],
          },
          {
            id: 'wiskunde-d',
            name: 'Wiskunde D',
            type: 'page',
            icon: '📊',
            children: Array(9)
              .fill(null)
              .map((_, i) => ({
                id: `wd-${i}`,
                name: [
                  'Current material',
                  'Homework',
                  'Tests',
                  'Formules',
                  'Active recall',
                  'Error log',
                  'Moeilijk',
                  'Analyse',
                  'Vragen',
                ][i],
                type: 'page',
              })),
          },
          {
            id: 'natuurkunde',
            name: 'Natuurkunde',
            type: 'page',
            icon: '⚛️',
            children: Array(9)
              .fill(null)
              .map((_, i) => ({
                id: `nk-${i}`,
                name: [
                  'Current material',
                  'Homework',
                  'Tests',
                  'Formules',
                  'Active recall',
                  'Error log',
                  'Moeilijk',
                  'Analyse',
                  'Vragen',
                ][i],
                type: 'page',
              })),
          },
          {
            id: 'scheikunde',
            name: 'Scheikunde',
            type: 'page',
            icon: '🧪',
            children: Array(9)
              .fill(null)
              .map((_, i) => ({
                id: `sk-${i}`,
                name: [
                  'Current material',
                  'Homework',
                  'Tests',
                  'Formules',
                  'Active recall',
                  'Error log',
                  'Moeilijk',
                  'Analyse',
                  'Vragen',
                ][i],
                type: 'page',
              })),
          },
          {
            id: 'biologie',
            name: 'Biologie',
            type: 'page',
            icon: '🧬',
            children: Array(9)
              .fill(null)
              .map((_, i) => ({
                id: `bio-${i}`,
                name: [
                  'Current material',
                  'Homework',
                  'Tests',
                  'Formules',
                  'Active recall',
                  'Error log',
                  'Moeilijk',
                  'Analyse',
                  'Vragen',
                ][i],
                type: 'page',
              })),
          },
          {
            id: 'nederlands',
            name: 'Nederlands',
            type: 'page',
            icon: '📖',
            children: Array(9)
              .fill(null)
              .map((_, i) => ({
                id: `nl-${i}`,
                name: [
                  'Current material',
                  'Homework',
                  'Tests',
                  'Formules',
                  'Active recall',
                  'Error log',
                  'Moeilijk',
                  'Analyse',
                  'Vragen',
                ][i],
                type: 'page',
              })),
          },
          {
            id: 'frans',
            name: 'Frans',
            type: 'page',
            icon: '🇫🇷',
            children: Array(9)
              .fill(null)
              .map((_, i) => ({
                id: `fr-${i}`,
                name: [
                  'Current material',
                  'Homework',
                  'Tests',
                  'Formules',
                  'Active recall',
                  'Error log',
                  'Moeilijk',
                  'Analyse',
                  'Vragen',
                ][i],
                type: 'page',
              })),
          },
          {
            id: 'engels',
            name: 'Cambridge Engels',
            type: 'page',
            icon: '🇬🇧',
            children: Array(9)
              .fill(null)
              .map((_, i) => ({
                id: `en-${i}`,
                name: [
                  'Current material',
                  'Homework',
                  'Tests',
                  'Formules',
                  'Active recall',
                  'Error log',
                  'Moeilijk',
                  'Analyse',
                  'Vragen',
                ][i],
                type: 'page',
              })),
          },
          {
            id: 'informatica',
            name: 'Informatica',
            type: 'page',
            icon: '💻',
            children: Array(9)
              .fill(null)
              .map((_, i) => ({
                id: `inf-${i}`,
                name: [
                  'Current material',
                  'Homework',
                  'Tests',
                  'Formules',
                  'Active recall',
                  'Error log',
                  'Moeilijk',
                  'Analyse',
                  'Vragen',
                ][i],
                type: 'page',
              })),
          },
          {
            id: 'arabisch',
            name: 'Arabisch/Islamitisch',
            type: 'page',
            icon: '🕌',
            children: Array(9)
              .fill(null)
              .map((_, i) => ({
                id: `ar-${i}`,
                name: [
                  'Current material',
                  'Homework',
                  'Tests',
                  'Formules',
                  'Active recall',
                  'Error log',
                  'Moeilijk',
                  'Analyse',
                  'Vragen',
                ][i],
                type: 'page',
              })),
          },
        ],
      },
      {
        id: 'foutenlogboek',
        name: 'Error log',
        type: 'page',
        icon: '📝',
        children: [],
        databases: [
          {
            name: 'Fouten Database',
            properties: [
              { name: 'Datum', type: 'date' },
              { name: 'Subject', type: 'select' },
              { name: 'Onderwerp', type: 'text' },
              { name: 'Vraag/Opgave', type: 'text' },
              {
                name: 'Fouttype',
                type: 'select',
                options: ['Rekenfout', 'Conceptfout', 'Leesfout', 'Tijdsdruk', 'Onbekend'],
              },
              { name: 'Mijn fout', type: 'text' },
              { name: 'Correcte aanpak', type: 'text' },
              { name: 'Waarom deze fout?', type: 'text' },
              { name: 'Herhalen op', type: 'date' },
              {
                name: 'Status',
                type: 'select',
                options: ['Nieuw', 'In behandeling', 'Begrepen', 'Beheerst'],
              },
              { name: 'Test-relevant', type: 'checkbox' },
            ],
          },
        ],
      },
      {
        id: 'herhaal-queue',
        name: 'Review queue',
        type: 'page',
        icon: '🔄',
        children: [],
        databases: [
          {
            name: 'Herhaal Database',
            properties: [
              { name: 'Vraag', type: 'text' },
              { name: 'Subject', type: 'select' },
              { name: 'Onderwerp', type: 'text' },
              { name: 'Niveau', type: 'select', options: ['Basis', 'Medium', 'Geavanceerd'] },
              { name: 'Volgende herhaling', type: 'date' },
              {
                name: 'Status',
                type: 'select',
                options: ['Nieuw', 'Lerend', 'Herhalend', 'Beheerst'],
              },
              {
                name: 'Laatste score',
                type: 'select',
                options: ['0%', '25%', '50%', '75%', '100%'],
              },
              { name: 'Aantal herhalingen', type: 'number' },
            ],
          },
        ],
      },
      {
        id: 'tests-deadlines',
        name: 'Tests & Deadlines',
        type: 'page',
        icon: '📅',
        children: [],
        databases: [
          {
            name: 'Tests Database',
            properties: [
              { name: 'Test/Deadline', type: 'text' },
              { name: 'Subject', type: 'select' },
              { name: 'Datum', type: 'date' },
              { name: 'Hoofdstukken', type: 'text' },
              { name: 'Stof', type: 'text' },
              { name: 'Weging', type: 'number' },
              { name: 'Status', type: 'select', options: ['Gepland', 'In progress', 'Done'] },
              {
                name: 'Type',
                type: 'select',
                options: ['Test', 'Tentamen', 'Presentation', 'Homework', 'Project'],
              },
              { name: 'T-7 Planning', type: 'text' },
              { name: 'T-3 Planning', type: 'text' },
              { name: 'T-1 Planning', type: 'text' },
            ],
            views: [
              { name: 'Komende week', type: 'calendar' },
              { name: 'Alle tests', type: 'table' },
            ],
          },
        ],
      },
      {
        id: 'projecten',
        name: 'Projects',
        type: 'page',
        icon: '🎯',
        children: [],
        databases: [
          {
            name: 'Projects Database',
            properties: [
              { name: 'Project', type: 'text' },
              { name: 'Subject', type: 'select' },
              { name: 'Deadline', type: 'date' },
              {
                name: 'Status',
                type: 'select',
                options: ['Idee', 'Planning', 'Uitvoering', 'Review', 'Done'],
              },
              { name: 'Stappen', type: 'text' },
              { name: 'Afhankelijkheden', type: 'text' },
              { name: 'Opmerkingen', type: 'text' },
            ],
          },
        ],
      },
      {
        id: 'archive',
        name: 'Archief',
        type: 'page',
        icon: '🗄️',
        children: [],
      },
    ],
  },
};
