<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\LabTestResult;
// *SL tietokantaan menevien tietojen käsittelyä varten

class LabTestResultController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        return LabTestResult::all();
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {


        \Log::debug('Saapunut data:', $request->all());
        try {
            $data = $request->validate([
                'PersonID' => 'required|string|max:10',
                'SampleDate' => 'nullable|date',
                'CombinedName' => 'nullable|string|max:200',
                'AnalysisName' => 'nullable|string|max:50',
                'AnalysisShortName' => 'nullable|string|max:50',
                'AnalysisCode' => 'nullable|string|max:50',
                'Result' => 'nullable|string|max:50',
                'MinimumValue' => 'nullable|string|max:10',
                'MaximumValue' => 'nullable|string|max:10',
                'ValueReference' => 'nullable|string|max:100',
                'Unit' => 'nullable|string|max:10',
                'Cost' => 'nullable|numeric',
                'CompanyUnitName' => 'nullable|string|max:50',
                'AdditionalInfo' => 'nullable|string|max:50',
                'AdditionalText' => 'nullable|string|max:300',
                'ResultAddedDate' => 'nullable|date',
                'ToMapDate' => 'nullable|date'
            ]);

            // Lisätään ResultAddedDate
            $data['ResultAddedDate'] = now();            
            $result = LabTestResult::create($data);
            \Log::debug('Tallennettu tulos:', ['id' => $result->id]);
            return $result;
        } catch (\Exception $e) {
            \Log::error('Virhe tallennuksessa:', [
                'message' => $e->getMessage(),
                'line' => $e->getLine(),
                'file' => $e->getFile()
            ]);
            throw $e;
        }
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        return LabTestResult::findOrFail($id);
    }

    public function showByPersonID($personID)
    {
        return LabTestResult::whereRaw('TRIM(PersonID) = ?', [trim($personID)])->get();
    }

    // 🔹 Hae henkilön tietty tulos ID:n perusteella
    public function showByPersonAndId($personID, $id)
    {
        return LabTestResult::whereRaw('TRIM(PersonID) = ?', [trim($personID)])
            ->where('ID', $id)
            ->firstOrFail();
    }

    // 🔹 Hae henkilön kaikki tulokset annetulta päivämääräväiltä
    public function showByPersonAndDateRange($personID, $startDate, $endDate)
    {
        /*
        return LabTestResult::where('PersonID', $personID)
            ->whereBetween('SampleDate', [$startDate, $endDate])
            ->orderBy('SampleDate', 'asc')
            ->get();
            */
        return LabTestResult::whereRaw('TRIM(PersonID) = ?', [trim($personID)])
            ->whereBetween('SampleDate', [$startDate, $endDate])
            ->orderBy('SampleDate', 'asc')
            ->get();
    }

    // 🔎 Hae henkilön tulokset, joissa analyysin nimi sisältää osan merkkijonoa
    public function showByPersonAndAnalysis($personID, $searchTerm)
    {

        return LabTestResult::whereRaw('TRIM(PersonID) = ?', [trim($personID)])
            ->where('AnalysisName', 'LIKE', "%{$searchTerm}%")
            ->orderBy('SampleDate', 'desc')
            ->get();
        /*
        return LabTestResult::where('PersonID', $personID)
            ->where('AnalysisName', 'LIKE', "%{$searchTerm}%")
            ->orderBy('SampleDate', 'desc')
            ->get();
        */
        /*
        // Debuggausta varten tämä koodinpätkä:
        $query = LabTestResult::where('PersonID', $personID)
            ->where('AnalysisName', 'LIKE', "%{$searchTerm}%")
            ->orderBy('SampleDate', 'desc');

        dd($query->toSql(), $query->getBindings());
        */
        // Kysely suoraan selaimeen, ei Reactin kautta:
        // http://localhost:8000/api/labtestresults/person/TEST123/analysis/TSH

        /* Voisi myös ajaa suoraan tinkerissä antamlla siinä:
        use App\Models\LabTestResult;
        LabTestResult::where('PersonID', 'ABC123')
            ->where('AnalysisName', 'LIKE', '%TS%')
            ->get(['ID','PersonID','AnalysisName']);
        */
    }



    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        $lab = LabTestResult::findOrFail($id);
        $lab->update($request->all());
        return $lab;
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        return LabTestResult::destroy($id);
    }
}
