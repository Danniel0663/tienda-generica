const API = `${window.location.origin}/api`;
const SESSION_KEY = 'tg.session';

let currentSession = null;

const VIEW_META = {
    dashboard: { title: 'Resumen General', subtitle: 'Operacion central y monitoreo comercial' },
    clientes: { title: 'Gestion de Clientes', subtitle: 'Administracion de datos para ventas y reportes' },
    ventas: { title: 'Registro de Ventas', subtitle: 'Liquidacion, IVA y consolidado por transaccion' },
    proveedores: { title: 'Gestion de Proveedores', subtitle: 'Alta, edicion y control de proveedores registrados' },
    productos: { title: 'Gestion de Productos', subtitle: 'Catalogo comercial y carga masiva por CSV' },
    usuarios: { title: 'Gestion de Usuarios', subtitle: 'Accesos del sistema y estado de cuentas operativas' },
    reportes: { title: 'Consultas y Reportes', subtitle: 'Analitica operativa y consolidado de ventas por cliente' }
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[0-9+()\-\s]{7,20}$/;
const USERNAME_REGEX = /^[a-zA-Z0-9._-]{4,60}$/;

const App = {
    init() {
        window.addEventListener('resize', () => this.handleViewport());
        window.addEventListener('keydown', event => {
            if (event.key === 'Escape') {
                this.closeModal();
                this.toggleSidebar(false);
            }
        });
        this.restoreSession();
        this.handleViewport();
    },
    restoreSession() {
        const savedSession = sessionStorage.getItem(SESSION_KEY);
        if (!savedSession) {
            return;
        }

        try {
            const parsed = JSON.parse(savedSession);
            if (this.isSessionExpired(parsed)) {
                this.clearSession();
                return;
            }
            currentSession = parsed;
            this.showApp();
        } catch (error) {
            this.clearSession();
        }
    },
    isSessionExpired(session) {
        return !session?.expiraEn || Number.isNaN(new Date(session.expiraEn).getTime()) || new Date(session.expiraEn) <= new Date();
    },
    persistSession(session) {
        currentSession = session;
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    },
    clearSession() {
        sessionStorage.removeItem(SESSION_KEY);
        currentSession = null;
    },
    handleViewport() {
        if (window.innerWidth > 980) {
            this.toggleSidebar(false, true);
        }
    },
    toggleSidebar(force, silent = false) {
        const sidebar = document.querySelector('.sidebar');
        const backdrop = document.getElementById('sidebarBackdrop');
        if (!sidebar || !backdrop) {
            return;
        }

        if (window.innerWidth > 980 && !silent) {
            return;
        }

        const shouldOpen = typeof force === 'boolean' ? force : !sidebar.classList.contains('open');
        sidebar.classList.toggle('open', shouldOpen);
        backdrop.classList.toggle('visible', shouldOpen);
        document.body.classList.toggle('menu-open', shouldOpen);
    },
    togglePassword() {
        const input = document.getElementById('loginPass');
        const btn = document.querySelector('.pass-toggle');
        if (!input || !btn) {
            return;
        }
        const isHidden = input.type === 'password';
        input.type = isHidden ? 'text' : 'password';
        btn.textContent = isHidden ? 'Ocultar' : 'Mostrar';
    },
    markFieldError(id, hasError) {
        const element = document.getElementById(id);
        if (!element) {
            return;
        }
        element.setAttribute('aria-invalid', hasError ? 'true' : 'false');
        element.classList.toggle('input-error', hasError);
    },
    async login(event) {
        event.preventDefault();
        const usuario = readValue('loginUser');
        const contrasena = readRawValue('loginPass');
        const errorElement = document.getElementById('loginError');

        if (errorElement) {
            errorElement.style.display = 'none';
            errorElement.textContent = '';
        }

        this.markFieldError('loginUser', false);
        this.markFieldError('loginPass', false);

        const isValid = validateFields([
            { id: 'loginUser', label: 'Usuario', required: true, pattern: USERNAME_REGEX, patternMessage: 'Ingresa un usuario válido' },
            { id: 'loginPass', label: 'Contraseña', required: true, minLength: 8 }
        ]);
        if (!isValid) {
            if (errorElement) {
                errorElement.style.display = 'block';
                errorElement.textContent = 'Completa usuario y contraseña para ingresar.';
            }
            return;
        }

        const button = document.getElementById('btnLogin');
        if (button) {
            button.disabled = true;
            button.textContent = 'Verificando...';
        }

        try {
            const session = await apiRequest('/auth/login', {
                method: 'POST',
                body: { usuario, contrasena },
                auth: false
            });
            this.persistSession(session);
            this.showApp();
            this.toast('Sesion iniciada correctamente');
        } catch (error) {
            this.markFieldError('loginUser', true);
            this.markFieldError('loginPass', true);
            if (errorElement) {
                errorElement.style.display = 'block';
                errorElement.textContent = getErrorMessage(error, 'No fue posible iniciar sesion.');
            }
        } finally {
            if (button) {
                button.disabled = false;
                button.textContent = 'Ingresar';
            }
        }
    },
    showApp() {
        const loginScreen = document.getElementById('loginScreen');
        const appShell = document.getElementById('appShell');
        if (loginScreen) {
            loginScreen.style.display = 'none';
        }
        if (appShell) {
            appShell.style.display = 'flex';
        }
        this.renderSessionDetails();
        this.navigate('dashboard');
    },
    renderSessionDetails() {
        if (!currentSession) {
            return;
        }

        setText('sidebarUser', currentSession.nombreCompleto);
        setText('sidebarEmail', currentSession.usuario);
        setText('sessionBadge', `Sesion protegida · ${currentSession.tipoToken || 'Bearer'}`);
        setText('sessionExpiry', `Expira ${fmtDateTime(currentSession.expiraEn)}`);
        setText('sidebarSessionStatus', `Sesion vigente hasta ${fmtDateTime(currentSession.expiraEn)}`);

        const avatar = document.querySelector('.user-avatar');
        if (avatar) {
            avatar.textContent = initials(currentSession.nombreCompleto);
        }
    },
    async logout(reason) {
        this.clearSession();
        this.closeModal();
        this.toggleSidebar(false, true);

        const appShell = document.getElementById('appShell');
        const loginScreen = document.getElementById('loginScreen');
        if (appShell) {
            appShell.style.display = 'none';
        }
        if (loginScreen) {
            loginScreen.style.display = 'flex';
        }

        const loginForm = document.querySelector('#loginScreen form');
        if (loginForm) {
            loginForm.reset();
        }
        this.markFieldError('loginUser', false);
        this.markFieldError('loginPass', false);
        if (reason) {
            const errorElement = document.getElementById('loginError');
            if (errorElement) {
                errorElement.style.display = 'block';
                errorElement.textContent = reason;
            }
        }
    },
    navigate(view) {
        if (!currentSession) {
            return;
        }

        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.view === view);
        });

        const meta = VIEW_META[view] || VIEW_META.dashboard;
        setText('pageTitle', meta.title);
        setText('pageSubtitle', meta.subtitle);

        const template = document.getElementById(`tpl-${view}`);
        const content = document.getElementById('content');
        if (template && content) {
            content.innerHTML = template.innerHTML;
            if (Views[view] && typeof Views[view].init === 'function') {
                Views[view].init();
            }
        }

        this.toggleSidebar(false);
    },
    openModal(title, html) {
        setText('modalTitle', title);
        const modalBody = document.getElementById('modalBody');
        if (modalBody) {
            modalBody.innerHTML = html;
        }
        const modal = document.getElementById('modal');
        if (modal) {
            modal.style.display = 'flex';
        }
    },
    closeModal() {
        const modal = document.getElementById('modal');
        if (modal) {
            modal.style.display = 'none';
        }
    },
    toast(message, type = 'success') {
        const container = document.getElementById('toasts');
        if (!container) {
            return;
        }

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        container.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transition = 'opacity .25s ease';
            setTimeout(() => toast.remove(), 250);
        }, 3200);
    }
};

function crudView(config) {
    let allData = [];

    return {
        async init() {
            await this.load();
        },
        async load() {
            try {
                allData = await apiRequest(`/${config.endpoint}`);
                this.render(allData);
            } catch (error) {
                App.toast(getErrorMessage(error, `No fue posible cargar ${config.name.toLowerCase()}.`), 'error');
            }
        },
        render(data) {
            const tableBody = document.getElementById(config.tbodyId);
            if (!tableBody) {
                return;
            }

            if (!data.length) {
                tableBody.innerHTML = emptyRow(config.emptyColumns || 6, `No hay registros de ${config.name.toLowerCase()}.`);
                return;
            }

            tableBody.innerHTML = data.map(item => config.renderRow(item)).join('');
        },
        search() {
            const query = readValue(config.searchId).toLowerCase();
            if (!query) {
                this.render(allData);
                return;
            }

            const filtered = allData.filter(item => {
                const candidates = [
                    item[config.idField],
                    item.nombreCompleto,
                    item.nombreProveedor,
                    item.nombreProducto,
                    item.usuario,
                    item.correoElectronico,
                    item.ciudad
                ];
                return candidates.some(candidate => String(candidate || '').toLowerCase().includes(query));
            });
            this.render(filtered);
        },
        openForm(item) {
            const isEdit = Boolean(item);
            App.openModal(
                `${isEdit ? 'Editar' : 'Nuevo'} ${config.name}`,
                `<form class="modal-form" onsubmit="Views.${config.endpoint}.save(event, ${isEdit})">
                    ${config.formHtml(item)}
                    <input type="hidden" id="formEditId" value="${isEdit ? item[config.idField] : ''}">
                    <div class="modal-actions">
                        <button type="button" class="btn btn-ghost" onclick="App.closeModal()">Cancelar</button>
                        <button type="submit" class="btn btn-accent">${isEdit ? 'Actualizar' : 'Guardar'}</button>
                    </div>
                </form>`
            );
        },
        async save(event, isEdit) {
            event.preventDefault();
            if (typeof config.validateForm === 'function' && !config.validateForm(isEdit)) {
                return;
            }

            const id = readRawValue('formEditId');
            const body = config.parseForm(isEdit);

            try {
                await apiRequest(isEdit ? `/${config.endpoint}/${id}` : `/${config.endpoint}`, {
                    method: isEdit ? 'PUT' : 'POST',
                    body
                });
                App.closeModal();
                App.toast(`${config.name} ${isEdit ? 'actualizado' : 'creado'} correctamente`);
                await this.load();
            } catch (error) {
                showFormErrors(error);
                App.toast(getErrorMessage(error, `No fue posible guardar ${config.name.toLowerCase()}.`), 'error');
            }
        },
        async remove(id) {
            if (!confirm(`¿Deseas eliminar ${config.name.toLowerCase()} con identificador ${id}?`)) {
                return;
            }

            try {
                await apiRequest(`/${config.endpoint}/${id}`, { method: 'DELETE' });
                App.toast(`${config.name} eliminado correctamente`);
                await this.load();
            } catch (error) {
                App.toast(getErrorMessage(error, `No fue posible eliminar ${config.name.toLowerCase()}.`), 'error');
            }
        }
    };
}

const Views = {};

Views.proveedores = crudView({
    endpoint: 'proveedores',
    idField: 'nit',
    name: 'Proveedor',
    searchId: 'searchProv',
    tbodyId: 'tbProv',
    emptyColumns: 6,
    renderRow: proveedor => `<tr>
        <td>${proveedor.nit}</td>
        <td>${escapeHtml(proveedor.nombreProveedor)}</td>
        <td>${escapeHtml(proveedor.direccion)}</td>
        <td>${escapeHtml(proveedor.telefono)}</td>
        <td>${escapeHtml(proveedor.ciudad)}</td>
        <td>
            <div class="actions-cell">
                <button class="btn btn-warn btn-xs" onclick="Views.proveedores.openForm(${serialize(proveedor)})">Editar</button>
                <button class="btn btn-danger btn-xs" onclick="Views.proveedores.remove(${proveedor.nit})">Eliminar</button>
            </div>
        </td>
    </tr>`,
    formHtml: proveedor => [
        fld({ id: 'nit', label: 'NIT', type: 'number', value: proveedor?.nit, disabled: Boolean(proveedor), min: 1, step: 1 }),
        fld({ id: 'nombreProveedor', label: 'Nombre', value: proveedor?.nombreProveedor, maxLength: 120 }),
        fld({ id: 'direccion', label: 'Direccion', value: proveedor?.direccion, maxLength: 180 }),
        fld({ id: 'telefono', label: 'Telefono', value: proveedor?.telefono, maxLength: 20 }),
        fld({ id: 'ciudad', label: 'Ciudad', value: proveedor?.ciudad, maxLength: 80 })
    ].join(''),
    validateForm: () => validateFields([
        { id: 'nit', label: 'NIT', required: true, type: 'positiveInt' },
        { id: 'nombreProveedor', label: 'Nombre', required: true, minLength: 3, maxLength: 120 },
        { id: 'direccion', label: 'Direccion', required: true, minLength: 8, maxLength: 180 },
        { id: 'telefono', label: 'Telefono', required: true, pattern: PHONE_REGEX, patternMessage: 'Ingresa un telefono valido' },
        { id: 'ciudad', label: 'Ciudad', required: true, minLength: 2, maxLength: 80 }
    ]),
    parseForm: () => ({
        nit: toPositiveInt('nit'),
        nombreProveedor: readValue('nombreProveedor'),
        direccion: readValue('direccion'),
        telefono: readValue('telefono'),
        ciudad: readValue('ciudad')
    })
});

Views.productos = {
    ...crudView({
        endpoint: 'productos',
        idField: 'codigoProducto',
        name: 'Producto',
        searchId: 'searchProd',
        tbodyId: 'tbProd',
        emptyColumns: 7,
        renderRow: producto => `<tr>
            <td>${producto.codigoProducto}</td>
            <td>${escapeHtml(producto.nombreProducto)}</td>
            <td>${escapeHtml(producto.nombreProveedor || producto.nitProveedor)}</td>
            <td class="money">$${fmtMoney(producto.precioCompra)}</td>
            <td class="money">${fmtMoney(producto.ivaCompra)}%</td>
            <td class="money">$${fmtMoney(producto.precioVenta)}</td>
            <td>
                <div class="actions-cell">
                    <button class="btn btn-warn btn-xs" onclick="Views.productos.openForm(${serialize(producto)})">Editar</button>
                    <button class="btn btn-danger btn-xs" onclick="Views.productos.remove(${producto.codigoProducto})">Eliminar</button>
                </div>
            </td>
        </tr>`,
        formHtml: producto => [
            fld({ id: 'codigoProducto', label: 'Codigo', type: 'number', value: producto?.codigoProducto, disabled: Boolean(producto), min: 1, step: 1 }),
            fld({ id: 'nombreProducto', label: 'Nombre', value: producto?.nombreProducto, maxLength: 80 }),
            fld({ id: 'nitProveedor', label: 'NIT Proveedor', type: 'number', value: producto?.nitProveedor, min: 1, step: 1 }),
            fld({ id: 'precioCompra', label: 'Precio Compra', type: 'number', value: producto?.precioCompra, min: 0.01, step: 0.01 }),
            fld({ id: 'ivaCompra', label: 'IVA (%)', type: 'number', value: producto?.ivaCompra, min: 0, max: 100, step: 0.01 }),
            fld({ id: 'precioVenta', label: 'Precio Venta', type: 'number', value: producto?.precioVenta, min: 0.01, step: 0.01 })
        ].join(''),
        validateForm: () => {
            const fieldsAreValid = validateFields([
                { id: 'codigoProducto', label: 'Codigo', required: true, type: 'positiveInt' },
                { id: 'nombreProducto', label: 'Nombre', required: true, minLength: 3, maxLength: 80 },
                { id: 'nitProveedor', label: 'NIT Proveedor', required: true, type: 'positiveInt' },
                { id: 'precioCompra', label: 'Precio Compra', required: true, type: 'decimal', min: 0.01 },
                { id: 'ivaCompra', label: 'IVA', required: true, type: 'decimal', min: 0, max: 100 },
                { id: 'precioVenta', label: 'Precio Venta', required: true, type: 'decimal', min: 0.01 }
            ]);

            if (!fieldsAreValid) {
                return false;
            }

            const precioCompra = toDecimal('precioCompra');
            const precioVenta = toDecimal('precioVenta');
            if (precioVenta < precioCompra) {
                App.markFieldError('precioVenta', true);
                document.getElementById('precioVenta').setCustomValidity('El precio de venta no puede ser menor al precio de compra');
                document.getElementById('precioVenta').reportValidity();
                return false;
            }

            return true;
        },
        parseForm: () => ({
            codigoProducto: toPositiveInt('codigoProducto'),
            nombreProducto: readValue('nombreProducto'),
            nitProveedor: toPositiveInt('nitProveedor'),
            precioCompra: toDecimal('precioCompra'),
            ivaCompra: toDecimal('ivaCompra'),
            precioVenta: toDecimal('precioVenta')
        })
    }),
    openCsv() {
        App.openModal('Carga masiva por CSV', `
            <div class="upload-card">
                <p class="upload-copy">Carga o actualiza productos con columnas: <strong>codigoProducto, nombreProducto, nitProveedor, precioCompra, ivaCompra, precioVenta</strong>.</p>
                <div class="csv-zone" onclick="document.getElementById('csvFileInput').click()">
                    <p>Seleccionar archivo CSV</p>
                    <span>Los registros existentes se actualizan por codigo y no se borra el catalogo completo.</span>
                    <input type="file" id="csvFileInput" accept=".csv" style="display:none" onchange="Views.productos.uploadCsv()">
                </div>
                <div id="csvResult" class="inline-feedback"></div>
            </div>
        `);
    },
    async uploadCsv() {
        const fileInput = document.getElementById('csvFileInput');
        const result = document.getElementById('csvResult');
        const file = fileInput?.files?.[0];

        if (!file) {
            return;
        }

        if (!file.name.toLowerCase().endsWith('.csv')) {
            if (result) {
                result.textContent = 'Selecciona un archivo con extension .csv.';
            }
            return;
        }

        const formData = new FormData();
        formData.append('archivo', file);

        try {
            const data = await apiRequest('/productos/cargar-csv', {
                method: 'POST',
                body: formData
            });
            App.closeModal();
            App.toast(`Catalogo actualizado con ${data.length} productos`);
            await this.load();
        } catch (error) {
            if (result) {
                result.textContent = getErrorMessage(error, 'No fue posible procesar el archivo.');
            }
        }
    }
};

Views.clientes = crudView({
    endpoint: 'clientes',
    idField: 'cedula',
    name: 'Cliente',
    searchId: 'searchCli',
    tbodyId: 'tbCli',
    emptyColumns: 6,
    renderRow: cliente => `<tr>
        <td>${cliente.cedula}</td>
        <td>${escapeHtml(cliente.nombreCompleto)}</td>
        <td>${escapeHtml(cliente.direccion)}</td>
        <td>${escapeHtml(cliente.telefono)}</td>
        <td>${escapeHtml(cliente.correoElectronico)}</td>
        <td>
            <div class="actions-cell">
                <button class="btn btn-warn btn-xs" onclick="Views.clientes.openForm(${serialize(cliente)})">Editar</button>
                <button class="btn btn-danger btn-xs" onclick="Views.clientes.remove(${cliente.cedula})">Eliminar</button>
            </div>
        </td>
    </tr>`,
    formHtml: cliente => [
        fld({ id: 'cedula', label: 'Cedula', type: 'number', value: cliente?.cedula, disabled: Boolean(cliente), min: 1, step: 1 }),
        fld({ id: 'nombreCompleto', label: 'Nombre Completo', value: cliente?.nombreCompleto, maxLength: 120 }),
        fld({ id: 'direccion', label: 'Direccion', value: cliente?.direccion, maxLength: 180 }),
        fld({ id: 'telefono', label: 'Telefono', value: cliente?.telefono, maxLength: 20 }),
        fld({ id: 'correoElectronico', label: 'Correo Electronico', type: 'email', value: cliente?.correoElectronico, maxLength: 120 })
    ].join(''),
    validateForm: () => validateFields([
        { id: 'cedula', label: 'Cedula', required: true, type: 'positiveInt' },
        { id: 'nombreCompleto', label: 'Nombre Completo', required: true, minLength: 3, maxLength: 120 },
        { id: 'direccion', label: 'Direccion', required: true, minLength: 8, maxLength: 180 },
        { id: 'telefono', label: 'Telefono', required: true, pattern: PHONE_REGEX, patternMessage: 'Ingresa un telefono valido' },
        { id: 'correoElectronico', label: 'Correo Electronico', required: true, type: 'email', maxLength: 120 }
    ]),
    parseForm: () => ({
        cedula: toPositiveInt('cedula'),
        nombreCompleto: readValue('nombreCompleto'),
        direccion: readValue('direccion'),
        telefono: readValue('telefono'),
        correoElectronico: readValue('correoElectronico').toLowerCase()
    })
});

Views.usuarios = crudView({
    endpoint: 'usuarios',
    idField: 'cedula',
    name: 'Usuario',
    searchId: 'searchUsr',
    tbodyId: 'tbUsr',
    emptyColumns: 6,
    renderRow: usuario => `<tr>
        <td>${usuario.cedula}</td>
        <td>${escapeHtml(usuario.nombreCompleto)}</td>
        <td>${escapeHtml(usuario.correoElectronico)}</td>
        <td>${escapeHtml(usuario.usuario)}</td>
        <td><span class="badge ${usuario.activo ? 'badge-green' : 'badge-red'}">${usuario.activo ? 'Activo' : 'Inactivo'}</span></td>
        <td>
            <div class="actions-cell">
                <button class="btn btn-warn btn-xs" onclick="Views.usuarios.openForm(${serialize(usuario)})">Editar</button>
                <button class="btn btn-danger btn-xs" onclick="Views.usuarios.remove(${usuario.cedula})">Eliminar</button>
            </div>
        </td>
    </tr>`,
    formHtml: usuario => [
        fld({ id: 'cedula', label: 'Cedula', type: 'number', value: usuario?.cedula, disabled: Boolean(usuario), min: 1, step: 1 }),
        fld({ id: 'nombreCompleto', label: 'Nombre Completo', value: usuario?.nombreCompleto, maxLength: 120 }),
        fld({ id: 'correoElectronico', label: 'Correo Electronico', type: 'email', value: usuario?.correoElectronico, maxLength: 120 }),
        fld({ id: 'usuario', label: 'Usuario', value: usuario?.usuario, maxLength: 60, autocomplete: 'username' }),
        fld({
            id: 'contrasena',
            label: `Contraseña ${usuario ? '(opcional en edicion)' : ''}`,
            type: 'password',
            value: '',
            required: false,
            maxLength: 120,
            autocomplete: usuario ? 'new-password' : 'new-password',
            placeholder: usuario ? 'Dejar vacio para conservar la actual' : 'Minimo 8 caracteres'
        }),
        `<label for="activo">Estado</label>
         <select id="activo" class="form-control">
            <option value="true" ${!usuario || usuario.activo ? 'selected' : ''}>Activo</option>
            <option value="false" ${usuario && !usuario.activo ? 'selected' : ''}>Inactivo</option>
         </select>`
    ].join(''),
    validateForm: isEdit => validateFields([
        { id: 'cedula', label: 'Cedula', required: true, type: 'positiveInt' },
        { id: 'nombreCompleto', label: 'Nombre Completo', required: true, minLength: 3, maxLength: 120 },
        { id: 'correoElectronico', label: 'Correo Electronico', required: true, type: 'email', maxLength: 120 },
        { id: 'usuario', label: 'Usuario', required: true, pattern: USERNAME_REGEX, patternMessage: 'Usa 4 a 60 caracteres: letras, numeros, punto, guion o guion bajo' },
        { id: 'contrasena', label: 'Contraseña', required: !isEdit, minLength: 8, maxLength: 120, allowBlank: isEdit }
    ]),
    parseForm: () => {
        const body = {
            cedula: toPositiveInt('cedula'),
            nombreCompleto: readValue('nombreCompleto'),
            correoElectronico: readValue('correoElectronico').toLowerCase(),
            usuario: readValue('usuario').toLowerCase(),
            activo: readRawValue('activo') === 'true'
        };
        const contrasena = readValue('contrasena');
        if (contrasena) {
            body.contrasena = contrasena;
        }
        return body;
    }
});

Views.ventas = {
    productos: [],
    step: 1,
    async init() {
        try {
            const [clientes, productos, ventas] = await Promise.all([
                apiRequest('/clientes'),
                apiRequest('/productos'),
                apiRequest('/ventas')
            ]);

            this.productos = productos;
            this.step = 1;
            this.renderStep();
            this.populateClientes(clientes);
            this.renderVentas(ventas);
            setValue('ventaVendedor', currentSession?.nombreCompleto || '');
            setValue('ventaVendedorId', currentSession?.cedula || '');
            const itemsContainer = document.getElementById('ventaItems');
            if (itemsContainer) {
                itemsContainer.innerHTML = '';
            }
            this.addItem();
            this.calc();
        } catch (error) {
            App.toast(getErrorMessage(error, 'No fue posible cargar el modulo de ventas.'), 'error');
        }
    },
    populateClientes(clientes) {
        const select = document.getElementById('ventaCliente');
        if (!select) {
            return;
        }

        select.innerHTML = '<option value="">Seleccionar cliente...</option>' + clientes
            .map(cliente => `<option value="${cliente.cedula}">${escapeHtml(cliente.nombreCompleto)} (${cliente.cedula})</option>`)
            .join('');
    },
    renderVentas(ventas) {
        const tableBody = document.getElementById('tbVentas');
        if (!tableBody) {
            return;
        }

        tableBody.innerHTML = ventas.length
            ? ventas.map(venta => `<tr>
                <td>${venta.codigoVenta}</td>
                <td>${escapeHtml(venta.nombreCliente)}</td>
                <td class="money">$${fmtMoney(venta.valorTotalVenta)}</td>
                <td class="money">$${fmtMoney(venta.valorIva)}</td>
                <td class="money">$${fmtMoney(venta.valorTotalConIva)}</td>
                <td>${fmtDateTime(venta.fechaVenta)}</td>
            </tr>`).join('')
            : emptyRow(6, 'No hay ventas registradas.');
    },
    addItem() {
        const itemsContainer = document.getElementById('ventaItems');
        if (!itemsContainer) {
            return;
        }


        const options = this.productos.map(producto =>
            `<option value="${producto.codigoProducto}" data-price="${producto.precioVenta}" data-iva="${producto.ivaCompra}">
                ${escapeHtml(producto.nombreProducto)} ($${fmtMoney(producto.precioVenta)})
            </option>`).join('');

        const row = document.createElement('div');
        row.className = 'venta-item';
        row.innerHTML = `
            <div class="field">
                <label>Producto</label>
                <select class="form-control vProd" onchange="Views.ventas.calc()">
                    <option value="">Seleccionar...</option>
                    ${options}
                </select>
            </div>
            <div class="field field-qty">
                <label>Cant.</label>
                <input type="number" class="form-control vCant" value="1" min="1" step="1" oninput="Views.ventas.calc()">
            </div>
            <button type="button" class="remove-btn" onclick="this.parentElement.remove(); Views.ventas.calc()">×</button>
        `;
        itemsContainer.appendChild(row);
    },
    collectItems() {
        const items = [];
        const selectedCodes = new Set();
        const rows = [...document.querySelectorAll('.venta-item')];

        for (const row of rows) {
            const select = row.querySelector('.vProd');
            const quantityInput = row.querySelector('.vCant');
            const codigoProducto = Number.parseInt(select?.value, 10);
            const cantidad = Number.parseInt(quantityInput?.value, 10);

            if (!codigoProducto) {
                return { valid: false, message: 'Selecciona un producto en cada fila.' };
            }
            if (!cantidad || cantidad <= 0) {
                return { valid: false, message: 'La cantidad debe ser mayor a cero.' };
            }
            if (selectedCodes.has(codigoProducto)) {
                return { valid: false, message: 'No puedes repetir el mismo producto en una venta.' };
            }

            selectedCodes.add(codigoProducto);
            items.push({ codigoProducto, cantidad });
        }

        if (!items.length) {
            return { valid: false, message: 'Debes agregar al menos un producto.' };
        }


        return { valid: true, items };
    },
    calc() {
        const result = this.collectItems();
        const rows = [...document.querySelectorAll('.venta-item')];
        let subtotal = 0;
        let iva = 0;

        rows.forEach(row => {
            const select = row.querySelector('.vProd');
            const quantity = Number.parseInt(row.querySelector('.vCant')?.value, 10) || 0;
            const selectedOption = select?.options?.[select.selectedIndex];
            if (select?.value && selectedOption) {
                const price = Number.parseFloat(selectedOption.dataset.price) || 0;
                const tax = Number.parseFloat(selectedOption.dataset.iva) || 0;
                subtotal += price * quantity;
                iva += (price * quantity * tax) / 100;
            }
        });

        setText('vtSubtotal', `$${fmtMoney(subtotal)}`);
        setText('vtIva', `$${fmtMoney(iva)}`);
        setText('vtTotal', `$${fmtMoney(subtotal + iva)}`);

        if (result.valid) {
            this.renderSummary(result.items);
        } else {
            setHtml('ventaSummaryItems', '<p class="summary-empty">Completa la seleccion de productos para ver el resumen.</p>');
        }
    },
    renderSummary(items) {
        const summary = items.map(item => {
            const producto = this.productos.find(candidate => candidate.codigoProducto === item.codigoProducto);
            if (!producto) {
                return '';
            }
            const subtotal = producto.precioVenta * item.cantidad;
            return `<div class="summary-item">
                <div>
                    <strong>${escapeHtml(producto.nombreProducto)}</strong>
                    <p>${item.cantidad} unidad(es) · IVA ${fmtMoney(producto.ivaCompra)}%</p>
                </div>
                <span>$${fmtMoney(subtotal)}</span>
            </div>`;
        }).join('');

        setHtml('ventaSummaryItems', summary || '<p class="summary-empty">Sin productos seleccionados.</p>');
    },
    prevStep() {
        if (this.step === 1) {
            return;
        }
        this.step -= 1;
        this.renderStep();
    },
    nextStep() {
        if (this.step === 1 && !readRawValue('ventaCliente')) {
            App.toast('Selecciona un cliente para continuar.', 'error');
            return;
        }

        if (this.step === 2) {
            const result = this.collectItems();
            if (!result.valid) {
                App.toast(result.message, 'error');
                return;
            }
            this.renderSummary(result.items);
        }

        if (this.step < 4) {
            this.step += 1;
            this.renderStep();
        }
    },
    renderStep() {
        document.querySelectorAll('.wizard-step').forEach(step => {
            step.classList.toggle('active', Number(step.dataset.step) === this.step);
        });
        document.querySelectorAll('.wizard-panel').forEach((panel, index) => {
            panel.classList.toggle('active', index + 1 === this.step);
        });
        setText('ventaConfirmCopy', this.step === 4
            ? `Confirma la venta para ${document.querySelector('#ventaCliente option:checked')?.textContent || 'el cliente seleccionado'}.`
            : 'Verifica los valores y confirma para registrar la venta.');
    },
    async crear(event) {
        event.preventDefault();
        if (this.step !== 4) {
            App.toast('Completa los pasos antes de registrar la venta.', 'error');
            return;
        }

        const result = this.collectItems();
        if (!result.valid) {
            App.toast(result.message, 'error');
            return;
        }

        try {
            const venta = await apiRequest('/ventas', {
                method: 'POST',
                body: {
                    cedulaCliente: Number.parseInt(readRawValue('ventaCliente'), 10),
                    cedulaUsuario: Number.parseInt(readRawValue('ventaVendedorId'), 10),
                    items: result.items
                }
            });
            App.toast(venta.mensaje || 'Venta registrada correctamente');
            this.showReceipt(venta);
            await this.init();
        } catch (error) {
            App.toast(getErrorMessage(error, 'No fue posible registrar la venta.'), 'error');
        }
    },
    showReceipt(venta) {
        const detalle = venta.detalles?.length
            ? `<div class="receipt-list">${venta.detalles.map(item => `
                    <div class="summary-item">
                        <div>
                            <strong>${escapeHtml(item.nombreProducto)}</strong>
                            <p>${item.cantidad} unidad(es)</p>
                        </div>
                        <span>$${fmtMoney(item.valorTotal)}</span>
                    </div>`).join('')}</div>`
            : '<p class="summary-empty">Sin detalle disponible.</p>';

        App.openModal(
            `Comprobante Venta #${venta.codigoVenta}`,
            `<div class="receipt-card">
                <p><strong>Cliente:</strong> ${escapeHtml(venta.nombreCliente)}</p>
                <p><strong>Vendedor:</strong> ${escapeHtml(venta.nombreUsuario)}</p>
                ${detalle}
                <div class="venta-totals">
                    <div class="total-row"><span>Subtotal</span><span>$${fmtMoney(venta.valorTotalVenta)}</span></div>
                    <div class="total-row"><span>IVA</span><span>$${fmtMoney(venta.valorIva)}</span></div>
                    <div class="total-row total-final"><span>Total</span><span>$${fmtMoney(venta.valorTotalConIva)}</span></div>
                </div>
            </div>`
        );
    }
};

Views.reportes = {
    async init() {
        await this.loadUsuarios();
    },
    showTab(id, button) {
        document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
        document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.remove('active'));

        button.classList.add('active');
        document.getElementById(id)?.classList.add('active');

        if (id === 'repUsuarios') {
            this.loadUsuarios();
        } else if (id === 'repClientes') {
            this.loadClientes();
        } else {
            this.loadVentas();
        }
    },
    async loadUsuarios() {
        try {
            const usuarios = await apiRequest('/reportes/usuarios');
            const activos = usuarios.filter(usuario => usuario.activo).length;
            setHtml('repUsrStats',
                statCard(usuarios.length, 'Total', 'var(--accent)') +
                statCard(activos, 'Activos', 'var(--green)') +
                statCard(usuarios.length - activos, 'Inactivos', 'var(--rose)'));
            setHtml('tbRepUsr',
                usuarios.length
                    ? usuarios.map(usuario => `<tr>
                        <td>${usuario.cedula}</td>
                        <td>${escapeHtml(usuario.nombreCompleto)}</td>
                        <td>${escapeHtml(usuario.correoElectronico)}</td>
                        <td>${escapeHtml(usuario.usuario)}</td>
                        <td><span class="badge ${usuario.activo ? 'badge-green' : 'badge-red'}">${usuario.activo ? 'Activo' : 'Inactivo'}</span></td>
                    </tr>`).join('')
                    : emptyRow(5, 'No hay usuarios registrados.'));
        } catch (error) {
            App.toast(getErrorMessage(error, 'No fue posible cargar el reporte de usuarios.'), 'error');
        }
    },
    async loadClientes() {
        try {
            const clientes = await apiRequest('/reportes/clientes');
            setHtml('repCliStats', statCard(clientes.length, 'Clientes', 'var(--cyan)'));
            setHtml('tbRepCli',
                clientes.length
                    ? clientes.map(cliente => `<tr>
                        <td>${cliente.cedula}</td>
                        <td>${escapeHtml(cliente.nombreCompleto)}</td>
                        <td>${escapeHtml(cliente.direccion)}</td>
                        <td>${escapeHtml(cliente.telefono)}</td>
                        <td>${escapeHtml(cliente.correoElectronico)}</td>
                    </tr>`).join('')
                    : emptyRow(5, 'No hay clientes registrados.'));
        } catch (error) {
            App.toast(getErrorMessage(error, 'No fue posible cargar el reporte de clientes.'), 'error');
        }
    },
    async loadVentas() {
        try {
            const reporte = await apiRequest('/reportes/ventas-por-cliente');
            const detalle = reporte.detalle || [];
            setHtml('tbRepVentas',
                detalle.length
                    ? detalle.map(item => `<tr>
                        <td>${item.cedulaCliente}</td>
                        <td>${escapeHtml(item.nombreCliente)}</td>
                        <td class="money">$${fmtMoney(item.totalCompras)}</td>
                    </tr>`).join('')
                    : emptyRow(3, 'Aun no hay informacion de ventas por cliente.'));
            const totalBar = document.getElementById('repTotalBar');
            if (totalBar) {
                totalBar.style.display = 'flex';
            }
            setText('repTotalConsolidado', `$${fmtMoney(reporte.totalConsolidado || 0)}`);
        } catch (error) {
            App.toast(getErrorMessage(error, 'No fue posible cargar el reporte de ventas.'), 'error');
        }
    }
};

Views.dashboard = {
    async init() {
        try {
            const [usuarios, clientes, productos, ventas] = await Promise.all([
                apiRequest('/usuarios'),
                apiRequest('/clientes'),
                apiRequest('/productos'),
                apiRequest('/ventas')
            ]);

            setHtml('dashStats',
                statCard(usuarios.length, 'Usuarios', 'var(--green)') +
                statCard(clientes.length, 'Clientes', 'var(--cyan)') +
                statCard(productos.length, 'Productos', 'var(--amber)') +
                statCard(ventas.length, 'Ventas', 'var(--rose)'));

            setHtml('dashVentas',
                ventas.length
                    ? ventas.slice(0, 10).map(venta => `<tr>
                        <td>${venta.codigoVenta}</td>
                        <td>${escapeHtml(venta.nombreCliente)}</td>
                        <td>${escapeHtml(venta.nombreUsuario)}</td>
                        <td class="money">$${fmtMoney(venta.valorTotalConIva)}</td>
                        <td>${fmtDateTime(venta.fechaVenta)}</td>
                    </tr>`).join('')
                    : emptyRow(5, 'No hay ventas registradas.'));
        } catch (error) {
            App.toast(getErrorMessage(error, 'No fue posible cargar el dashboard.'), 'error');
        }
    }
};

async function apiRequest(path, options = {}) {
    const { method = 'GET', body, headers = {}, auth = true } = options;
    const requestHeaders = new Headers(headers);
    const isFormData = body instanceof FormData;

    if (auth !== false && currentSession && App.isSessionExpired(currentSession)) {
        await App.logout('La sesion ha expirado. Vuelve a iniciar sesion.');
        throw { message: 'La sesion ha expirado.' };
    }

    if (auth !== false && currentSession?.token) {
        requestHeaders.set('Authorization', `${currentSession.tipoToken || 'Bearer'} ${currentSession.token}`);
    }

    if (!isFormData && body != null && !requestHeaders.has('Content-Type')) {
        requestHeaders.set('Content-Type', 'application/json');
    }

    const response = await fetch(`${API}${path}`, {
        method,
        headers: requestHeaders,
        body: body == null ? undefined : (isFormData ? body : JSON.stringify(body))
    });

    const payload = await parseResponse(response);
    if (response.status === 401 && auth !== false) {
        await App.logout(payload?.message || payload?.mensaje || 'La sesion ha expirado. Vuelve a iniciar sesion.');
        throw buildApiError(response, payload, 'La sesion ha expirado.');
    }

    if (!response.ok) {
        throw buildApiError(response, payload);
    }

    return payload;
}

async function parseResponse(response) {
    const text = await response.text();
    if (!text) {
        return null;
    }

    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
        try {
            return JSON.parse(text);
        } catch (error) {
            return { message: text };
        }
    }

    return { message: text };
}

function buildApiError(response, payload, fallbackMessage) {
    return {
        status: response.status,
        message: payload?.message || payload?.mensaje || fallbackMessage || 'No fue posible completar la operacion.',
        fieldErrors: payload?.fieldErrors || {}
    };
}

function getErrorMessage(error, fallback) {
    if (error?.fieldErrors && Object.keys(error.fieldErrors).length) {
        return Object.values(error.fieldErrors)[0];
    }
    return error?.message || fallback;
}

function showFormErrors(error) {
    if (!error?.fieldErrors) {
        return;
    }

    Object.entries(error.fieldErrors).forEach(([field]) => {
        App.markFieldError(field, true);
    });
}

function validateFields(fields) {
    for (const field of fields) {
        const input = document.getElementById(field.id);
        if (!input) {
            continue;
        }

        const rawValue = readRawValue(field.id);
        const value = field.trim === false ? rawValue : rawValue.trim();
        let message = '';

        input.setCustomValidity('');
        App.markFieldError(field.id, false);

        if (!value && field.allowBlank) {
            continue;
        }
        if (field.required && !value) {
            message = `${field.label} es obligatorio.`;
        } else if (field.type === 'positiveInt' && value && (!/^\d+$/.test(value) || Number(value) <= 0)) {
            message = `${field.label} debe ser un numero positivo.`;
        } else if (field.type === 'decimal' && value && (Number.isNaN(Number(value)) || Number(value) < (field.min ?? Number.NEGATIVE_INFINITY) || Number(value) > (field.max ?? Number.POSITIVE_INFINITY))) {
            message = `${field.label} esta fuera del rango permitido.`;
        } else if (field.type === 'email' && value && !EMAIL_REGEX.test(value)) {
            message = 'Ingresa un correo electronico valido.';
        } else if (field.pattern && value && !field.pattern.test(value)) {
            message = field.patternMessage || `${field.label} tiene un formato invalido.`;
        } else if (field.minLength && value.length < field.minLength) {
            message = `${field.label} debe tener al menos ${field.minLength} caracteres.`;
        } else if (field.maxLength && value.length > field.maxLength) {
            message = `${field.label} no puede superar ${field.maxLength} caracteres.`;
        }

        if (message) {
            input.setCustomValidity(message);
            App.markFieldError(field.id, true);
            input.reportValidity();
            return false;
        }
    }

    return true;
}

function fld(options) {
    const {
        id,
        label,
        type = 'text',
        value = '',
        disabled = false,
        required = true,
        step,
        min,
        max,
        maxLength,
        placeholder = '',
        autocomplete = 'off'
    } = options;

    const safeValue = escapeAttribute(value ?? '');
    return `<label for="${id}">${label}</label>
        <input
            class="form-control"
            type="${type}"
            id="${id}"
            value="${safeValue}"
            ${disabled ? 'disabled' : ''}
            ${required ? 'required' : ''}
            ${step != null ? `step="${step}"` : ''}
            ${min != null ? `min="${min}"` : ''}
            ${max != null ? `max="${max}"` : ''}
            ${maxLength != null ? `maxlength="${maxLength}"` : ''}
            ${placeholder ? `placeholder="${escapeAttribute(placeholder)}"` : ''}
            autocomplete="${autocomplete}">
    `;
}

function setText(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = value;
    }
}

function setHtml(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.innerHTML = value;
    }
}

function setValue(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.value = value;
    }
}

function readValue(id) {
    return readRawValue(id).trim();
}

function readRawValue(id) {
    return document.getElementById(id)?.value || '';
}

function toPositiveInt(id) {
    return Number.parseInt(readRawValue(id), 10);
}

function toDecimal(id) {
    return Number.parseFloat(readRawValue(id));
}

function fmtMoney(value) {
    return Number(value || 0).toLocaleString('es-CO', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function fmtDateTime(value) {
    if (!value) {
        return 'Sin fecha';
    }
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
        return value;
    }
    return parsed.toLocaleString('es-CO', {
        dateStyle: 'medium',
        timeStyle: 'short'
    });
}

function initials(value) {
    return String(value || '')
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map(part => part[0])
        .join('')
        .toUpperCase() || 'TG';
}

function statCard(number, label, color) {
    return `<div class="stat-card">
        <div class="stat-number" style="color:${color}">${number}</div>
        <div class="stat-label">${label}</div>
    </div>`;
}

function emptyRow(colspan, message) {
    return `<tr><td colspan="${colspan}" class="empty-cell">${message}</td></tr>`;
}

function serialize(value) {
    return JSON.stringify(value).replace(/"/g, '&quot;');
}

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function escapeAttribute(value) {
    return escapeHtml(value);
}

App.init();
