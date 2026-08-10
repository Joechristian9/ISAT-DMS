<?php

use App\Http\Controllers\Teacher\DashboardController;
use Illuminate\Support\Facades\Route;

Route::prefix('teacher')->name('teacher.')->middleware(['auth', 'teacher'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    
    // IPCRF Routes
    Route::get('/ipcrf', [\App\Http\Controllers\Teacher\IpcrfController::class, 'index'])->name('ipcrf');
    Route::post('/ipcrf/upload', [\App\Http\Controllers\Teacher\IpcrfController::class, 'upload'])->name('ipcrf.upload');
    Route::delete('/ipcrf/{submission}', [\App\Http\Controllers\Teacher\IpcrfController::class, 'deleteFile'])->name('ipcrf.delete');
    
    // Signed IPCRF Routes
    Route::get('/signed-ipcrf', [\App\Http\Controllers\Teacher\SignedIpcrfController::class, 'index'])->name('signed-ipcrf');
    Route::post('/signed-ipcrf', [\App\Http\Controllers\Teacher\SignedIpcrfController::class, 'store'])->name('signed-ipcrf.store');
    Route::delete('/signed-ipcrf/{signedIpcrf}', [\App\Http\Controllers\Teacher\SignedIpcrfController::class, 'destroy'])->name('signed-ipcrf.destroy');
    
    // IPCRF History Routes
    Route::get('/ipcrf-history', [\App\Http\Controllers\Teacher\IpcrfHistoryController::class, 'index'])->name('ipcrf-history');
    
    // Survey Routes
    Route::post('/survey', [\App\Http\Controllers\Teacher\SurveyController::class, 'store'])->name('survey.store');
    
    // Questionnaire Routes
    Route::get('/questionnaire', [\App\Http\Controllers\Teacher\QuestionnaireController::class, 'index'])->name('questionnaire');
    Route::post('/questionnaire', [\App\Http\Controllers\Teacher\QuestionnaireController::class, 'store'])->name('questionnaire.store');
});
