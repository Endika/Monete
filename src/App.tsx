import { useEffect, useState } from 'react'
import { ContainerProvider } from '@/presentation/context/ContainerProvider'
import { PartyProvider } from '@/presentation/context/PartyContext'
import { HomePage } from '@/presentation/components/features/home/HomePage'
import { HostDashboard } from '@/presentation/components/features/host/HostDashboard'
import { GuestPage } from '@/presentation/components/features/guest/GuestPage'
import { Footer } from '@/presentation/components/common/Footer'
import { OfflineBanner } from '@/presentation/components/features/pwa/OfflineBanner'
import { UpdateBanner } from '@/presentation/components/features/pwa/UpdateBanner'
import { InstallPrompt } from '@/presentation/components/features/pwa/InstallPrompt'

interface Route {
  partyId: string | null
  host: boolean
}

function readRoute(): Route {
  const params = new URL(window.location.href).searchParams
  return { partyId: params.get('party'), host: params.get('host') === '1' }
}

export default function App() {
  const [route, setRoute] = useState<Route>(() => readRoute())

  useEffect(() => {
    const handler = () => setRoute(readRoute())
    window.addEventListener('popstate', handler)
    return () => window.removeEventListener('popstate', handler)
  }, [])

  const goToParty = (id: string) => {
    window.history.pushState({}, '', `${import.meta.env.BASE_URL}?party=${id}&host=1`)
    setRoute(readRoute())
  }

  const openParty = (id: string, host: boolean) => {
    window.history.pushState(
      {},
      '',
      `${import.meta.env.BASE_URL}?party=${id}${host ? '&host=1' : ''}`,
    )
    setRoute(readRoute())
  }

  return (
    <ContainerProvider>
      <OfflineBanner />
      <UpdateBanner />
      <InstallPrompt />
      {route.partyId ? (
        // NOTE: client-side schema version-gate deferred; server write-guard + PWA autoUpdate cover stale clients.
        <PartyProvider partyId={route.partyId}>
          {route.host ? (
            <HostDashboard partyId={route.partyId} />
          ) : (
            <GuestPage partyId={route.partyId} />
          )}
        </PartyProvider>
      ) : (
        <HomePage onCreated={goToParty} onOpenParty={openParty} />
      )}
      <Footer />
    </ContainerProvider>
  )
}
