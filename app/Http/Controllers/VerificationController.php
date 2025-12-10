<?php

namespace App\Http\Controllers;

use App\Models\Resource;
use App\Models\ResourcePage;
use App\Models\Term;
use App\Models\TermEdit;
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

    private function renderVerificationPage(
        ResourcePage $page,
        ?Term $currentTerm = null,
    ) {
        $page->load("resource");
        $resource = $page->resource;
        $resource->load("pages");
        $terms = $page->terms()->orderBy("y")->get();

        // Load edit history for each term with user information
        $terms->load([
            "edits" => function ($query) {
                $query->with("user")->orderBy("created_at", "desc");
            },
        ]);

        $allPages = $resource->pages()->orderBy("page_number")->get();

        $nextPage = $resource
            ->pages()
            ->where("page_number", ">", $page->page_number)
            ->orderBy("page_number")
            ->first();

        $prevPage = $resource
            ->pages()
            ->where("page_number", "<", $page->page_number)
            ->orderBy("page_number", "desc")
            ->first();

        return Inertia::render("Terms/Verify", [
            "auth" => [
                "user" => auth()->user(),
            ],
            "currentTerm" => $currentTerm,
            "page" => [
                "id" => $page->id,
                "page_number" => $page->page_number,
                "image_path" => $page->image_path,
                "status" => $page->status,
                "resource_id" => $page->resource_id,
            ],
            "resource" => [
                "id" => $resource->id,
                "name" => $resource->name,
                "pages" => $allPages->map(
                    fn($p) => [
                        "id" => $p->id,
                        "page_number" => $p->page_number,
                    ],
                ),
            ],
            "terms" => $terms,
            "nextPageId" => $nextPage?->id,
            "prevPageId" => $prevPage?->id,
            "totalPages" => $resource->pages()->count(),
            "pdfUrl" => route("resources.pdf", $resource->id),
            "imageUrl" => $page->image_path
                ? route("pages.image", $page->id)
                : null,
        ]);
    }

    public function servePdf(Resource $resource)
    {
        $path = storage_path("app/private/" . $resource->path);

        if (!file_exists($path)) {
            abort(404);
        }

        return response()->file($path);
    }

    public function serveImage(ResourcePage $page)
    {
        if (!$page->image_path) {
            abort(404);
        }

        $path = storage_path("app/" . $page->image_path);

        if (!file_exists($path)) {
            abort(404);
        }

        // Add caching headers for better performance
        $lastModified = filemtime($path);
        $etag = md5($path . $lastModified);

        // Check if client has cached version
        $ifNoneMatch = request()->header("If-None-Match");
        $ifModifiedSince = request()->header("If-Modified-Since");

        if ($ifNoneMatch && $ifNoneMatch === $etag) {
            return response()->make("", 304); // Not Modified
        }

        if ($ifModifiedSince && strtotime($ifModifiedSince) >= $lastModified) {
            return response()->make("", 304); // Not Modified
        }

        return response()
            ->file($path)
            ->header("Cache-Control", "public, max-age=31536000") // 1 year
            ->header(
                "Expires",
                gmdate("D, d M Y H:i:s", time() + 31536000) . " GMT",
            )
            ->header("ETag", $etag)
            ->header(
                "Last-Modified",
                gmdate("D, d M Y H:i:s", $lastModified) . " GMT",
            );
    }

    public function updateTerm(Request $request, Term $term)
    {
        $validated = $request->validate([
            "term_en" => "nullable|string|max:255",
            "term_ar" => "nullable|string|max:255",
            "corrections" => "nullable|string",
        ]);

        // Remove null values to only update provided fields
        $validated = array_filter($validated, fn($value) => $value !== null);

        // Record edit history for each changed field
        foreach ($validated as $field => $newValue) {
            $oldValue = $term->$field;

            // Only record if value actually changed
            if ($oldValue !== $newValue) {
                TermEdit::create([
                    "term_id" => $term->id,
                    "user_id" => auth()->id(),
                    "field_changed" => $field,
                    "old_value" => $oldValue,
                    "new_value" => $newValue,
                ]);
            }
        }

        $term->update($validated);

        return back();
    }

    public function updateTermStatus(Request $request, Term $term)
    {
        $validated = $request->validate([
            "status" => "required|in:accepted,rejected,unverified",
            "rejection_reason" => "nullable|string|required_if:status,rejected",
        ]);

        // Record status change in edit history
        $oldStatus = $term->status;
        $newStatus = $validated["status"];

        if ($oldStatus !== $newStatus) {
            TermEdit::create([
                "term_id" => $term->id,
                "user_id" => auth()->id(),
                "field_changed" => "status",
                "old_value" => $oldStatus,
                "new_value" => $newStatus,
            ]);
        }

        $term->update($validated);

        return back();
    }
}
