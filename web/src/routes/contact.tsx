import { createFileRoute, useLoaderData } from '@tanstack/react-router'
import { buildHead, breadcrumbs, rootSettings } from '~/lib/seo'
import { getPage } from '~/lib/sanity/api'
import { clean, formatPhone, whatsappUrl } from '~/lib/text'
import { PageHeader } from '~/components/ui/PageHeader'
import { PageSections } from '~/components/page/PageSections'
import { WhatsAppButtons, WhatsAppIcon } from '~/components/ui/WhatsApp'

export const Route = createFileRoute('/contact')({
  loader: () => getPage({ data: { slug: 'contact' } }),
  head: ({ matches, loaderData: page }) =>
    buildHead({
      title: page?.title || 'Contact Us',
      description: page?.intro,
      seo: page?.seo,
      image: page?.body?.[0]?.images?.[0],
      path: '/contact/',
      settings: rootSettings(matches),
      jsonLd: [breadcrumbs([['Contact', '/contact/']])],
    }),
  component: ContactPage,
})

function ContactPage() {
  const page = Route.useLoaderData()
  const { footer } = useLoaderData({ from: '__root__' })
  const mainWa = whatsappUrl(footer.whatsapp, 'Hello Na Uyana, ')
  return (
    <>
      <PageHeader title={page?.title || 'Contact Us'} intro={page?.intro || 'We would love to hear from you.'} />
      <section aria-label="Contact details" className="py-section">
        <div className="mx-auto grid max-w-site gap-6 px-4 sm:px-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-card border border-gold-400/30 bg-white/70 p-6 shadow-sm">
            <h2 className="text-h3">WhatsApp</h2>
            <p className="mt-2">The quickest way to reach us.</p>
            {mainWa && footer.whatsapp && (
              <a
                href={mainWa}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex min-h-12 items-center gap-2 rounded-full bg-forest-700 px-5 font-semibold text-white hover:bg-forest-700/90"
              >
                <WhatsAppIcon />
                {formatPhone(footer.whatsapp)}
              </a>
            )}
            <div className="mt-4">
              <WhatsAppButtons contacts={footer.contacts} tone="soft" label={(name) => name} />
            </div>
          </div>
          <div className="rounded-card border border-gold-400/30 bg-white/70 p-6 shadow-sm">
            <h2 className="text-h3">Visit us</h2>
            {footer.address && <p className="mt-2 whitespace-pre-line">{clean(footer.address)}</p>}
            {footer.mapsUrl && (
              <a
                href={footer.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex min-h-11 items-center font-semibold text-brown-700 underline underline-offset-4"
              >
                Open in Google Maps
              </a>
            )}
          </div>
          <div className="rounded-card border border-gold-400/30 bg-white/70 p-6 shadow-sm">
            <h2 className="text-h3">Email & social media</h2>
            {footer.email && (
              <a
                href={`mailto:${footer.email}`}
                className="mt-2 inline-flex min-h-11 items-center font-semibold text-brown-700 underline underline-offset-4"
              >
                {footer.email}
              </a>
            )}
            <ul className="mt-2 space-y-1">
              {footer.socialLinks
                .filter((s) => s.url)
                .map((s) => (
                  <li key={s.url}>
                    <a
                      href={s.url ?? ''}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-11 items-center hover:underline"
                    >
                      {s.label || s.platform}
                    </a>
                  </li>
                ))}
            </ul>
          </div>
        </div>
      </section>
      <PageSections sections={page?.body} />
    </>
  )
}
