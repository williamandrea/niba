import { createFileRoute, useLoaderData } from '@tanstack/react-router'
import { buildHead, rootSettings } from '~/lib/seo'
import { langDeps } from '~/lib/i18n'
import { getHome } from '~/lib/sanity/api'
import {
  EventsSection,
  FeaturedVerse,
  Hero,
  InstagramSection,
  Intro,
  LatestArticles,
  ProgramsSection,
  TeacherQuote,
  TeachersSection,
  VenerablesSection,
} from '~/components/home/HomeSections'

export const Route = createFileRoute('/')({
  loaderDeps: langDeps,
  loader: ({ deps: { lang } }) => getHome({ data: { lang } }),
  head: ({ matches }) => buildHead({ path: '/', settings: rootSettings(matches) }),
  component: HomePage,
})

function HomePage() {
  const data = Route.useLoaderData()
  const { siteName } = useLoaderData({ from: '__root__' })
  const home = data.home
  return (
    <>
      <Hero
        siteName={siteName}
        image={home?.hero?.image}
        paliVerse={home?.hero?.paliVerse}
        meaning={home?.hero?.meaning}
        tagline={home?.hero?.tagline}
        button={home?.hero?.button}
      />
      <Intro
        heading={home?.intro?.heading}
        text={home?.intro?.text}
        images={home?.intro?.images}
        buttons={home?.intro?.buttons}
      />
      <TeacherQuote quote={home?.teacherQuote?.quote} teacher={home?.teacherQuote?.teacher} />
      <EventsSection events={data.events} hasPastEvents={data.hasPastEvents} />
      <TeachersSection teachers={data.teachers} />
      <VenerablesSection venerables={data.venerables} intro={home?.venerablesIntro} />
      <ProgramsSection programs={data.programs} intro={home?.programsIntro} />
      <LatestArticles articles={data.articles} />
      <InstagramSection feed={data.instagram} heading={home?.instagram?.heading} />
      <FeaturedVerse featured={data.featured} />
    </>
  )
}
