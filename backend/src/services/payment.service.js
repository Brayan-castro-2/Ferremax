const {
  Environment,
  IntegrationApiKeys,
  IntegrationCommerceCodes,
  Options,
  WebpayPlus
} = require('transbank-sdk')

// Configuración de WebpayPlus usando variables de entorno o las de integración por defecto
const tx = new WebpayPlus.Transaction(new Options(
  process.env.TBK_COMMERCE_CODE || IntegrationCommerceCodes.WEBPAY_PLUS,
  process.env.TBK_API_KEY || IntegrationApiKeys.WEBPAY,
  process.env.NODE_ENV === 'production' ? Environment.Production : Environment.Integration
))

const initTransaction = async ({ buyOrder, sessionId, amount, returnUrl }) => {
  try {
    // createResponse => { token, url }
    const createResponse = await tx.create(buyOrder, sessionId, amount, returnUrl)
    return createResponse
  } catch (error) {
    console.error('Error al iniciar transacción Transbank:', error)
    throw new Error('No se pudo inicializar la transacción de pago')
  }
}

const confirmTransaction = async (tokenWs) => {
  try {
    // confirmResponse => status, amount, buy_order, response_code, etc.
    const confirmResponse = await tx.commit(tokenWs)
    
    // En un sistema real:
    // Si confirmResponse.response_code === 0 y confirmResponse.status === 'AUTHORIZED'
    // => Actualizar la orden a PAGADA en Supabase usando confirmResponse.buy_order
    
    return confirmResponse
  } catch (error) {
    console.error('Error al confirmar transacción Transbank:', error)
    throw new Error('No se pudo confirmar el pago')
  }
}

module.exports = {
  initTransaction,
  confirmTransaction
}
