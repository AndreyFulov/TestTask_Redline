<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\AddressController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::get('/test', [AddressController::class, 'test']);
Route::middleware('auth:sanctum')->group(function () {
    Route::get('search', [AddressController::class, 'search']);
    Route::get('/users/{user}/addresses', [AddressController::class, 'index']);
    Route::post('/users/{user}/addresses', [AddressController::class, 'store']);
    Route::delete('/users/{user}/addresses/{address}', [AddressController::class, 'destroy']);
    Route::post("/logout", [AuthController::class,'logout']);
});