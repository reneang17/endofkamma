class PDFViewer {
    constructor(canvasId, controls) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.controls = controls;
        this.pdfDoc = null;
        this.pageNum = 1;
        this.pageRendering = false;
        this.minPageNum = controls.minPage || 1;
        this.maxPageNum = controls.maxPage || 204;
        this.chapterSelect = document.getElementById('chapter-select');
    }

    async renderPage(num) {
        this.pageRendering = true;
        num = Math.max(this.minPageNum, Math.min(num, this.maxPageNum));  // Ensure num is within allowed range
        const page = await this.pdfDoc.getPage(num);
        const scale = 5;
        const viewport = page.getViewport({ scale: scale });

        this.canvas.style.width = '100%';
        this.canvas.style.height = 'auto';
        this.canvas.width = viewport.width;
        this.canvas.height = viewport.height;

        const renderContext = {
            canvasContext: this.ctx,
            viewport: viewport
        };

        await page.render(renderContext).promise;
        this.pageRendering = false;
        document.getElementById(this.controls.pageNum).value = num;  // Update current page in text field
        this.updateChapterSelect(num);  // Update the chapter select dropdown
    }

    loadDocument(url) {
        pdfjsLib.getDocument(url).promise.then(pdfDoc_ => {
            this.pdfDoc = pdfDoc_;
            this.renderPage(this.pageNum);
        });
    }

    setupEventListeners() {
        document.getElementById(this.controls.prevPage).addEventListener('click', () => this.onPrevPage());
        document.getElementById(this.controls.nextPage).addEventListener('click', () => this.onNextPage());
        document.getElementById(this.controls.goPage).addEventListener('click', () => this.gotoPage());
        document.getElementById(this.controls.pageNum).addEventListener('focus', () => this.onPageNumFocus());
        document.getElementById(this.controls.pageNum).addEventListener('keydown', (event) => this.onPageNumKeydown(event));
        document.getElementById('chapter-select').addEventListener('change', (e) => this.gotoChapter(e.target.value));
        document.getElementById(this.controls.downloadPDF).addEventListener('click', () => this.downloadPDF());
    }

    onPrevPage() {
        if (this.pageNum <= this.minPageNum) {
            return;
        }
        this.pageNum--;
        this.renderPage(this.pageNum);
    }

    onNextPage() {
        if (this.pageNum >= this.pdfDoc.numPages || this.pageNum >= this.maxPageNum) {
            return;
        }
        this.pageNum++;
        this.renderPage(this.pageNum);
    }

    gotoPage() {
        const pageNumber = parseInt(document.getElementById(this.controls.pageNum).value);
        if (pageNumber >= this.minPageNum && pageNumber <= Math.min(this.maxPageNum, this.pdfDoc.numPages)) {
            this.pageNum = pageNumber;
            this.renderPage(this.pageNum);
        } else {
            alert('Invalid page number. Valid pages range from 1 to 204.');
        }
    }

    onPageNumFocus() {
        document.getElementById(this.controls.pageNum).select();
    }

    onPageNumKeydown(event) {
        if (event.key === 'Enter') {
            this.gotoPage();
        }
    }

    gotoChapter(pageNumber) {
        const num = parseInt(pageNumber);
        this.pageNum = num;  // Update the current page number
        this.renderPage(num);
    }

    downloadPDF() {
        const url = this.controls.pdfUrl + '#page=' + this.pageNum;
        window.open(url, '_blank');
    }

    updateChapterSelect(currentPage) {
        // Define the chapter ranges as an array of objects
        const chapters = [
            { start: 1, end: 4, optionIndex: 0 },    // Cover
            { start: 5, end: 5, optionIndex: 1 },    // Introduction
            { start: 6, end: 7, optionIndex: 2 },    // Index
            { start: 8, end: 16, optionIndex: 3 },   // Preface
            { start: 17, end: 18, optionIndex: 4 },  // Notes on the text
            { start: 19, end: 39, optionIndex: 5 },  // 1. Action that leads to liberation
            { start: 40, end: 41, optionIndex: 6 },  // 1M Settling in place
            { start: 42, end: 62, optionIndex: 7 },  // 2. Bright kamma
            { start: 63, end: 64, optionIndex: 8 },  // 2M Recollection
            { start: 65, end: 85, optionIndex: 9 },  // 3. The kamma of meditation
            { start: 86, end: 89, optionIndex: 10 }, // 3M Embodying the mind
            { start: 90, end: 110, optionIndex: 11 },// 4. Kamma and memory
            { start: 111, end: 113, optionIndex: 12 },// 4M Goodwill
            { start: 114, end: 133, optionIndex: 13 },// 5. Regarding the world
            { start: 134, end: 136, optionIndex: 14 },// 5M Meeting your world
            { start: 137, end: 157, optionIndex: 15 },// 6. The kamma of relationship
            { start: 158, end: 161, optionIndex: 16 },// 6M Meeting space
            { start: 162, end: 182, optionIndex: 17 },// 7. Is there an end?
            { start: 183, end: 187, optionIndex: 18 },// 7M Uncontracted awareness
            { start: 188, end: 196, optionIndex: 19 },// Endnotes
            { start: 197, end: 200, optionIndex: 20 },// Glossary
            { start: 201, end: 202, optionIndex: 21 },// Edition notice
            { start: 203, end: 204, optionIndex: 22 } // License & copyright
        ];

        // Check which interval the current page falls into
        for (let chapter of chapters) {
            if (currentPage >= chapter.start && currentPage <= chapter.end) {
                this.chapterSelect.selectedIndex = chapter.optionIndex;
                return;
            }
        }

        // If no match, deselect the current option
        this.chapterSelect.selectedIndex = -1;  // None selected
    }
}
