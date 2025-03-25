function setupPdfViewer() {
       
    const pdfLinks = document.querySelectorAll('.pdf-link');
    const pdfViewerContainer = document.getElementById('pdf-viewer-container');
    const pdfCanvas = document.getElementById('pdf-canvas');
    const closePdfViewerButton = document.getElementById('close-pdf-viewer');
    const zoomInButton = document.getElementById('zoom-in');
    const zoomOutButton = document.getElementById('zoom-out');
    const printPdfButton = document.getElementById('print-pdf');
    const downloadPdfLink = document.getElementById('download-pdf');
    const prevPageButton = document.getElementById('prev-page');
    const nextPageButton = document.getElementById('next-page');

    let scale = 1; // Escala inicial del PDF
    let currentPage = 1; // Página actual

    // Función para renderizar el PDF con la escala actual
    function renderPdf(pdf, page) {
        const viewport = page.getViewport({ scale });
        const canvasContext = pdfCanvas.getContext('2d');
        pdfCanvas.height = viewport.height;
        pdfCanvas.width = viewport.width;

        const renderContext = {
            canvasContext,
            viewport,
        };
        page.render(renderContext);
    }

    // Función para renderizar una página específica
    function renderPage(pdf, pageNumber) {
        pdf.getPage(pageNumber).then(page => {
            renderPdf(pdf, page);
        });
    }

    pdfLinks.forEach(link => {
        link.addEventListener('click', function() {
            const pdfUrl = this.getAttribute('data-pdf-url');

            pdfViewerContainer.style.display = 'block';

            pdfjsLib.getDocument(pdfUrl).promise.then(pdf => {
                renderPage(pdf, currentPage); // Renderizar la primera página

                // Funcionalidad de zoom
                zoomInButton.addEventListener('click', () => {
                    scale += 0.1;
                    renderPage(pdf, currentPage);
                });

                zoomOutButton.addEventListener('click', () => {
                    scale -= 0.1;
                    renderPage(pdf, currentPage);
                });

                // Funcionalidad de pasar páginas
                prevPageButton.addEventListener('click', () => {
                    if (currentPage > 1) {
                        currentPage--;
                        renderPage(pdf, currentPage);
                    }
                });

                nextPageButton.addEventListener('click', () => {
                    if (currentPage < pdf.numPages) {
                        currentPage++;
                        renderPage(pdf, currentPage);
                    }
                });

                // Funcionalidad de impresión
                printPdfButton.addEventListener('click', () => {
                    window.print();
                });

                // Funcionalidad de descarga
                downloadPdfLink.href = pdfUrl; // Establecer la URL de descarga
            });
        });
    });

    closePdfViewerButton.addEventListener('click', function() {
        pdfViewerContainer.style.display = 'none';
    });
}

document.addEventListener('DOMContentLoaded', setupPdfViewer);