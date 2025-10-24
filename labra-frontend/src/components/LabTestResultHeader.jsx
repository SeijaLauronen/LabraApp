import React from 'react';
import { labFields } from '../definitions/labfields';
// *SL Lab Test Result Table Header Component


const LabTestResultHeader = ({ mode, handleSort, orientation = 'horizontal', data = [], onFieldChange = () => {}, onDelete = () => {} }) => {
    const editable = mode !== "show";
    const visibleFields = labFields.filter(field =>
        editable ? field.editable : true
    );

    if (orientation === 'vertical') {
        // First row: empty top-left, then one header cell per result (we can show index or leave blank).
        return (
            <>
                <tr>
                    <th></th>
                    {data.map((_, i) => (
                        <th key={i} style={{ textAlign: 'center' }}>
                            {editable && (
                                <button onClick={() => onDelete(i)} style={{ fontSize: '0.8rem' }}>
                                    Poista
                                </button>
                            )}
                        </th>
                    ))}
                    <th>{/* actions column, unused here */}</th>
                </tr>

                {visibleFields.map(field => (
                    <tr key={field.key}>
                        <th style={{ textAlign: 'left', verticalAlign: 'top', paddingRight: '8px' }}>{field.label}</th>
                        {data.map((item, idx) => (
                            <td key={idx}>
                                {editable ? (
                                    <input
                                        type={field.type || 'text'}
                                        value={item[field.key] ?? ''}
                                        onChange={(e) => onFieldChange(idx, field.key, e.target.value)}
                                    />
                                ) : (
                                    item[field.key] ?? ''
                                )}
                            </td>
                        ))}
                        <td></td>
                    </tr>
                ))}
            </>
        );
    }


    return (
        <tr>
            {!editable && (
                <>
                    <th></th> {/* Checkbox column */}
                    {visibleFields.map(field => (
                        <th
                            key={field.key}
                            onClick={() => field.sortable ? handleSort(field.key) : null}
                            style={{ cursor: field.sortable ? 'pointer' : 'default' }}
                        >
                            {field.label}
                        </th>
                    ))}
                </>
            )}
            <th>{/* Actions column */}</th>
        </tr>
    );
};

export default LabTestResultHeader;