async function downloadForm() {
    const login = document.querySelector('.user-info').textContent.replace('Logged in as: ', '');
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });

    const pageWidth = pdf.internal.pageSize.getWidth() - 20; // 10 mm margins on each side
    const pageHeight = pdf.internal.pageSize.getHeight() - 40; // Margins and space for header/footer
    const contentWidthPx = 800; // Match max-width of container in part_5.html
    const contentWidthMm = Math.min(contentWidthPx * 0.264583, pageWidth); // Scale to page width

    // Select the form content (the container div)
    const formContainer = document.querySelector('.container');
    if (!formContainer) {
        console.error("Form container not found.");
        alert("Error: Form content not found.");
        return;
    }

    // Function to create PDF container
    const createContainer = (rowsToRender = null) => {
        const pdfContainer = document.createElement('div');
        pdfContainer.className = 'print-preview';
        pdfContainer.style.padding = '10px';
        pdfContainer.style.backgroundColor = '#ffffff';
        pdfContainer.style.position = 'absolute';
        pdfContainer.style.left = '-9999px';
        pdfContainer.style.width = `${contentWidthPx}px`;
        pdfContainer.style.maxWidth = `${contentWidthPx}px`;
        pdfContainer.style.boxSizing = 'border-box';
        pdfContainer.style.fontFamily = "'Roboto Condensed', sans-serif";

        // Add user info
        const userInfo = document.createElement('div');
        userInfo.className = 'user-info';
        userInfo.textContent = `Logged in as: ${login}`;
        userInfo.style.color = '#8b7314';
        userInfo.style.textAlign = 'center';
        userInfo.style.fontSize = '14px';
        userInfo.style.marginBottom = '5px';
        pdfContainer.appendChild(userInfo);

        // Add title
        const title = document.createElement('h1');
        title.textContent = 'V. TACE Form';
        title.style.color = '#8b7314';
        title.style.textAlign = 'center';
        title.style.fontSize = '18px';
        title.style.textTransform = 'uppercase';
        title.style.marginBottom = '10px';
        pdfContainer.appendChild(title);

        // Clone the form or specific rows
        let formClone;
        if (rowsToRender) {
            formClone = document.createElement('div');
            const tableClone = formContainer.querySelector('table').cloneNode(true);
            tableClone.innerHTML = '';
            const thead = formContainer.querySelector('table thead')?.cloneNode(true);
            if (thead) {
                tableClone.appendChild(thead);
            }
            const tbody = document.createElement('tbody');
            rowsToRender.forEach(row => tbody.appendChild(row.cloneNode(true)));
            tableClone.appendChild(tbody);
            formClone.appendChild(tableClone);
        } else {
            formClone = formContainer.cloneNode(true);
        }

        // Apply print styles
        formClone.style.width = `${contentWidthPx}px`;
        formClone.style.maxWidth = `${contentWidthPx}px`;
        formClone.style.boxSizing = 'border-box';

        formClone.querySelectorAll('table').forEach(table => {
            table.style.width = '100%';
            table.style.maxWidth = '100%';
            table.style.borderCollapse = 'collapse';
            table.style.fontSize = '0.8em';
            table.style.tableLayout = 'fixed';
        });

        formClone.querySelectorAll('table, th, td').forEach(el => {
            el.style.border = '1px solid #8b7314';
        });

        formClone.querySelectorAll('th').forEach(th => {
            th.style.backgroundColor = '#8b7314';
            th.style.color = '#000';
            th.style.padding = '5px';
            th.style.textAlign = 'center';
            th.style.wordBreak = 'break-word';
        });

        formClone.querySelectorAll('td').forEach(td => {
            td.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            td.style.color = '#000';
            td.style.padding = '5px';
            td.style.textAlign = 'left';
            td.style.wordBreak = 'break-word';
        });

        formClone.querySelectorAll('.checkbox-symbol').forEach(symbol => {
            symbol.style.fontSize = '1em';
            symbol.style.marginRight = '5px';
            symbol.style.verticalAlign = 'middle';
            symbol.style.display = 'inline-block';
            symbol.style.color = symbol.textContent === '☒' ? '#ff0000' : '#000';
        });

        formClone.querySelectorAll('.radio-symbol').forEach(symbol => {
            symbol.style.fontSize = '1em';
            symbol.style.marginRight = '5px';
            symbol.style.verticalAlign = 'middle';
            symbol.style.display = 'inline-block';
            symbol.style.color = symbol.textContent === '●' ? '#ff0000' : '#000';
        });

        formClone.querySelectorAll('textarea').forEach(ta => {
            const div = document.createElement('div');
            div.textContent = ta.value || ta.getAttribute('data-value') || '';
            div.style.border = 'none';
            div.style.background = 'transparent';
            div.style.width = '100%';
            div.style.fontFamily = "'Roboto Condensed', sans-serif";
            div.style.color = '#000';
            ta.parentNode.replaceChild(div, ta);
        });

        formClone.querySelectorAll('.signature-date').forEach(span => {
            span.style.color = '#000';
            span.style.marginLeft = '10px';
        });

        formClone.querySelectorAll('.locked-select').forEach(span => {
            span.style.color = '#000';
        });

        // Remove buttons
        formClone.querySelectorAll('.button-container, .button').forEach(btn => btn.remove());

        pdfContainer.appendChild(formClone);
        return pdfContainer;
    };

    // Function to calculate height
    const calculateHeight = async (rowsToRender = null) => {
        const pdfContainer = createContainer(rowsToRender);
        document.body.appendChild(pdfContainer);
        try {
            const canvas = await html2canvas(pdfContainer, {
                scale: 2,
                backgroundColor: '#ffffff',
                logging: true,
                useCORS: true,
                windowWidth: contentWidthPx
            });
            const imgHeight = canvas.height;
            const imgWidth = canvas.width;
            const heightInMm = (imgHeight * contentWidthMm) / imgWidth;
            return { pdfContainer, heightInMm, canvas };
        } catch (e) {
            console.error("Error in html2canvas during height calculation:", e);
            throw e;
        }
    };

    // Render the form, splitting into pages if necessary
    let pageNumber = 1;
    try {
        const { pdfContainer, heightInMm, canvas } = await calculateHeight();

        if (heightInMm <= pageHeight) {
            // Fits on one page
            const imgData = canvas.toDataURL('image/jpeg', 1.0);
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            const width = contentWidthMm;
            const height = (imgHeight * width) / imgWidth;

            const leftMargin = (pdf.internal.pageSize.getWidth() - width) / 2;
            const topMargin = 10;
            pdf.addImage(imgData, 'JPEG', leftMargin, topMargin, width, height);

            pdf.setFontSize(10);
            pdf.setTextColor(0, 0, 0);
            pdf.text(`Page ${pageNumber}`, pdf.internal.pageSize.getWidth() - 30, pdf.internal.pageSize.getHeight() - 10);
        } else {
            // Split into multiple pages
            const tables = formContainer.querySelectorAll('table');
            let currentPageContent = [];
            let currentHeight = 0;

            for (let table of tables) {
                const rows = table.querySelectorAll('tr');
                let tableRows = [];

                for (let i = 0; i < rows.length; i++) {
                    const testRows = [...tableRows, rows[i]];
                    const { heightInMm: testHeight } = await calculateHeight(testRows);

                    if (testHeight <= pageHeight - currentHeight || tableRows.length === 0) {
                        tableRows.push(rows[i]);
                        currentHeight += testHeight;
                    } else {
                        // Render current page
                        currentPageContent.push({ table, rows: tableRows });
                        const pageContainer = createContainer(tableRows);
                        document.body.appendChild(pageContainer);
                        try {
                            const pageCanvas = await html2canvas(pageContainer, {
                                scale: 2,
                                backgroundColor: '#ffffff',
                                logging: true,
                                useCORS: true,
                                windowWidth: contentWidthPx
                            });
                            const imgData = pageCanvas.toDataURL('image/jpeg', 1.0);
                            const imgWidth = pageCanvas.width;
                            const imgHeight = pageCanvas.height;
                            const width = contentWidthMm;
                            const height = (imgHeight * width) / imgWidth;

                            const leftMargin = (pdf.internal.pageSize.getWidth() - width) / 2;
                            const topMargin = 10;
                            pdf.addImage(imgData, 'JPEG', leftMargin, topMargin, width, height);

                            pdf.setFontSize(10);
                            pdf.setTextColor(0, 0, 0);
                            pdf.text(`Page ${pageNumber}`, pdf.internal.pageSize.getWidth() - 30, pdf.internal.pageSize.getHeight() - 10);
                        } finally {
                            document.body.removeChild(pageContainer);
                        }

                        // Start new page
                        pdf.addPage();
                        pageNumber++;
                        currentPageContent = [];
                        tableRows = [rows[i]];
                        currentHeight = await (async () => {
                            const { heightInMm } = await calculateHeight(tableRows);
                            return heightInMm;
                        })();
                    }
                }

                if (tableRows.length > 0) {
                    currentPageContent.push({ table, rows: tableRows });
                }
            }

            // Render the last page
            if (currentPageContent.length > 0) {
                const pageContainer = createContainer(currentPageContent[0].rows);
                document.body.appendChild(pageContainer);
                try {
                    const pageCanvas = await html2canvas(pageContainer, {
                        scale: 2,
                        backgroundColor: '#ffffff',
                        logging: true,
                        useCORS: true,
                        windowWidth: contentWidthPx
                    });
                    const imgData = pageCanvas.toDataURL('image/jpeg', 1.0);
                    const imgWidth = pageCanvas.width;
                    const imgHeight = pageCanvas.height;
                    const width = contentWidthMm;
                    const height = (imgHeight * width) / imgWidth;

                    const leftMargin = (pdf.internal.pageSize.getWidth() - width) / 2;
                    const topMargin = 10;
                    pdf.addImage(imgData, 'JPEG', leftMargin, topMargin, width, height);

                    pdf.setFontSize(10);
                    pdf.setTextColor(0, 0, 0);
                    pdf.text(`Page ${pageNumber}`, pdf.internal.pageSize.getWidth() - 30, pdf.internal.pageSize.getHeight() - 10);
                } finally {
                    document.body.removeChild(pageContainer);
                }
            }
        }

        // Save PDF
        pdf.save(`TACE_Form_${login}.pdf`);
    } catch (e) {
        console.error("Error generating PDF:", e);
        alert("Error: Failed to generate PDF. Check console for details.");
    } finally {
        // Clean up
        const tempContainers = document.querySelectorAll('div[style*="position: absolute"]');
        tempContainers.forEach(container => container.remove());
    }
}

function printForm() {
    window.print();
}