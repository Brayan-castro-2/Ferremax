// backend/src/services/currency.service.js
// Tipo de cambio USD → CLP vía API pública mindicador.cl

const MINDICADOR_DOLAR_URL = 'https://mindicador.cl/api/dolar'
const CACHE_TTL_MS = 60 * 60 * 1000 // 1 hora

/** @type {{ valor: number|null, actualizadoEn: string|null, cachedAt: number }} */
let cache = {
  valor: null,
  actualizadoEn: null,
  cachedAt: 0
}

const parseValor = (data) => {
  const raw = data?.serie?.[0]?.valor
  const valor = typeof raw === 'number' ? raw : parseFloat(raw)
  if (!Number.isFinite(valor) || valor <= 0) {
    return null
  }
  return valor
}

/**
 * Obtiene el valor USD en CLP (último de la serie mindicador).
 * Usa caché en memoria 1 h; si falla la red, devuelve el último valor cacheado aunque haya expirado.
 *
 * @returns {Promise<{ valorDolar: number, actualizadoEn: string, fuente: string }>}
 */
const obtenerValorDolar = async () => {
  const ahora = Date.now()
  const cacheVigente =
    cache.valor != null && ahora - cache.cachedAt < CACHE_TTL_MS

  if (cacheVigente) {
    return {
      valorDolar: cache.valor,
      actualizadoEn: cache.actualizadoEn,
      fuente: 'mindicador.cl'
    }
  }

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 12_000)
    const res = await fetch(MINDICADOR_DOLAR_URL, {
      headers: { Accept: 'application/json' },
      signal: controller.signal
    }).finally(() => clearTimeout(timeoutId))

    if (!res.ok) {
      throw new Error(`mindicador.cl respondió HTTP ${res.status}`)
    }

    const data = await res.json()
    const valor = parseValor(data)

    if (valor == null) {
      throw new Error('Respuesta de mindicador.cl sin valor válido en serie[0].')
    }

    const actualizadoEn = new Date(ahora).toISOString()
    cache = {
      valor,
      actualizadoEn,
      cachedAt: ahora
    }

    return {
      valorDolar: valor,
      actualizadoEn,
      fuente: 'mindicador.cl'
    }
  } catch (err) {
    if (cache.valor != null) {
      return {
        valorDolar: cache.valor,
        actualizadoEn: cache.actualizadoEn,
        fuente: 'mindicador.cl'
      }
    }

    const e = new Error(
      `No se pudo obtener el tipo de cambio: ${err.message || 'error de red'}`
    )
    e.status = 503
    throw e
  }
}

module.exports = { obtenerValorDolar, MINDICADOR_DOLAR_URL, CACHE_TTL_MS }
