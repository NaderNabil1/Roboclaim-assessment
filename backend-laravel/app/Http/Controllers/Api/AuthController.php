<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Tymon\JWTAuth\Exceptions\JWTException;
use Tymon\JWTAuth\Exceptions\TokenExpiredException;
use Tymon\JWTAuth\Exceptions\TokenInvalidException;
use Tymon\JWTAuth\Facades\JWTAuth;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|string',
            'password' => 'required|string',
        ]);

        $email = $request->input('email');
        $password = $request->input('password');

        $user = User::where('email', $email)->first();

        if (! $user || ! \Hash::check($password, $user->password)) {
            return response()->json([
                'error' => 'Invalid credentials',
                'message' => 'The email or password you entered is incorrect. Please try again.',
            ], 401);
        }

        $token = auth('api')->login($user);
        $expiresInSeconds = auth('api')->factory()->getTTL() * 60;

        return response()->json([
            'access_token' => $token,
            'user_id' => (string) $user->id,
            'first_name' => $user->first_name,
            'last_name' => $user->last_name,
            'phone' => $user->phone,
            'email' => $user->email,
            'role' => $user->role,
            'expires_in' => $expiresInSeconds,
        ]);
    }

    public function me(Request $request)
    {
        $user = auth('api')->user();

        return response()->json([
            'user_id' => (string) $user->id,
            'first_name' => $user->first_name,
            'last_name' => $user->last_name,
            'phone' => $user->phone,
            'email' => $user->email,
            'role' => $user->role,
        ]);
    }

    public function logout(Request $request)
    {
        $token = $request->bearerToken();
        if ($token) {
            $request->headers->set('Authorization', 'Bearer '.$token, true);
        }

        try {
            JWTAuth::parseToken()->authenticate();
            JWTAuth::invalidate(JWTAuth::getToken());

            return response()->json(['message' => 'Successfully logged out']);
        } catch (TokenExpiredException $e) {
            return response()->json(['message' => 'You already logged out']);
        } catch (TokenInvalidException $e) {
            return response()->json(['message' => 'You already logged out']);
        } catch (JWTException $e) {
            return response()->json(['message' => 'Valid token is required'], 401);
        }
    }
}
