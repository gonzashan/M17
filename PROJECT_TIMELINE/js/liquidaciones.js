// Asegúrate de que esta función obtenerNombreArchivo esté accesible globalmente o dentro de cargarLiquidaciones
function obtenerNombreArchivo(url) {
    const indiceUltimaBarra = url.lastIndexOf('/');
    if (indiceUltimaBarra === -1) {
        return url;
    }
    const nombreArchivo = url.substring(indiceUltimaBarra + 1);
    return nombreArchivo;
}

async function cargarLiquidaciones() {
    // CORRECCIÓN 1: Declarar la variable numeroAnios al inicio de la función
    let numeroAnios = 0; 
    
    // Necesitamos que 'container' esté declarado antes del bloque 'try' para que sea accesible en 'catch'
    const container = document.getElementById('liquidaciones-container');

    try {
        const response = await fetch('https://raw.githubusercontent.com/gonzashan/M17/e21f73956d632a7c3bda737459388bf0a8401afb/PROJECT_TIMELINE/json/liquidaciones.json');
        
        const liquidaciones = await response.json();
        const propietarios2024 = [];

        container.innerHTML = '';
        
        // CORRECCIÓN 2: Inversión del Ciclo
        // 1. Obtener los años (claves)
        const anios = Object.keys(liquidaciones);
        
        // 2. Invertir el array para ir del año mayor al menor
        //    (e.g., [2024, 2023, 2022] en lugar de [2022, 2023, 2024])
        anios.reverse(); 

        // 3. Iterar sobre el array de años invertido
        for (const anio of anios) { // Usamos for...of para iterar el array
            numeroAnios++;
            const anioData = liquidaciones[anio];
            const url = anioData.url;
            const datos = anioData.data;
            const anioDiv = document.createElement('div');
            anioDiv.className = "liquidaciones-div";
            
            const table = document.createElement('table');
            table.className = 'fl-table';
            const anioHeader = document.createElement('thead');

            let folderFiles = url.substring(0, url.lastIndexOf('/') + 1);
            let liquidacionOrdinaria = folderFiles + 'liquidacion_ordinaria_' + anio + '.pdf';

            //console.log(liquidacionOrdinaria);
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
                        if (propiedad !== 'url') { // Añadida la exclusión de 'url' también en Totales
                            if (columnIndex === 0) {
                                rowHTML += `<td>▶️  ${liquidacion[propiedad]}</td>`;
                            } else if (columnIndex === 8) {
                                rowHTML += `<td style="background-color: antiquewhite;">${liquidacion[propiedad]}</td>`;
                            } else if (columnIndex === 9) {
                                rowHTML += `<td class="s-l-collapse" style="background-color: gold;border-bottom-right-radius: 5px;">${liquidacion[propiedad]}</td>`;
                            } else {
                                rowHTML += `<td>${liquidacion[propiedad]}</td>`;
                            }
                            columnIndex++;
                        }
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
                                if (propiedad !== 'url') { // Añadida la exclusión de 'url'
                                    detalleHTML += `<td>${detalle[propiedad]}</td>`;
                                    if (contador === Object.keys(detalle).length - 2) { // Ajustamos el índice si excluimos 'url'
                                        saldoLiquidacion = detalle[propiedad];
                                    }
                                    contador++;
                                }
                            }
                            detalleRow.innerHTML = detalleHTML;
                            if (saldoLiquidacion && saldoLiquidacion.includes('-')) {
                                detalleRow.classList.add('enNegativo');
                            }

                            if (anio == '2024') {
                                console.log(saldoLiquidacion);
                                propietarios2024.push({ // Agregamos un objeto al array
                                    piso: detalle.PIS,
                                    saldo: saldoLiquidacion
                                });
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
                    // Usar Object.keys(datos[0]).length - 1 si 'url' es la propiedad excluida
                    collapseRow.innerHTML = `<td colspan="${Object.keys(datos[0]).length - 1}" class="hiddenRow"></td>`; 
                    collapseRow.querySelector('td').appendChild(collapseDiv);
                    tbody.appendChild(collapseRow);
                    totalesRowAdded = true;
                }
            });
            table.appendChild(tbody);
            anioDiv.appendChild(table);
            container.appendChild(anioDiv);
        }
        
        const arrayPropietarios2024 = `let arrayPropietarios2024 = [${propietarios2024.map(item => `{ piso: "${item.piso}", saldo: "${item.saldo}" }`).join(', ')}];`;      
        console.log(propietarios2024);
        console.log(arrayPropietarios2024);
        
        return numeroAnios; // Devuelve una promesa resuelta
    } catch (error) {
        console.error('Error al cargar las liquidaciones:', error);
        container.textContent = 'Error al cargar las liquidaciones.';
        return 0; // Se recomienda devolver un valor en caso de error
    }
}
