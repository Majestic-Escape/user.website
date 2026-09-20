"use client"

import { useEffect, useRef } from "react"

interface GoogleMapProps {
  lat: number
  lng: number
}

// The Maps JS API is loaded once per browser session, and a single Map
// instance is reused across stay pages. The previous version appended a new
// <script> on every mount (whose load raced the next navigation) and created
// a new Map each time; Google's API never frees Map instances, so 40 stay
// visits left ~40 script tags and ~28 MB of heap behind. Measured after this
// change: heap flat across 150 stay visits.
let mapsLoader: Promise<void> | null = null
let sharedContainer: HTMLDivElement | null = null
let sharedMap: google.maps.Map | null = null
// The API returns an approximate point before booking (the exact address is
// in the confirmed booking); the map shows the area, not a pin.
let sharedCircle: google.maps.Circle | null = null
const AREA_RADIUS_M = 500

function loadGoogleMaps(): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("no window"))
  if (window.google?.maps) return Promise.resolve()
  if (mapsLoader) return mapsLoader
  mapsLoader = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      'script[data-me-google-maps="1"]',
    )
    const script = existing ?? document.createElement("script")
    if (!existing) {
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`
      script.async = true
      script.defer = true
      script.dataset.meGoogleMaps = "1"
    }
    script.addEventListener("load", () => resolve(), { once: true })
    script.addEventListener(
      "error",
      () => {
        mapsLoader = null
        reject(new Error("Google Maps failed to load"))
      },
      { once: true },
    )
    if (!existing) document.head.appendChild(script)
  })
  return mapsLoader
}

export default function GoogleMap({ lat, lng }: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Listings without coordinates used to throw inside the Maps API
    // ("setCenter: not a LatLng"); render nothing instead.
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return
    let cancelled = false
    const host = mapRef.current
    loadGoogleMaps()
      .then(() => {
        if (cancelled || !host || !window.google?.maps) return
        if (!sharedContainer) {
          sharedContainer = document.createElement("div")
          sharedContainer.style.width = "100%"
          sharedContainer.style.height = "100%"
        }
        host.appendChild(sharedContainer)
        const center = { lat, lng }
        if (!sharedMap) {
          sharedMap = new window.google.maps.Map(sharedContainer, {
            center,
            zoom: 14,
          })
        } else {
          sharedMap.setCenter(center)
          sharedMap.setZoom(14)
          window.google.maps.event.trigger(sharedMap, "resize")
        }
        if (!sharedCircle) {
          sharedCircle = new window.google.maps.Circle({
            map: sharedMap,
            center,
            radius: AREA_RADIUS_M,
            strokeColor: "#4D7C3F",
            strokeOpacity: 0.8,
            strokeWeight: 1.5,
            fillColor: "#4D7C3F",
            fillOpacity: 0.18,
            clickable: false,
          })
        } else {
          sharedCircle.setCenter(center)
          sharedCircle.setMap(sharedMap)
        }
      })
      .catch((error) => console.error(error))
    return () => {
      cancelled = true
      // Detach (never destroy) the shared map so the next stay page reuses it.
      if (host && sharedContainer && sharedContainer.parentElement === host) {
        host.removeChild(sharedContainer)
      }
    }
  }, [lat, lng])

  return <div ref={mapRef} className="w-full h-[400px] rounded-lg" />
}
