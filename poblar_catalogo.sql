-- Script para poblar la tabla "producto" (versión antigua) con los 12 productos del Mockup.
-- Si la tabla se llama "productos" o el ID tiene otro nombre, cambia "producto" por "productos".

INSERT INTO producto (nombre, descripcion, precio, stock, categoria, activo) VALUES
('Taladro Percutor 700W', 'Taladro con percusión para mampostería', 79990, 12, 'Herramientas Eléctricas', true),
('Sierra Circular 1400W', 'Sierra de alta potencia para maderas', 124990, 8, 'Herramientas Eléctricas', true),
('Destornillador Eléctrico', 'Batería de larga duración 18V', 34990, 25, 'Herramientas Eléctricas', true),
('Martillo 500g Mango Fibra', 'Mango ergonómico antideslizante', 12990, 40, 'Herramientas Manuales', true),
('Llave Inglesa 10"', 'Acero forjado resistente', 8990, 30, 'Herramientas Manuales', true),
('Set Brocas HSS 19 piezas', 'Para metal, madera y plástico', 19990, 3, 'Herramientas Manuales', true),
('Cemento 25kg Portland', 'Alta resistencia, uso general', 7490, 60, 'Construcción', true),
('Pintura Látex Blanca 4L', 'Interior/exterior, lavable', 18990, 18, 'Pintura', true),
('Rodillo 22cm Lana', 'Para superficies lisas y semilisas', 4990, 35, 'Pintura', true),
('Extensión 10m 3 Enchufes', 'Cable 2.5mm², uso industrial', 14990, 22, 'Electricidad', true),
('Casco de Seguridad HDPE', 'Certificado ANSI Z89.1', 9990, 0, 'Seguridad', true),
('Guantes de Cuero Trabajo', 'Talla M/L/XL disponible', 5990, 50, 'Seguridad', true);
