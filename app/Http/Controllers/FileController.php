<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * Serves user-uploaded files (MOV PDFs, signed IPCRFs, profile photos) that live
 * on the "public" disk (storage/app/public).
 *
 * We deliberately do NOT rely on the public/storage symlink: shared hosting
 * (Hostinger) frequently refuses to follow it and answers /storage/... with a
 * bare Apache 403. Routing the files through PHP also means only authenticated
 * users can read them, instead of anyone who guesses the URL.
 */
class FileController extends Controller
{
    public function __invoke(Request $request, string $path): StreamedResponse
    {
        // Block path traversal (".." segments, null bytes, absolute paths).
        abort_if(
            str_contains($path, '..') || str_contains($path, "\0") || str_starts_with($path, '/'),
            404
        );

        $disk = Storage::disk('public');

        abort_unless($disk->exists($path), 404);

        // Inline so PDFs/images render in the <iframe>/<img> instead of downloading.
        return $disk->response($path, null, [
            'Content-Disposition' => 'inline; filename="'.basename($path).'"',
        ]);
    }
}
