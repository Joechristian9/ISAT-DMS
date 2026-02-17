<?php

use App\Http\Controllers\Teacher\DashboardController;
use Illuminate\Support\Facades\Route;

Route::prefix('teacher')->name('teacher.')->middleware(['auth', 'teacher'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    
    // IPCRF Routes
    Route::get('/ipcrf', [\App\Http\Controllers\Teacher\IpcrfController::class, 'index'])->name('ipcrf');
    Route::post('/ipcrf/upload', [\App\Http\Controllers\Teacher\IpcrfController::class, 'upload'])->name('ipcrf.upload');
    Route::delete('/ipcrf/{submission}', [\App\Http\Controllers\Teacher\IpcrfController::class, 'deleteFile'])->name('ipcrf.delete');
});
