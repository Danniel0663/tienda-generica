INSERT INTO usuarios (cedula,nombre_completo,correo_electronico,usuario,contrasena,activo)
SELECT id,nombre,CONCAT(login,'@example.com'),login,
       '$2a$10$I4oHFC0JJggIqnHG9jwxCuALVk5p8YKszGGaSyt1aPmhAgqAkHIUq',TRUE
FROM (VALUES (760001,'Luna Ríos','demo.caja'), (760002,'Mateo Sol','demo.turno')) AS u(id,nombre,login);

INSERT INTO clientes (cedula,nombre_completo,direccion,telefono,correo_electronico)
SELECT id,nombre,CONCAT('Calle de muestra ',id-761000),'0000000000',CONCAT('cliente',id,'@example.com')
FROM (VALUES (761001,'Alma Prado'), (761002,'Leo Vela'), (761003,'Nina Montes'),
             (761004,'Teo Valle'), (761005,'Mara Robles'), (761006,'Sol Arenas')) AS c(id,nombre);

INSERT INTO proveedores (nit,nombre_proveedor,direccion,telefono,ciudad)
SELECT id,nombre,'Bodega de muestra','0000000000',ciudad
FROM (VALUES (762001,'Despensa Alba','Bogotá'), (762002,'Origen Tostado','Manizales'),
             (762003,'Casa del Papel','Medellín')) AS p(id,nombre,ciudad);

INSERT INTO productos (codigo_producto,nombre_producto,nit_proveedor,precio_compra,iva_compra,precio_venta)
SELECT id,nombre,proveedor,costo,iva,precio FROM (VALUES
  (763001,'Arroz blanco 1 kg',762001,3200,0,4500),
  (763002,'Lentejas 500 g',762001,2100,0,3400),
  (763003,'Avena en hojuelas 400 g',762001,2900,0,4200),
  (763004,'Granola con semillas 300 g',762001,6100,0,8900),
  (763005,'Café molido Sierra 250 g',762002,9500,5,14500),
  (763006,'Café en grano Sierra 500 g',762002,17500,5,25000),
  (763007,'Filtro de café reutilizable',762002,8200,19,12500),
  (763008,'Cuaderno punteado A5',762003,5100,19,7900),
  (763009,'Bolígrafo azul',762003,900,19,1800),
  (763010,'Libreta de bolsillo',762003,3200,19,5200)
) AS p(id,nombre,proveedor,costo,iva,precio);

-- Un día de actividad por jornada, repartido entre ambos turnos.
CREATE TEMPORARY TABLE jornadas_demo ON COMMIT DROP AS
SELECT n, 764000+n AS venta, ((CURRENT_TIMESTAMP AT TIME ZONE 'America/Bogota') - n * interval '1 day') AS fecha
FROM (VALUES (0),(1),(2),(3),(4),(5),(6),
             (7),(8),(9),(10),(11),(12),(13)) AS dias(n);
CREATE TEMPORARY TABLE lineas_demo ON COMMIT DROP AS
SELECT j.venta,p.codigo_producto,1+MOD(j.n+k.pos,3) AS cantidad,p.precio_venta,p.iva_compra
FROM jornadas_demo j CROSS JOIN (VALUES (0),(3)) AS k(pos)
JOIN productos p ON p.codigo_producto=763001+MOD(j.n+k.pos,10);

INSERT INTO ventas (codigo_venta,cedula_cliente,cedula_usuario,valor_total_venta,valor_iva,valor_total_con_iva,fecha_venta)
SELECT j.venta,761001+MOD(j.n,6),760001+MOD(j.n,2),t.base,t.iva,t.base+t.iva,j.fecha
FROM jornadas_demo j JOIN (
  SELECT venta,SUM(cantidad*precio_venta) AS base,SUM(ROUND(cantidad*precio_venta*iva_compra/100,2)) AS iva
  FROM lineas_demo GROUP BY venta
) t ON t.venta=j.venta;

INSERT INTO detalle_ventas (codigo_venta,codigo_producto,cantidad,valor_unitario,valor_total)
SELECT venta,codigo_producto,cantidad,precio_venta,cantidad*precio_venta FROM lineas_demo;
SELECT setval(pg_get_serial_sequence('ventas','codigo_venta'), MAX(codigo_venta)) FROM ventas;
