create table if not exists usuarios (
    cedula bigint not null,
    nombre_completo varchar(120) not null,
    correo_electronico varchar(120) not null,
    usuario varchar(60) not null,
    contrasena varchar(255) not null,
    activo boolean not null default true,
    fecha_creacion datetime not null default current_timestamp,
    constraint pk_usuarios primary key (cedula),
    constraint uk_usuarios_usuario unique (usuario),
    constraint uk_usuarios_correo unique (correo_electronico)
);

create table if not exists clientes (
    cedula bigint not null,
    nombre_completo varchar(120) not null,
    direccion varchar(180) not null,
    telefono varchar(40) not null,
    correo_electronico varchar(120) not null,
    constraint pk_clientes primary key (cedula),
    constraint uk_clientes_correo unique (correo_electronico)
);

create table if not exists proveedores (
    nit bigint not null,
    nombre_proveedor varchar(120) not null,
    direccion varchar(180) not null,
    telefono varchar(40) not null,
    ciudad varchar(80) not null,
    constraint pk_proveedores primary key (nit)
);

create table if not exists productos (
    codigo_producto bigint not null,
    nombre_producto varchar(80) not null,
    nit_proveedor bigint not null,
    precio_compra decimal(15, 2) not null,
    iva_compra decimal(7, 2) not null,
    precio_venta decimal(15, 2) not null,
    constraint pk_productos primary key (codigo_producto),
    constraint fk_productos_proveedor foreign key (nit_proveedor) references proveedores (nit)
);

create index idx_productos_proveedor on productos (nit_proveedor);

create table if not exists ventas (
    codigo_venta bigint not null auto_increment,
    cedula_cliente bigint not null,
    cedula_usuario bigint not null,
    valor_total_venta decimal(15, 2) not null,
    valor_iva decimal(15, 2) not null,
    valor_total_con_iva decimal(15, 2) not null,
    fecha_venta datetime not null default current_timestamp,
    constraint pk_ventas primary key (codigo_venta),
    constraint fk_ventas_cliente foreign key (cedula_cliente) references clientes (cedula),
    constraint fk_ventas_usuario foreign key (cedula_usuario) references usuarios (cedula)
);

create index idx_ventas_cliente on ventas (cedula_cliente);
create index idx_ventas_usuario on ventas (cedula_usuario);
create index idx_ventas_fecha on ventas (fecha_venta);

create table if not exists detalle_ventas (
    id_detalle bigint not null auto_increment,
    codigo_venta bigint not null,
    codigo_producto bigint not null,
    cantidad int not null,
    valor_unitario decimal(15, 2) not null,
    valor_total decimal(15, 2) not null,
    constraint pk_detalle_ventas primary key (id_detalle),
    constraint fk_detalle_venta foreign key (codigo_venta) references ventas (codigo_venta),
    constraint fk_detalle_producto foreign key (codigo_producto) references productos (codigo_producto),
    constraint uk_detalle_venta_producto unique (codigo_venta, codigo_producto)
);

create index idx_detalle_venta on detalle_ventas (codigo_venta);
create index idx_detalle_producto on detalle_ventas (codigo_producto);
