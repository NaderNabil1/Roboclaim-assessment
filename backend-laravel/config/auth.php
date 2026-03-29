<?php

return [

    'defaults' => [
        'guard' => 'web',  // Set default guard to 'web'
        'passwords' => 'users',
    ],

    // Authentication Guards
    'guards' => [
        'web' => [
            'driver' => 'session',
            'provider' => 'users',
        ],

        'api' => [
            'driver' => 'jwt',  // Use JWT driver for API authentication
            'provider' => 'users',
            'hash' => false,
        ],
    ],

    // User Providers
    'providers' => [
        'users' => [
            'driver' => 'eloquent',
            'model' => App\Models\User::class,  // Change to your User model
        ],

        // Optionally, you can configure a database provider
        // 'users' => [
        //     'driver' => 'database',
        //     'table' => 'users',
        // ],
    ],

    // Password Reset Settings
    'passwords' => [
        'users' => [
            'provider' => 'users',
            'table' => 'password_resets',
            'expire' => 60,
            'throttle' => 60,
        ],
    ],

    // Password Confirmation Timeout
    'password_timeout' => 10800,
];
