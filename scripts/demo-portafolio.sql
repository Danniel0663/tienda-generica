-- Ejecutar con mysql en modo batch (sin --force) sobre la base de la demo.
SET NAMES utf8mb4;
CREATE TABLE IF NOT EXISTS cargas_demo (
  nombre VARCHAR(80) PRIMARY KEY
) ENGINE=InnoDB;
START TRANSACTION;
INSERT IGNORE INTO cargas_demo VALUES ('portafolio-v1');
SET @cargar = ROW_COUNT();

INSERT INTO usuarios (cedula,nombre_completo,correo_electronico,usuario,contrasena,activo)
SELECT id,nombre,CONCAT(login,'@example.com'),login,
       '$2a$10$I4oHFC0JJggIqnHG9jwxCuALVk5p8YKszGGaSyt1aPmhAgqAkHIUq',TRUE
FROM (VALUES ROW(760001,'Luna Ríos','demo.caja'), ROW(760002,'Mateo Sol','demo.turno')) AS u(id,nombre,login)
WHERE @cargar;

INSERT INTO clientes (cedula,nombre_completo,direccion,telefono,correo_electronico)
SELECT id,nombre,CONCAT('Calle de muestra ',id-761000),'0000000000',CONCAT('cliente',id,'@example.com')
FROM (VALUES ROW(761001,'Alma Prado'), ROW(761002,'Leo Vela'), ROW(761003,'Nina Montes'),
             ROW(761004,'Teo Valle'), ROW(761005,'Mara Robles'), ROW(761006,'Sol Arenas')) AS c(id,nombre)
WHERE @cargar;

INSERT INTO proveedores (nit,nombre_proveedor,direccion,telefono,ciudad)
SELECT id,nombre,'Bodega de muestra','0000000000',ciudad
FROM (VALUES ROW(762001,'Despensa Alba','Bogotá'), ROW(762002,'Origen Tostado','Manizales'),
             ROW(762003,'Casa del Papel','Medellín')) AS p(id,nombre,ciudad)
WHERE @cargar;

INSERT INTO productos (codigo_producto,nombre_producto,nit_proveedor,precio_compra,iva_compra,precio_venta)
SELECT id,nombre,proveedor,costo,iva,precio FROM (VALUES
  ROW(763001,'Arroz blanco 1 kg',762001,3200,0,4500),
  ROW(763002,'Lentejas 500 g',762001,2100,0,3400),
  ROW(763003,'Avena en hojuelas 400 g',762001,2900,0,4200),
  ROW(763004,'Granola con semillas 300 g',762001,6100,0,8900),
  ROW(763005,'Café molido Sierra 250 g',762002,9500,5,14500),
  ROW(763006,'Café en grano Sierra 500 g',762002,17500,5,25000),
  ROW(763007,'Filtro de café reutilizable',762002,8200,19,12500),
  ROW(763008,'Cuaderno punteado A5',762003,5100,19,7900),
  ROW(763009,'Bolígrafo azul',762003,900,19,1800),
  ROW(763010,'Libreta de bolsillo',762003,3200,19,5200)
) AS p(id,nombre,proveedor,costo,iva,precio) WHERE @cargar;

-- Un día de actividad por jornada, repartido entre ambos turnos.
CREATE TEMPORARY TABLE jornadas_demo AS
SELECT n, 764000+n AS venta, DATE_SUB(UTC_TIMESTAMP() - INTERVAL 5 HOUR, INTERVAL n DAY) AS fecha
FROM (VALUES ROW(0),ROW(1),ROW(2),ROW(3),ROW(4),ROW(5),ROW(6),
             ROW(7),ROW(8),ROW(9),ROW(10),ROW(11),ROW(12),ROW(13)) AS dias(n)
WHERE @cargar;
CREATE TEMPORARY TABLE lineas_demo AS
SELECT j.venta,p.codigo_producto,1+MOD(j.n+k.pos,3) AS cantidad,p.precio_venta,p.iva_compra
FROM jornadas_demo j CROSS JOIN (VALUES ROW(0),ROW(3)) AS k(pos)
JOIN productos p ON p.codigo_producto=763001+MOD(j.n+k.pos,10);

INSERT INTO ventas (codigo_venta,cedula_cliente,cedula_usuario,valor_total_venta,valor_iva,valor_total_con_iva,fecha_venta)
SELECT j.venta,761001+MOD(j.n,6),760001+MOD(j.n,2),t.base,t.iva,t.base+t.iva,j.fecha
FROM jornadas_demo j JOIN (
  SELECT venta,SUM(cantidad*precio_venta) AS base,SUM(ROUND(cantidad*precio_venta*iva_compra/100,2)) AS iva
  FROM lineas_demo GROUP BY venta
) t ON t.venta=j.venta;

INSERT INTO detalle_ventas (codigo_venta,codigo_producto,cantidad,valor_unitario,valor_total)
SELECT venta,codigo_producto,cantidad,precio_venta,cantidad*precio_venta FROM lineas_demo;
COMMIT;
DROP TEMPORARY TABLE lineas_demo,jornadas_demo;
