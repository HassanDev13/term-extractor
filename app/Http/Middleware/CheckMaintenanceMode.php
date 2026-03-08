<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckMaintenanceMode
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Skip maintenance mode check for admin routes
        if ($request->is('admin*')) {
            return $next($request);
        }

        $isMaintenanceMode = \App\Models\Setting::get('maintenance_mode', false);

        if ($isMaintenanceMode) {
            // Allow logged-in admins to bypass maintenance mode on the frontend
            if (auth()->check() && auth()->user()->is_admin) {
                return $next($request);
            }

            // Abort with 503 Service Unavailable
            abort(503, 'The site is currently in maintenance mode. Please check back later.');
        }

        return $next($request);
    }
}
