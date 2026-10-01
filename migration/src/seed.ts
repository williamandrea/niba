/*
 * Starter content so the new site isn't empty, in English and Indonesian.
 * Anything we are unsure about is marked "TODO:" so admins can find it in the
 * Studio. The public site hides TODO notes automatically. TODO notes are only
 * in English: the Indonesian site shows the English text until it is translated.
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

/** Text in two languages (see studio/schemaTypes/objects/locale.ts). Leave `id` out to translate later. */
export const localeString = (en: string, id?: string) => ({ _type: 'localeString', en, ...(id ? { id } : {}) })
export const localeText = (en: string, id?: string) => ({ _type: 'localeText', en, ...(id ? { id } : {}) })
export const localeBlocks = (en: unknown[], id?: unknown[]) => ({
  _type: 'localeBlockContent',
  en,
  ...(id?.length ? { id } : {}),
})

type Label = readonly [en: string, id: string]
const link = ([en, id]: Label, href: string) => ({ _type: 'link', _key: key('l'), label: localeString(en, id), href })

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
  heading: Label | undefined,
  paras: Para[],
  parasId: Para[],
  images: ImageRef[] = [],
  background = 'light',
) {
  const photos = images.filter(Boolean).map((img) => ({ ...image(img, 'photo'), _key: key('p') }))
  return {
    _type: 'pageSection',
    _key: key('s'),
    ...(heading ? { heading: localeString(...heading) } : {}),
    content: localeBlocks(pt(prefix, paras), pt(prefix, parasId)),
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
  { label: ['Home', 'Beranda'], href: '/' },
  {
    label: ['About', 'Tentang'],
    href: '/about/',
    children: [
      [['About Us', 'Tentang Kami'], '/about/'],
      [['Our Teachers', 'Guru Kami'], '/teachers/'],
      [['Residing Venerables', 'Bhante yang Berdiam'], '/residing-venerables/'],
    ],
  },
  {
    label: ['NIBA', 'NIBA'],
    href: '/niba/',
    children: [
      [['About NIBA', 'Tentang NIBA'], '/niba/'],
      [['Registration', 'Pendaftaran'], '/niba/registration/'],
    ],
  },
  { label: ['Programs', 'Program'], href: '/programs/' },
  {
    label: ['Events', 'Kegiatan'],
    href: '/events/',
    children: [
      [['Upcoming', 'Mendatang'], '/events/'],
      [['Past', 'Lalu'], '/events/past/'],
    ],
  },
  {
    label: ['Resources', 'Materi'],
    href: '/blog/',
    children: [
      [['Articles', 'Artikel'], '/blog/'],
      [['Books', 'Buku'], '/books/'],
      [['Chanting', 'Paritta'], '/chanting/'],
    ],
  },
  { label: ['Contact', 'Kontak'], href: '/contact/' },
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
      label: localeString(item.label[0], item.label[1]),
      href: item.href,
      ...('children' in item ? { children: item.children.map(([label, href]) => link(label, href)) } : {}),
    })),
    footer: {
      quote: localeText(
        'Mind precedes all mental states. Mind is their chief; they are all mind-wrought. If with an impure mind a person speaks or acts, suffering follows him, like the wheel that follows the foot of the ox.',
        'Pikiran adalah pelopor dari segala sesuatu, pikiran adalah pemimpin, pikiran adalah pembentuk. Bila seseorang berbicara atau berbuat dengan pikiran jahat, maka penderitaan akan mengikutinya, bagaikan roda pedati mengikuti langkah kaki lembu yang menariknya.',
      ),
      quoteSource: localeString('Dhammapada, verse 1', 'Dhammapada, syair 1'),
      address: 'Komplek Graha Metropolitan\nJl. Kapten Sumarsono, Blok B, No. 81\n20124 Medan, Indonesia',
      mapsUrl: 'https://share.google/SJtspZehqD7mbtxXg',
      email: 'nauyana@gmail.com',
      whatsapp: '+6281215004788',
      contacts: [ID.contactRussel, ID.contactPopo, ID.contactArman, ID.contactFenny].map(reference),
      usefulLinks: [
        link(['About us', 'Tentang kami'], '/about/'),
        link(['Our teachers', 'Guru kami'], '/teachers/'),
        link(['About NIBA', 'Tentang NIBA'], '/niba/'),
        link(['Articles', 'Artikel'], '/blog/'),
        link(['Books', 'Buku'], '/books/'),
      ],
      nibaBlurb: localeText(
        'Parents are welcome to nurture their children with the precious gift of Dhamma by guiding them at home or enrolling them in our Buddhist school.',
        'Para orang tua dipersilakan membekali anak-anak dengan hadiah Dhamma yang berharga, dengan membimbing mereka di rumah atau mendaftarkan mereka di sekolah Buddhis kami.',
      ),
      nibaButton: {
        _type: 'link',
        label: localeString('Register for NIBA', 'Daftar NIBA'),
        href: '/niba/registration/',
      },
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
      title: localeString('Na Uyana Aranya Indonesia', 'Na Uyana Aranya Indonesia'),
      description: localeText(
        'A Theravada Buddhist community in Medan. Sunday Dhamma school for children (NIBA), weekly Dhamma and meditation programs, and retreats.',
        'Komunitas Buddhis Theravada di Medan. Sekolah Minggu Dhamma untuk anak-anak (NIBA), program Dhamma dan meditasi mingguan, serta retret.',
      ),
    },
  })

  // Homepage
  docs.push({
    _id: ID.homepage,
    _type: 'homepage',
    hero: {
      image: image(img.hero),
      paliVerse: 'Sukhi Hotu,\nNibbānassa Paccayo Hotu (TODO: confirm spelling with teachers)',
      meaning: localeText(
        'May you be well and happy; may this be a condition for Nibbāna.',
        'Semoga Anda sehat dan berbahagia; semoga ini menjadi kondisi untuk mencapai Nibbāna.',
      ),
      tagline: localeString('Theruwan Saranai with Metta', 'Theruwan Saranai dengan Metta'),
      button: { _type: 'link', label: localeString('About Na Uyana', 'Tentang Na Uyana'), href: '/about/' },
    },
    intro: {
      heading: localeString('A Sunday Dhamma school for young hearts', 'Sekolah Minggu Dhamma untuk hati yang muda'),
      text: localeText(
        'NIBA is our Sunday Dhamma school for children and teenagers in Medan. Through stories from the Dhammapada, chanting, and gentle meditation, young people learn kindness, honesty, and mindfulness, and grow up with the Triple Gem as their refuge.',
        'NIBA adalah sekolah Minggu Dhamma kami untuk anak-anak dan remaja di Medan. Melalui kisah-kisah Dhammapada, pembacaan paritta, dan meditasi yang lembut, generasi muda belajar welas asih, kejujuran, dan perhatian penuh, serta tumbuh dengan Tiratana sebagai perlindungan.',
      ),
      images: img.niba
        .filter(Boolean)
        .slice(0, 5)
        .map((ref) => ({ ...image(ref, 'photo'), _key: key('p') })),
      buttons: [
        link(['Join NIBA', 'Ikut NIBA'], '/niba/registration/'),
        link(['Our Programs', 'Program Kami'], '/programs/'),
      ],
    },
    teacherQuote: {
      quote: localeText(
        'TODO: add a short quote from one of our teachers. This section stays hidden until a quote is added.',
      ),
      teacher: { _type: 'reference', _ref: ID.teacherAriyadhamma },
    },
    programsIntro: localeText(
      'Join us every week. All programs are free of charge.',
      'Bergabunglah bersama kami setiap minggu. Semua program tidak dipungut biaya.',
    ),
    venerablesIntro: localeText(
      'During the residency, all devotees are welcome to offer dāna to the venerables at the morning piṇḍapāta and at lunchtime. Please check our Instagram for the latest news.',
      'Selama masa berdiam, semua umat dipersilakan berdana kepada para bhante saat piṇḍapāta pagi dan pada waktu makan siang. Kabar terbaru dapat dilihat di Instagram kami.',
    ),
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
      bio: localeText('TODO: add a short biography.'),
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
      name: localeString('Dhammapada Class for Young Generation (NIBA)', 'Kelas Dhammapada untuk Generasi Muda (NIBA)'),
      slug: slug('niba-dhammapada-class'),
      icon: '📖',
      shortDescription: localeText(
        'Every Sunday, children and teenagers learn the Dhamma through Dhammapada stories, simple chanting, and gentle mindfulness. A warm, friendly class where young hearts grow in kindness and wisdom.',
        'Setiap Minggu, anak-anak dan remaja belajar Dhamma melalui kisah-kisah Dhammapada, paritta sederhana, dan latihan perhatian penuh yang lembut. Kelas yang hangat dan ramah, tempat hati yang muda tumbuh dalam welas asih dan kebijaksanaan.',
      ),
      schedule: [{ _type: 'scheduleItem', _key: key('t'), day: 'sunday', startTime: '09:30', endTime: '11:30' }],
      scheduleNote: localeString('TODO: confirm 09.30–11.30 or 14.00–17.00 WIB. The old site lists both.'),
      audience: 'registration',
      images: img.niba
        .filter(Boolean)
        .slice(0, 2)
        .map((ref) => ({ ...image(ref, 'photo'), _key: key('p') })),
      button: {
        _type: 'link',
        label: localeString('Register your child', 'Daftarkan anak Anda'),
        href: '/niba/registration/',
      },
      order: 1,
    },
    {
      _id: 'program-abhidhamma',
      _type: 'program',
      name: localeString('Abhidhamma Discussion – Paṭiccasamuppāda', 'Diskusi Abhidhamma – Paṭiccasamuppāda'),
      slug: slug('abhidhamma-discussion'),
      icon: '☸️',
      shortDescription: localeText(
        'A weekly study circle on Dependent Origination (Paṭiccasamuppāda): how causes and conditions give rise to suffering, and how seeing them clearly points the way to freedom. Come to listen, ask, and reflect together.',
        'Kelompok belajar mingguan tentang Sebab-Musabab yang Saling Bergantungan (Paṭiccasamuppāda): bagaimana sebab dan kondisi memunculkan penderitaan, dan bagaimana melihatnya dengan jelas menunjukkan jalan menuju kebebasan. Mari mendengar, bertanya, dan merenung bersama.',
      ),
      schedule: [{ _type: 'scheduleItem', _key: key('t'), day: 'sunday', startTime: '14:00', endTime: '17:00' }],
      audience: 'public',
      images: img.abhidhamma ? [{ ...image(img.abhidhamma, 'photo'), _key: key('p') }] : undefined,
      order: 2,
    },
    {
      _id: 'program-meditation',
      _type: 'program',
      name: localeString('Meditation with Metta', 'Meditasi dengan Metta'),
      slug: slug('meditation-with-metta'),
      icon: '🤍',
      shortDescription: localeText(
        'Come and sit with us. Guided meditation to grow mindfulness, calm, and loving-kindness (mettā) in a quiet, supportive setting. Beginners are very welcome.',
        'Mari duduk bersama kami. Meditasi terbimbing untuk menumbuhkan perhatian penuh, ketenangan, dan cinta kasih (mettā) dalam suasana yang hening dan mendukung. Pemula sangat dipersilakan.',
      ),
      schedule: [
        { _type: 'scheduleItem', _key: key('t'), day: 'tuesday', startTime: '19:00', endTime: '21:00' },
        { _type: 'scheduleItem', _key: key('t'), day: 'friday', startTime: '19:00', endTime: '21:00' },
        { _type: 'scheduleItem', _key: key('t'), day: 'sunday', startTime: '17:00', endTime: '19:00' },
      ],
      scheduleNote: localeString('TODO: confirm the Tuesday 19.00–21.00 session.'),
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
      title: localeString('Pabbajjā 2026', 'Pabbajjā 2026'),
      slug: slug('pabbajja-2026'),
      type: 'pabbajja',
      startDate: '2026-05-23',
      endDate: '2026-05-30',
      audience: 'limited',
      guidedBy: { _type: 'reference', _ref: ID.teacherAriyananda },
      image: image(img.pabbajja),
      description: localeBlocks(
        pt('ev', [
          'A week of temporary ordination for lay devotees. Participants live the simple life of a novice: keeping the precepts, joining the daily routine of the monastery, and practising meditation under the guidance of our teacher.',
          'Places are limited. Please contact us on WhatsApp to ask about joining.',
        ]),
        pt('ev', [
          'Satu minggu pentahbisan sementara bagi umat awam. Peserta menjalani kehidupan sederhana seorang samanera: menjaga sila, mengikuti kegiatan harian vihara, dan berlatih meditasi di bawah bimbingan guru kami.',
          'Tempat terbatas. Silakan hubungi kami lewat WhatsApp untuk menanyakan cara bergabung.',
        ]),
      ),
      contacts: [ID.contactRussel, ID.contactPopo].map(reference),
    },
    {
      _id: 'event-meditation-retreat-2026',
      _type: 'event',
      title: localeString('Meditation Retreat', 'Retret Meditasi'),
      slug: slug('meditation-retreat-2026'),
      type: 'meditation-retreat',
      startDate: '2026-03-14',
      endDate: '2026-03-24',
      sessions: [
        {
          _type: 'eventSession',
          _key: key('se'),
          label: localeString('Session 1', 'Sesi 1'),
          start: '2026-03-14',
          end: '2026-03-24',
        },
        {
          _type: 'eventSession',
          _key: key('se'),
          label: localeString('Session 2', 'Sesi 2'),
          start: '2026-03-18',
          end: '2026-03-24',
        },
      ],
      audience: 'public',
      guidedByText: 'Most Ven. Siyambalape Medhankara',
      image: image(img.retreat),
      description: localeBlocks(
        pt('ev', [
          'Days of quiet practice: guided sitting and walking meditation, Dhamma talks, and noble silence. Choose the full retreat or join for the shorter second session.',
        ]),
        pt('ev', [
          'Hari-hari latihan yang hening: meditasi duduk dan berjalan terbimbing, ceramah Dhamma, dan keheningan mulia. Pilih retret penuh atau ikut sesi kedua yang lebih singkat.',
        ]),
      ),
      contacts: [ID.contactArman, ID.contactFenny].map(reference),
    },
  )

  // Pages
  docs.push(
    {
      _id: 'page-about',
      _type: 'page',
      title: localeString('About Us', 'Tentang Kami'),
      slug: slug('about'),
      intro: localeText(
        'A Theravada Buddhist community in Medan, Indonesia.',
        'Komunitas Buddhis Theravada di Medan, Indonesia.',
      ),
      body: [
        section(
          'ab',
          ['Who we are', 'Siapa kami'],
          [
            'Na Uyana Aranya Indonesia is a Theravada Buddhist community in Medan, North Sumatra. We come together to learn the Buddha’s teaching, to practise meditation, and to support the monastic Sangha.',
            'Everyone is welcome: families, young people, and anyone curious about the Dhamma.',
            'TODO: please check this text with the committee and add our story.',
          ],
          [
            'Na Uyana Aranya Indonesia adalah komunitas Buddhis Theravada di Medan, Sumatera Utara. Kami berkumpul untuk mempelajari ajaran Buddha, berlatih meditasi, dan menyokong Sangha.',
            'Semua orang dipersilakan: keluarga, generasi muda, dan siapa pun yang ingin mengenal Dhamma.',
          ],
          [img.buddhaRupang, img.nauyana],
        ),
        section(
          'ab',
          ['What we offer', 'Kegiatan kami'],
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
          [
            {
              bullets: [
                'NIBA, sekolah Minggu Dhamma untuk anak-anak dan remaja',
                'Diskusi Abhidhamma setiap minggu',
                'Meditasi dengan mettā, beberapa kali seminggu',
                'Retret dan program pabbajjā (pentahbisan sementara)',
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
      title: localeString('About NIBA', 'Tentang NIBA'),
      slug: slug('niba'),
      intro: localeText(
        'Our Sunday Dhamma school for children and teenagers.',
        'Sekolah Minggu Dhamma kami untuk anak-anak dan remaja.',
      ),
      body: [
        section(
          'ni',
          ['Growing up with the Dhamma', 'Tumbuh bersama Dhamma'],
          [
            'NIBA gives children a warm place to learn the Buddha’s teaching. Each week we read a story from the Dhammapada, talk about what it means in daily life, chant together, and practise a few minutes of quiet mindfulness.',
            'Parents are welcome to nurture their children with the precious gift of Dhamma by guiding them at home or enrolling them in our Buddhist school.',
          ],
          [
            'NIBA memberi anak-anak tempat yang hangat untuk mempelajari ajaran Buddha. Setiap minggu kami membaca sebuah kisah dari Dhammapada, membahas maknanya dalam kehidupan sehari-hari, membaca paritta bersama, dan berlatih perhatian penuh dalam hening selama beberapa menit.',
            'Para orang tua dipersilakan membekali anak-anak dengan hadiah Dhamma yang berharga, dengan membimbing mereka di rumah atau mendaftarkan mereka di sekolah Buddhis kami.',
          ],
          img.niba.slice(0, 3),
        ),
        section(
          'ni',
          ['Who can join', 'Siapa yang bisa ikut'],
          ['TODO: add the age range and class groups.', 'Registration is required. It only takes a WhatsApp message.'],
          ['Wajib mendaftar. Cukup kirim pesan WhatsApp.'],
          [],
          'warm',
        ),
      ],
    },
    {
      _id: 'page-niba-registration',
      _type: 'page',
      title: localeString('NIBA Registration', 'Pendaftaran NIBA'),
      slug: slug('niba-registration'),
      intro: localeText(
        'Register your child through WhatsApp. It only takes a minute.',
        'Daftarkan anak Anda lewat WhatsApp. Hanya perlu satu menit.',
      ),
      body: [
        section(
          'nr',
          ['How to register', 'Cara mendaftar'],
          [
            {
              numbers: [
                'Tap one of the WhatsApp buttons on this page.',
                'Send your child’s name and age, and your name.',
                'We will reply with the class details and what to bring.',
              ],
            },
            'TODO: confirm what information parents should send.',
          ],
          [
            {
              numbers: [
                'Tekan salah satu tombol WhatsApp di halaman ini.',
                'Kirim nama dan usia anak Anda, serta nama Anda.',
                'Kami akan membalas dengan detail kelas dan apa saja yang perlu dibawa.',
              ],
            },
          ],
        ),
      ],
    },
    {
      _id: 'page-books',
      _type: 'page',
      title: localeString('Books', 'Buku'),
      slug: slug('books'),
      intro: localeText('Dhamma books to read and share.', 'Buku-buku Dhamma untuk dibaca dan dibagikan.'),
      body: [
        section('bo', undefined, ['TODO: add the book list (title, author, and a link or where to get a copy).'], []),
      ],
    },
    {
      _id: 'page-chanting',
      _type: 'page',
      title: localeString('Chanting', 'Paritta'),
      slug: slug('chanting'),
      intro: localeText(
        'Pali chanting we recite together, with English meanings.',
        'Paritta dalam bahasa Pali yang kami bacakan bersama, beserta artinya.',
      ),
      body: [
        section(
          'ch',
          undefined,
          ['TODO: add chanting texts. Use the "Pali verse" block for Pali with its meaning.'],
          [],
        ),
      ],
    },
    {
      _id: 'page-contact',
      _type: 'page',
      title: localeString('Contact Us', 'Hubungi Kami'),
      slug: slug('contact'),
      intro: localeText(
        'We would love to hear from you. The quickest way to reach us is WhatsApp.',
        'Kami senang mendengar dari Anda. Cara tercepat untuk menghubungi kami adalah lewat WhatsApp.',
      ),
    },
  )

  // Remove empty optional fields so Sanity doesn't store `undefined`.
  return JSON.parse(JSON.stringify(docs)) as SanityDoc[]
}
