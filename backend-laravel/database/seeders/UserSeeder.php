<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::create([
            'first_name' => 'Admin',
            'last_name' => 'Account',
            'email' => 'admin@test.com',
            'password' => Hash::make('admin@test.com'),
            'phone' => '0123456789',
            'role' => 'admin',
        ]);

        User::create([
            'first_name' => 'User',
            'last_name' => 'Account',
            'email' => 'user@test.com',
            'phone' => '0123456789',
            'password' => Hash::make('user@test.com'),
            'role' => 'user',
        ]);
    }
}
