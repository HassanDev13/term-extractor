<?php

namespace App\Jobs;

use App\Models\Resource;
use Exception;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Spatie\PdfToText\Pdf;

class ProcessPageExtractionJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected Resource $resource;
    protected int $pageNumber;
    protected bool $forceOCR;
    public function __construct(Resource $resource, int $pageNumber, bool $forceOCR = false)
    {
        $this->resource = $resource;
        $this->pageNumber = $pageNumber;
        $this->forceOCR = $forceOCR;
    }

    public function handle()
    {
        $fullPath = storage_path('app/private/' . $this->resource->path);

        if (!file_exists($fullPath)) {
            throw new Exception("File not found: {$fullPath}");
        }

        try {
            $text = Pdf::getText($fullPath);

            if (!empty(trim($text)) && $this->forceOCR) {

                // NEED WORK , ALL Content stored on single page
                $this->resource->pages()->create([
                    'page_number' => $this->pageNumber,
                    'text'        => trim($text),
                    'image_path' => '',
                    'status'      => 'done',
                ]);

                Log::info("Page {$this->pageNumber} text extracted directly from PDF for Resource {$this->resource->id}");
                return;
            }

            $this->extractPageToImageAndDispatchOCR($fullPath);
        } catch (Exception $e) {
            Log::error("ProcessPageExtractionJob failed on page {$this->pageNumber}", [
                'resource_id' => $this->resource->id,
                'error'       => $e->getMessage(),
            ]);

            $this->resource->pages()->create([
                'page_number'   => $this->pageNumber,
                'image_path'    => null,
                'status'        => 'error',
                'error_message' => $e->getMessage(),
            ]);

            throw $e;
        }
    }
    /**
     * Extracts a single page from the PDF as a high-resolution image,
     * enhances the image for better OCR quality,
     * stores its path in the database,
     * and dispatches a job to run OCR on that page.
     */
    protected function extractPageToImageAndDispatchOCR(string $fullPath)
    {
        $tmpDir = storage_path('app/tmp/pdf_' . $this->resource->id . '_' . uniqid());
        if (!is_dir($tmpDir)) mkdir($tmpDir, 0777, true);

        $pagesDir = storage_path('app/resource_pages/' . $this->resource->id);
        if (!is_dir($pagesDir)) mkdir($pagesDir, 0777, true);

        $cmd = "pdftoppm -png -r 500 -f {$this->pageNumber} -l {$this->pageNumber} "
            . escapeshellarg($fullPath) . " "
            . escapeshellarg($tmpDir . '/page');
        exec($cmd, $output, $return);

        if ($return !== 0) {
            throw new Exception("pdftoppm failed on page {$this->pageNumber} with code {$return}");
        }

        $images = glob($tmpDir . '/page-*.png');
        if (empty($images)) {
            throw new Exception("No image generated for page {$this->pageNumber}");
        }

        $imgPath = $images[0];
        $processedImage = $tmpDir . '/page-' . $this->pageNumber . '-processed.png';

        $cmd2 = "convert " . escapeshellarg($imgPath) .
            " -colorspace Gray -type Grayscale -density 500 " .
            "-sharpen 0x0.5 -contrast-stretch 0.1%x0.1% -morphology close diamond:1 " .
            "-despeckle -blur 0x0.5 -unsharp 0x1 " .
            escapeshellarg($processedImage);
        exec($cmd2, $output2, $return2);
        if ($return2 !== 0) {
            throw new Exception("ImageMagick convert failed on page {$this->pageNumber} with code {$return2}");
        }

        $destPath = $pagesDir . '/page-' . $this->pageNumber . '.png';
        rename($processedImage, $destPath);

        $relPath = 'resource_pages/' . $this->resource->id . '/page-' . $this->pageNumber . '.png';

        $page = $this->resource->pages()->create([
            'page_number' => $this->pageNumber,
            'image_path'  => $relPath,
            'status'      => 'pending',
        ]);

        @unlink($imgPath);
        @rmdir($tmpDir);

        ProcessPageJob::dispatch($page);
    }
}
