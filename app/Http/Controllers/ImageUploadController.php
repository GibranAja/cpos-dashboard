<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

/**
 * Dashboard-owned image hosting. The API only stores image URL strings and has
 * no upload endpoint, so we persist the file on the public disk and hand back an
 * absolute URL to embed as `imageUrl` / `qrisImageUrl`.
 *
 * APP_URL must be the public dashboard domain so the mobile app can load these.
 */
class ImageUploadController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'image' => ['required', 'image', 'max:4096'], // 4 MB
            'folder' => ['nullable', 'in:products,qris'],
        ]);

        $folder = $request->input('folder', 'products');
        $path = $request->file('image')->store($folder, 'public');

        return response()->json([
            'url' => Storage::disk('public')->url($path),
            'path' => $path,
        ]);
    }
}
