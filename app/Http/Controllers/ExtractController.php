<?php

namespace App\Http\Controllers;


use App\Actions\ExtractTermsAction;
use App\Http\Requests\ExtractRequest;
use App\Jobs\ProcessResourceJob;
use App\Jobs\ProcessPageForGPTJob;
use App\Models\Resource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Pest\Support\Str;

class ExtractController extends Controller
{

    public function upload(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'file' => 'required|file|max:100240|mimes:pdf'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $file = $request->file('file');
        $originalName = $file->getClientOriginalName();
        $ext = strtolower($file->getClientOriginalExtension());

        $filename = now()->format('Ymd_His_') . Str::random(6) . '.' . $ext;
        $path = $file->storeAs('resources', $filename);

        $resource = Resource::create([
            'name' => $originalName,
            'path' => $path,
            'status' => 'pending',
        ]);

        // dispatch the job to process the resource (Queue)
        ProcessResourceJob::dispatch($resource);

        return response()->json([
            'message' => 'File uploaded and queued for processing.',
            'resource_id' => $resource->id
        ]);
    }


    public function cleanText(Request $request, Resource $resource)
    {
        $validator = Validator::make($request->all(), [
            'start_page' => 'required|integer|min:1',
            'end_page'   => 'required|integer|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 422);
        }

        $startPage = $request->input('start_page');
        $endPage   = $request->input('end_page');

        if ($endPage < $startPage) {
            return response()->json([
                'errors' => ['end_page' => 'End page must be greater than or equal to start page.']
            ], 422);
        }

        $pages = $resource->pages()
            ->whereBetween('page_number', [$startPage, $endPage])
            ->get();
        if ($pages->isEmpty()) {
            return response()->json([
                'message' => 'No pages found in the specified range.'
            ], 404);
        }

        foreach ($pages as $page) {
            // Dispatch a job to process each page
            ProcessPageForGPTJob::dispatch($page);
        }

        Log::info("CleanText dispatched for Resource {$resource->id} pages {$startPage}-{$endPage}");

        return response()->json([
            'message' => 'Pages queued for cleaning and GPT processing.',
            'resource_id' => $resource->id,
            'pages_count' => $pages->count()
        ]);
    }
}
