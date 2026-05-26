// ============================================================
//  pub-pos  →  Servicio Bsale  (boleta electrónica Chile)
//  Ubicación sugerida: pub-api/services/bsaleService.js
// ============================================================
//
//  MODO DEMO: si BSALE_TOKEN no está en .env, simula la respuesta
//  del API de Bsale sin llamar al SII. Ideal para mostrar el flujo.
//
//  Para producción real:
//    1. Crear cuenta en bsale.cl
//    2. Obtener BSALE_TOKEN y BSALE_OFFICE_ID desde el panel
//    3. Agregar esas variables al .env
// ============================================================

const BSALE_TOKEN   = process.env.BSALE_TOKEN;
const BSALE_OFFICE  = process.env.BSALE_OFFICE_ID || "1";
const DEMO_MODE     = !BSALE_TOKEN || BSALE_TOKEN === "demo";

// Código SII 39 = Boleta Electrónica
// En Bsale, el documentTypeId que corresponde a boleta lo configuras
// en el panel. Usa BSALE_DOC_TYPE_ID en .env o deja el default 8.
const DOC_TYPE_ID   = process.env.BSALE_DOC_TYPE_ID || "8";

/**
 * Emite una boleta electrónica en Bsale.
 *
 * @param {Object} params
 * @param {number}  params.orderId   - ID de la orden en pub-pos
 * @param {Array}   params.items     - Array de { name, quantity, price }
 * @param {number}  params.total     - Total con IVA incluido
 * @returns {Object} { boletaId, numero, urlPdf, urlXml, modo }
 */
async function emitirBoleta({ orderId, items, total }) {

  // ── MODO DEMO ───────────────────────────────────────────────
  if (DEMO_MODE) {
    console.log(`[Bsale DEMO] Simulando boleta para orden #${orderId}`);
    await new Promise(r => setTimeout(r, 600)); // simula latencia de red

    return {
      boletaId : 99000 + orderId,
      numero   : 1000 + orderId,
      urlPdf   : null,                // en demo no hay PDF real
      urlPublic: null,
      modo     : "DEMO",
      mensaje  : "Boleta simulada (modo demo). Configura BSALE_TOKEN en .env para producción."
    };
  }

  // ── PRODUCCIÓN ──────────────────────────────────────────────
  // Convertir items a la estructura que espera Bsale
  const details = items.map(item => {
    const precioNeto = Math.round(Number(item.price) / 1.19);
    return {
      comment      : item.name,
      netUnitValue : precioNeto,
      quantity     : Number(item.quantity),
      taxId        : "[1]"   // [1] = IVA 19% configurado en Bsale
    };
  });

  const body = {
    documentTypeId : parseInt(DOC_TYPE_ID),
    officeId       : parseInt(BSALE_OFFICE),
    emissionDate   : Math.floor(Date.now() / 1000),  // Unix timestamp
    declare        : 1,                               // 1 = enviar al SII
    details
  };

  const response = await fetch("https://api.bsale.cl/v1/documents.json", {
    method  : "POST",
    headers : {
      "access_token" : BSALE_TOKEN,
      "Content-Type" : "application/json"
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Bsale API error ${response.status}: ${error}`);
  }

  const data = await response.json();

  return {
    boletaId : data.id,
    numero   : data.number,
    urlPdf   : data.urlPdf   || null,
    urlPublic: data.urlPublicView || null,
    modo     : "PRODUCCION"
  };
}

module.exports = { emitirBoleta, DEMO_MODE };
