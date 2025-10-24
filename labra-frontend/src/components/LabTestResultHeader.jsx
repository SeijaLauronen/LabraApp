import React from 'react';
// *SL Lab Test Result Table Header Component

const LabTestResultHeader = ({ mode, handleSort }) => {
    const editable = mode !== "show";
    return (
        <tr>
            {!editable && (
                <>
                    <th></th>
                    <th onClick={() => handleSort("ID")}>ID</th>
                </>
            )}
            <th onClick={() => handleSort("SampleDate")}>Näyte pvm</th>
            <th onClick={() => handleSort("AnalysisName")}>Analyysin nimi</th>
            <th onClick={() => handleSort("CombinedName")}>Yleisnimi</th>
            <th onClick={() => handleSort("AnalysisShortName")}>Lyhenne</th>
            <th onClick={() => handleSort("AnalysisCode")}>Koodi</th>
            <th onClick={() => handleSort("Result")}>Tulos</th>
            <th onClick={() => handleSort("Unit")}>Yksikkö</th>
            <th onClick={() => handleSort("MinimumValue")}>Min</th>
            <th onClick={() => handleSort("MaximumValue")}>Max</th>
            <th onClick={() => handleSort("ValueReference")}>Referenssiryhmä</th>
            <th onClick={() => handleSort("CompanyUnitName")}>TH yksikkö</th>
            <th onClick={() => handleSort("AdditionalInfo")}>Lisäinfo</th>
            <th onClick={() => handleSort("AdditionalText")}>Lisätieto</th>
            <th onClick={() => handleSort("ResultAddedDate")}>Tallennus pvm</th>
            <th onClick={() => handleSort("ToMapDate")}>Lisätty hv karttaan</th>
            <th>
            </th>
        </tr>

    );
};

export default LabTestResultHeader;