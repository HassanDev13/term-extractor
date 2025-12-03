<?php

namespace App\Http\Controllers;

use App\Models\Term;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TermController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->input('search', '');
     $terms = Term::query()
    ->with(['resourcePage.resource'])
    ->when($search, function ($query, $search) {
        $query->where(function ($q) use ($search) {
            $q->whereRaw('LOWER(term_en) = ?', [strtolower($search)])
              ->orWhereRaw('LOWER(term_ar) = ?', [strtolower($search)]);
        });
    })
    ->orderBy('created_at', 'desc')
    ->paginate(20)
    ->withQueryString();
        return Inertia::render('Terms/Index', [
            'terms' => $terms,
            'filters' => [
                'search' => $search,
            ],
        ]);
    }
}
