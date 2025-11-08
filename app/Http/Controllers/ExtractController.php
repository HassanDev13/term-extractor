<?php

namespace App\Http\Controllers;


use App\Actions\ExtractTermsAction;
use App\Http\Requests\ExtractRequest;
use Illuminate\Http\JsonResponse;

class ExtractController extends Controller
{
    public function store(ExtractRequest $request, ExtractTermsAction $action): JsonResponse
    {
        $result = $action->execute(
            $request->file('file'),
            $request->boolean('use_gpt'),
            $request->boolean('use_tesseract')
        );

        return response()->json([
            'status' => 'success',
            'data' => $result,
        ]);
    }
}