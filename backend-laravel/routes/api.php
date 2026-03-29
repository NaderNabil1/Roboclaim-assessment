<?php

use App\Http\Controllers\Api\Admin\AdminClaimReportController;
use App\Http\Controllers\Api\Admin\AdminPolicyController;
use App\Http\Controllers\Api\Admin\AdminSupportConversationController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ClaimReportController;
use App\Http\Controllers\Api\ClaimReportDocumentController;
use App\Http\Controllers\Api\PolicyValidationController;
use App\Http\Controllers\Api\SupportConversationController;
use App\Http\Controllers\Api\UserPolicyController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function () {
    Route::post('login', [AuthController::class, 'login']);
    Route::post('logout', [AuthController::class, 'logout'])->middleware('auth:api');
    Route::get('me', [AuthController::class, 'me'])->middleware('auth:api');
});

Route::middleware('auth:api')->group(function () {
    Route::post('policies/validate', [PolicyValidationController::class, 'validatePolicy']);
    Route::get('policies', [UserPolicyController::class, 'index']);
    Route::post('policies', [UserPolicyController::class, 'store']);
    Route::get('claims', [ClaimReportController::class, 'index']);
    Route::post('claims', [ClaimReportController::class, 'store']);
    Route::get('claims/{claimReport}/document', [ClaimReportDocumentController::class, 'show']);

    Route::get('support/conversations', [SupportConversationController::class, 'index']);
    Route::post('support/conversations', [SupportConversationController::class, 'store']);
    Route::get('support/conversations/{supportConversation}/messages', [SupportConversationController::class, 'messages']);
    Route::post('support/conversations/{supportConversation}/messages', [SupportConversationController::class, 'sendMessage']);
});

Route::middleware(['auth:api', 'admin'])->prefix('admin')->group(function () {
    Route::get('policies', [AdminPolicyController::class, 'index']);
    Route::post('policies', [AdminPolicyController::class, 'store']);
    Route::patch('policies/{policy}', [AdminPolicyController::class, 'update']);
    Route::delete('policies/{policy}', [AdminPolicyController::class, 'destroy']);
    Route::get('claim-reports', [AdminClaimReportController::class, 'index']);
    Route::patch('claim-reports/{claimReport}', [AdminClaimReportController::class, 'update']);

    Route::get('support/conversations', [AdminSupportConversationController::class, 'index']);
    Route::get('support/conversations/{supportConversation}/messages', [AdminSupportConversationController::class, 'messages']);
    Route::post('support/conversations/{supportConversation}/messages', [AdminSupportConversationController::class, 'sendMessage']);
});
