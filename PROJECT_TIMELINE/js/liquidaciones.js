async function cargarLiquidaciones() {
    try {
        const response = await fetch('https://raw.githubusercontent.com/gonzashan/M17/e21f73956d632a7c3bda737459388bf0a8401afb/PROJECT_TIMELINE/json/liquidaciones.json');
        
        const liquidaciones = await response.json();
        const container = document.getElementById('liquidaciones-container');

        container.innerHTML = '';
        for (const anio in liquidaciones) {
            numeroAnios++;
            const anioData = liquidaciones[anio];
            const url = anioData.url;
            const datos = anioData.data;
            const anioDiv = document.createElement('div');
            anioDiv.className = "liquidaciones-div";
          /*anioDiv.style.display = 'flex';
            anioDiv.style.flexDirection = 'column';
            anioDiv.style.alignItems = 'center';
            anioDiv.style.paddingTop = '10px';
            anioDiv.style.paddingBottom = '30px';*/
            const table = document.createElement('table');
            table.className = 'fl-table';
            const anioHeader = document.createElement('thead');

            let folderFiles = url.substring(0, url.lastIndexOf('/') + 1);
            let liquidacionOrdinaria = folderFiles + 'liquidacion_ordinaria_' + anio + '.pdf';

            console.log(liquidacionOrdinaria);
            anioHeader.innerHTML = `<tr>
                    <td style="font-size: 14px;">Liquidaciones ${anio}</td>
                </tr>
                <tr>
                    <td>
                        <a href="${url}" target="_blank" style="font-size: 11px;font-weight: 400;"> 📄${obtenerNombreArchivo(url)}</a>
                        <a href="${liquidacionOrdinaria}" target="_blank" style="font-size: 11px;font-weight: 400;padding-left: 72px;"> 📄${obtenerNombreArchivo(liquidacionOrdinaria)}</a>
                    </td>
                </tr>`;
            table.appendChild(anioHeader);
            const thead = document.createElement('thead');
            let theadHTML = '<tr>';
            for (const cabecera in datos[0]) {
                if (cabecera !== 'url') {
                    theadHTML += `<th>${cabecera}</th>`;
                }
            }
            theadHTML += '</tr>';
            thead.innerHTML = theadHTML;
            table.appendChild(thead);
            const headers = thead.querySelectorAll('th');
            headers.forEach(header => {
                if (header.textContent.includes('PIS') || header.textContent.includes('PISO') || header.textContent.includes('TOTAL') || header.textContent.includes('LIQUIDAC')) {
                    header.classList.add('custom-header');
                }
            });
            const tbody = document.createElement('tbody');
            let totalesRowAdded = false;
            datos.forEach(liquidacion => {
                if ((liquidacion['PISO'] === 'Totales' || liquidacion['PIS'] === 'Totales') && !totalesRowAdded) {
                    const row = document.createElement('tr');
                    row.classList.add('totales');
                    row.setAttribute('data-toggle', 'collapse');
                    row.setAttribute('data-target', `#collapse-${anio}`);
                    row.className = 'accordion-toggle';
                    let rowHTML = '';
                    let columnIndex = 0;
                    for (const propiedad in liquidacion) {
                        if (columnIndex === 0) {
                            rowHTML += `<td>▶️  ${liquidacion[propiedad]}</td>`;
                        } else if (columnIndex === 8) {
                            rowHTML += `<td style="background-color: antiquewhite;">${liquidacion[propiedad]}</td>`;
                        } else if (columnIndex === 9) {
                            rowHTML += `<td class="s-l-collapse" style="background-color: gold;border-bottom-right-radius: 5px;">${liquidacion[propiedad]}</td>`;
                        } else {
                            rowHTML += `<td>${liquidacion[propiedad]}</td>`;
                        }
                        columnIndex++;
                    }
                    row.innerHTML = rowHTML;
                    tbody.appendChild(row);
                    const collapseDiv = document.createElement('div');
                    collapseDiv.className = 'accordian-body collapse';
                    collapseDiv.id = `collapse-${anio}`;
                    let detalleRows = []; // Almacenar las filas de detalle para agregar la clase al último

                    datos.forEach(detalle => {
                        if (detalle.PISO !== 'Totales') {
                            const detalleRow = document.createElement('tr');
                            let detalleHTML = '';
                            let saldoLiquidacion;
                            let contador = 0;
                            for (const propiedad in detalle) {
                                detalleHTML += `<td>${detalle[propiedad]}</td>`;
                                if (contador === Object.keys(detalle).length - 1) {
                                    saldoLiquidacion = detalle[propiedad];
                                }
                                contador++;
                            }
                            detalleRow.innerHTML = detalleHTML;
                            if (saldoLiquidacion && saldoLiquidacion.includes('-')) {
                                detalleRow.classList.add('enNegativo');
                            }
                            detalleRows.push(detalleRow); // Agregar la fila al array
                        }
                    });

                    // Agregar todas las filas de detalle al collapseDiv
                    detalleRows.forEach(detalleRow => {
                        collapseDiv.appendChild(detalleRow);
                    });

                    // Agregar la clase y atributos al último <tr> dentro de collapseDiv ️🔼
                    if (detalleRows.length > 0) {
                        const lastDetalleRow = detalleRows[detalleRows.length - 1];
                        lastDetalleRow.classList.add('accordion-toggle');
                        lastDetalleRow.setAttribute('data-toggle', 'collapse');
                        lastDetalleRow.setAttribute('data-target', `#collapse-${anio}`);
                        // Seleccionar el primer <td> del último <tr>
                        const firstTd = lastDetalleRow.querySelector('td:first-child');

                        // Agregar el símbolo al principio del texto
                        if (firstTd) {
                            firstTd.textContent = '🔼 ' + firstTd.textContent;
                        }
                    }

                    const collapseRow = document.createElement('tr');
                    collapseRow.innerHTML = `<td colspan="${Object.keys(datos[0]).length}" class="hiddenRow"></td>`;
                    collapseRow.querySelector('td').appendChild(collapseDiv);
                    tbody.appendChild(collapseRow);
                    totalesRowAdded = true;
                }
            });
            table.appendChild(tbody);
            anioDiv.appendChild(table);
            container.appendChild(anioDiv);
        }
        console.log(`Número de años: ${numeroAnios}`);
        return numeroAnios; // Devuelve una promesa resuelta
    } catch (error) {
        console.error('Error al cargar las liquidaciones:', error);
        container.textContent = 'Error al cargar las liquidaciones.';
    }
}

function obtenerNombreArchivo(url) {
    const indiceUltimaBarra = url.lastIndexOf('/');
    if (indiceUltimaBarra === -1) {
        return url;
    }
    const nombreArchivo = url.substring(indiceUltimaBarra + 1);
    return nombreArchivo;
}
