// SL 202510: Definitions for lab test result fields
export const labFields = [
    { key: "ID", label: "ID", type: "text", sortable: true, editable: false },
    { key: "SampleDate", label: "Näyte pvm", type: "datetime-local", sortable: true, editable: true },
    { key: "AnalysisName", label: "Analyysin nimi", type: "text", sortable: true, editable: true },
    { key: "CombinedName", label: "Yleisnimi", type: "text", sortable: true, editable: true },
    { key: "AnalysisShortName", label: "Lyhenne", type: "text", sortable: true, editable: true },
    { key: "AnalysisCode", label: "Koodi", type: "text", sortable: true, editable: true },
    { key: "Result", label: "Tulos", type: "text", sortable: true, editable: true },
    { key: "Unit", label: "Yksikkö", type: "text", sortable: true, editable: true },
    { key: "MinimumValue", label: "Min", type: "text", sortable: true, editable: true },
    { key: "MaximumValue", label: "Max", type: "text", sortable: true, editable: true },
    { key: "ValueReference", label: "Referenssiryhmä", type: "text", sortable: true, editable: true },
    { key: "CompanyUnitName", label: "TH yksikkö", type: "text", sortable: true, editable: true },
    { key: "AdditionalInfo", label: "Lisäinfo", type: "text", sortable: true, editable: true },
    { key: "AdditionalText", label: "Lisätieto", type: "text", sortable: true, editable: true },
    { key: "ResultAddedDate", label: "Tallennus pvm", type: "date", sortable: true, editable: false },
    { key: "ToMapDate", label: "Lisätty hv karttaan", type: "date", sortable: true, editable: true }
];


// Fields whose values are automatically copied to a new row from the previous row
export const copyFields = ["SampleDate", "CompanyUnitName"];

// Default values if there is no previous row to copy from
export const newRowDefaults = {
     SampleDate: () => {
        const d = new Date();
        d.setHours(9, 0, 0); // Set time to 09:00:00
        const pad = (n) => n.toString().padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    },
    CompanyUnitName: () => "", 
    ResultAddedDate: () => null,
    ToMapDate: () => null
};