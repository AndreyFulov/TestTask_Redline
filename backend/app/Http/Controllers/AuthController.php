<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
            'name' => 'required|string|max:255', // Новое поле для имени
        ]);

        // Попытка найти пользователя по email
        $user = User::where('email', $request->email)->first();

        // Если пользователя не существует, создаем нового с именем
        if (!$user) {
            $user = User::create([
                'name' => $request->name,  // Сохранение имени пользователя
                'email' => $request->email,
                'password' => Hash::make($request->password),
            ]);
        } else {
            // Проверка пароля
            if (!Hash::check($request->password, $user->password)) {
                throw ValidationException::withMessages([
                    'email' => ['Неправильные учетные данные.'],
                ]);
            }
        }

        // Создание персонального токена для аутентификации
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user_id' => $user->id, // Возвращаем ID пользователя
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->tokens()->delete();

        return response()->json(['message' => 'Успешный выход']);
    }
}
