import { createClient } from '@sanity/client'
import { fileURLToPath } from 'node:url'

const root = (p: string) => fileURLToPath(new URL(`../${p}`, import.meta.url))

try {
  process.loadEnvFile(root('../.env'))
} catch {
  // Rely on process.env
}

const projectId = process.env.SANITY_PROJECT_ID
const dataset = process.env.SANITY_DATASET || 'production'
const token = process.env.SANITY_WRITE_TOKEN

if (!projectId || !token) {
  console.error('Missing SANITY_PROJECT_ID or SANITY_WRITE_TOKEN')
  process.exit(1)
}

const client = createClient({
  projectId,
  dataset,
  token,
  apiVersion: '2026-09-30',
  useCdn: false,
})

let keyCounter = 0
const nextKey = () => `v4k${String(++keyCounter).padStart(3, '0')}`

const block = (text: string, style = 'normal') => ({
  _key: nextKey(),
  _type: 'block',
  style,
  markDefs: [],
  children: [
    {
      _key: `${nextKey()}s`,
      _type: 'span',
      marks: [],
      text,
    },
  ],
})

export const verse4Doc = {
  _id: 'post-dhammapada-verse-4',
  _type: 'post',
  title: {
    _type: 'localeString',
    en: 'Dhammapada Verse 4: The Story of Monk Tissa',
  },
  slug: {
    _type: 'slug',
    current: 'dhammapada-verse-4-the-story-of-monk-tissa',
  },
  category: {
    _type: 'reference',
    _ref: 'category-dhammapada',
  },
  excerpt: {
    _type: 'localeText',
    en: 'While residing at the Jetavana Monastery in Sāvatthi, the Buddha uttered these Verses, with reference to Monk Tissa. Tissa, son of the Buddha’s maternal aunt, was at one time staying with the Buddha…',
  },
  // Published after Verse 3 (which was published 2026-05-04) so it is featured as the newest verse
  publishedAt: new Date().toISOString(),
  body: {
    _type: 'localeBlockContent',
    en: [
      {
        _type: 'verse',
        _key: nextKey(),
        pali: 'Akkocchi maṃ, avadhi maṃ\najini maṃ ahāsi me\nye taṃ na upanayhanti\nveraṃ tesaṃ sammati.',
        meaning:
          'Who bear not within them enmity (hatred):\n“He has abused and beaten me,\ndefeated me and plundered me”,\nhate is allayed for them.',
        reference: 'Dhammapada 1:4',
      },
      block('Overcoming Anger', 'h2'),
      block(
        'While residing at the Jetavana Monastery in Sāvatthi, the Buddha uttered these Verses, with reference to Monk Tissa. Tissa, son of the Buddha’s maternal aunt, was at one time staying with the Buddha. He had become a monk only in his old age, but he posed as a senior monk and was very pleased when visiting monks asked his permission to do some service for him. On the other hand, he failed to perform the duties expected of junior monks; besides, he often quarrelled with the younger monks. Should anyone rebuke him on account of his behaviour, he would go complaining to the Buddha, weeping, very much dissatisfied and very upset.',
      ),
      block(
        'Once, the Teacher asked him, “Tissa, why have you come to me so sad and sorrowful with tears in your eyes, weeping?” The other monks had discussed among themselves, “If he goes alone, he may cause trouble.” So they too went along with him, paid obeisance to the Teacher, and sat down respectfully on one side. Tissa answered the Teacher’s question, “Venerable, these monks are abusing me.” The Teacher asked, “But where were you sitting?” “In the centre of the monastery in the Hall of State, Venerable.” “Did you see these monks when they came?” “Yes, Venerable I saw them.” “Did you rise and go to meet them?” “No, Venerable, I did not.” “Did you offer to take their monastic utensils?” “No, Venerable, I did not offer to take them.” “Tissa, do not act thus. You alone are to be blamed; ask their pardon.” “I will not ask their pardon, Venerable.”',
      ),
      block(
        'The monks said to the Teacher, “He is an obstinate monk, Venerable.” The Teacher replied, “Monks, this is not the first time he has proved obstinate; he was obstinate also in a previous state of existence.” “We know all about his present obstinacy, Venerable; but what did he do in a previous state of existence?” “Well then, monks, listen,” said the Teacher. So saying, he told the following story.',
      ),
      block(
        'Once upon a time, when a certain king reigned at Benāres, an ascetic named Devala, who had resided for eight months in the Himālaya country, desiring to reside near the city during the four months of the rains, for salt and vinegar returned from the Himālayas. Seeing two boys at the gate of the city, he asked them, “Where do monks who come to this city spend the night?” “In the potter’s hall, Venerable.” So Devala went to the potter’s hall, stopped at the door, and said, “If it is agreeable to you, Bhaggava, I would like to spend one night in your hall.” The potter turned over the hall to him, saying, “I have no work going on in the hall at night, and the hall is a large one; spend the night here as you please, Venerable.” No sooner had Devala entered the hall and sat down than another ascetic named Nārada, returning from the Himālayas, asked the potter for a night’s lodging. The potter thought to himself, “The ascetic who arrived first may or may not be willing to spend the night with him; I will therefore relieve myself of responsibility.”',
      ),
      block(
        'So he said to the ascetic who had just arrived, “Venerable, if the ascetic who arrived first approves of it, spend the night at your pleasure.” So Nārada approached Devala and said, “Teacher, if it is agreeable to you, I would like to spend one night here.” Devala replied, “The hall is a large one; therefore come in and spend the night on one side.” So Nārada went in and sat down beside the ascetic who had gone in before him. Both exchanged friendly greetings.',
      ),
      block(
        'When it was bedtime, Nārada noted carefully the place where Devala lay and the position of the door, and then lay down. But when Devala lay down, instead of lying down in his proper place, he lay down directly across the doorway. The result was that when Nārada went out at night, he trod on Devala’s matted locks. Thereupon Devala cried out, “Who is treading on my locks?” Nārada replied, “Teacher, it is I.” “False ascetic,” said Devala, “You come from the forest and tread on my locks.” “Teacher, I did not know that you were lying here; please pardon me.” Nārada then went out, leaving Devala weeping as if his heart would break. Devala thought to himself, “I will not let him tread on me when he comes in also.” So he turned around and lay down, placing his head where his feet had been before. When Nārada came in, he thought to himself, “The first time I injured the teacher; this time I will go in past his feet.” The result was that, when Nārada entered, he trod on Devala’s neck. Thereupon Devala cried out, “Who is that?” Nārada replied, “It is I, teacher.” “False ascetic,” said Devala, “The first time you trod on my locks. This time you tread on my neck. I will curse you.” “Teacher, I am not to blame. I did not know that you were lying in this position. When I came in I thought to myself, ‘The first time I injured the teacher; this time I will go in past his feet.’ Please pardon me.” “False ascetic, I will curse you.” “Do not do so, teacher.” But Devala, paying no attention to what Nārada said, cursed him all the same, saying, “May your head split into seven pieces at sunrise.”',
      ),
      block(
        'Now Nārada, perceiving that the curse would fall back on his brother-ascetic, felt compassion for him, and therefore put forth the power of his meditation and prevented the sunrise. When the sun did not rise, the king had to intervene and ask Devala to apologise. Devala refused. Then said Nārada to Devala, “Teacher, I will put forth my power of meditation and make the sun to rise. At the moment of sunrise please keep a lump of clay on your head and submerge in water and rise in different places as you go your way.” As soon as the sun’s rays touched the lump of clay on his head, it divided into seven pieces. Thereupon Devala ducked in the water, and came up in a different place, and ran away. When the Buddha had given his instruction, he said, “Monks, at that time the king was Ānanda, Devala was Tissa, and Nārada was myself, when at that time he was obstinate.”',
      ),
      block(
        'The Buddha advised them not to keep thoughts of enmity, for this could be only appeased by thoughts of friendliness.',
      ),
      block('Explanatory Translation (Verse 4)', 'h3'),
      block('maṃ akkocchi maṃ avadhi maṃ ajini me ahāsi'),
      block('ye taṃ na upanayhanti tesaṃ veraṃ sammati.'),
      block(
        'maṃ: me; akkocchi: (he) insulted; maṃ: me; avadhi: (he) assaulted; maṃ: me; ajini: (he) defeated; ahāsi: (he) robbed; me: my (belongings); ye: those who; taṃ: such thoughts; na upanayhanti: does not constantly return to; tesaṃ: their; veraṃ: enmity; sammati: ceases.',
      ),
      block(
        'Living in human society, people often quarrel with one another. When such conflicts occur, people often keep thinking about the wrongs done to them by others. When that happens, their anger tends to grow. But in those who forgive and forget the wrongs done to them, anger quickly vanishes. They are then at peace.',
      ),
      block('Commentary', 'h3'),
      block(
        'This pair of verses reveals the psychological principle that is basic to emotional control. Emotion is an excitement of the body that begins with a thought. A thought creates a mental picture which, if held onto, excites a corresponding emotion. It is only when this mental picture is discarded and paid no attention to, that the emotion subsides. The Buddha’s constant advice to His followers was not to retaliate but to practice patience at all times and places, even under provocation. The Buddha praises those who forebear the wrongs of others, even though they have the power to retaliate. In the Dhammapada itself there are many instances that show how the Buddha practiced patience, even when he was severely criticised, abused, and attacked. Patience is not a sign of weakness or defeatism but the unfailing strength of great men and women.',
      ),
      block(
        'The secret of patience is to change the mental picture or how you interpret a situation. An example is given in the Shāntivādi Jātaka, where the saint Shāntivādi was the Buddha Gotama in his former life. The saint kept repeating the thought, “Long live the king may he be free from harm,” while his limbs were severed until death, by this cruel king who wanted to test his patience.',
      ),
    ],
  },
}

async function main() {
  console.log('Uploading Dhammapada Verse 4 document to Sanity...')
  const result = await client.createOrReplace(verse4Doc)
  console.log('Created/Updated document with ID:', result._id)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
