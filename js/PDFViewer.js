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
}
