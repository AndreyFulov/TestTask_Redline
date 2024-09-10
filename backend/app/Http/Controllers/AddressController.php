<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Address;
use App\Models\User;
use Illuminate\Support\Facades\Cache;
use MoveMoveIo\DaData\Enums\Language;
use MoveMoveIo\DaData\Facades\DaDataAddress;


/**
 * Class DaData
 * @package App\DaData
 */
class AddressController extends Controller
{
    // Показать все адреса пользователя
    public function index(User $user)
    {
        return response()->json($user->addresses);
    }

    public function test() : void
    {
        $dadata = DaDataAddress::prompt('пер. Чкалова Джубга', 50, Language::RU);

        dd($dadata);    
    }
    public function search(Request $request)
    {
        $query = $request->input('address');
        $dadata = Cache::remember("dadata_address_{$query}", 3600, function () use ($query) {
            // Выполняем запрос к API DaData
            return DaDataAddress::prompt($query, 5, Language::RU);
        });
        if (isset($dadata['suggestions']) && is_array($dadata['suggestions'])) {
            $suggestions = array_map(function ($suggestion) {
                return [
                    'value' => $suggestion['value'],
                    'unrestricted_value' => $suggestion['unrestricted_value'],
                    'data' => $suggestion['data']
                ];
            }, $dadata['suggestions']);
            
            // Вернуть данные на фронтенд
            return response()->json(['suggestions' => $suggestions]);
        }

        // В случае ошибки
        return response()->json(['error' => 'Не удалось получить адреса.'], 500);
    }

    // Добавить новый адрес
    public function store(Request $request, $userId)
    {
        $request->validate([
            'address' => 'required|string|max:255',
        ]);

        $address = Address::create([
            'address' => $request->address,
            'user_id' => $userId,
        ]);

        return response()->json($address, 201);
    }

    // Удалить адрес
    public function destroy(User $user, Address $address)
    {
        // Проверка, что адрес принадлежит пользователю
        if ($address->user_id !== $user->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // Удаление адреса
        $address->delete();

        return response()->json(['message' => 'Address deleted'], 200);
    }
}
