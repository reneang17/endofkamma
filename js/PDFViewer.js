class PDFViewer {
  constructor(canvasId, controls) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext("2d");
    this.controls = controls;
    this.pdfDoc = null;
    this.pageNum = 1;
    this.pageRendering = false;
    this.minPageNum = controls.minPage || 1;
    this.maxPageNum = controls.maxPage || 204;
    this.chapterSelect = document.getElementById("chapter-select");

    // Touch gesture tracking
    this.touchStartX = 0; // Starting X position of the touch
    this.touchEndX = 0; // Ending X position of the touch
  }

  async renderPage(num) {
    this.pageRendering = true;
    num = Math.max(this.minPageNum, Math.min(num, this.maxPageNum)); // Ensure num is within allowed range
    const page = await this.pdfDoc.getPage(num);
    const scale = 5;
    const viewport = page.getViewport({ scale: scale });

    this.canvas.style.width = "100%";
    this.canvas.style.height = "auto";
    this.canvas.width = viewport.width;
    this.canvas.height = viewport.height;

    const renderContext = {
      canvasContext: this.ctx,
      viewport: viewport,
    };

    await page.render(renderContext).promise;
    this.pageRendering = false;
    document.getElementById(this.controls.pageNum).value = num; // Update current page in text field
    this.updateChapterSelect(num); // Update the chapter select dropdown
  }

  loadDocument(url) {
    pdfjsLib.getDocument(url).promise.then((pdfDoc_) => {
      this.pdfDoc = pdfDoc_;
      this.renderPage(this.pageNum);
    });
  }

  setupEventListeners() {
    document
      .getElementById(this.controls.prevPage)
      .addEventListener("click", () => this.onPrevPage());
    document
      .getElementById(this.controls.nextPage)
      .addEventListener("click", () => this.onNextPage());
    document
      .getElementById(this.controls.goPage)
      .addEventListener("click", () => this.gotoPage());
    document
      .getElementById(this.controls.pageNum)
      .addEventListener("focus", () => this.onPageNumFocus());
    document
      .getElementById(this.controls.pageNum)
      .addEventListener("keydown", (event) => this.onPageNumKeydown(event));
    document
      .getElementById("chapter-select")
      .addEventListener("change", (e) => this.gotoChapter(e.target.value));
    document
      .getElementById(this.controls.downloadPDF)
      .addEventListener("click", () => this.downloadPDF());

    // Add event listeners for touch gestures on the canvas
    this.canvas.addEventListener("touchstart", (event) =>
      this.onTouchStart(event)
    );
    this.canvas.addEventListener("touchmove", (event) =>
      this.onTouchMove(event)
    );
    this.canvas.addEventListener("touchend", (event) => this.onTouchEnd(event));

    // Retain the existing canvas click-to-next-page functionality
    this.canvas.addEventListener("click", () => this.onNextPage());
  }

  onTouchStart(event) {
    // Capture the starting X position of the touch
    this.touchStartX = event.touches[0].clientX;
  }

  onTouchMove(event) {
    // Optionally, capture the current X position if needed for velocity/distance
    this.touchEndX = event.touches[0].clientX;
  }

  onTouchEnd() {
    // Calculate the difference between start and end positions
    const deltaX = this.touchEndX - this.touchStartX;

    // Define a threshold for swipe detection (e.g., 50px)
    const swipeThreshold = 50;

    if (Math.abs(deltaX) > swipeThreshold) {
      if (deltaX > 0) {
        // Swiped to the right (previous page)
        this.onPrevPage();
      } else {
        // Swiped to the left (next page)
        this.onNextPage();
      }
    }
  }

  onPrevPage() {
    if (this.pageNum <= this.minPageNum) {
      return;
    }
    this.pageNum--;
    this.renderPage(this.pageNum);
  }

  onNextPage() {
    if (
      this.pageNum >= this.pdfDoc.numPages ||
      this.pageNum >= this.maxPageNum
    ) {
      return;
    }
    this.pageNum++;
    this.renderPage(this.pageNum);
  }

  gotoPage() {
    const pageNumber = parseInt(
      document.getElementById(this.controls.pageNum).value
    );
    if (
      pageNumber >= this.minPageNum &&
      pageNumber <= Math.min(this.maxPageNum, this.pdfDoc.numPages)
    ) {
      this.pageNum = pageNumber;
      this.renderPage(this.pageNum);
    } else {
      alert("Invalid page number. Valid pages range from 1 to 204.");
    }
  }

  onPageNumFocus() {
    document.getElementById(this.controls.pageNum).select();
  }

  onPageNumKeydown(event) {
    if (event.key === "Enter") {
      this.gotoPage();
    }
  }

  gotoChapter(pageNumber) {
    const num = parseInt(pageNumber);
    this.pageNum = num; // Update the current page number
    this.renderPage(num);
  }

  downloadPDF() {
    const url = this.controls.pdfUrl + "#page=" + this.pageNum;
    window.open(url, "_blank");
  }

  updateChapterSelect(currentPage) {
    const chapters = [
      { start: 1, end: 4, optionIndex: 0 },
      { start: 5, end: 5, optionIndex: 1 },
      { start: 6, end: 7, optionIndex: 2 },
      { start: 8, end: 16, optionIndex: 3 },
      { start: 17, end: 18, optionIndex: 4 },
      { start: 19, end: 39, optionIndex: 5 },
      { start: 40, end: 41, optionIndex: 6 },
      { start: 42, end: 62, optionIndex: 7 },
      { start: 63, end: 64, optionIndex: 8 },
      { start: 65, end: 85, optionIndex: 9 },
      { start: 86, end: 89, optionIndex: 10 },
      { start: 90, end: 110, optionIndex: 11 },
      { start: 111, end: 113, optionIndex: 12 },
      { start: 114, end: 133, optionIndex: 13 },
      { start: 134, end: 136, optionIndex: 14 },
      { start: 137, end: 157, optionIndex: 15 },
      { start: 158, end: 161, optionIndex: 16 },
      { start: 162, end: 182, optionIndex: 17 },
      { start: 183, end: 187, optionIndex: 18 },
      { start: 188, end: 196, optionIndex: 19 },
      { start: 197, end: 200, optionIndex: 20 },
      { start: 201, end: 202, optionIndex: 21 },
      { start: 203, end: 204, optionIndex: 22 },
    ];

    for (let chapter of chapters) {
      if (currentPage >= chapter.start && currentPage <= chapter.end) {
        this.chapterSelect.selectedIndex = chapter.optionIndex;
        return;
      }
    }

    this.chapterSelect.selectedIndex = -1;
  }
}
