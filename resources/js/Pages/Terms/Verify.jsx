import { useState, useEffect, useRef } from "react";
import { Head, router } from "@inertiajs/react";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Badge } from "@/Components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/Components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/Components/ui/dialog";
import { Textarea } from "@/Components/ui/textarea";
import {
    ChevronLeft,
    ChevronRight,
    Check,
    X,
    ZoomIn,
    ZoomOut,
    RotateCcw,
    History,
    ArrowLeft,
    Star,
    FileText,
    List,
} from "lucide-react";
import { Document, Page, pdfjs } from "react-pdf";
import { useLanguage } from "@/Contexts/LanguageContext";

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function Verify({
    auth,
    currentTerm,
    page,
    resource,
    terms,
    nextPageId,
    prevPageId,
    totalPages,
    pdfUrl,
}) {
    const { t, locale } = useLanguage();
    const isAuthenticated = !!auth?.user;
    const [numPages, setNumPages] = useState(null);
    const [pageInput, setPageInput] = useState(page.page_number.toString());
    const [rejectionDialog, setRejectionDialog] = useState({
        open: false,
        term: null,
    });
    const [rejectionReason, setRejectionReason] = useState("");
    const [historyDialog, setHistoryDialog] = useState({
        open: false,
        term: null,
    });
    const [scale, setScale] = useState(1.0);
    const [editingEnglishTerms, setEditingEnglishTerms] = useState({});
    const [editingArabicTerms, setEditingArabicTerms] = useState({});

    // Mobile view toggle state
    const [showPdfOnMobile, setShowPdfOnMobile] = useState(true);

    // Dragging state for PDF
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [scrollPos, setScrollPos] = useState({ x: 0, y: 0 });
    const pdfContainerRef = useRef(null);

    const onDocumentLoadSuccess = ({ numPages }) => {
        setNumPages(numPages);
    };

    const handlePageNavigation = (pageNumber) => {
        const targetPage = resource.pages?.find(
            (p) => p.page_number === pageNumber,
        );
        if (targetPage) {
            router.visit(route("pages.verify", targetPage.id));
        }
    };

    const handlePageInputSubmit = () => {
        const pageNum = parseInt(pageInput);
        if (pageNum >= 1 && pageNum <= totalPages) {
            handlePageNavigation(pageNum);
        }
    };

    const handlePageInputKeyPress = (e) => {
        if (e.key === "Enter") {
            handlePageInputSubmit();
        }
    };

    const handleStatusUpdate = (term, status) => {
        if (status === "rejected") {
            setRejectionDialog({ open: true, term });
            setRejectionReason("");
        } else if (status === "unverified") {
            router.put(
                route("terms.update-status", term.id),
                {
                    status: "unverified",
                    rejection_reason: null,
                },
                {
                    preserveScroll: true,
                },
            );
        } else {
            router.put(
                route("terms.update-status", term.id),
                {
                    status,
                    rejection_reason: null,
                },
                {
                    preserveScroll: true,
                },
            );
        }
    };

    const handleRejectSubmit = () => {
        if (rejectionDialog.term && rejectionReason.trim()) {
            router.put(
                route("terms.update-status", rejectionDialog.term.id),
                {
                    status: "rejected",
                    rejection_reason: rejectionReason,
                },
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        setRejectionDialog({ open: false, term: null });
                        setRejectionReason("");
                    },
                },
            );
        }
    };

    const handleEnglishTermChange = (termId, value) => {
        setEditingEnglishTerms((prev) => ({
            ...prev,
            [termId]: value,
        }));
    };

    const handleEnglishTermUpdate = (term) => {
        const newValue = editingEnglishTerms[term.id];
        if (newValue && newValue.trim() !== "" && newValue !== term.term_en) {
            router.put(
                route("terms.update", term.id),
                {
                    term_en: newValue.trim(),
                },
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        setEditingEnglishTerms((prev) => {
                            const updated = { ...prev };
                            delete updated[term.id];
                            return updated;
                        });
                    },
                },
            );
        }
    };

    const handleEnglishInputKeyPress = (e, term) => {
        if (e.key === "Enter") {
            handleEnglishTermUpdate(term);
        }
    };

    const handleArabicTermChange = (termId, value) => {
        setEditingArabicTerms((prev) => ({
            ...prev,
            [termId]: value,
        }));
    };

    const handleArabicTermUpdate = (term) => {
        const newValue = editingArabicTerms[term.id];
        if (newValue && newValue.trim() !== "" && newValue !== term.term_ar) {
            router.put(
                route("terms.update", term.id),
                {
                    term_ar: newValue.trim(),
                },
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        setEditingArabicTerms((prev) => {
                            const updated = { ...prev };
                            delete updated[term.id];
                            return updated;
                        });
                    },
                },
            );
        }
    };

    const handleArabicInputKeyPress = (e, term) => {
        if (e.key === "Enter") {
            handleArabicTermUpdate(term);
        }
    };

    const handleZoomIn = () => setScale((prev) => Math.min(prev + 0.2, 2.0));
    const handleZoomOut = () => setScale((prev) => Math.max(prev - 0.2, 0.6));

    // PDF Dragging handlers
    const handleMouseDown = (e) => {
        if (!pdfContainerRef.current) return;
        setIsDragging(true);
        setDragStart({
            x: e.clientX - scrollPos.x,
            y: e.clientY - scrollPos.y,
        });
        pdfContainerRef.current.style.cursor = "grabbing";
    };

    const handleMouseMove = (e) => {
        if (!isDragging || !pdfContainerRef.current) return;
        e.preventDefault();

        const x = e.clientX - dragStart.x;
        const y = e.clientY - dragStart.y;

        setScrollPos({ x, y });
        pdfContainerRef.current.scrollLeft = -x;
        pdfContainerRef.current.scrollTop = -y;
    };

    const handleMouseUp = () => {
        setIsDragging(false);
        if (pdfContainerRef.current) {
            pdfContainerRef.current.style.cursor = "grab";
        }
    };

    const handleMouseLeave = () => {
        setIsDragging(false);
        if (pdfContainerRef.current) {
            pdfContainerRef.current.style.cursor = "grab";
        }
    };

    const handleLogout = () => {
        router.post("/logout");
    };

    return (
        <>
            <Head
                title={`${t("verify.title")} - ${resource.name} - ${t("common.page")} ${page.page_number}`}
            />

            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
                <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-[1800px]">
                    {/* Header */}
                    <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="flex items-start gap-3 sm:gap-4">
                            <Button
                                variant="outline"
                                onClick={() =>
                                    router.visit(route("terms.index"))
                                }
                                className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shrink-0"
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                <span className="hidden sm:inline">
                                    {t("common.back")}
                                </span>
                                <span className="sm:hidden">
                                    {t("common.back_short")}
                                </span>
                            </Button>
                            <div className="flex-1 min-w-0">
                                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2 truncate">
                                    <span className="hidden sm:inline">
                                        {t("verify.status")}
                                    </span>
                                    <span className="sm:hidden">
                                        {t("verify.status_short")}
                                    </span>
                                </h1>
                                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                                    {resource.name} - {t("common.page")}{" "}
                                    {page.page_number} {t("common.of")}{" "}
                                    {totalPages}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3">
                            {auth?.user && (
                                <>
                                    <div className="text-right hidden sm:block">
                                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                                            {t("common.signed_in_as")}
                                        </p>
                                        <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate max-w-[150px]">
                                            {auth.user.email}
                                        </p>
                                    </div>
                                    <Button
                                        variant="outline"
                                        onClick={handleLogout}
                                        className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-xs sm:text-sm px-2 sm:px-4"
                                    >
                                        <span className="hidden sm:inline">
                                            {t("common.logout")}
                                        </span>
                                        <span className="sm:hidden">
                                            {t("common.logout_short")}
                                        </span>
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Read-Only Mode Banner */}
                    {!isAuthenticated && (
                        <div className="mb-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 sm:p-4">
                            <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-200">
                                <strong>{t("verify.read_only_title")}</strong>{" "}
                                {t("verify.read_only_desc")}{" "}
                                <a
                                    href="/login"
                                    className="underline hover:text-blue-600"
                                >
                                    {t("common.login")}
                                </a>
                                .
                            </p>
                        </div>
                    )}

                    {/* Mobile Toggle Button */}
                    <div className="lg:hidden mb-4 flex gap-2">
                        <Button
                            variant={showPdfOnMobile ? "default" : "outline"}
                            onClick={() => setShowPdfOnMobile(true)}
                            className="flex-1"
                        >
                            <FileText className="h-4 w-4 mr-2" />
                            PDF
                        </Button>
                        <Button
                            variant={!showPdfOnMobile ? "default" : "outline"}
                            onClick={() => setShowPdfOnMobile(false)}
                            className="flex-1"
                        >
                            <List className="h-4 w-4 mr-2" />
                            {t("verify.terms")} ({terms.length})
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
                        {/* Left: PDF Viewer - 5 columns */}
                        <div
                            className={`lg:col-span-5 bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden transition-colors duration-200 ${!showPdfOnMobile ? "hidden lg:block" : ""}`}
                        >
                            <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                    <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                                        {t("verify.document_preview")}
                                    </h2>
                                    <div className="flex items-center gap-1 sm:gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleZoomOut}
                                            disabled={scale <= 0.6}
                                            className="h-8 w-8 sm:h-9 sm:w-auto px-1 sm:px-3"
                                        >
                                            <ZoomOut className="h-3 w-3 sm:h-4 sm:w-4" />
                                            <span className="hidden sm:inline ml-1">
                                                -
                                            </span>
                                        </Button>
                                        <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 min-w-10 sm:min-w-12 text-center">
                                            {Math.round(scale * 100)}%
                                        </span>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleZoomIn}
                                            disabled={scale >= 2.0}
                                            className="h-8 w-8 sm:h-9 sm:w-auto px-1 sm:px-3"
                                        >
                                            <ZoomIn className="h-3 w-3 sm:h-4 sm:w-4" />
                                            <span className="hidden sm:inline ml-1">
                                                +
                                            </span>
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            <div
                                ref={pdfContainerRef}
                                className="bg-gray-100 dark:bg-gray-950 overflow-auto transition-colors duration-200 select-none"
                                style={{
                                    height: "calc(100vh - 320px)",
                                    cursor: scale > 1 ? "grab" : "default",
                                }}
                                onMouseDown={
                                    scale > 1 ? handleMouseDown : undefined
                                }
                                onMouseMove={
                                    scale > 1 ? handleMouseMove : undefined
                                }
                                onMouseUp={
                                    scale > 1 ? handleMouseUp : undefined
                                }
                                onMouseLeave={
                                    scale > 1 ? handleMouseLeave : undefined
                                }
                            >
                                <div className="flex items-start justify-center p-2 sm:p-4 min-h-full">
                                    <Document
                                        file={pdfUrl}
                                        onLoadSuccess={onDocumentLoadSuccess}
                                        loading={
                                            <div className="flex items-center justify-center p-8">
                                                <div className="text-gray-500 dark:text-gray-400">
                                                    {t("verify.loading_pdf")}
                                                </div>
                                            </div>
                                        }
                                        error={
                                            <div className="flex items-center justify-center p-8">
                                                <div className="text-red-500 dark:text-red-400">
                                                    {t("verify.failed_pdf")}
                                                </div>
                                            </div>
                                        }
                                    >
                                        <Page
                                            pageNumber={page.page_number}
                                            scale={scale}
                                            renderTextLayer={false}
                                            renderAnnotationLayer={false}
                                            className="shadow-lg pointer-events-none"
                                        />
                                    </Document>
                                </div>
                            </div>

                            {/* Navigation Controls */}
                            <div className="p-3 sm:p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-colors duration-200">
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4">
                                    <Button
                                        variant="outline"
                                        onClick={() =>
                                            prevPageId &&
                                            router.visit(
                                                route(
                                                    "pages.verify",
                                                    prevPageId,
                                                ),
                                            )
                                        }
                                        disabled={!prevPageId}
                                        className="shrink-0 w-full sm:w-auto"
                                    >
                                        <ChevronLeft className="h-4 w-4 mr-2" />
                                        <span className="hidden sm:inline">
                                            {t("common.previous")}
                                        </span>
                                        <span className="sm:hidden">
                                            {t("common.prev_short")}
                                        </span>
                                    </Button>

                                    <div className="flex items-center gap-1 sm:gap-2 shrink-0 order-first sm:order-0">
                                        <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                                            {t("common.page")}:
                                        </span>
                                        <Input
                                            type="number"
                                            min="1"
                                            max={totalPages}
                                            value={pageInput}
                                            onChange={(e) =>
                                                setPageInput(e.target.value)
                                            }
                                            onKeyPress={handlePageInputKeyPress}
                                            className="w-16 sm:w-20 text-center bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 text-xs sm:text-sm"
                                        />
                                        <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                                            {t("common.of")} {totalPages}
                                        </span>
                                        <Button
                                            onClick={handlePageInputSubmit}
                                            size="sm"
                                            className="px-2 sm:px-3"
                                        >
                                            <span className="hidden sm:inline">
                                                {t("common.go")}
                                            </span>
                                            <span className="sm:hidden">→</span>
                                        </Button>
                                    </div>

                                    <Button
                                        variant="outline"
                                        onClick={() =>
                                            nextPageId &&
                                            router.visit(
                                                route(
                                                    "pages.verify",
                                                    nextPageId,
                                                ),
                                            )
                                        }
                                        disabled={!nextPageId}
                                        className="shrink-0 w-full sm:w-auto"
                                    >
                                        <span className="hidden sm:inline">
                                            {t("common.next")}
                                        </span>
                                        <span className="sm:hidden">
                                            {t("common.next_short")}
                                        </span>
                                        <ChevronRight className="h-4 w-4 ml-2" />
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Right: Terms Table - 7 columns */}
                        <div
                            className={`lg:col-span-7 bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden transition-colors duration-200 ${showPdfOnMobile ? "hidden lg:block" : "block"}`}
                        >
                            <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700">
                                <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                                    {t("verify.terms_on_page")}
                                </h2>
                                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    {t("verify.terms_found", {
                                        count: terms.length,
                                    })}
                                </p>
                            </div>

                            <div
                                className="overflow-auto"
                                style={{ height: "calc(100vh - 320px)" }}
                            >
                                <Table>
                                    <TableHeader className="sticky top-0 bg-white dark:bg-gray-800 z-10 shadow-sm">
                                        <TableRow className="border-b border-gray-200 dark:border-gray-700">
                                            <TableHead className="w-[25%] sm:w-[25%] text-gray-700 dark:text-gray-300 text-xs sm:text-sm">
                                                <span className="hidden sm:inline">
                                                    {t(
                                                        "verify.english_editable",
                                                    )}
                                                </span>
                                                <span className="sm:hidden">
                                                    {t("verify.english_short")}
                                                </span>
                                            </TableHead>
                                            <TableHead className="w-[25%] sm:w-[25%] text-gray-700 dark:text-gray-300 text-xs sm:text-sm">
                                                <span className="hidden sm:inline">
                                                    {t(
                                                        "verify.arabic_editable",
                                                    )}
                                                </span>
                                                <span className="sm:hidden">
                                                    {t("verify.arabic_short")}
                                                </span>
                                            </TableHead>
                                            <TableHead className="w-[12%] sm:w-[12%] text-center text-gray-700 dark:text-gray-300 text-xs sm:text-sm">
                                                <span className="hidden sm:inline">
                                                    Confidence
                                                </span>
                                                <span className="sm:hidden">
                                                    Conf.
                                                </span>
                                            </TableHead>
                                            <TableHead className="w-[12%] sm:w-[12%] text-gray-700 dark:text-gray-300 text-xs sm:text-sm">
                                                {t("common.status")}
                                            </TableHead>
                                            <TableHead className="w-[26%] sm:w-[26%] text-right text-gray-700 dark:text-gray-300 text-xs sm:text-sm">
                                                {t("common.actions")}
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {terms.length === 0 ? (
                                            <TableRow>
                                                <TableCell
                                                    colSpan={5}
                                                    className="text-center text-gray-500 dark:text-gray-400 py-8 sm:py-12 text-xs sm:text-sm"
                                                >
                                                    {t(
                                                        "verify.no_terms_on_page",
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            terms.map((term) => {
                                                const confidenceLevel =
                                                    term.confidence_level || 0;
                                                const confidenceColor =
                                                    confidenceLevel >= 9
                                                        ? "text-green-500 dark:text-green-400"
                                                        : confidenceLevel >= 7
                                                          ? "text-blue-500 dark:text-blue-400"
                                                          : confidenceLevel >= 5
                                                            ? "text-yellow-500 dark:text-yellow-400"
                                                            : confidenceLevel >=
                                                                3
                                                              ? "text-orange-500 dark:text-orange-400"
                                                              : "text-red-500 dark:text-red-400";

                                                return (
                                                    <TableRow
                                                        key={term.id}
                                                        className={`transition-colors border-b border-gray-100 dark:border-gray-700 ${
                                                            currentTerm?.id ===
                                                            term.id
                                                                ? "bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-500"
                                                                : "hover:bg-gray-50 dark:hover:bg-gray-700/50"
                                                        }`}
                                                    >
                                                        <TableCell className="py-2 sm:py-4">
                                                            <Input
                                                                type="text"
                                                                value={
                                                                    editingEnglishTerms[
                                                                        term.id
                                                                    ] !==
                                                                    undefined
                                                                        ? editingEnglishTerms[
                                                                              term
                                                                                  .id
                                                                          ]
                                                                        : term.term_en
                                                                }
                                                                onChange={(e) =>
                                                                    handleEnglishTermChange(
                                                                        term.id,
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                                onBlur={() =>
                                                                    handleEnglishTermUpdate(
                                                                        term,
                                                                    )
                                                                }
                                                                onKeyPress={(
                                                                    e,
                                                                ) =>
                                                                    handleEnglishInputKeyPress(
                                                                        e,
                                                                        term,
                                                                    )
                                                                }
                                                                className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:ring-blue-500 dark:focus:ring-blue-400"
                                                                placeholder={t(
                                                                    "verify.enter_english",
                                                                )}
                                                                disabled={
                                                                    !isAuthenticated
                                                                }
                                                            />
                                                        </TableCell>
                                                        <TableCell className="py-4">
                                                            <Input
                                                                type="text"
                                                                dir="rtl"
                                                                value={
                                                                    editingArabicTerms[
                                                                        term.id
                                                                    ] !==
                                                                    undefined
                                                                        ? editingArabicTerms[
                                                                              term
                                                                                  .id
                                                                          ]
                                                                        : term.term_ar
                                                                }
                                                                onChange={(e) =>
                                                                    handleArabicTermChange(
                                                                        term.id,
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                                onBlur={() =>
                                                                    handleArabicTermUpdate(
                                                                        term,
                                                                    )
                                                                }
                                                                onKeyPress={(
                                                                    e,
                                                                ) =>
                                                                    handleArabicInputKeyPress(
                                                                        e,
                                                                        term,
                                                                    )
                                                                }
                                                                className="font-arabic text-right bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:ring-blue-500 dark:focus:ring-blue-400"
                                                                placeholder={t(
                                                                    "verify.enter_arabic",
                                                                )}
                                                                disabled={
                                                                    !isAuthenticated
                                                                }
                                                            />
                                                        </TableCell>
                                                        <TableCell className="py-4 text-center">
                                                            <div className="flex flex-col items-center gap-1">
                                                                <div className="flex items-center gap-0.5">
                                                                    <Star
                                                                        className={`h-3 w-3 ${confidenceColor} fill-current`}
                                                                    />
                                                                    <span
                                                                        className={`text-xs sm:text-sm font-semibold ${confidenceColor}`}
                                                                    >
                                                                        {
                                                                            confidenceLevel
                                                                        }
                                                                        /10
                                                                    </span>
                                                                </div>
                                                                <span className="text-[10px] text-gray-500 dark:text-gray-400 hidden sm:inline">
                                                                    {confidenceLevel >=
                                                                    9
                                                                        ? "Very High"
                                                                        : confidenceLevel >=
                                                                            7
                                                                          ? "High"
                                                                          : confidenceLevel >=
                                                                              5
                                                                            ? "Medium"
                                                                            : confidenceLevel >=
                                                                                3
                                                                              ? "Low"
                                                                              : confidenceLevel >
                                                                                  0
                                                                                ? "Very Low"
                                                                                : "N/A"}
                                                                </span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="py-4">
                                                            <Badge
                                                                variant={
                                                                    term.status ===
                                                                    "accepted"
                                                                        ? "default"
                                                                        : term.status ===
                                                                            "rejected"
                                                                          ? "destructive"
                                                                          : "secondary"
                                                                }
                                                                className="text-xs"
                                                            >
                                                                {term.status ===
                                                                "accepted"
                                                                    ? t(
                                                                          "verify.accepted",
                                                                      )
                                                                    : term.status ===
                                                                        "rejected"
                                                                      ? t(
                                                                            "verify.rejected",
                                                                        )
                                                                      : t(
                                                                            "verify.pending",
                                                                        )}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-right py-4">
                                                            <div className="flex items-center justify-end gap-1">
                                                                {/* History Button */}
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() =>
                                                                        setHistoryDialog(
                                                                            {
                                                                                open: true,
                                                                                term,
                                                                            },
                                                                        )
                                                                    }
                                                                    className="h-8 w-8 p-0"
                                                                    title="View edit history"
                                                                >
                                                                    <History className="h-4 w-4" />
                                                                </Button>

                                                                {(term.status ===
                                                                    "accepted" ||
                                                                    term.status ===
                                                                        "rejected") && (
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        onClick={() =>
                                                                            handleStatusUpdate(
                                                                                term,
                                                                                "unverified",
                                                                            )
                                                                        }
                                                                        className="h-8 w-8 p-0"
                                                                        title="Return to unverified"
                                                                        disabled={
                                                                            !isAuthenticated
                                                                        }
                                                                    >
                                                                        <RotateCcw className="h-4 w-4" />
                                                                    </Button>
                                                                )}

                                                                <Button
                                                                    size="sm"
                                                                    variant={
                                                                        term.status ===
                                                                        "accepted"
                                                                            ? "default"
                                                                            : "outline"
                                                                    }
                                                                    onClick={() =>
                                                                        handleStatusUpdate(
                                                                            term,
                                                                            "accepted",
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        !isAuthenticated ||
                                                                        term.status ===
                                                                            "accepted"
                                                                    }
                                                                    className="h-8 w-8 p-0"
                                                                    title="Accept term"
                                                                >
                                                                    <Check className="h-4 w-4" />
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant={
                                                                        term.status ===
                                                                        "rejected"
                                                                            ? "destructive"
                                                                            : "outline"
                                                                    }
                                                                    onClick={() =>
                                                                        handleStatusUpdate(
                                                                            term,
                                                                            "rejected",
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        !isAuthenticated ||
                                                                        term.status ===
                                                                            "rejected"
                                                                    }
                                                                    className="h-8 w-8 p-0"
                                                                    title="Reject term"
                                                                >
                                                                    <X className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Rejection Reason Dialog */}
            <Dialog
                open={rejectionDialog.open}
                onOpenChange={(open) =>
                    setRejectionDialog({ open, term: null })
                }
            >
                <DialogContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 max-w-[95vw] sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-gray-900 dark:text-white text-lg sm:text-xl">
                            {t("verify.rejection_reason")}
                        </DialogTitle>
                        <DialogDescription className="text-gray-600 dark:text-gray-400 text-sm">
                            {t("verify.rejection_desc")}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-3 sm:py-4">
                        <Textarea
                            placeholder={t("verify.enter_rejection_reason")}
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            className="min-h-[100px] sm:min-h-[120px] bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 text-sm"
                        />
                    </div>
                    <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                        <Button
                            variant="outline"
                            onClick={() =>
                                setRejectionDialog({ open: false, term: null })
                            }
                            className="w-full sm:w-auto"
                        >
                            {t("common.cancel")}
                        </Button>
                        <Button
                            onClick={handleRejectSubmit}
                            disabled={!rejectionReason.trim()}
                            className="w-full sm:w-auto"
                        >
                            <span className="hidden sm:inline">
                                {t("verify.reject_term")}
                            </span>
                            <span className="sm:hidden">
                                {t("verify.rejected")}
                            </span>
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit History Dialog */}
            <Dialog
                open={historyDialog.open}
                onOpenChange={(open) => setHistoryDialog({ open, term: null })}
            >
                <DialogContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 max-w-[95vw] sm:max-w-3xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-gray-900 dark:text-white flex items-center gap-2 text-lg sm:text-xl">
                            <History className="h-4 w-4 sm:h-5 sm:w-5" />
                            {t("verify.edit_history")}
                        </DialogTitle>
                        <DialogDescription className="text-gray-600 dark:text-gray-400 text-sm">
                            {historyDialog.term && (
                                <div className="mt-2 space-y-1">
                                    <p className="font-medium truncate">
                                        {t("verify.english_short")}:{" "}
                                        {historyDialog.term.term_en}
                                    </p>
                                    <p
                                        className="font-medium font-arabic truncate"
                                        dir="rtl"
                                    >
                                        {t("verify.arabic_short")}:{" "}
                                        {historyDialog.term.term_ar}
                                    </p>
                                </div>
                            )}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-3 sm:py-4">
                        {historyDialog.term?.edits &&
                        historyDialog.term.edits.length > 0 ? (
                            <div className="space-y-3 sm:space-y-4">
                                {historyDialog.term.edits.map((edit, index) => (
                                    <div
                                        key={edit.id}
                                        className="border-l-4 border-blue-500 pl-3 sm:pl-4 py-2 bg-gray-50 dark:bg-gray-700/50 rounded-r"
                                    >
                                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1 sm:gap-2 mb-2">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate">
                                                    {edit.user
                                                        ? edit.user.name
                                                        : t("common.system")}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    {new Date(
                                                        edit.created_at,
                                                    ).toLocaleString()}
                                                </p>
                                            </div>
                                            <Badge
                                                variant="outline"
                                                className="text-xs"
                                            >
                                                {edit.field_changed ===
                                                "term_en"
                                                    ? t("verify.english")
                                                    : edit.field_changed ===
                                                        "term_ar"
                                                      ? t("verify.arabic")
                                                      : t("common.status")}
                                            </Badge>
                                        </div>
                                        <div className="mt-2 space-y-1">
                                            <div className="flex items-center gap-2 text-sm">
                                                <span className="text-red-600 dark:text-red-400 font-medium">
                                                    {t("common.old")}:
                                                </span>
                                                <span
                                                    className={`text-gray-700 dark:text-gray-300 ${edit.field_changed === "term_ar" ? "font-arabic" : ""}`}
                                                    dir={
                                                        edit.field_changed ===
                                                        "term_ar"
                                                            ? "rtl"
                                                            : "ltr"
                                                    }
                                                >
                                                    {edit.old_value ||
                                                        t("common.empty")}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm">
                                                <span className="text-green-600 dark:text-green-400 font-medium">
                                                    {t("common.new")}:
                                                </span>
                                                <span
                                                    className={`text-gray-700 dark:text-gray-300 ${edit.field_changed === "term_ar" ? "font-arabic" : ""}`}
                                                    dir={
                                                        edit.field_changed ===
                                                        "term_ar"
                                                            ? "rtl"
                                                            : "ltr"
                                                    }
                                                >
                                                    {edit.new_value ||
                                                        t("common.empty")}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                <History className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                <p>{t("verify.no_history")}</p>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() =>
                                setHistoryDialog({ open: false, term: null })
                            }
                            className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        >
                            {t("common.close")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
