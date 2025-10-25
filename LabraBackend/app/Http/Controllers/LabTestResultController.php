<?php
// SL 202510: for handling data going into the database
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

            // Add  ResultAddedDate
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
                $query->whereBetween('SampleDate', [$start, $end]);
            } elseif ($start) {
                $query->where('SampleDate', '>=', $start);
            } elseif ($end) {
                $query->where('SampleDate', '<=', $end);
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
}
