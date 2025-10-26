<?php
// SL 202510: API routes for LabTestResult

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\LabTestResultController; // SL 202510: added this line

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

// SL 202510 sanctum removed, no need for this:
/*
Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});
*/


// Search that requires personID and allows combining other criteria
// Note! This route must be defined before the resource route to avoid conflicts!!
Route::get('labtestresults/search', [LabTestResultController::class, 'search']);


// This line automatically creates RESTful routes for the labtestresults resource (GET, POST, PUT, DELETE)
Route::apiResource('labtestresults', LabTestResultController::class);
