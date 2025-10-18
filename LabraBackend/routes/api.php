<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

use App\Http\Controllers\LabTestResultController;
// Haku henkilön mukaan
Route::get('labtestresults/person/{personID}', [LabTestResultController::class, 'showByPersonID']);

// Haku henkilön ja ID:n mukaan
Route::get('labtestresults/person/{personID}/id/{id}', [LabTestResultController::class, 'showByPersonAndId']);

// Haku henkilön ja päivämäärävälin mukaan
Route::get('labtestresults/person/{personID}/dates/{startDate}/{endDate}', [LabTestResultController::class, 'showByPersonAndDateRange']);

// Haku henkilön ja analyysin nimen perusteella
Route::get('labtestresults/person/{personID}/analysis/{searchTerm}', [LabTestResultController::class, 'showByPersonAndAnalysis']);

//Tämä rivi luo automaattisesti RESTful-reitit resurssille labtestresults (GET, POST, PUT, DELETE)
Route::apiResource('labtestresults', LabTestResultController::class);
