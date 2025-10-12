<?php

namespace App\Models;

//use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LabTestResult extends Model
{
    //use HasFactory;
 
    // Olemassa oleva taulu
    protected $table = 'labtestresults';

    // Taulussa ei ole created_at tai updated_at -sarakkeita
    public $timestamps = false;

    // Pääavain on 'ID' (ei 'id')
    protected $primaryKey = 'ID';

    // Jos halutaan sallia massainsertti (create, update)
    protected $fillable = [
        'PersonID',
        'SampleDate',
        'CombinedName',
        'AnalysisName',
        'AnalysisShortName',
        'AnalysisCode',
        'Result',
        'MinimumValue',
        'MaximumValue',
        'ValueReference',
        'Unit',
        'Cost',
        'CompanyUnitName',
        'AdditionalInfo',
        'AdditionalText',
        'ResultAddedDate',
        'ToMapDate'
    ];
}
