<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\SearchService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use OpenAI\Laravel\Facades\OpenAI;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ChatController extends Controller
{
    protected $searchService;

    public function __construct(SearchService $searchService)
    {
        $this->searchService = $searchService;
    }

    public function index(): Response
    {
        return Inertia::render('Chat/Index');
    }

    public function chat(Request $request)
    {
        $request->validate([
            'messages' => 'required|array',
            'messages.*.role' => 'required|string|in:user,assistant',
            'messages.*.content' => 'nullable|string',
        ]);

        $userMessages = $request->input('messages');
        
        return new StreamedResponse(function () use ($userMessages) {
            // Disable output buffering
            if (ob_get_level()) ob_end_clean();

            try {
                $systemMessage = [
                    'role' => 'system', 
                    'content' => 'You are a helpful assistant capable of searching for terms and listing resources used in the database. 
                    
IMPORTANT:
1. Always respond in ARABIC, even if the user asks in English.
2. Always mention the Resource Name and Page Number for each term found (in Arabic context).
3. If the user asks for exact matches, use the `search_terms` tool with `exact_match=true`.
4. If the user asks about the project or capabilities, use `get_project_info`.
'
                ];

                // Prepend system message to history
                $messages = array_merge([$systemMessage], $userMessages);

                $tools = [
                    [
                        'type' => 'function',
                        'function' => [
                            'name' => 'search_terms',
                            'description' => 'Search for terms in the database. Returns grouped terms with resource information.',
                            'parameters' => [
                                'type' => 'object',
                                'properties' => [
                                    'query' => [
                                        'type' => 'string',
                                        'description' => 'The search query for terms (English or Arabic)',
                                    ],
                                    'exact_match' => [
                                        'type' => 'boolean',
                                        'description' => 'Set to true for exact match only, false for partial match (default)',
                                    ],
                                ],
                                'required' => ['query'],
                            ],
                        ],
                    ],
                    [
                        'type' => 'function',
                        'function' => [
                            'name' => 'get_project_info',
                            'description' => 'Get information about the project, what it does, and what tools are available.',
                            'parameters' => [
                                'type' => 'object',
                                'properties' => (object)[],
                            ],
                        ],
                    ],
                    [
                        'type' => 'function',
                        'function' => [
                            'name' => 'list_resources',
                            'description' => 'List all available resources with their status and page counts.',
                            'parameters' => [
                                'type' => 'object',
                                'properties' => (object)[],
                            ],
                        ],
                    ],
                ];

                // First call - check if tools are needed (not streamed yet)
                $response = OpenAI::chat()->create([
                    'model' => env('OPENAI_MODEL', 'deepseek-chat'),
                    'messages' => $messages,
                    'tools' => $tools,
                ]);

                $choice = $response->choices[0];
                $finishReason = $choice->finishReason;

                // If the model wants to call a tool
                if ($finishReason === 'tool_calls' || $choice->message->toolCalls) {
                    // Send a "thinking" chunk to the client
                    echo json_encode(['chunk' => "Thinking...\n"]) . "\n";
                    flush();

                    $toolCalls = $choice->message->toolCalls;
                    
                    // Append the assistant's message with tool calls to history
                    $messages[] = $choice->message->toArray();

                    foreach ($toolCalls as $toolCall) {
                        $functionName = $toolCall->function->name;
                        $arguments = json_decode($toolCall->function->arguments, true);
                        
                        $result = null;

                        try {
                            if ($functionName === 'search_terms') {
                                $result = $this->searchService->searchTerms($arguments['query'] ?? '', $arguments['exact_match'] ?? false);
                            } elseif ($functionName === 'list_resources') {
                                $result = $this->searchService->listResources();
                            } elseif ($functionName === 'get_project_info') {
                                $result = [
                                    'name' => 'Term Extractor AI',
                                    'description' => 'A system to extract, verify, and search for terminology from PDF resources.',
                                    'capabilities' => [
                                        'Search Terms' => 'Find terms in English or Arabic, with options for exact or partial matching.',
                                        'List Resources' => 'View all PDF resources the terms are extracted from.',
                                        'Detailed Context' => 'See exactly which page number a term appears on in a specific book.',
                                    ]
                                ];
                            } else {
                                $result = ['error' => "Unknown tool: $functionName"];
                            }
                        } catch (\Exception $e) {
                            $result = ['error' => $e->getMessage()];
                        }

                        // Append tool result to messages
                        $messages[] = [
                            'role' => 'tool',
                            'tool_call_id' => $toolCall->id,
                            'content' => json_encode($result),
                        ];
                    }

                    // Streaming the final response
                    $stream = OpenAI::chat()->createStreamed([
                        'model' => env('OPENAI_MODEL', 'deepseek-chat'),
                        'messages' => $messages,
                    ]);

                    foreach ($stream as $response) {
                        if (isset($response->choices[0]->delta->content)) {
                            $content = $response->choices[0]->delta->content;
                            
                            // Aggressively clean ANY tag that looks like internal model instructions
                            // Handles <|DSML|...>, <dsml>...</dsml>, <think>...</think>, etc.
                            // Also handle the variations with unicode pipes if they occur
                            $content = preg_replace('/<[\|｜].*?[\|｜]>/su', '', $content);
                            $content = preg_replace('/<dsml>.*?<\/dsml>/si', '', $content);
                            $content = preg_replace('/<think>.*?<\/think>/si', '', $content);
                            
                            if ($content !== '') {
                                echo json_encode(['chunk' => $content]) . "\n";
                                flush();
                            }
                        }
                    }

                } else {
                    // No tool called, just stream the original content
                    $content = $choice->message->content;
                    // Aggressive clean
                    $content = preg_replace('/<[\|｜].*?[\|｜]>/su', '', $content);
                    $content = preg_replace('/<dsml>.*?<\/dsml>/si', '', $content);
                    $content = preg_replace('/<think>.*?<\/think>/si', '', $content);
                    
                    echo json_encode(['chunk' => $content]) . "\n";
                    flush();
                }
            } catch (\Exception $e) {
                Log::error('Chat Stream Error: ' . $e->getMessage());
                echo json_encode(['chunk' => "Error: " . $e->getMessage()]) . "\n";
                flush();
            }

        }, 200, [
            'Content-Type' => 'application/x-ndjson',
            'X-Accel-Buffering' => 'no',
            'Cache-Control' => 'no-cache',
            'Connection' => 'keep-alive',
        ]);
    }
}
