import ProductPicker from './ProductPicker';
import WeeklySales from './WeeklySales';
const STORE_NAME = import.meta.env.VITE_STORE_NAME?.trim() || 'Mostrador';
import {
  Fragment,
  startTransition,
  useDeferredValue,
  useEffect,
  useMemo,
  useState
} from 'react';
import { apiRequest } from './api';
import {
  clearStoredSession,
  createFormData,
  extractErrorMessage,
  formatCurrency,
  formatDateTime,
  formatNumber,
  getInitials,
  getServerFieldErrors,
  loadStoredSession,
  matchesQuery,
  persistSession,
  requireValue,
  validateEmail,
  validatePhone,
  validatePositiveDecimal,
  validatePositiveInteger,
  validateRange,
  validateUsername
} from './utils';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Resumen', eyebrow: 'Inicio' },
  { id: 'clientes', label: 'Clientes', eyebrow: 'Operación' },
  { id: 'ventas', label: 'Ventas', eyebrow: 'Operación' },
  { id: 'proveedores', label: 'Proveedores', eyebrow: 'Catálogo' },
  { id: 'productos', label: 'Productos', eyebrow: 'Catálogo' },
  { id: 'usuarios', label: 'Usuarios', eyebrow: 'Administración' },
  { id: 'reportes', label: 'Reportes', eyebrow: 'Analítica' }
];

const VIEW_TITLES = {
  dashboard: {
    title: 'Resumen operativo',
    subtitle: 'Consulta tus ventas y la actividad de tu tienda.'
  },
  clientes: {
    title: 'Gestión de clientes',
    subtitle: 'Base relacional lista para ventas, facturación y seguimiento.'
  },
  ventas: {
    title: 'Registro de ventas',
    subtitle: 'Añade productos y cantidades para calcular el total con IVA.'
  },
  proveedores: {
    title: 'Gestión de proveedores',
    subtitle: 'Mantén activo el ecosistema de abastecimiento del catálogo.'
  },
  productos: {
    title: 'Gestión de productos',
    subtitle: 'Administra el catálogo y actualiza lotes por CSV sin borrar historial.'
  },
  usuarios: {
    title: 'Gestión de usuarios',
    subtitle: 'Control de acceso, credenciales y estado operativo de las cuentas.'
  },
  reportes: {
    title: 'Reportes ejecutivos',
    subtitle: 'Consulta cortes rápidos sobre usuarios, clientes y ventas por cliente.'
  }
};

function ToastViewport({ toasts, onDismiss }) {
  return (
    <div className="toast-viewport" role="status" aria-live="polite">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast-card ${toast.tone}`}>
          <div>
            <strong>{toast.title}</strong>
            <p>{toast.message}</p>
          </div>
          <button
            type="button"
            className="toast-close"
            onClick={() => onDismiss(toast.id)}
            aria-label="Cerrar notificación"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

function Modal({ open, title, subtitle, onClose, children }) {
  if (!open) {
    return null;
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(event) => event.stopPropagation()}>
        <div className="modal-head">
          <div>
            <p className="eyebrow">Edición</p>
            <h3>{title}</h3>
            {subtitle ? <p className="modal-subtitle">{subtitle}</p> : null}
          </div>
          <button
            type="button"
            className="icon-button"
            onClick={onClose}
            aria-label="Cerrar modal"
          >
            ×
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

function StatusBadge({ active, trueLabel = 'Activo', falseLabel = 'Inactivo' }) {
  return (
    <span className={`status-badge ${active ? 'positive' : 'negative'}`}>
      {active ? trueLabel : falseLabel}
    </span>
  );
}

function FormField({ field, value, error, isEditing, onChange }) {
  const isDisabled = Boolean(isEditing && field.disabledOnEdit);
  const fieldValue = value ?? '';

  return (
    <label className="form-field">
      <span className="field-label">{field.label}</span>
      {field.type === 'select' ? (
        <select
          value={fieldValue}
          onChange={(event) => onChange(field.name, event.target.value)}
          disabled={isDisabled}
        >
          {(field.options || []).map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={field.type || 'text'}
          value={fieldValue}
          onChange={(event) => onChange(field.name, event.target.value)}
          disabled={isDisabled}
          placeholder={field.placeholder}
          min={field.min}
          max={field.max}
          step={field.step}
          autoComplete={field.autoComplete}
        />
      )}
      {field.helper ? <small className="field-helper">{field.helper}</small> : null}
      {error ? <small className="field-error">{error}</small> : null}
    </label>
  );
}

function SummaryTile({ label, value, note, tone = 'primary' }) {
  return (
    <article className={`summary-tile ${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      {note ? <small>{note}</small> : null}
    </article>
  );
}

function EmptyState({ title, description }) {
  return (
    <div className="empty-state">
      <strong>{title}</strong>
      <p>{description}</p>
    </div>
  );
}

function CrudSection({
  title,
  description,
  resourceLabel,
  endpoint,
  token,
  onUnauthorized,
  onTrace,
  onToast,
  idField,
  columns,
  searchableFields,
  formFields,
  initialForm,
  mapItemToForm,
  toPayload,
  validate,
  searchPlaceholder,
  emptyMessage,
  toolbarButtons = [],
  externalRefreshKey = 0
}) {
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editor, setEditor] = useState(null);
  const [refreshTick, setRefreshTick] = useState(0);
  const deferredQuery = useDeferredValue(query);

  useEffect(() => {
    let alive = true;

    async function loadItems() {
      setLoading(true);
      setError('');

      try {
        const { data } = await apiRequest(`/${endpoint}`, {
          token,
          onTrace,
          onUnauthorized
        });

        if (alive) {
          setItems(Array.isArray(data) ? data : []);
        }
      } catch (requestError) {
        if (alive) {
          setError(
            extractErrorMessage(
              requestError,
              `No fue posible cargar ${resourceLabel.toLowerCase()}.`
            )
          );
        }
      } finally {
        if (alive) {
          setLoading(false);
        }
      }
    }

    loadItems();

    return () => {
      alive = false;
    };
  }, [token, endpoint, externalRefreshKey, refreshTick]);

  const filteredItems = useMemo(
    () =>
      items.filter((item) =>
        matchesQuery(item, searchableFields, deferredQuery)
      ),
    [items, searchableFields, deferredQuery]
  );

  function reload() {
    setRefreshTick((current) => current + 1);
  }

  function openCreate() {
    setEditor({
      mode: 'create',
      form: initialForm(),
      errors: {},
      serverError: ''
    });
  }

  function openEdit(item) {
    setEditor({
      mode: 'edit',
      form: mapItemToForm(item),
      errors: {},
      serverError: ''
    });
  }

  function updateField(name, value) {
    setEditor((current) => ({
      ...current,
      form: {
        ...current.form,
        [name]: value
      },
      errors: {
        ...current.errors,
        [name]: ''
      }
    }));
  }

  async function handleDelete(item) {
    const identifier = item[idField];
    const confirmed = window.confirm(
      `¿Deseas eliminar ${resourceLabel.toLowerCase()} con identificador ${identifier}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      await apiRequest(`/${endpoint}/${identifier}`, {
        method: 'DELETE',
        token,
        onTrace,
        onUnauthorized
      });
      onToast(
        `${resourceLabel} eliminado`,
        'La operación se completó correctamente.',
        'success'
      );
      reload();
    } catch (requestError) {
      onToast(
        'No se pudo eliminar el registro',
        extractErrorMessage(
          requestError,
          `No fue posible eliminar ${resourceLabel.toLowerCase()}.`
        ),
        'error'
      );
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const isEditing = editor.mode === 'edit';
    const validationErrors = validate(editor.form, isEditing);

    if (Object.keys(validationErrors).length) {
      setEditor((current) => ({
        ...current,
        errors: validationErrors,
        serverError: ''
      }));
      return;
    }

    try {
      await apiRequest(
        isEditing
          ? `/${endpoint}/${editor.form[idField]}`
          : `/${endpoint}`,
        {
          method: isEditing ? 'PUT' : 'POST',
          body: toPayload(editor.form, isEditing),
          token,
          onTrace,
          onUnauthorized
        }
      );

      setEditor(null);
      onToast(
        `${resourceLabel} ${isEditing ? 'actualizado' : 'creado'}`,
        'Se guardaron los cambios.',
        'success'
      );
      reload();
    } catch (requestError) {
      setEditor((current) => ({
        ...current,
        errors: {
          ...current.errors,
          ...getServerFieldErrors(requestError)
        },
        serverError: extractErrorMessage(
          requestError,
          `No fue posible guardar ${resourceLabel.toLowerCase()}.`
        )
      }));
    }
  }

  return (
    <Fragment>
      <section className="panel">
        <div className="panel-head">
          <div>
            <p className="eyebrow">Módulo</p>
            <h2>{title}</h2>
            <p>{description}</p>
          </div>
          <div className="panel-actions">
            <input
              type="search"
              className="search-input"
              value={query}
              placeholder={searchPlaceholder}
              onChange={(event) => setQuery(event.target.value)}
            />
            {toolbarButtons.map((button) => (
              <button
                key={button.label}
                type="button"
                className={`button ${button.tone || 'ghost'}`}
                onClick={button.onClick}
              >
                {button.label}
              </button>
            ))}
            <button type="button" className="button primary" onClick={openCreate}>
              Nuevo {resourceLabel}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="loading-state">Cargando datos del módulo...</div>
        ) : error ? (
          <EmptyState
            title="No se pudo cargar la tabla"
            description={error}
          />
        ) : (
          <div className="table-shell">
            <table className="data-table">
              <thead>
                <tr>
                  {columns.map((column) => (
                    <th key={column.key}>{column.label}</th>
                  ))}
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.length ? (
                  filteredItems.map((item) => (
                    <tr key={item[idField]}>
                      {columns.map((column) => (
                        <td key={column.key}>
                          {column.render ? column.render(item) : item[column.key] ?? '--'}
                        </td>
                      ))}
                      <td>
                        <div className="inline-actions">
                          <button
                            type="button"
                            className="button ghost small"
                            onClick={() => openEdit(item)}
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            className="button danger small"
                            onClick={() => handleDelete(item)}
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={columns.length + 1}>
                      <EmptyState
                        title="Sin registros"
                        description={emptyMessage}
                      />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <Modal
        open={Boolean(editor)}
        title={
          editor?.mode === 'edit'
            ? `Editar ${resourceLabel}`
            : `Nuevo ${resourceLabel}`
        }
        subtitle="Completa los campos y guarda los cambios."
        onClose={() => setEditor(null)}
      >
        {editor ? (
          <form className="form-grid" onSubmit={handleSubmit}>
            {formFields.map((field) => (
              <FormField
                key={field.name}
                field={field}
                value={editor.form[field.name]}
                error={editor.errors[field.name]}
                isEditing={editor.mode === 'edit'}
                onChange={updateField}
              />
            ))}

            {editor.serverError ? (
              <div className="form-banner error">{editor.serverError}</div>
            ) : null}

            <div className="modal-actions">
              <button
                type="button"
                className="button ghost"
                onClick={() => setEditor(null)}
              >
                Cancelar
              </button>
              <button type="submit" className="button primary">
                {editor.mode === 'edit' ? 'Actualizar' : 'Guardar'}
              </button>
            </div>
          </form>
        ) : null}
      </Modal>
    </Fragment>
  );
}

function DashboardView({
  token,
  onTrace,
  onUnauthorized,
  onToast,
  onNavigate
}) {
  const [snapshot, setSnapshot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshTick, setRefreshTick] = useState(0);

  useEffect(() => {
    let alive = true;

    async function loadSnapshot() {
      setLoading(true);
      setError('');

      try {
        const [usuarios, clientes, proveedores, productos, ventas, ventasPorCliente] =
          await Promise.all([
            apiRequest('/usuarios', { token, onTrace, onUnauthorized }),
            apiRequest('/clientes', { token, onTrace, onUnauthorized }),
            apiRequest('/proveedores', { token, onTrace, onUnauthorized }),
            apiRequest('/productos', { token, onTrace, onUnauthorized }),
            apiRequest('/ventas', { token, onTrace, onUnauthorized }),
            apiRequest('/reportes/ventas-por-cliente', {
              token,
              onTrace,
              onUnauthorized
            })
          ]);

        if (!alive) {
          return;
        }

        setSnapshot({
          usuarios: usuarios.data,
          clientes: clientes.data,
          proveedores: proveedores.data,
          productos: productos.data,
          ventas: ventas.data,
          ventasPorCliente: ventasPorCliente.data
        });
      } catch (requestError) {
        if (alive) {
          setError(
            extractErrorMessage(
              requestError,
              'No fue posible cargar el resumen del tablero.'
            )
          );
        }
      } finally {
        if (alive) {
          setLoading(false);
        }
      }
    }

    loadSnapshot();

    return () => {
      alive = false;
    };
  }, [token, refreshTick]);

  const quickStats = snapshot
    ? [
        {
          label: 'Usuarios',
          value: snapshot.usuarios.length,
          note: `${snapshot.usuarios.filter((item) => item.activo).length} activos`,
          tone: 'primary'
        },
        {
          label: 'Clientes',
          value: snapshot.clientes.length,
          note: 'Base comercial disponible',
          tone: 'cyan'
        },
        {
          label: 'Proveedores',
          value: snapshot.proveedores.length,
          note: 'Alianzas de catálogo',
          tone: 'amber'
        },
        {
          label: 'Productos',
          value: snapshot.productos.length,
          note: 'Inventario lógico cargado',
          tone: 'primary'
        },
        {
          label: 'Ventas',
          value: snapshot.ventas.length,
          note: 'Transacciones registradas',
          tone: 'cyan'
        },
        {
          label: 'Consolidado',
          value: formatCurrency(snapshot.ventasPorCliente.totalConsolidado),
          note: 'Ventas agregadas por cliente',
          tone: 'amber'
        }
      ]
    : [];

  return (
    <div className="content-stack">
      <section className="hero-grid">
        <article className="hero-card">
          <h2>Punto de venta</h2>
          <p>Registra una compra o consulta el precio de un producto.</p>
          <div className="hero-actions">
            <button
              type="button"
              className="button primary"
              onClick={() => onNavigate('ventas')}
            >
              Registrar venta
            </button>
            <button
              type="button"
              className="button ghost"
              onClick={() => onNavigate('productos')}
            >
              Abrir catálogo
            </button>
            <button
              type="button"
              className="button ghost"
              onClick={() => setRefreshTick((current) => current + 1)}
            >
              Refrescar panel
            </button>
          </div>
        </article>

        {snapshot && !error && !loading && <WeeklySales sales={snapshot.ventas} />}
      </section>

      <section className="panel">
        <div className="panel-head compact">
          <div>
            <p className="eyebrow">Indicadores</p>
            <h3>Tu tienda en cifras</h3>
          </div>
        </div>
        {loading ? (
          <div className="loading-state">Cargando indicadores...</div>
        ) : error ? (
          <EmptyState title="Error de tablero" description={error} />
        ) : (
          <div className="summary-grid">
            {quickStats.map((item) => (
              <SummaryTile
                key={item.label}
                label={item.label}
                value={item.value}
                note={item.note}
                tone={item.tone}
              />
            ))}
          </div>
        )}
      </section>

      <section className="split-layout">
        <article className="panel">
          <div className="panel-head compact">
            <div>
              <p className="eyebrow">Acciones rápidas</p>
              <h3>Rutas frecuentes del equipo</h3>
            </div>
          </div>
          <div className="action-grid">
            <button
              type="button"
              className="action-card"
              onClick={() => onNavigate('clientes')}
            >
              <strong>Crear cliente</strong>
              <span>Abre el formulario de clientes y registra una nueva cuenta.</span>
            </button>
            <button
              type="button"
              className="action-card"
              onClick={() => onNavigate('usuarios')}
            >
              <strong>Activar usuarios</strong>
              <span>Administra accesos, estados y credenciales operativas.</span>
            </button>
            <button
              type="button"
              className="action-card"
              onClick={() => {
                onNavigate('productos');
                onToast(
                  'Carga por CSV disponible',
                  'En el módulo de productos encontrarás el botón para importar lotes.',
                  'warning'
                );
              }}
            >
              <strong>Importar catálogo</strong>
              <span>Sincroniza productos desde archivo CSV con actualización incremental.</span>
            </button>
          </div>
        </article>

        <article className="panel">
          <div className="panel-head compact">
            <div>
              <p className="eyebrow">Últimas ventas</p>
              <h3>Actividad reciente</h3>
            </div>
          </div>
          {snapshot?.ventas?.length ? (
            <div className="table-shell">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Cliente</th>
                    <th>Vendedor</th>
                    <th>Total + IVA</th>
                    <th>Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {snapshot.ventas.slice(0, 6).map((venta) => (
                    <tr key={venta.codigoVenta}>
                      <td>{venta.codigoVenta}</td>
                      <td>{venta.nombreCliente}</td>
                      <td>{venta.nombreUsuario}</td>
                      <td>{formatCurrency(venta.valorTotalConIva)}</td>
                      <td>{formatDateTime(venta.fechaVenta)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              title="Sin ventas recientes"
              description="Aún no hay transacciones registradas para poblar el tablero."
            />
          )}
        </article>
      </section>
    </div>
  );
}

function SalesView({
  token,
  session,
  onTrace,
  onUnauthorized,
  onToast
}) {
  const [catalog, setCatalog] = useState({
    clientes: [],
    productos: [],
    ventas: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    cedulaCliente: '',
    items: []
  });
  const [receipt, setReceipt] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [refreshTick, setRefreshTick] = useState(0);

  useEffect(() => {
    let alive = true;

    async function loadCatalog() {
      setLoading(true);
      setError('');

      try {
        const [clientes, productos, ventas] = await Promise.all([
          apiRequest('/clientes', { token, onTrace, onUnauthorized }),
          apiRequest('/productos', { token, onTrace, onUnauthorized }),
          apiRequest('/ventas', { token, onTrace, onUnauthorized })
        ]);

        if (!alive) {
          return;
        }

        setCatalog({
          clientes: clientes.data,
          productos: productos.data,
          ventas: ventas.data
        });
      } catch (requestError) {
        if (alive) {
          setError(
            extractErrorMessage(
              requestError,
              'No fue posible cargar el módulo de ventas.'
            )
          );
        }
      } finally {
        if (alive) {
          setLoading(false);
        }
      }
    }

    loadCatalog();

    return () => {
      alive = false;
    };
  }, [token, refreshTick]);

  const detailedItems = useMemo(
    () =>
      form.items.map((item) => {
        const product = catalog.productos.find(
          (candidate) => String(candidate.codigoProducto) === String(item.codigoProducto)
        );
        const quantity = Number(item.cantidad || 0);
        const subtotal = Number(product?.precioVenta || 0) * quantity;
        const iva = subtotal * (Number(product?.ivaCompra || 0) / 100);

        return {
          item,
          product,
          quantity,
          subtotal,
          iva
        };
      }),
    [catalog.productos, form.items]
  );

  const totals = useMemo(
    () =>
      detailedItems.reduce(
        (accumulator, line) => ({
          subtotal: accumulator.subtotal + line.subtotal,
          iva: accumulator.iva + line.iva
        }),
        { subtotal: 0, iva: 0 }
      ),
    [detailedItems]
  );

  function updateLine(index, key, value) {
    setForm((current) => ({
      ...current,
      items: current.items.map((line, lineIndex) =>
        lineIndex === index ? { ...line, [key]: value } : line
      )
    }));
  }

  function addProduct(code) {
    setForm(current => {
      const exists = current.items.some(line => line.codigoProducto === code);
      const items = exists
        ? current.items.map(line => line.codigoProducto === code
            ? { ...line, cantidad: String(Number(line.cantidad) + 1) }
            : line)
        : [...current.items, { codigoProducto: code, cantidad: '1' }];
      return { ...current, items };
    });
  }

  function removeLine(index) {
    setForm(current => ({
      ...current, items: current.items.filter((_, lineIndex) => lineIndex !== index)
    }));
  }
  function validateSale() {
    if (!form.cedulaCliente) {
      return 'Selecciona un cliente para registrar la venta.';
    }

    if (!form.items.length) {
      return 'Agrega al menos un producto.';
    }

    const selectedProducts = new Set();
    for (const line of form.items) {
      if (!line.codigoProducto) {
        return 'Selecciona un producto en cada fila.';
      }

      const quantity = Number(line.cantidad);
      if (!Number.isInteger(quantity) || quantity <= 0) {
        return 'La cantidad debe ser un entero positivo.';
      }

      if (selectedProducts.has(line.codigoProducto)) {
        return 'No puedes repetir el mismo producto dentro de la venta.';
      }

      selectedProducts.add(line.codigoProducto);
    }

    return '';
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const validationMessage = validateSale();

    if (validationMessage) {
      onToast('Venta incompleta', validationMessage, 'error');
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await apiRequest('/ventas', {
        method: 'POST',
        body: {
          cedulaCliente: Number(form.cedulaCliente),
          cedulaUsuario: Number(session.cedula),
          items: form.items.map((line) => ({
            codigoProducto: Number(line.codigoProducto),
            cantidad: Number(line.cantidad)
          }))
        },
        token,
        onTrace,
        onUnauthorized
      });

      setReceipt(data);
      setForm({
        cedulaCliente: '',
        items: []
      });
      setRefreshTick((current) => current + 1);
      onToast(
        'Venta registrada',
        data.mensaje || 'La operación quedó registrada correctamente.',
        'success'
      );
    } catch (requestError) {
      onToast(
        'No se pudo registrar la venta',
        extractErrorMessage(
          requestError,
          'Revisa los datos de la venta e intenta de nuevo.'
        ),
        'error'
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Fragment>
      <div className="sales-layout">
        <section className="panel sales-form-panel">
          <div className="panel-head">
            <div>
              <p className="eyebrow">Flujo comercial</p>
              <h2>Nueva venta</h2>
              <p>
                Selecciona el cliente y agrega los productos a su compra.
              </p>
            </div>
            <button
              type="button"
              className="button ghost"
              onClick={() => setRefreshTick((current) => current + 1)}
            >
              Refrescar datos
            </button>
          </div>

          {loading ? (
            <div className="loading-state">Cargando clientes, productos y ventas...</div>
          ) : error ? (
            <EmptyState title="Módulo no disponible" description={error} />
          ) : (
            <form className="sales-form" onSubmit={handleSubmit}>
              <div className="sales-identity">
                <label className="form-field">
                  <span className="field-label">Cliente</span>
                  <select
                    value={form.cedulaCliente}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        cedulaCliente: event.target.value
                      }))
                    }
                  >
                    <option value="">Seleccionar cliente...</option>
                    {catalog.clientes.map((cliente) => (
                      <option key={cliente.cedula} value={cliente.cedula}>
                        {cliente.nombreCompleto} ({cliente.cedula})
                      </option>
                    ))}
                  </select>
                </label>

                <label className="form-field">
                  <span className="field-label">Vendedor</span>
                  <input value={session.nombreCompleto} disabled />
                </label>
              </div>

              <div className="sales-lines">
                <ProductPicker products={catalog.productos} onAdd={addProduct} />
                <h3>Carrito</h3>
                {!form.items.length && <p>Selecciona un producto para empezar la venta.</p>}
                {detailedItems.map(({ item: line, product }, index) => (
                  <div key={line.codigoProducto} className="line-card">
                    <strong>{product?.nombreProducto || line.codigoProducto}</strong>
                    <label className="form-field narrow">
                      <span className="field-label">Cantidad</span>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={line.cantidad}
                        onChange={(event) =>
                          updateLine(index, 'cantidad', event.target.value)
                        }
                      />
                    </label>

                    <button
                      type="button"
                      className="button danger small"
                      onClick={() => removeLine(index)}
                    >
                      Quitar
                    </button>
                  </div>
                ))}
              </div>

              <div className="form-footer">
                <button type="submit" className="button primary" disabled={submitting}>
                  {submitting ? 'Registrando...' : 'Registrar venta · ' + formatCurrency(totals.subtotal + totals.iva)}
                </button>
              </div>
            </form>
          )}
        </section>

        <section className="panel sales-summary-panel">
          <div className="panel-head compact">
            <div>
              <p className="eyebrow">Resumen</p>
              <h3>Total de la venta</h3>
            </div>
          </div>

          <div className="summary-list">
            {detailedItems.some((line) => line.product) ? (
              detailedItems.map((line, index) =>
                line.product ? (
                  <div key={`${line.product.codigoProducto}-${index}`} className="summary-row">
                    <div>
                      <strong>{line.product.nombreProducto}</strong>
                      <p>
                        {line.quantity} unidad(es) · IVA {formatNumber(line.product.ivaCompra)}%
                      </p>
                    </div>
                    <span>{formatCurrency(line.subtotal + line.iva)}</span>
                  </div>
                ) : null
              )
            ) : (
              <EmptyState
                title="Sin productos elegidos"
                description="Selecciona productos para ver el cálculo de subtotal, IVA y total."
              />
            )}
          </div>

          <div className="totals-card">
            <div>
              <span>Subtotal</span>
              <strong>{formatCurrency(totals.subtotal)}</strong>
            </div>
            <div>
              <span>IVA</span>
              <strong>{formatCurrency(totals.iva)}</strong>
            </div>
            <div className="grand-total">
              <span>Total</span>
              <strong>{formatCurrency(totals.subtotal + totals.iva)}</strong>
            </div>
          </div>

          <div className="panel-head compact">
            <div>
              <p className="eyebrow">Historial</p>
              <h3>Ventas recientes</h3>
            </div>
          </div>

          {catalog.ventas.length ? (
            <div className="table-shell">
              <table className="data-table compact">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Cliente</th>
                    <th>Total + IVA</th>
                    <th>Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {catalog.ventas.slice(0, 6).map((venta) => (
                    <tr key={venta.codigoVenta}>
                      <td>{venta.codigoVenta}</td>
                      <td>{venta.nombreCliente}</td>
                      <td>{formatCurrency(venta.valorTotalConIva)}</td>
                      <td>{formatDateTime(venta.fechaVenta)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              title="Sin ventas registradas"
              description="El historial aparecerá aquí en cuanto se registren transacciones."
            />
          )}
        </section>
      </div>

      <Modal
        open={Boolean(receipt)}
        title={receipt ? `Comprobante #${receipt.codigoVenta}` : 'Comprobante'}
        subtitle="La venta quedó registrada y ya hace parte del resumen operativo."
        onClose={() => setReceipt(null)}
      >
        {receipt ? (
          <div className="receipt-grid">
            <div>
              <span>Cliente</span>
              <strong>{receipt.nombreCliente}</strong>
            </div>
            <div>
              <span>Vendedor</span>
              <strong>{receipt.nombreUsuario}</strong>
            </div>
            <div className="receipt-lines">
              {(receipt.detalles || []).map((item) => (
                <div key={`${item.codigoProducto}-${item.cantidad}`} className="summary-row">
                  <div>
                    <strong>{item.nombreProducto}</strong>
                    <p>{item.cantidad} unidad(es)</p>
                  </div>
                  <span>{formatCurrency(item.valorTotal)}</span>
                </div>
              ))}
            </div>
            <div className="totals-card">
              <div>
                <span>Subtotal</span>
                <strong>{formatCurrency(receipt.valorTotalVenta)}</strong>
              </div>
              <div>
                <span>IVA</span>
                <strong>{formatCurrency(receipt.valorIva)}</strong>
              </div>
              <div className="grand-total">
                <span>Total</span>
                <strong>{formatCurrency(receipt.valorTotalConIva)}</strong>
              </div>
            </div>
          </div>
        ) : null}
      </Modal>
    </Fragment>
  );
}

function ReportsView({ token, onTrace, onUnauthorized }) {
  const [activeTab, setActiveTab] = useState('usuarios');
  const [report, setReport] = useState({
    usuarios: [],
    clientes: [],
    ventasPorCliente: {
      detalle: [],
      totalConsolidado: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshTick, setRefreshTick] = useState(0);

  useEffect(() => {
    let alive = true;

    async function loadReports() {
      setLoading(true);
      setError('');

      try {
        const [usuarios, clientes, ventasPorCliente] = await Promise.all([
          apiRequest('/reportes/usuarios', { token, onTrace, onUnauthorized }),
          apiRequest('/reportes/clientes', { token, onTrace, onUnauthorized }),
          apiRequest('/reportes/ventas-por-cliente', {
            token,
            onTrace,
            onUnauthorized
          })
        ]);

        if (!alive) {
          return;
        }

        setReport({
          usuarios: usuarios.data,
          clientes: clientes.data,
          ventasPorCliente: ventasPorCliente.data
        });
      } catch (requestError) {
        if (alive) {
          setError(
            extractErrorMessage(
              requestError,
              'No fue posible cargar los reportes administrativos.'
            )
          );
        }
      } finally {
        if (alive) {
          setLoading(false);
        }
      }
    }

    loadReports();

    return () => {
      alive = false;
    };
  }, [token, refreshTick]);

  return (
    <section className="panel">
      <div className="panel-head">
        <div>
          <p className="eyebrow">Analítica</p>
          <h2>Informes de la tienda</h2>
          <p>
            Consulta el directorio de clientes, el equipo y los importes vendidos por cliente.
          </p>
        </div>
        <button
          type="button"
          className="button ghost"
          onClick={() => setRefreshTick((current) => current + 1)}
        >
          Refrescar reportes
        </button>
      </div>

      <div className="tab-row">
        <button
          type="button"
          className={`tab-button ${activeTab === 'usuarios' ? 'active' : ''}`}
          onClick={() => setActiveTab('usuarios')}
        >
          Usuarios
        </button>
        <button
          type="button"
          className={`tab-button ${activeTab === 'clientes' ? 'active' : ''}`}
          onClick={() => setActiveTab('clientes')}
        >
          Clientes
        </button>
        <button
          type="button"
          className={`tab-button ${activeTab === 'ventas' ? 'active' : ''}`}
          onClick={() => setActiveTab('ventas')}
        >
          Ventas por cliente
        </button>
      </div>

      {loading ? (
        <div className="loading-state">Cargando informes...</div>
      ) : error ? (
        <EmptyState title="Reportes no disponibles" description={error} />
      ) : activeTab === 'usuarios' ? (
        <Fragment>
          <div className="summary-grid">
            <SummaryTile
              label="Usuarios"
              value={report.usuarios.length}
              note="Registros disponibles"
            />
            <SummaryTile
              label="Activos"
              value={report.usuarios.filter((item) => item.activo).length}
              note="Cuentas operativas"
              tone="cyan"
            />
            <SummaryTile
              label="Inactivos"
              value={report.usuarios.filter((item) => !item.activo).length}
              note="Cuentas pausadas"
              tone="amber"
            />
          </div>

          <div className="table-shell">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Cédula</th>
                  <th>Nombre</th>
                  <th>Correo</th>
                  <th>Usuario</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {report.usuarios.map((usuario) => (
                  <tr key={usuario.cedula}>
                    <td>{usuario.cedula}</td>
                    <td>{usuario.nombreCompleto}</td>
                    <td>{usuario.correoElectronico}</td>
                    <td>{usuario.usuario}</td>
                    <td>
                      <StatusBadge active={usuario.activo} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Fragment>
      ) : activeTab === 'clientes' ? (
        <Fragment>
          <div className="summary-grid">
            <SummaryTile
              label="Clientes"
              value={report.clientes.length}
              note="Base comercial sincronizada"
            />
          </div>

          <div className="table-shell">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Cédula</th>
                  <th>Nombre</th>
                  <th>Dirección</th>
                  <th>Teléfono</th>
                  <th>Correo</th>
                </tr>
              </thead>
              <tbody>
                {report.clientes.map((cliente) => (
                  <tr key={cliente.cedula}>
                    <td>{cliente.cedula}</td>
                    <td>{cliente.nombreCompleto}</td>
                    <td>{cliente.direccion}</td>
                    <td>{cliente.telefono}</td>
                    <td>{cliente.correoElectronico}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Fragment>
      ) : (
        <Fragment>
          <div className="summary-grid">
            <SummaryTile
              label="Clientes con ventas"
              value={report.ventasPorCliente.detalle.length}
              note="Consolidado por cliente"
            />
            <SummaryTile
              label="Total consolidado"
              value={formatCurrency(report.ventasPorCliente.totalConsolidado)}
              note="Suma total del reporte"
              tone="amber"
            />
          </div>

          <div className="table-shell">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Cédula</th>
                  <th>Nombre cliente</th>
                  <th>Total compras</th>
                </tr>
              </thead>
              <tbody>
                {report.ventasPorCliente.detalle.map((item) => (
                  <tr key={item.cedulaCliente}>
                    <td>{item.cedulaCliente}</td>
                    <td>{item.nombreCliente}</td>
                    <td>{formatCurrency(item.totalCompras)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Fragment>
      )}
    </section>
  );
}

function ProductsView(props) {
  const [csvOpen, setCsvOpen] = useState(false);
  const [csvFile, setCsvFile] = useState(null);
  const [csvError, setCsvError] = useState('');
  const [csvUploading, setCsvUploading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  async function handleCsvSubmit(event) {
    event.preventDefault();

    if (!csvFile) {
      setCsvError('Selecciona un archivo CSV antes de continuar.');
      return;
    }

    if (!csvFile.name.toLowerCase().endsWith('.csv')) {
      setCsvError('El archivo debe tener extensión .csv.');
      return;
    }

    setCsvUploading(true);
    setCsvError('');

    try {
      const { data } = await apiRequest('/productos/cargar-csv', {
        method: 'POST',
        body: createFormData(csvFile),
        token: props.token,
        onTrace: props.onTrace,
        onUnauthorized: props.onUnauthorized
      });

      props.onToast(
        'Catálogo actualizado',
        `Se procesaron ${Array.isArray(data) ? data.length : 0} productos desde el CSV.`,
        'success'
      );
      setCsvOpen(false);
      setCsvFile(null);
      setRefreshKey((current) => current + 1);
    } catch (requestError) {
      setCsvError(
        extractErrorMessage(
          requestError,
          'No fue posible procesar el archivo CSV.'
        )
      );
    } finally {
      setCsvUploading(false);
    }
  }

  return (
    <Fragment>
      <CrudSection
        {...props}
        title="Catálogo comercial"
        description="Crea, edita y revisa productos con precio de compra, IVA y precio de venta."
        resourceLabel="Producto"
        endpoint="productos"
        idField="codigoProducto"
        searchPlaceholder="Buscar por código, nombre o proveedor..."
        searchableFields={[
          'codigoProducto',
          'nombreProducto',
          'nombreProveedor',
          'nitProveedor'
        ]}
        columns={[
          { key: 'codigoProducto', label: 'Código' },
          { key: 'nombreProducto', label: 'Nombre' },
          { key: 'nombreProveedor', label: 'Proveedor' },
          {
            key: 'precioCompra',
            label: 'P. compra',
            render: (item) => formatCurrency(item.precioCompra)
          },
          {
            key: 'ivaCompra',
            label: 'IVA %',
            render: (item) => `${formatNumber(item.ivaCompra)}%`
          },
          {
            key: 'precioVenta',
            label: 'P. venta',
            render: (item) => formatCurrency(item.precioVenta)
          }
        ]}
        formFields={[
          {
            name: 'codigoProducto',
            label: 'Código',
            type: 'number',
            min: 1,
            step: 1,
            disabledOnEdit: true
          },
          { name: 'nombreProducto', label: 'Nombre', placeholder: 'Portátil 15"' },
          {
            name: 'nitProveedor',
            label: 'NIT proveedor',
            type: 'number',
            min: 1,
            step: 1
          },
          {
            name: 'precioCompra',
            label: 'Precio compra',
            type: 'number',
            min: 0.01,
            step: 0.01
          },
          {
            name: 'ivaCompra',
            label: 'IVA (%)',
            type: 'number',
            min: 0,
            max: 100,
            step: 0.01
          },
          {
            name: 'precioVenta',
            label: 'Precio venta',
            type: 'number',
            min: 0.01,
            step: 0.01
          }
        ]}
        initialForm={() => ({
          codigoProducto: '',
          nombreProducto: '',
          nitProveedor: '',
          precioCompra: '',
          ivaCompra: '',
          precioVenta: ''
        })}
        mapItemToForm={(item) => ({
          codigoProducto: String(item.codigoProducto),
          nombreProducto: item.nombreProducto || '',
          nitProveedor: String(item.nitProveedor || ''),
          precioCompra: String(item.precioCompra || ''),
          ivaCompra: String(item.ivaCompra || ''),
          precioVenta: String(item.precioVenta || '')
        })}
        toPayload={(form) => ({
          codigoProducto: Number(form.codigoProducto),
          nombreProducto: form.nombreProducto.trim(),
          nitProveedor: Number(form.nitProveedor),
          precioCompra: Number(form.precioCompra),
          ivaCompra: Number(form.ivaCompra),
          precioVenta: Number(form.precioVenta)
        })}
        validate={(form) => {
          const errors = {};

          errors.codigoProducto = validatePositiveInteger(
            form.codigoProducto,
            'Ingresa un código válido.'
          );
          errors.nombreProducto = requireValue(
            form.nombreProducto,
            'El nombre es obligatorio.'
          );
          errors.nitProveedor = validatePositiveInteger(
            form.nitProveedor,
            'Ingresa el NIT del proveedor.'
          );
          errors.precioCompra = validatePositiveDecimal(
            form.precioCompra,
            'El precio de compra debe ser mayor que cero.'
          );
          errors.ivaCompra =
            requireValue(form.ivaCompra, 'El IVA es obligatorio.') ||
            validateRange(form.ivaCompra, 0, 100, 'El IVA debe estar entre 0 y 100.');
          errors.precioVenta = validatePositiveDecimal(
            form.precioVenta,
            'El precio de venta debe ser mayor que cero.'
          );

          if (
            !errors.precioCompra &&
            !errors.precioVenta &&
            Number(form.precioVenta) < Number(form.precioCompra)
          ) {
            errors.precioVenta =
              'El precio de venta no puede ser menor que el precio de compra.';
          }

          return Object.fromEntries(
            Object.entries(errors).filter(([, value]) => value)
          );
        }}
        emptyMessage="Aún no existen productos en el catálogo."
        toolbarButtons={[
          {
            label: 'Cargar CSV',
            tone: 'ghost',
            onClick: () => setCsvOpen(true)
          }
        ]}
        externalRefreshKey={refreshKey}
      />

      <Modal
        open={csvOpen}
        title="Carga masiva de productos"
        subtitle="Columnas esperadas: codigoProducto, nombreProducto, nitProveedor, precioCompra, ivaCompra, precioVenta."
        onClose={() => {
          setCsvOpen(false);
          setCsvError('');
          setCsvFile(null);
        }}
      >
        <form className="form-grid" onSubmit={handleCsvSubmit}>
          <label className="form-field">
            <span className="field-label">Archivo CSV</span>
            <input
              type="file"
              accept=".csv"
              onChange={(event) => setCsvFile(event.target.files?.[0] || null)}
            />
            <small className="field-helper">
              Los códigos existentes se actualizan; los nuevos se agregan.
            </small>
          </label>

          {csvError ? <div className="form-banner error">{csvError}</div> : null}

          <div className="modal-actions">
            <button
              type="button"
              className="button ghost"
              onClick={() => setCsvOpen(false)}
            >
              Cancelar
            </button>
            <button type="submit" className="button primary" disabled={csvUploading}>
              {csvUploading ? 'Procesando...' : 'Importar CSV'}
            </button>
          </div>
        </form>
      </Modal>
    </Fragment>
  );
}

function LoginScreen({ onLogin, onTrace, onUnauthorized }) {
  const [credentials, setCredentials] = useState({
    usuario: '',
    contrasena: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    const usernameError = validateUsername(
      credentials.usuario,
      'Ingresa un usuario válido.'
    );
    const passwordError = requireValue(
      credentials.contrasena,
      'La contraseña es obligatoria.'
    );

    if (usernameError || passwordError) {
      setError(usernameError || passwordError);
      return;
    }

    setLoading(true);
    try {
      const { data } = await apiRequest('/auth/login', {
        method: 'POST',
        body: credentials,
        onTrace,
        onUnauthorized
      });
      onLogin(data);
    } catch (requestError) {
      setError(
        extractErrorMessage(
          requestError,
          'No fue posible iniciar sesión con las credenciales suministradas.'
        )
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-shell">
      <section className="login-hero">
        <p className="eyebrow">Gestión comercial</p>
        <h1>{STORE_NAME}</h1>
        <p>Ventas, clientes y catálogo en un solo lugar.</p>
        <WeeklySales sample />
      </section>

      <section className="login-card">
        <div className="login-card-glow" />
        <p className="eyebrow">Acceso seguro</p>
        <h2>Iniciar sesión</h2>
        {import.meta.env.VITE_PORTFOLIO_DEMO === 'true' ? (
          <div>
            <p>Explora la tienda con datos ficticios. Los cambios son visibles para quienes prueben la demo.</p>
            <button type="button" className="button ghost"
              onClick={() => setCredentials({ usuario: 'demo.caja', contrasena: 'MostradorDemo26!' })}>
              Usar cuenta de prueba
            </button>
          </div>
        ) : <p>Usa tus credenciales para entrar al panel operativo y a los reportes.</p>}

        <form className="form-grid" onSubmit={handleSubmit}>
          <label className="form-field">
            <span className="field-label">Usuario</span>
            <input
              value={credentials.usuario}
              autoComplete="username"
              onChange={(event) =>
                setCredentials((current) => ({
                  ...current,
                  usuario: event.target.value
                }))
              }
              placeholder="Tu usuario"
            />
          </label>

          <label className="form-field">
            <span className="field-label">Contraseña</span>
            <div className="password-row">
              <input
                type={showPassword ? 'text' : 'password'}
                value={credentials.contrasena}
                autoComplete="current-password"
                onChange={(event) =>
                  setCredentials((current) => ({
                    ...current,
                    contrasena: event.target.value
                  }))
                }
                placeholder="Mínimo 8 caracteres"
              />
              <button
                type="button"
                className="button ghost small"
                onClick={() => setShowPassword((current) => !current)}
              >
                {showPassword ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>
          </label>

          {error ? <div className="form-banner error">{error}</div> : null}

          <button type="submit" className="button primary wide" disabled={loading}>
            {loading ? 'Verificando...' : 'Ingresar'}
          </button>
        </form>
      </section>
    </div>
  );
}

export default function App() {
  const [session, setSession] = useState(() => loadStoredSession());
  const [currentView, setCurrentView] = useState('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth > 980) {
        setMobileSidebarOpen(false);
      }
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  function dismissToast(id) {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }

  function showToast(title, message, tone = 'success') {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((current) => [...current, { id, title, message, tone }]);
    window.setTimeout(() => {
      dismissToast(id);
    }, 3600);
  }

  function handleUnauthorized() {
    clearStoredSession();
    setSession(null);
    setCurrentView('dashboard');
    showToast(
      'Sesión expirada',
      'Tu token ya no es válido. Inicia sesión de nuevo para continuar.',
      'warning'
    );
  }

  function handleLogin(nextSession) {
    persistSession(nextSession);
    setSession(nextSession);
    startTransition(() => setCurrentView('dashboard'));
    showToast(
      'Sesión iniciada',
      nextSession.mensaje || 'Accediste correctamente al panel.',
      'success'
    );
  }

  function handleLogout() {
    clearStoredSession();
    setSession(null);
    setCurrentView('dashboard');
    setMobileSidebarOpen(false);
  }

  function navigateTo(view) {
    startTransition(() => setCurrentView(view));
    setMobileSidebarOpen(false);
  }

  const currentMeta = VIEW_TITLES[currentView];

  if (!session) {
    return (
      <Fragment>
        <LoginScreen
          onLogin={handleLogin}
          onUnauthorized={handleUnauthorized}
        />
        <ToastViewport toasts={toasts} onDismiss={dismissToast} />
      </Fragment>
    );
  }

  return (
    <Fragment>
      <div className="app-shell">
        <div
          className={`sidebar-backdrop ${mobileSidebarOpen ? 'visible' : ''}`}
          onClick={() => setMobileSidebarOpen(false)}
        />

        <aside className={`sidebar ${mobileSidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-brand">
            <div className="brand-mark">{getInitials(STORE_NAME)}</div>
            <div>
              <strong>{STORE_NAME}</strong>
              <small>Gestión comercial</small>
            </div>
          </div>

          <nav className="sidebar-nav">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`nav-pill ${item.id === currentView ? 'active' : ''}`}
                onClick={() => navigateTo(item.id)}
              >
                <span>{item.eyebrow}</span>
                <strong>{item.label}</strong>
              </button>
            ))}
          </nav>

          <div className="sidebar-user">
            <div className="avatar-ring">{getInitials(session.nombreCompleto)}</div>
            <div>
              <strong>{session.nombreCompleto}</strong>
              <small>{session.usuario}</small>
              <small>Expira: {formatDateTime(session.expiraEn)}</small>
            </div>
          </div>

          <button type="button" className="button ghost wide" onClick={handleLogout}>
            Cerrar sesión
          </button>
        </aside>

        <main className="main-stage">
          <header className="topbar">
            <div className="topbar-title">
              <button
                type="button"
                className="icon-button mobile-only"
                onClick={() => setMobileSidebarOpen(true)}
                aria-label="Abrir menú"
              >
                ☰
              </button>
              <div>
                <p className="eyebrow">Panel operativo</p>
                <h1>{currentMeta.title}</h1>
                <p>{currentMeta.subtitle}</p>
              </div>
            </div>

            
          </header>

          {currentView === 'dashboard' ? (
            <DashboardView
              token={session.token}
              onUnauthorized={handleUnauthorized}
              onToast={showToast}
              onNavigate={navigateTo}
            />
          ) : null}

          {currentView === 'proveedores' ? (
            <CrudSection
              title="Proveedores activos"
              description="Administra el NIT, contacto y ciudad de los proveedores del negocio."
              resourceLabel="Proveedor"
              endpoint="proveedores"
              token={session.token}
              onUnauthorized={handleUnauthorized}
              onToast={showToast}
              idField="nit"
              searchPlaceholder="Buscar por NIT, nombre o ciudad..."
              searchableFields={['nit', 'nombreProveedor', 'ciudad']}
              columns={[
                { key: 'nit', label: 'NIT' },
                { key: 'nombreProveedor', label: 'Nombre' },
                { key: 'direccion', label: 'Dirección' },
                { key: 'telefono', label: 'Teléfono' },
                { key: 'ciudad', label: 'Ciudad' }
              ]}
              formFields={[
                {
                  name: 'nit',
                  label: 'NIT',
                  type: 'number',
                  min: 1,
                  step: 1,
                  disabledOnEdit: true
                },
                { name: 'nombreProveedor', label: 'Nombre' },
                { name: 'direccion', label: 'Dirección' },
                { name: 'telefono', label: 'Teléfono' },
                { name: 'ciudad', label: 'Ciudad' }
              ]}
              initialForm={() => ({
                nit: '',
                nombreProveedor: '',
                direccion: '',
                telefono: '',
                ciudad: ''
              })}
              mapItemToForm={(item) => ({
                nit: String(item.nit),
                nombreProveedor: item.nombreProveedor || '',
                direccion: item.direccion || '',
                telefono: item.telefono || '',
                ciudad: item.ciudad || ''
              })}
              toPayload={(form) => ({
                nit: Number(form.nit),
                nombreProveedor: form.nombreProveedor.trim(),
                direccion: form.direccion.trim(),
                telefono: form.telefono.trim(),
                ciudad: form.ciudad.trim()
              })}
              validate={(form) => {
                const errors = {
                  nit: validatePositiveInteger(form.nit, 'Ingresa un NIT válido.'),
                  nombreProveedor: requireValue(
                    form.nombreProveedor,
                    'El nombre del proveedor es obligatorio.'
                  ),
                  direccion: requireValue(
                    form.direccion,
                    'La dirección es obligatoria.'
                  ),
                  telefono: validatePhone(
                    form.telefono,
                    'Ingresa un teléfono válido.'
                  ),
                  ciudad: requireValue(form.ciudad, 'La ciudad es obligatoria.')
                };

                return Object.fromEntries(
                  Object.entries(errors).filter(([, value]) => value)
                );
              }}
              emptyMessage="Todavía no hay proveedores registrados."
            />
          ) : null}

          {currentView === 'clientes' ? (
            <CrudSection
              title="Clientes del sistema"
              description="Gestiona datos maestros para ventas y trazabilidad comercial."
              resourceLabel="Cliente"
              endpoint="clientes"
              token={session.token}
              onUnauthorized={handleUnauthorized}
              onToast={showToast}
              idField="cedula"
              searchPlaceholder="Buscar por cédula, nombre o correo..."
              searchableFields={['cedula', 'nombreCompleto', 'correoElectronico']}
              columns={[
                { key: 'cedula', label: 'Cédula' },
                { key: 'nombreCompleto', label: 'Nombre' },
                { key: 'direccion', label: 'Dirección' },
                { key: 'telefono', label: 'Teléfono' },
                { key: 'correoElectronico', label: 'Correo' }
              ]}
              formFields={[
                {
                  name: 'cedula',
                  label: 'Cédula',
                  type: 'number',
                  min: 1,
                  step: 1,
                  disabledOnEdit: true
                },
                { name: 'nombreCompleto', label: 'Nombre completo' },
                { name: 'direccion', label: 'Dirección' },
                { name: 'telefono', label: 'Teléfono' },
                { name: 'correoElectronico', label: 'Correo', type: 'email' }
              ]}
              initialForm={() => ({
                cedula: '',
                nombreCompleto: '',
                direccion: '',
                telefono: '',
                correoElectronico: ''
              })}
              mapItemToForm={(item) => ({
                cedula: String(item.cedula),
                nombreCompleto: item.nombreCompleto || '',
                direccion: item.direccion || '',
                telefono: item.telefono || '',
                correoElectronico: item.correoElectronico || ''
              })}
              toPayload={(form) => ({
                cedula: Number(form.cedula),
                nombreCompleto: form.nombreCompleto.trim(),
                direccion: form.direccion.trim(),
                telefono: form.telefono.trim(),
                correoElectronico: form.correoElectronico.trim().toLowerCase()
              })}
              validate={(form) => {
                const errors = {
                  cedula: validatePositiveInteger(
                    form.cedula,
                    'Ingresa una cédula válida.'
                  ),
                  nombreCompleto: requireValue(
                    form.nombreCompleto,
                    'El nombre completo es obligatorio.'
                  ),
                  direccion: requireValue(
                    form.direccion,
                    'La dirección es obligatoria.'
                  ),
                  telefono: validatePhone(
                    form.telefono,
                    'Ingresa un teléfono válido.'
                  ),
                  correoElectronico:
                    requireValue(
                      form.correoElectronico,
                      'El correo es obligatorio.'
                    ) ||
                    validateEmail(
                      form.correoElectronico,
                      'Ingresa un correo válido.'
                    )
                };

                return Object.fromEntries(
                  Object.entries(errors).filter(([, value]) => value)
                );
              }}
              emptyMessage="Todavía no hay clientes registrados."
            />
          ) : null}

          {currentView === 'usuarios' ? (
            <CrudSection
              title="Usuarios y accesos"
              description="Controla nombre, correo, alias de ingreso y estado de cada cuenta."
              resourceLabel="Usuario"
              endpoint="usuarios"
              token={session.token}
              onUnauthorized={handleUnauthorized}
              onToast={showToast}
              idField="cedula"
              searchPlaceholder="Buscar por cédula, usuario o correo..."
              searchableFields={[
                'cedula',
                'nombreCompleto',
                'correoElectronico',
                'usuario'
              ]}
              columns={[
                { key: 'cedula', label: 'Cédula' },
                { key: 'nombreCompleto', label: 'Nombre' },
                { key: 'correoElectronico', label: 'Correo' },
                { key: 'usuario', label: 'Usuario' },
                {
                  key: 'activo',
                  label: 'Estado',
                  render: (item) => <StatusBadge active={item.activo} />
                }
              ]}
              formFields={[
                {
                  name: 'cedula',
                  label: 'Cédula',
                  type: 'number',
                  min: 1,
                  step: 1,
                  disabledOnEdit: true
                },
                { name: 'nombreCompleto', label: 'Nombre completo' },
                { name: 'correoElectronico', label: 'Correo', type: 'email' },
                {
                  name: 'usuario',
                  label: 'Usuario',
                  helper: '4 a 60 caracteres: letras, números, punto, guion o guion bajo.'
                },
                {
                  name: 'contrasena',
                  label: 'Contraseña',
                  type: 'password',
                  helper: 'Déjala vacía al editar para conservar la clave actual.'
                },
                {
                  name: 'activo',
                  label: 'Estado',
                  type: 'select',
                  options: [
                    { value: 'true', label: 'Activo' },
                    { value: 'false', label: 'Inactivo' }
                  ]
                }
              ]}
              initialForm={() => ({
                cedula: '',
                nombreCompleto: '',
                correoElectronico: '',
                usuario: '',
                contrasena: '',
                activo: 'true'
              })}
              mapItemToForm={(item) => ({
                cedula: String(item.cedula),
                nombreCompleto: item.nombreCompleto || '',
                correoElectronico: item.correoElectronico || '',
                usuario: item.usuario || '',
                contrasena: '',
                activo: String(item.activo)
              })}
              toPayload={(form, isEditing) => {
                const payload = {
                  cedula: Number(form.cedula),
                  nombreCompleto: form.nombreCompleto.trim(),
                  correoElectronico: form.correoElectronico.trim().toLowerCase(),
                  usuario: form.usuario.trim().toLowerCase(),
                  activo: form.activo === 'true'
                };

                if (!isEditing || form.contrasena.trim()) {
                  payload.contrasena = form.contrasena;
                }

                return payload;
              }}
              validate={(form, isEditing) => {
                const errors = {
                  cedula: validatePositiveInteger(
                    form.cedula,
                    'Ingresa una cédula válida.'
                  ),
                  nombreCompleto: requireValue(
                    form.nombreCompleto,
                    'El nombre es obligatorio.'
                  ),
                  correoElectronico:
                    requireValue(
                      form.correoElectronico,
                      'El correo es obligatorio.'
                    ) ||
                    validateEmail(
                      form.correoElectronico,
                      'Ingresa un correo válido.'
                    ),
                  usuario:
                    requireValue(form.usuario, 'El usuario es obligatorio.') ||
                    validateUsername(
                      form.usuario,
                      'Ingresa un usuario válido.'
                    )
                };

                if (!isEditing || form.contrasena.trim()) {
                  errors.contrasena =
                    requireValue(
                      form.contrasena,
                      'La contraseña es obligatoria.'
                    ) ||
                    (form.contrasena.length >= 8
                      ? ''
                      : 'La contraseña debe tener al menos 8 caracteres.');
                }

                return Object.fromEntries(
                  Object.entries(errors).filter(([, value]) => value)
                );
              }}
              emptyMessage="Todavía no hay usuarios registrados."
            />
          ) : null}

          {currentView === 'productos' ? (
            <ProductsView
              token={session.token}
              onUnauthorized={handleUnauthorized}
              onToast={showToast}
            />
          ) : null}

          {currentView === 'ventas' ? (
            <SalesView
              token={session.token}
              session={session}
              onUnauthorized={handleUnauthorized}
              onToast={showToast}
            />
          ) : null}

          {currentView === 'reportes' ? (
            <ReportsView
              token={session.token}
              onUnauthorized={handleUnauthorized}
            />
          ) : null}
        </main>
      </div>

      <ToastViewport toasts={toasts} onDismiss={dismissToast} />
    </Fragment>
  );
}
