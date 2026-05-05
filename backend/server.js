// backend/server.js
// Arranque del servidor HTTP

const app  = require('./app')
const port = process.env.PORT || 3000

app.listen(port, () => {
  console.log(`\n╔══════════════════════════════════════╗`)
  console.log(`║   FERREMAS API                       ║`)
  console.log(`║   http://localhost:${port}              ║`)
  console.log(`║   Entorno: ${(process.env.NODE_ENV || 'development').padEnd(25)}║`)
  console.log(`╚══════════════════════════════════════╝\n`)
})
