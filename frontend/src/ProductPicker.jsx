import { useState } from 'react';
import { formatCurrency, matchesQuery } from './utils';

export default function ProductPicker({ products, onAdd }) {
  const [query, setQuery] = useState('');
  const results = products.filter(product =>
    matchesQuery(product, ['nombreProducto', 'codigoProducto'], query)
  );

  function handleKeyDown(event) {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    const match = results.find(product => String(product.codigoProducto) === query.trim());
    const product = match || (results.length === 1 && query.trim() ? results[0] : null);
    if (product) {
      onAdd(product.codigoProducto);
      setQuery('');
    }
  }

  return (
    <section className="product-picker">
      <label className="form-field">
        <span className="field-label">Buscar producto</span>
        <input type="search" placeholder="Nombre o código" value={query}
          onKeyDown={handleKeyDown} onChange={event => setQuery(event.target.value)} />
      </label>
      <div className="picker-results">
        {results.map(product => (
          <button type="button" key={product.codigoProducto}
            onClick={() => onAdd(product.codigoProducto)}>
            <strong>{product.nombreProducto}</strong>
            <small>#{product.codigoProducto} · {formatCurrency(product.precioVenta)} antes de IVA</small>
            <span aria-hidden="true">+</span>
          </button>
        ))}
      </div>
      {!results.length && <p role="status">{products.length
        ? 'Sin coincidencias. Prueba otro nombre o código.'
        : 'Agrega tu primer producto desde el catálogo.'}</p>}
    </section>
  );
}
