import React from 'react';
// *SL Lab Test Result Table Row Component
const LabTestResultRow = ({ row, onToggleSelect, isSelected, mode, onDelete, onFieldChange }) => {
    const editable = mode !== "show";

    const renderCell = (field, type = "text") => {
        if (!editable) return <>{row[field]}</>;
        if (type === "date") {
            return (
                <input
                    type="date"
                    value={row[field] ?? ""}
                    onChange={(e) => onFieldChange(field, e.target.value)}
                />
            );
        }
        return (
            <input
                type="text"
                value={row[field] ?? ""}
                onChange={(e) => onFieldChange(field, e.target.value)}
            />
        );
    };

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
                    <td>{row.ID}</td>
                </>
            )}
            
            <td>{renderCell("SampleDate", "date")}</td>
            <td>{renderCell("AnalysisName")}</td>
            <td>{renderCell("CombinedName")}</td>
            <td>{renderCell("AnalysisShortName")}</td>
            <td>{renderCell("AnalysisCode")}</td>
            <td>{renderCell("Result")}</td>
            <td>{renderCell("Unit")}</td>
            <td>{renderCell("MinimumValue")}</td>
            <td>{renderCell("MaximumValue")}</td>
            <td>{renderCell("ValueReference")}</td>
            <td>{renderCell("CompanyUnitName")}</td>
            <td>{renderCell("AdditionalInfo")}</td>
            <td>{renderCell("AdditionalText")}</td>
            <td>{renderCell("ResultAddedDate", "date")}</td>
            <td>{renderCell("ToMapDate", "date")}</td>
            <td>
                {mode !== "show" && (
                    <button onClick={onDelete}>Poista</button>
                )}
            </td>
        </tr>
    );
};


export default LabTestResultRow;