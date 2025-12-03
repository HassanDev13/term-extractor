<?php

namespace App\Http\Controllers;

use App\Models\Resource;
use App\Models\ResourcePage;
use App\Models\Term;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class VerificationController extends Controller
{
    public function verifyTerm(Term $term)
    {
        return $this->renderVerificationPage($term->resourcePage, $term);
    }

    public function verifyPage(ResourcePage $page)
    {
        return $this->renderVerificationPage($page);
    }

    private function renderVerificationPage(ResourcePage $page, ?Term $currentTerm = null)
    {
        $page->load('resource');
        $resource = $page->resource;
        $resource->load('pages');
        $terms = $page->terms()->orderBy('y')->get();

        $allPages = $resource->pages()->orderBy('page_number')->get();
        
        $nextPage = $resource->pages()
            ->where('page_number', '>', $page->page_number)
            ->orderBy('page_number')
            ->first();

        $prevPage = $resource->pages()
            ->where('page_number', '<', $page->page_number)
            ->orderBy('page_number', 'desc')
            ->first();

        return Inertia::render('Terms/Verify', [
            'currentTerm' => $currentTerm,
            'page' => $page,
            'resource' => [
                'id' => $resource->id,
                'name' => $resource->name,
                'pages' => $allPages->map(fn($p) => [
                    'id' => $p->id,
                    'page_number' => $p->page_number,
                ]),
            ],
            'terms' => $terms,
            'nextPageId' => $nextPage?->id,
            'prevPageId' => $prevPage?->id,
            'totalPages' => $resource->pages()->count(),
            'pdfUrl' => route('resources.pdf', $resource->id),
        ]);
    }

    public function servePdf(Resource $resource)
    {
        $path = storage_path('app/private/' . $resource->path);
        
        if (!file_exists($path)) {
            abort(404);
        }

        return response()->file($path);
    }

    public function updateTermStatus(Request $request, Term $term)
    {
        $validated = $request->validate([
            'status' => 'required|in:accepted,rejected,inverfy',
            'rejection_reason' => 'nullable|string|required_if:status,rejected',
        ]);

        $term->update($validated);

        return back();
    }
}
