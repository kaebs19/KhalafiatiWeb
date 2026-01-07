import '../styles/Table.css';

const Table = ({ columns, data, onRowClick, actions, loading, emptyMessage = 'No data available' }) => {
  if (loading) {
    return (
      <div className="table-loading">
        <div className="spinner"></div>
        <p>Loading data...</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="table-empty">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table className="table">
        <thead>
          <tr>
            {columns.map((column, index) => (
              <th key={index} className={column.className}>
                {column.label}
              </th>
            ))}
            {actions && <th className="table-actions-header">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              onClick={() => onRowClick && onRowClick(row)}
              className={onRowClick ? 'clickable' : ''}
            >
              {columns.map((column, colIndex) => (
                <td key={colIndex} className={column.className}>
                  {column.render ? column.render(row) : row[column.field]}
                </td>
              ))}
              {actions && (
                <td className="table-actions" onClick={(e) => e.stopPropagation()}>
                  <div className="action-buttons">
                    {actions(row)}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
