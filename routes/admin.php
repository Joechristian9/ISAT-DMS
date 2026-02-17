<?php

use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\PendingActionController;
use Illuminate\Support\Facades\Route;

Route::prefix('admin')->name('admin.')->middleware(['auth', 'admin'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    
    // IPCRF Management
    Route::get('/ipcrf', [\App\Http\Controllers\Admin\IpcrfManagementController::class, 'index'])->name('ipcrf');
    Route::get('/ipcrf/submissions', [\App\Http\Controllers\Admin\IpcrfManagementController::class, 'submissions'])->name('ipcrf.submissions');
    Route::post('/ipcrf/review/{submission}', [\App\Http\Controllers\Admin\IpcrfManagementController::class, 'review'])->name('ipcrf.review');
    Route::post('/ipcrf/kra', [\App\Http\Controllers\Admin\IpcrfManagementController::class, 'storeKra'])->name('ipcrf.kra.store');
    Route::put('/ipcrf/kra/{kra}', [\App\Http\Controllers\Admin\IpcrfManagementController::class, 'updateKra'])->name('ipcrf.kra.update');
    Route::post('/ipcrf/objective', [\App\Http\Controllers\Admin\IpcrfManagementController::class, 'storeObjective'])->name('ipcrf.objective.store');
    Route::put('/ipcrf/objective/{objective}', [\App\Http\Controllers\Admin\IpcrfManagementController::class, 'updateObjective'])->name('ipcrf.objective.update');
    Route::delete('/ipcrf/objective/{objective}', [\App\Http\Controllers\Admin\IpcrfManagementController::class, 'deleteObjective'])->name('ipcrf.objective.delete');
    
    // My pending actions (for regular admins)
    Route::get('/my-actions', [PendingActionController::class, 'myActions'])->name('my-actions');
    
    // Super admin only routes
    Route::middleware('super-admin')->group(function () {
        Route::get('/pending-actions', [PendingActionController::class, 'index'])->name('pending-actions');
        Route::post('/pending-actions/{pendingAction}/approve', [PendingActionController::class, 'approve'])->name('pending-actions.approve');
        Route::post('/pending-actions/{pendingAction}/reject', [PendingActionController::class, 'reject'])->name('pending-actions.reject');
    });
});
