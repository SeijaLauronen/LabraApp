// SL 202510: Lab Test Result Table Row Component
import React from 'react';
import { labFields } from '../definitions/labfields';

const LabTestResultRow = ({ row, onToggleSelect, isSelected, mode, onDelete, onFieldChange, orientation = 'horizontal' }) => {
    const editable = mode !== "show";
    const visibleFields = labFields.filter(field => 
        editable ? field.editable : true
    );

    const renderCell = (field) => {
        if (!editable) return row[field.key];
        
        return (
            <input
                type={field.type}
                value={row[field.key] ?? ""}
                onChange={(e) => onFieldChange(field.key, e.target.value)}
            />
        );
    };

  if (orientation === 'vertical') {
        return (
            <>
                {visibleFields.map((field, idx) => (
                    <tr key={field.key}>
                        <th style={{ textAlign: 'left', verticalAlign: 'top', paddingRight: '8px' }}>{field.label}</th>
                        <td>{renderCell(field)}</td>
                        {idx === 0 && (
                            <td rowSpan={visibleFields.length} style={{ verticalAlign: 'top' }}>
                                {mode !== "show" && (
                                    <button onClick={onDelete}>Poista</button>
                                )}
                            </td>
                        )}
                    </tr>
                ))}
            </>
        );
    }

    // horizontal (default) rendering
    return (
        <tr style={{ background: isSelected ? '#e3f2fd' : 'transparent' }}>
            {!editable && (
                <>
                    <td>
                        <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={onToggleSelect}
                        />
                    </td>                                        
                </>
            )}
            {visibleFields.map(field => (
                <td key={field.key}>{renderCell(field)}</td>
            ))}
            <td>
                {mode !== "show" && (
                    <button onClick={onDelete}>Poista</button>
                )}
            </td>
        </tr>
    );
};

export default LabTestResultRow;