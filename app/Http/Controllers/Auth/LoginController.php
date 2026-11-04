<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Services\Auth\AuthService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LoginController extends Controller
{
    public function __construct(private readonly AuthService $authService)
    {
    }

    public function create(Request $request): RedirectResponse|Response
    {
        // Si ya hay sesión activa, no mostramos el form -- lo mandamos
        // a donde le corresponda según su rol, la misma lógica que
        // usa store() justo después de loguearse.
        if ($request->user()) {
            return redirect()->to(
                $this->authService->redirectPathFor($request->user())
            );
        }
        
        return Inertia::render('Auth/LoginPage');
    }

    public function store(Request $request): RedirectResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        if (! $this->authService->attempt($credentials, $request->boolean('remember'))) {
            return back()
                ->withErrors(['email' => 'Credenciais inválidas.'])
                ->onlyInput('email');
        }

        $request->session()->regenerate();

        return redirect()->to(
            $this->authService->redirectPathFor($request->user())
        );
    }

    public function destroy(Request $request): RedirectResponse
    {
        $this->authService->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login');
    }
}