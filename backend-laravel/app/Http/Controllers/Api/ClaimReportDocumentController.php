<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ClaimReport;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class ClaimReportDocumentController extends Controller
{
    public function show(Request $request, ClaimReport $claimReport): BinaryFileResponse
    {
        $user = auth('api')->user();
        if ($claimReport->user_id !== $user->id && ! $user->isAdmin()) {
            abort(403, 'You cannot access this document.');
        }

        if (! Storage::disk('local')->exists($claimReport->document_path)) {
            abort(404, 'File not found.');
        }

        $path = Storage::disk('local')->path($claimReport->document_path);
        $download = $request->boolean('download');
        $filename = $claimReport->document_name ?: basename($claimReport->document_path);

        $disposition = $download
            ? 'attachment; filename="'.$this->asciiFilename($filename).'"'
            : 'inline; filename="'.$this->asciiFilename($filename).'"';

        return response()->file($path, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => $disposition,
        ]);
    }

    private function asciiFilename(string $name): string
    {
        $safe = preg_replace('/[^\x20-\x7E]/', '_', $name);

        return $safe !== '' ? $safe : 'document.pdf';
    }
}
