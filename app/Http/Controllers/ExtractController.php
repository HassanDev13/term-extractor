<?php

namespace App\Http\Controllers;


use App\Actions\ExtractTermsAction;
use App\Http\Requests\ExtractRequest;
use App\Jobs\ProcessResourceJob;
use App\Models\Resource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Pest\Support\Str;

class ExtractController extends Controller
{
    public function store(ExtractRequest $request, ExtractTermsAction $action): JsonResponse
    {
        $result = $action->execute(
            $request->file('file'),
            $request->boolean('use_gpt'),
            $request->boolean('use_tesseract'),
            $request->integer('page')
        );

        return response()->json([
            'status' => 'success',
            'data' => $result,
        ], 200, [], JSON_UNESCAPED_UNICODE);
    }

    public function upload(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'file' => 'required|file|max:10240|mimes:pdf'
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
}
