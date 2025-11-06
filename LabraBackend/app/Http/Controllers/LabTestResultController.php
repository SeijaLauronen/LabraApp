<?php
// SL 202510: Controller for handling data going into the database
namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\LabTestResult;

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

            // Trim to avoid trailing spaces
            $data['PersonID'] = trim($data['PersonID']);

            if ($data['PersonID'] === '') {
                return response()->json(['error' => 'PersonID ei voi olla tyhjä.'], 400);
            }

            // Add  ResultAddedDate
            $data['ResultAddedDate'] = now();
            $result = LabTestResult::create($data);
            \Log::debug('Tallennettu tulos:', ['id' => $result->id]);
            //return $result;
            return response()->json($result, 201);
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

    /**
     * Summary of search
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function search(Request $request)
    {
        \Log::debug('Search request params:', $request->all());

        if (!$request->filled('personID')) {
            return response()->json(['error' => 'personID is required'], 400);
        }

        try {
            $query = LabTestResult::query();

            // Trim PersonID
            // TODO: TRIM‑vertailu heikentää indeksien hyödyntämistä — harkitse PersonID:n tallentamista aina trimattuna (esim. modelissa tai ennen tallennusta) ja vertailua suoraan.
            $personID = trim($request->input('personID'));
            $query->whereRaw('TRIM(PersonID) = ?', [$personID]);

            // Date range: startDate / endDate can be separate or both
            $start = $request->input('startDate');
            $end = $request->input('endDate');
            if ($start && $end) {
                $query->whereBetween('SampleDate', [
                    $start . ' 00:00:00',
                    $end . ' 23:59:59'
                ]);
            } elseif ($start) {
                $query->where('SampleDate', '>=', $start . ' 00:00:00');
            } elseif ($end) {
                $query->where('SampleDate', '<=', $end . ' 23:59:59');
            }

            // Search term for analysis name (partial match)
            if ($request->filled('searchTerm')) {
                $term = $request->input('searchTerm');
                $query->where('AnalysisName', 'like', "%{$term}%");
            }


            // Sort and pagination (for example ?perPage=50)
            // TODO testaa tuo pagination
            $sortField = $request->input('sortField', 'SampleDate');
            $sortOrder = $request->input('sortOrder', 'desc');
            $perPage = (int) $request->input('perPage', 100);

            $results = $query->orderBy($sortField, $sortOrder)->paginate($perPage);
            \Log::debug('Search results count:', ['count' => $results->count()]);
            return response()->json($results);
        } catch (\Exception $e) {
            \Log::error('Search error:', [
                'message' => $e->getMessage(),
                'line' => $e->getLine(),
                'file' => $e->getFile()
            ]);
            throw $e;
        }
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


    // TODO korvaa tämä käyttämään jo olemassa olevaa storea, tarkemmin paluuviestit
    public function import(Request $request)
    {
        $data = $request->all();
        \Log::debug('Saapunut data importille:', $request->all());

        try {
            foreach ($data as $index => $row) {
                $personId = trim($row['PersonID'] ?? '');

                if (empty($personId)) {
                    \Log::warning("Rivi $index ohitettu: PersonID puuttuu", $row);
                    return response()->json([
                        'error' => "Rivillä $index puuttuu PersonID, tuonti keskeytettiin."
                    ], 400);
                }

                LabTestResult::create([
                    'PersonID' => $personId,
                    'SampleDate' => $row['SampleDate'] ?? null,
                    'CompanyUnitName' => $row['CompanyUnitName'] ?? null,
                    'AnalysisName' => $row['AnalysisName'] ?? null,
                    'Result' => $row['Result'] ?? null,
                    'MinimumValue' => $row['MinimumValue'] ?? null,
                    'MaximumValue' => $row['MaximumValue'] ?? null,
                    'AdditionalText' => $row['AdditionalText'] ?? null,
                ]);
            }
        } catch (\Exception $e) {
            \Log::error('Import error:', [
                'message' => $e->getMessage(),
                'line' => $e->getLine(),
                'file' => $e->getFile()
            ]);
            //throw $e;
            return response()->json(['error' => $e->getMessage()], 500);
        }


        return response()->json([
            'success' => true,
            'message' => 'Tiedot tallennettu'
        ], 200);
    }

}
