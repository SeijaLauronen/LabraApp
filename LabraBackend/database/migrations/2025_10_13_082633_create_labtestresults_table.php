<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateLabtestresultsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        if (!Schema::hasTable('labtestresults')) {
            Schema::create('labtestresults', function (Blueprint $table) {
                $table->increments('ID');
                $table->string('PersonID', 10);
                $table->dateTime('SampleDate')->nullable();
                $table->string('CombinedName', 200)->nullable();
                $table->string('AnalysisName', 50)->nullable();
                $table->string('AnalysisShortName', 50)->nullable();
                $table->string('AnalysisCode', 50)->nullable();
                $table->string('Result', 50)->nullable();
                $table->string('MinimumValue', 10)->nullable();
                $table->string('MaximumValue', 10)->nullable();
                $table->string('ValueReference', 100)->nullable();
                $table->string('Unit', 10)->nullable();
                $table->double('Cost')->nullable();
                $table->string('CompanyUnitName', 50)->nullable();
                $table->string('AdditionalInfo', 50)->nullable();
                $table->string('AdditionalText', 300)->nullable();
                $table->dateTime('ResultAddedDate')->useCurrent();
                $table->dateTime('ToMapDate')->nullable();
            });
        }
    }


    /**
     * Reverse the migrations.
     *
     * @return void
     */
    // Kommentoin tämän varuilta, ette vahingossa poista tietokannasta
    /*
    public function down()
    {
        Schema::dropIfExists('labtestresults');
    }
    */
}
