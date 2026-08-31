<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Stop the browser from re-showing an authenticated page after logout.
 *
 * Without this, pressing the browser Back button after logging out serves the
 * cached HTML (or the back/forward cache) of the last panel page, so it looks
 * like the user is still signed in. `no-store` forces the browser to re-request
 * the page, which then hits the `auth` middleware and redirects to /login.
 */
class NoCache
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        if (method_exists($response, 'headers')) {
            $response->headers->set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
            $response->headers->set('Pragma', 'no-cache');
            $response->headers->set('Expires', 'Sat, 01 Jan 2000 00:00:00 GMT');
        }

        return $response;
    }
}
