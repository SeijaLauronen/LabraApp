import React from 'react';
import LabTestResultHeader from './LabTestResultHeader';
import { labFields, copyFields, newRowDefaults } from '../definitions/labfields';

// Reusable vertical editor for multiple rows
const LabTestResultsEditor = ({
  title = 'Edit rows',
  rows,
  setRows,
  personID,
  onSave,
  onCancel,
  allowAdd = true,
  allowDelete = true,
  saveLabel = 'Tallenna'
}) => {

  const makeNewRow = () => {
    if (!personID) {
      alert('Anna henkilön tunniste ennen uuden rivin lisäämistä.');
      return null;
    }
    const prev = rows.length ? rows[rows.length - 1] : null;
    const r = {};
    labFields.forEach(f => {
      if (copyFields.includes(f.key)) {
        r[f.key] = prev && prev[f.key] !== undefined
          ? prev[f.key]
          : (typeof newRowDefaults[f.key] === 'function' ? newRowDefaults[f.key]() : (newRowDefaults[f.key] ?? ''));
      } else {
        r[f.key] = typeof newRowDefaults[f.key] === 'function'
          ? newRowDefaults[f.key]()
          : (newRowDefaults[f.key] ?? '');
      }
    });
    r.ID = null;
    r.PersonID = personID;
    return r;
  };

  const handleAddRow = () => {
    const nr = makeNewRow();
    if (!nr) return;
    setRows([...rows, nr]);
  };

  const handleFieldChange = (rowIdx, field, value) => {
    const copy = [...rows];
    copy[rowIdx] = { ...copy[rowIdx], [field]: value };
    setRows(copy);
  };

  const handleDelete = (rowIdx) => {
    // Cornfirm not needed when deleting rows in edit mode
    // if (!window.confirm('Poistetaanko rivi?')) return;
    setRows(rows.filter((_, i) => i !== rowIdx));
  };

  return (
    <div style={{ marginTop: 20, padding: 12, border: '1px solid #ccc' }}>
      <h3>{title}</h3>
      <div style={{ marginBottom: 8 }}>
        {allowAdd && <button onClick={handleAddRow}>Lisää uusi)</button>}
        <button onClick={onCancel} style={{ marginLeft: 8 }}>Peruuta</button>
      </div>

      <table border="1" cellPadding="6">
        <tbody>
          <LabTestResultHeader
            mode="edit"
            orientation="vertical"
            data={rows}
            onFieldChange={handleFieldChange}
            onDelete={allowDelete ? handleDelete : () => {}}
          />
        </tbody>
      </table>

      <div style={{ marginTop: 10 }}>
        <button onClick={onSave}>{saveLabel}</button>
      </div>
    </div>
  );
};

export default LabTestResultsEditor;