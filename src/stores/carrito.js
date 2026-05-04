// src/stores/carrito.js
// Store del carrito de compras con Pinia

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCarritoStore = defineStore('carrito', () => {
  const items = ref([])

  const totalItems    = computed(() => items.value.reduce((acc, i) => acc + i.cantidad, 0))
  const subtotal      = computed(() => items.value.reduce((acc, i) => acc + (i.precio * i.cantidad), 0))
  const aplicaDescuento = computed(() => totalItems.value > 4)
  const total         = computed(() => aplicaDescuento.value ? subtotal.value * 0.9 : subtotal.value)
  const descuento     = computed(() => subtotal.value - total.value)

  function agregar(producto) {
    const existente = items.value.find(i => i.id === producto.id)
    if (existente) {
      existente.cantidad++
    } else {
      items.value.push({ ...producto, cantidad: 1 })
    }
  }

  function quitar(idProducto) {
    const idx = items.value.findIndex(i => i.id === idProducto)
    if (idx !== -1) {
      if (items.value[idx].cantidad > 1) {
        items.value[idx].cantidad--
      } else {
        items.value.splice(idx, 1)
      }
    }
  }

  function eliminar(idProducto) {
    items.value = items.value.filter(i => i.id !== idProducto)
  }

  function vaciar() {
    items.value = []
  }

  return { items, totalItems, subtotal, aplicaDescuento, total, descuento, agregar, quitar, eliminar, vaciar }
})
