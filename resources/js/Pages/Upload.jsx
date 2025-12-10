import { useState } from "react";
import { Head, router } from "@inertiajs/react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Progress } from "@/Components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/Components/ui/alert";
import {
    Upload,
    FileText,
    CheckCircle,
    AlertCircle,
    Loader2,
    ArrowLeft,
    FileUp,
    BookOpen,
} from "lucide-react";
import { useLanguage } from "@/Contexts/LanguageContext";

export default function UploadPage() {
    const { t } = useLanguage();
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [uploadResult, setUploadResult] = useState(null);
    const [error, setError] = useState(null);
    const [pageNumber, setPageNumber] = useState("");

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            if (selectedFile.type !== "application/pdf") {
                setError(t("upload.errors.invalid_type"));
                setFile(null);
                return;
            }

            if (selectedFile.size > 100 * 1024 * 1024) {
                // 100MB limit
                setError(t("upload.errors.file_too_large"));
                setFile(null);
                return;
            }

            setFile(selectedFile);
            setError(null);
            setUploadResult(null);
        }
    };

    const handleUpload = async () => {
        if (!file) {
            setError(t("upload.errors.no_file"));
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        if (pageNumber) {
            formData.append("page", pageNumber);
        }

        setUploading(true);
        setProgress(0);
        setError(null);

        try {
            // Simulate progress for better UX
            const progressInterval = setInterval(() => {
                setProgress((prev) => {
                    if (prev >= 90) {
                        clearInterval(progressInterval);
                        return prev;
                    }
                    return prev + 10;
                });
            }, 300);

            const response = await fetch("/api/upload", {
                method: "POST",
                body: formData,
                headers: {
                    "X-Requested-With": "XMLHttpRequest",
                    Accept: "application/json",
                },
            });

            clearInterval(progressInterval);
            setProgress(100);

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.errors?.file?.[0] ||
                        data.message ||
                        t("upload.errors.upload_failed"),
                );
            }

            setUploadResult({
                success: true,
                message: data.message,
                resourceId: data.resource_id,
            });

            // Reset form after successful upload
            setFile(null);
            document.getElementById("file-upload").value = "";
            setPageNumber("");

            // Auto-clear success message after 5 seconds
            setTimeout(() => {
                setUploadResult(null);
            }, 5000);
        } catch (err) {
            setError(err.message || t("upload.errors.upload_failed"));
        } finally {
            setUploading(false);
            setProgress(0);
        }
    };

    const handleReset = () => {
        setFile(null);
        setError(null);
        setUploadResult(null);
        setPageNumber("");
        document.getElementById("file-upload").value = "";
    };

    return (
        <>
            <Head title={t("upload.title")} />

            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <div className="container mx-auto px-4 py-8">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-4">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => router.visit("/")}
                                    className="flex items-center gap-2"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    {t("common.back")}
                                </Button>
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                    {t("upload.title")}
                                </h1>
                            </div>
                        </div>

                        <p className="text-gray-600 dark:text-gray-400 max-w-3xl">
                            {t("upload.description")}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Upload Card */}
                        <div className="lg:col-span-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <FileUp className="h-5 w-5" />
                                        {t("upload.upload_section")}
                                    </CardTitle>
                                    <CardDescription>
                                        {t("upload.upload_instructions")}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {/* File Upload Area */}
                                    <div className="space-y-4">
                                        <div className="grid w-full max-w-sm items-center gap-1.5">
                                            <Label htmlFor="file-upload">
                                                {t("upload.select_file")}
                                            </Label>
                                            <div className="flex items-center gap-4">
                                                <Input
                                                    id="file-upload"
                                                    type="file"
                                                    accept=".pdf,application/pdf"
                                                    onChange={handleFileChange}
                                                    disabled={uploading}
                                                    className="flex-1"
                                                />
                                                {file && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={handleReset}
                                                        disabled={uploading}
                                                    >
                                                        {t("common.clear")}
                                                    </Button>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-500">
                                                {t("upload.file_requirements")}
                                            </p>
                                        </div>

                                        {/* Page Number Input (Optional) */}
                                        <div className="grid w-full max-w-sm items-center gap-1.5">
                                            <Label htmlFor="page-number">
                                                {t("upload.page_number")} (
                                                {t("common.optional")})
                                            </Label>
                                            <Input
                                                id="page-number"
                                                type="number"
                                                min="1"
                                                placeholder={t(
                                                    "upload.page_placeholder",
                                                )}
                                                value={pageNumber}
                                                onChange={(e) =>
                                                    setPageNumber(
                                                        e.target.value,
                                                    )
                                                }
                                                disabled={uploading}
                                                className="max-w-xs"
                                            />
                                            <p className="text-sm text-gray-500">
                                                {t("upload.page_help")}
                                            </p>
                                        </div>

                                        {/* File Preview */}
                                        {file && (
                                            <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
                                                <div className="flex items-center gap-3">
                                                    <FileText className="h-8 w-8 text-blue-500" />
                                                    <div className="flex-1">
                                                        <p className="font-medium text-gray-900 dark:text-white">
                                                            {file.name}
                                                        </p>
                                                        <p className="text-sm text-gray-500">
                                                            {(
                                                                file.size /
                                                                (1024 * 1024)
                                                            ).toFixed(2)}{" "}
                                                            MB
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Progress Bar */}
                                        {uploading && (
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-600 dark:text-gray-400">
                                                        {t("upload.uploading")}
                                                        ...
                                                    </span>
                                                    <span className="font-medium">
                                                        {progress}%
                                                    </span>
                                                </div>
                                                <Progress
                                                    value={progress}
                                                    className="h-2"
                                                />
                                            </div>
                                        )}

                                        {/* Upload Button */}
                                        <Button
                                            onClick={handleUpload}
                                            disabled={!file || uploading}
                                            className="w-full sm:w-auto"
                                            size="lg"
                                        >
                                            {uploading ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    {t("upload.uploading")}...
                                                </>
                                            ) : (
                                                <>
                                                    <Upload className="mr-2 h-4 w-4" />
                                                    {t("upload.upload_button")}
                                                </>
                                            )}
                                        </Button>
                                    </div>

                                    {/* Success Message */}
                                    {uploadResult?.success && (
                                        <Alert className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                                            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                                            <AlertTitle className="text-green-800 dark:text-green-300">
                                                {t("upload.success")}
                                            </AlertTitle>
                                            <AlertDescription className="text-green-700 dark:text-green-400">
                                                {uploadResult.message}
                                                {uploadResult.resourceId && (
                                                    <p className="mt-1">
                                                        {t(
                                                            "upload.resource_id",
                                                        )}
                                                        :{" "}
                                                        {
                                                            uploadResult.resourceId
                                                        }
                                                    </p>
                                                )}
                                            </AlertDescription>
                                        </Alert>
                                    )}

                                    {/* Error Message */}
                                    {error && (
                                        <Alert variant="destructive">
                                            <AlertCircle className="h-4 w-4" />
                                            <AlertTitle>
                                                {t("upload.error")}
                                            </AlertTitle>
                                            <AlertDescription>
                                                {error}
                                            </AlertDescription>
                                        </Alert>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Sidebar Info */}
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <BookOpen className="h-5 w-5" />
                                        {t("upload.how_it_works")}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-3">
                                        <div className="flex items-start gap-3">
                                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 text-xs font-semibold">
                                                1
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white">
                                                    {t("upload.step1_title")}
                                                </p>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    {t("upload.step1_desc")}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 text-xs font-semibold">
                                                2
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white">
                                                    {t("upload.step2_title")}
                                                </p>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    {t("upload.step2_desc")}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 text-xs font-semibold">
                                                3
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white">
                                                    {t("upload.step3_title")}
                                                </p>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    {t("upload.step3_desc")}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>{t("upload.tips")}</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                                        <li className="flex items-start gap-2">
                                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                                            <span>{t("upload.tip1")}</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                                            <span>{t("upload.tip2")}</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                                            <span>{t("upload.tip3")}</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                                            <span>{t("upload.tip4")}</span>
                                        </li>
                                    </ul>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
