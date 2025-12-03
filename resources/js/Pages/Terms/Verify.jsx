import { useState, useEffect, useRef } from 'react';
import { Head, router } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Badge } from '@/Components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { Textarea } from '@/Components/ui/textarea';
import { ChevronLeft, ChevronRight, Check, X, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { Document, Page, pdfjs } from 'react-pdf';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function Verify({ currentTerm, page, resource, terms, nextPageId, prevPageId, totalPages, pdfUrl }) {
    const [numPages, setNumPages] = useState(null);
    const [pageInput, setPageInput] = useState(page.page_number.toString());
    const [rejectionDialog, setRejectionDialog] = useState({ open: false, term: null });
    const [rejectionReason, setRejectionReason] = useState('');
    const [scale, setScale] = useState(1.0);
    const [editingTerms, setEditingTerms] = useState({});
    
    // Dragging state for PDF
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [scrollPos, setScrollPos] = useState({ x: 0, y: 0 });
    const pdfContainerRef = useRef(null);

    const onDocumentLoadSuccess = ({ numPages }) => {
        setNumPages(numPages);
    };

    const handlePageNavigation = (pageNumber) => {
        const targetPage = resource.pages?.find(p => p.page_number === pageNumber);
        if (targetPage) {
            router.visit(route('pages.verify', targetPage.id));
        }
    };

    const handlePageInputSubmit = () => {
        const pageNum = parseInt(pageInput);
        if (pageNum >= 1 && pageNum <= totalPages) {
            handlePageNavigation(pageNum);
        }
    };

    const handlePageInputKeyPress = (e) => {
        if (e.key === 'Enter') {
            handlePageInputSubmit();
        }
    };

    const handleStatusUpdate = (term, status) => {
        if (status === 'rejected') {
            setRejectionDialog({ open: true, term });
            setRejectionReason('');
        } else if (status === 'unverified') {
            router.put(route('terms.update-status', term.id), {
                status: 'unverified',
                rejection_reason: null,
            }, {
                preserveScroll: true,
            });
        } else {
            router.put(route('terms.update-status', term.id), {
                status,
                rejection_reason: null,
            }, {
                preserveScroll: true,
            });
        }
    };

    const handleRejectSubmit = () => {
        if (rejectionDialog.term && rejectionReason.trim()) {
            router.put(route('terms.update-status', rejectionDialog.term.id), {
                status: 'rejected',
                rejection_reason: rejectionReason,
            }, {
                preserveScroll: true,
                onSuccess: () => {
                    setRejectionDialog({ open: false, term: null });
                    setRejectionReason('');
                },
            });
        }
    };

    const handleArabicTermChange = (termId, value) => {
        setEditingTerms(prev => ({
            ...prev,
            [termId]: value
        }));
    };

    const handleArabicTermUpdate = (term) => {
        const newValue = editingTerms[term.id];
        if (newValue && newValue.trim() !== '' && newValue !== term.term_ar) {
            router.put(route('terms.update', term.id), {
                term_ar: newValue.trim(),
            }, {
                preserveScroll: true,
                onSuccess: () => {
                    setEditingTerms(prev => {
                        const updated = { ...prev };
                        delete updated[term.id];
                        return updated;
                    });
                },
            });
        }
    };

    const handleArabicInputKeyPress = (e, term) => {
        if (e.key === 'Enter') {
            handleArabicTermUpdate(term);
        }
    };

    const handleZoomIn = () => setScale(prev => Math.min(prev + 0.2, 2.0));
    const handleZoomOut = () => setScale(prev => Math.max(prev - 0.2, 0.6));

    // PDF Dragging handlers
    const handleMouseDown = (e) => {
        if (!pdfContainerRef.current) return;
        setIsDragging(true);
        setDragStart({
            x: e.clientX - scrollPos.x,
            y: e.clientY - scrollPos.y
        });
        pdfContainerRef.current.style.cursor = 'grabbing';
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
            pdfContainerRef.current.style.cursor = 'grab';
        }
    };

    const handleMouseLeave = () => {
        setIsDragging(false);
        if (pdfContainerRef.current) {
            pdfContainerRef.current.style.cursor = 'grab';
        }
    };

    return (
        <>
            <Head title={`Verify - ${resource.name} - Page ${page.page_number}`} />
            
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
                <div className="container mx-auto px-4 py-6 max-w-[1800px]">
                    {/* Header */}
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            Term Verification
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            {resource.name} - Page {page.page_number} of {totalPages}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* Left: PDF Viewer - 5 columns */}
                        <div className="lg:col-span-5 bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden transition-colors duration-200">
                            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        Document Preview
                                    </h2>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleZoomOut}
                                            disabled={scale <= 0.6}
                                        >
                                            <ZoomOut className="h-4 w-4" />
                                        </Button>
                                        <span className="text-sm text-gray-600 dark:text-gray-400 min-w-[3rem] text-center">
                                            {Math.round(scale * 100)}%
                                        </span>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleZoomIn}
                                            disabled={scale >= 2.0}
                                        >
                                            <ZoomIn className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            <div 
                                ref={pdfContainerRef}
                                className="bg-gray-100 dark:bg-gray-950 overflow-auto transition-colors duration-200 select-none" 
                                style={{ 
                                    height: 'calc(100vh - 280px)',
                                    cursor: scale > 1 ? 'grab' : 'default'
                                }}
                                onMouseDown={scale > 1 ? handleMouseDown : undefined}
                                onMouseMove={scale > 1 ? handleMouseMove : undefined}
                                onMouseUp={scale > 1 ? handleMouseUp : undefined}
                                onMouseLeave={scale > 1 ? handleMouseLeave : undefined}
                            >
                                <div className="flex items-start justify-center p-4 min-h-full">
                                    <Document
                                        file={pdfUrl}
                                        onLoadSuccess={onDocumentLoadSuccess}
                                        loading={
                                            <div className="flex items-center justify-center p-8">
                                                <div className="text-gray-500 dark:text-gray-400">Loading PDF...</div>
                                            </div>
                                        }
                                        error={
                                            <div className="flex items-center justify-center p-8">
                                                <div className="text-red-500 dark:text-red-400">Failed to load PDF</div>
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
                            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-colors duration-200">
                                <div className="flex items-center justify-between gap-4">
                                    <Button
                                        variant="outline"
                                        onClick={() => prevPageId && router.visit(route('pages.verify', prevPageId))}
                                        disabled={!prevPageId}
                                        className="flex-shrink-0"
                                    >
                                        <ChevronLeft className="h-4 w-4 mr-2" />
                                        Previous
                                    </Button>

                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Page:</span>
                                        <Input
                                            type="number"
                                            min="1"
                                            max={totalPages}
                                            value={pageInput}
                                            onChange={(e) => setPageInput(e.target.value)}
                                            onKeyPress={handlePageInputKeyPress}
                                            className="w-20 text-center bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                                        />
                                        <span className="text-sm text-gray-600 dark:text-gray-400">of {totalPages}</span>
                                        <Button onClick={handlePageInputSubmit} size="sm">Go</Button>
                                    </div>

                                    <Button
                                        variant="outline"
                                        onClick={() => nextPageId && router.visit(route('pages.verify', nextPageId))}
                                        disabled={!nextPageId}
                                        className="flex-shrink-0"
                                    >
                                        Next
                                        <ChevronRight className="h-4 w-4 ml-2" />
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Right: Terms Table - 7 columns */}
                        <div className="lg:col-span-7 bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden transition-colors duration-200">
                            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Terms on This Page
                                </h2>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    {terms.length} term{terms.length !== 1 ? 's' : ''} found
                                </p>
                            </div>

                            <div className="overflow-auto" style={{ height: 'calc(100vh - 280px)' }}>
                                <Table>
                                    <TableHeader className="sticky top-0 bg-white dark:bg-gray-800 z-10 shadow-sm">
                                        <TableRow className="border-b border-gray-200 dark:border-gray-700">
                                            <TableHead className="w-[35%] text-gray-700 dark:text-gray-300">English</TableHead>
                                            <TableHead className="w-[35%] text-gray-700 dark:text-gray-300">Arabic (Editable)</TableHead>
                                            <TableHead className="w-[12%] text-gray-700 dark:text-gray-300">Status</TableHead>
                                            <TableHead className="w-[18%] text-right text-gray-700 dark:text-gray-300">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {terms.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-center text-gray-500 dark:text-gray-400 py-12">
                                                    No terms found on this page
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            terms.map((term) => (
                                                <TableRow 
                                                    key={term.id}
                                                    className={`transition-colors border-b border-gray-100 dark:border-gray-700 ${
                                                        currentTerm?.id === term.id 
                                                            ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-500' 
                                                            : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                                                    }`}
                                                >
                                                    <TableCell className="font-medium text-gray-900 dark:text-gray-100 py-4">
                                                        {term.term_en}
                                                    </TableCell>
                                                    <TableCell className="py-4">
                                                        <Input
                                                            type="text"
                                                            dir="rtl"
                                                            value={editingTerms[term.id] !== undefined ? editingTerms[term.id] : term.term_ar}
                                                            onChange={(e) => handleArabicTermChange(term.id, e.target.value)}
                                                            onBlur={() => handleArabicTermUpdate(term)}
                                                            onKeyPress={(e) => handleArabicInputKeyPress(e, term)}
                                                            className="font-arabic text-right bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:ring-blue-500 dark:focus:ring-blue-400"
                                                            placeholder="أدخل المصطلح العربي"
                                                        />
                                                    </TableCell>
                                                    <TableCell className="py-4">
                                                        <Badge
                                                            variant={
                                                                term.status === 'accepted' ? 'default' :
                                                                term.status === 'rejected' ? 'destructive' :
                                                                'secondary'
                                                            }
                                                            className="text-xs"
                                                        >
                                                            {term.status === 'accepted' ? 'Accepted' :
                                                             term.status === 'rejected' ? 'Rejected' :
                                                             'Pending'}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right py-4">
                                                        <div className="flex items-center justify-end gap-1">
                                                            {(term.status === 'accepted' || term.status === 'rejected') && (
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() => handleStatusUpdate(term, 'unverified')}
                                                                    className="h-8 w-8 p-0"
                                                                    title="Return to unverified"
                                                                >
                                                                    <RotateCcw className="h-4 w-4" />
                                                                </Button>
                                                            )}
                                                            
                                                            <Button
                                                                size="sm"
                                                                variant={term.status === 'accepted' ? 'default' : 'outline'}
                                                                onClick={() => handleStatusUpdate(term, 'accepted')}
                                                                disabled={term.status === 'accepted'}
                                                                className="h-8 w-8 p-0"
                                                                title="Accept term"
                                                            >
                                                                <Check className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant={term.status === 'rejected' ? 'destructive' : 'outline'}
                                                                onClick={() => handleStatusUpdate(term, 'rejected')}
                                                                disabled={term.status === 'rejected'}
                                                                className="h-8 w-8 p-0"
                                                                title="Reject term"
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Rejection Reason Dialog */}
            <Dialog open={rejectionDialog.open} onOpenChange={(open) => setRejectionDialog({ open, term: null })}>
                <DialogContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <DialogHeader>
                        <DialogTitle className="text-gray-900 dark:text-white">Rejection Reason</DialogTitle>
                        <DialogDescription className="text-gray-600 dark:text-gray-400">
                            Please provide a reason for rejecting this term.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Textarea
                            placeholder="Enter rejection reason..."
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            rows={4}
                            className="resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                        />
                    </div>
                    <DialogFooter>
                        <Button 
                            variant="outline" 
                            onClick={() => setRejectionDialog({ open: false, term: null })}
                            className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        >
                            Cancel
                        </Button>
                        <Button 
                            variant="destructive" 
                            onClick={handleRejectSubmit}
                            disabled={!rejectionReason.trim()}
                        >
                            Reject Term
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}