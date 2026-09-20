import * as React from "react"

const MOBILE_BREAKPOINT = 768
const QUERY = `(max-width: ${MOBILE_BREAKPOINT - 1}px)`

function subscribe(onChange: () => void) {
  const mql = window.matchMedia(QUERY)
  mql.addEventListener("change", onChange)
  return () => mql.removeEventListener("change", onChange)
}

/** `true` cuando la ventana está por debajo del breakpoint móvil. */
export function useIsMobile() {
  // useSyncExternalStore es la forma idiomática de leer una fuente externa (matchMedia):
  // sin efectos que hagan setState y sin desfase entre el primer render y el valor real.
  return React.useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false,
  )
}
