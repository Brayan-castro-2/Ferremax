// servicios/Simulador.js
// Esto simula lo que hay en las tablas de la base de datos

export const DB_SIMULADA = {
  productos: [
    { id: 1, nombre: "Taladro Bosch", precio: 50000, stock_fisico: 10, stock_disponible: 10 },
    { id: 2, nombre: "Martillo Stanley", precio: 15000, stock_fisico: 5, stock_disponible: 5 }
  ],
  usuarios: [
    { id: 101, nombre: "Brayan", rol: "Administrador", requiere_cambio: true }
  ],
  pedidos: []
};
