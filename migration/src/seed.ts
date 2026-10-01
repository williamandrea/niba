/*
 * Starter content so the new site isn't empty. Anything we are unsure about
 * is marked "TODO:" so admins can find it in the Studio. The public site
 * hides TODO notes automatically.
 */

export type ImageRef = { assetId: string; alt: string } | undefined
export type SanityDoc = { _id: string; _type: string; [key: string]: unknown }

let keyCounter = 0
const key = (prefix: string) => `${prefix}${String(++keyCounter).padStart(3, '0')}`

export function image(ref: ImageRef, type = 'image') {
  if (!ref) return undefined
  return { _type: type, asset: { _type: 'reference', _ref: ref.assetId }, alt: ref.alt }
}

const reference = (id: string) => ({ _type: 'reference', _ref: id, _key: key('r') })
const slug = (current: string) => ({ _type: 'slug', current })
const link = (label: string, href: string) => ({ _type: 'link', _key: key('l'), label, href })

type Para = string | { h2: string } | { h3: string } | { bullets: string[] } | { numbers: string[] }

/** Builds simple Portable Text from plain strings. */
export function pt(prefix: string, paras: Para[]) {
  const block = (text: string, style = 'normal', listItem?: string) => ({
    _type: 'block',
    _key: key(prefix),
    style,
    markDefs: [],
    children: [{ _type: 'span', _key: key(prefix), text, marks: [] }],
    ...(listItem ? { listItem, level: 1 } : {}),
  })
  return paras.flatMap((p) => {
    if (typeof p === 'string') return [block(p)]
    if ('h2' in p) return [block(p.h2, 'h2')]
    if ('h3' in p) return [block(p.h3, 'h3')]
    if ('bullets' in p) return p.bullets.map((t) => block(t, 'normal', 'bullet'))
    return p.numbers.map((t) => block(t, 'normal', 'number'))
  })
}

function section(
  prefix: string,
  heading: string | undefined,
  paras: Para[],
  images: ImageRef[] = [],
  background = 'light',
) {
  const photos = images.filter(Boolean).map((img) => ({ ...image(img, 'photo'), _key: key('p') }))
  return {
    _type: 'pageSection',
    _key: key('s'),
    ...(heading ? { heading } : {}),
    content: pt(prefix, paras),
    ...(photos.length ? { images: photos } : {}),
    background,
  }
}

export type SeedImages = {
  logo?: ImageRef
  hero?: ImageRef
  buddhaRupang?: ImageRef
  nauyana?: ImageRef
  pabbajja?: ImageRef
  retreat?: ImageRef
  abhidhamma?: ImageRef
  meditation?: ImageRef
  paAuk?: ImageRef
  niba: ImageRef[]
}

export const ID = {
  settings: 'siteSettings',
  homepage: 'homepage',
  categoryDhammapada: 'category-dhammapada',
  contactRussel: 'contact-russel',
  contactPopo: 'contact-popo',
  contactArman: 'contact-arman',
  contactFenny: 'contact-fenny',
  teacherPaAuk: 'teacher-pa-auk-sayadaw',
  teacherAriyadhamma: 'teacher-ariyadhamma',
  teacherAriyananda: 'teacher-ariyananda',
}

const MENU = [
  { label: 'Home', href: '/' },
  {
    label: 'About',
    href: '/about/',
    children: [
      ['About Us', '/about/'],
      ['Our Teachers', '/teachers/'],
      ['Residing Venerables', '/residing-venerables/'],
    ],
  },
  {
    label: 'NIBA',
    href: '/niba/',
    children: [
      ['About NIBA', '/niba/'],
      ['Registration', '/niba/registration/'],
    ],
  },
  { label: 'Programs', href: '/programs/' },
  {
    label: 'Events',
    href: '/events/',
    children: [
      ['Upcoming', '/events/'],
      ['Past', '/events/past/'],
    ],
  },
  {
    label: 'Resources',
    href: '/blog/',
    children: [
      ['Articles', '/blog/'],
      ['Books', '/books/'],
      ['Chanting', '/chanting/'],
    ],
  },
  { label: 'Contact', href: '/contact/' },
] as const

const RESIDENCY = { start: '2026-07-18', end: '2026-11-12' }

export function seedDocuments(img: SeedImages): SanityDoc[] {
  keyCounter = 0
  const docs: SanityDoc[] = []

  // Contacts
  docs.push(
    { _id: ID.contactRussel, _type: 'contactPerson', name: 'Mr. Russel', whatsapp: '+6281378880880' },
    { _id: ID.contactPopo, _type: 'contactPerson', name: 'Mrs. Popo', whatsapp: '+628126507356' },
    { _id: ID.contactArman, _type: 'contactPerson', name: 'Mr. Arman', whatsapp: 'TODO: number' },
    { _id: ID.contactFenny, _type: 'contactPerson', name: 'Mrs. Fenny', whatsapp: 'TODO: number' },
  )

  // Settings
  docs.push({
    _id: ID.settings,
    _type: 'siteSettings',
    siteName: 'Na Uyana Aranya Indonesia',
    logo: image(img.logo),
    menu: MENU.map((item) => ({
      _type: 'menuItem',
      _key: key('m'),
      label: item.label,
      href: item.href,
      ...('children' in item ? { children: item.children.map(([label, href]) => link(label, href)) } : {}),
    })),
    footer: {
      quote:
        'Mind precedes all mental states. Mind is their chief; they are all mind-wrought. If with an impure mind a person speaks or acts, suffering follows him, like the wheel that follows the foot of the ox.',
      quoteSource: 'Dhammapada, verse 1',
      address: 'Komplek Graha Metropolitan\nJl. Kapten Sumarsono, Blok B, No. 81\n20124 Medan, Indonesia',
      mapsUrl: 'https://share.google/SJtspZehqD7mbtxXg',
      email: 'nauyana@gmail.com',
      whatsapp: '+6281215004788',
      contacts: [ID.contactRussel, ID.contactPopo, ID.contactArman, ID.contactFenny].map(reference),
      usefulLinks: [
        link('About us', '/about/'),
        link('Our teachers', '/teachers/'),
        link('About NIBA', '/niba/'),
        link('Articles', '/blog/'),
        link('Books', '/books/'),
      ],
      nibaBlurb:
        'Parents are welcome to nurture their children with the precious gift of Dhamma by guiding them at home or enrolling them in our Buddhist school.',
      nibaButton: { _type: 'link', label: 'Register for NIBA', href: '/niba/registration/' },
      socialLinks: [
        {
          _type: 'socialLink',
          _key: key('so'),
          platform: 'instagram',
          label: '@nauyanaaranya',
          url: 'https://www.instagram.com/nauyanaaranya/',
        },
        {
          _type: 'socialLink',
          _key: key('so'),
          platform: 'instagram',
          label: '@niba_nauyana',
          url: 'https://www.instagram.com/niba_nauyana/',
        },
      ],
    },
    seo: {
      _type: 'seo',
      title: 'Na Uyana Aranya Indonesia',
      description:
        'A Theravada Buddhist community in Medan. Sunday Dhamma school for children (NIBA), weekly Dhamma and meditation programs, and retreats.',
    },
  })

  // Homepage
  docs.push({
    _id: ID.homepage,
    _type: 'homepage',
    hero: {
      image: image(img.hero),
      paliVerse: 'Sukhi Hotu,\nNibbānassa Paccayo Hotu (TODO: confirm spelling with teachers)',
      meaning: 'May you be well and happy; may this be a condition for Nibbāna.',
      tagline: 'Theruwan Saranai with Metta',
      button: { _type: 'link', label: 'About Na Uyana', href: '/about/' },
    },
    intro: {
      heading: 'A Sunday Dhamma school for young hearts',
      text: 'NIBA is our Sunday Dhamma school for children and teenagers in Medan. Through stories from the Dhammapada, chanting, and gentle meditation, young people learn kindness, honesty, and mindfulness, and grow up with the Triple Gem as their refuge.',
      images: img.niba
        .filter(Boolean)
        .slice(0, 5)
        .map((ref) => ({ ...image(ref, 'photo'), _key: key('p') })),
      buttons: [link('Join NIBA', '/niba/registration/'), link('Our Programs', '/programs/')],
    },
    teacherQuote: {
      quote: 'TODO: add a short quote from one of our teachers. This section stays hidden until a quote is added.',
      teacher: { _type: 'reference', _ref: ID.teacherAriyadhamma },
    },
    programsIntro: 'Join us every week. All programs are free of charge.',
    venerablesIntro:
      'During the residency, all devotees are welcome to offer dāna to the venerables at the morning piṇḍapāta and at lunchtime. Please check our Instagram for the latest news.',
  })

  // Teachers
  const teachers = [
    {
      _id: ID.teacherPaAuk,
      fullName: 'Most Venerable Pa-Auk Tawya Sayadaw Bhaddanta Āciṇṇa Mahāthera',
      shortName: 'Pa-Auk Sayadaw',
      slug: 'pa-auk-sayadaw',
      photo: image(img.paAuk),
    },
    {
      _id: ID.teacherAriyadhamma,
      fullName: 'Most Venerable Nā Uyanē Sri Ariyadhammābhidhāna Mahāthēra',
      shortName: 'Ariyadhamma Bhante',
      slug: 'na-uyane-ariyadhamma-mahathera',
    },
    {
      _id: ID.teacherAriyananda,
      fullName: 'Most Venerable Angulgamuwē Ariyanandhābhidhāna Mahāthēra',
      shortName: 'Ariyananda Bhante',
      slug: 'angulgamuwe-ariyananda-mahathera',
    },
  ]
  teachers.forEach((t, i) =>
    docs.push({
      _id: t._id,
      _type: 'teacher',
      fullName: t.fullName,
      shortName: t.shortName,
      slug: slug(t.slug),
      role: 'teacher',
      ...(t.photo ? { photo: t.photo } : {}),
      bio: 'TODO: add a short biography.',
      order: i + 1,
    }),
  )

  const venerables = [
    'Attaragama Mudhita Mahathero',
    'Jayamuthugama Ariyasiri',
    'Haburugala Chandaratana',
    'Padukke Saddhasiri',
    'Pallebage Sasanadhamma',
  ]
  venerables.forEach((name, i) => {
    const s = name.toLowerCase().replace(/[^a-z]+/g, '-')
    docs.push({
      _id: `teacher-resident-${s}`,
      _type: 'teacher',
      fullName: name,
      slug: slug(s),
      role: 'resident',
      residencyStart: RESIDENCY.start,
      residencyEnd: RESIDENCY.end,
      order: i + 1,
    })
  })

  // Programs
  docs.push(
    {
      _id: 'program-niba',
      _type: 'program',
      name: 'Dhammapada Class for Young Generation (NIBA)',
      slug: slug('niba-dhammapada-class'),
      icon: '📖',
      shortDescription:
        'Every Sunday, children and teenagers learn the Dhamma through Dhammapada stories, simple chanting, and gentle mindfulness. A warm, friendly class where young hearts grow in kindness and wisdom.',
      schedule: [{ _type: 'scheduleItem', _key: key('t'), day: 'sunday', startTime: '09:30', endTime: '11:30' }],
      scheduleNote: 'TODO: confirm 09.30–11.30 or 14.00–17.00 WIB. The old site lists both.',
      audience: 'registration',
      images: img.niba
        .filter(Boolean)
        .slice(0, 2)
        .map((ref) => ({ ...image(ref, 'photo'), _key: key('p') })),
      button: { _type: 'link', label: 'Register your child', href: '/niba/registration/' },
      order: 1,
    },
    {
      _id: 'program-abhidhamma',
      _type: 'program',
      name: 'Abhidhamma Discussion – Paṭiccasamuppāda',
      slug: slug('abhidhamma-discussion'),
      icon: '☸️',
      shortDescription:
        'A weekly study circle on Dependent Origination (Paṭiccasamuppāda): how causes and conditions give rise to suffering, and how seeing them clearly points the way to freedom. Come to listen, ask, and reflect together.',
      schedule: [{ _type: 'scheduleItem', _key: key('t'), day: 'sunday', startTime: '14:00', endTime: '17:00' }],
      audience: 'public',
      images: img.abhidhamma ? [{ ...image(img.abhidhamma, 'photo'), _key: key('p') }] : undefined,
      order: 2,
    },
    {
      _id: 'program-meditation',
      _type: 'program',
      name: 'Meditation with Metta',
      slug: slug('meditation-with-metta'),
      icon: '🤍',
      shortDescription:
        'Come and sit with us. Guided meditation to grow mindfulness, calm, and loving-kindness (mettā) in a quiet, supportive setting. Beginners are very welcome.',
      schedule: [
        { _type: 'scheduleItem', _key: key('t'), day: 'tuesday', startTime: '19:00', endTime: '21:00' },
        { _type: 'scheduleItem', _key: key('t'), day: 'friday', startTime: '19:00', endTime: '21:00' },
        { _type: 'scheduleItem', _key: key('t'), day: 'sunday', startTime: '17:00', endTime: '19:00' },
      ],
      scheduleNote: 'TODO: confirm the Tuesday 19.00–21.00 session.',
      audience: 'public',
      contacts: [ID.contactArman, ID.contactFenny].map(reference),
      images: img.meditation ? [{ ...image(img.meditation, 'photo'), _key: key('p') }] : undefined,
      order: 3,
    },
  )

  // Events (both already past)
  docs.push(
    {
      _id: 'event-pabbajja-2026',
      _type: 'event',
      title: 'Pabbajjā 2026',
      slug: slug('pabbajja-2026'),
      type: 'pabbajja',
      startDate: '2026-05-23',
      endDate: '2026-05-30',
      audience: 'limited',
      guidedBy: { _type: 'reference', _ref: ID.teacherAriyananda },
      image: image(img.pabbajja),
      description: pt('ev', [
        'A week of temporary ordination for lay devotees. Participants live the simple life of a novice: keeping the precepts, joining the daily routine of the monastery, and practising meditation under the guidance of our teacher.',
        'Places are limited. Please contact us on WhatsApp to ask about joining.',
      ]),
      contacts: [ID.contactRussel, ID.contactPopo].map(reference),
    },
    {
      _id: 'event-meditation-retreat-2026',
      _type: 'event',
      title: 'Meditation Retreat',
      slug: slug('meditation-retreat-2026'),
      type: 'meditation-retreat',
      startDate: '2026-03-14',
      endDate: '2026-03-24',
      sessions: [
        { _type: 'eventSession', _key: key('se'), label: 'Session 1', start: '2026-03-14', end: '2026-03-24' },
        { _type: 'eventSession', _key: key('se'), label: 'Session 2', start: '2026-03-18', end: '2026-03-24' },
      ],
      audience: 'public',
      guidedByText: 'Most Ven. Siyambalape Medhankara',
      image: image(img.retreat),
      description: pt('ev', [
        'Days of quiet practice: guided sitting and walking meditation, Dhamma talks, and noble silence. Choose the full retreat or join for the shorter second session.',
      ]),
      contacts: [ID.contactArman, ID.contactFenny].map(reference),
    },
  )

  // Pages
  docs.push(
    {
      _id: 'page-about',
      _type: 'page',
      title: 'About Us',
      slug: slug('about'),
      intro: 'A Theravada Buddhist community in Medan, Indonesia.',
      body: [
        section(
          'ab',
          'Who we are',
          [
            'Na Uyana Aranya Indonesia is a Theravada Buddhist community in Medan, North Sumatra. We come together to learn the Buddha’s teaching, to practise meditation, and to support the monastic Sangha.',
            'Everyone is welcome: families, young people, and anyone curious about the Dhamma.',
            'TODO: please check this text with the committee and add our story.',
          ],
          [img.buddhaRupang, img.nauyana],
        ),
        section(
          'ab',
          'What we offer',
          [
            {
              bullets: [
                'NIBA, a Sunday Dhamma school for children and teenagers',
                'A weekly Abhidhamma discussion',
                'Meditation with mettā, several times a week',
                'Retreats and pabbajjā (temporary ordination) programs',
              ],
            },
          ],
          [],
          'warm',
        ),
      ],
    },
    {
      _id: 'page-niba',
      _type: 'page',
      title: 'About NIBA',
      slug: slug('niba'),
      intro: 'Our Sunday Dhamma school for children and teenagers.',
      body: [
        section(
          'ni',
          'Growing up with the Dhamma',
          [
            'NIBA gives children a warm place to learn the Buddha’s teaching. Each week we read a story from the Dhammapada, talk about what it means in daily life, chant together, and practise a few minutes of quiet mindfulness.',
            'Parents are welcome to nurture their children with the precious gift of Dhamma by guiding them at home or enrolling them in our Buddhist school.',
          ],
          img.niba.slice(0, 3),
        ),
        section(
          'ni',
          'Who can join',
          ['TODO: add the age range and class groups.', 'Registration is required. It only takes a WhatsApp message.'],
          [],
          'warm',
        ),
      ],
    },
    {
      _id: 'page-niba-registration',
      _type: 'page',
      title: 'NIBA Registration',
      slug: slug('niba-registration'),
      intro: 'Register your child through WhatsApp. It only takes a minute.',
      body: [
        section('nr', 'How to register', [
          {
            numbers: [
              'Tap one of the WhatsApp buttons on this page.',
              'Send your child’s name and age, and your name.',
              'We will reply with the class details and what to bring.',
            ],
          },
          'TODO: confirm what information parents should send.',
        ]),
      ],
    },
    {
      _id: 'page-books',
      _type: 'page',
      title: 'Books',
      slug: slug('books'),
      intro: 'Dhamma books to read and share.',
      body: [section('bo', undefined, ['TODO: add the book list (title, author, and a link or where to get a copy).'])],
    },
    {
      _id: 'page-chanting',
      _type: 'page',
      title: 'Chanting',
      slug: slug('chanting'),
      intro: 'Pali chanting we recite together, with English meanings.',
      body: [
        section('ch', undefined, ['TODO: add chanting texts. Use the "Pali verse" block for Pali with its meaning.']),
      ],
    },
    {
      _id: 'page-contact',
      _type: 'page',
      title: 'Contact Us',
      slug: slug('contact'),
      intro: 'We would love to hear from you. The quickest way to reach us is WhatsApp.',
    },
  )

  // Remove empty optional fields so Sanity doesn't store `undefined`.
  return JSON.parse(JSON.stringify(docs)) as SanityDoc[]
}
