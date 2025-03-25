
const liquidaciones_id = document.getElementById('liquidaciones-container');
const gastos_ingresos = document.getElementById('gastos-ingresos-container');
const tagFilter = document.getElementById('tag-filter');
const filteredItems = document.getElementById('filtered-items');
const timelineContainer = document.getElementById("timeline");
const timelinePDFContainer = document.getElementById("timeline-pdf-container");
const jsonDataFlitered = [];
let whoIsOnScreen = 0;
const buttonPdf = document.getElementById("buttonPDF");
var symbol1 = '▶️';
var symbol2 = '🔽';
var symbolEnd = ' 🔼 ';

let numeroAnios = 0;

const timeFadeout = 800; 
var tags_diccionario = {"cerramiento": 1, "cuenta bancaria": 2, "gas": 3, "importante": 4, "mancomunidad": 5, "parking": 6, "portería": 7, "portería-juicio": 8, "portería-venta": 9};
var jsonData = {};


inicio2();


function timeLineLoad(timelineData){
  timeline.id = "timeline";

  timelineData.forEach((event) => {
  const li = document.createElement("li");
  li.classList.add("work");

    // Procesar el array event.content para mostrar los párrafos
  let contenidoHTML = "";
  event.content.forEach((parrafo) => {
      contenidoHTML += `<p>${parrafo.text}</p>`; // Agregar cada párrafo como un <p>
    });

  li.innerHTML = `
        <input class='radio' id='${event.id}' name='works' type='radio'>
        <div class="relative">
            
            <span class='date'>${event.date}</span>
            <span class='circle'></span>
        </div>
        <div class='content'>
          <label for='${event.id}'>${event.title}</label>
          <p>🏛️ ${event.president}            
             ${event.link ? `<a href="${event.link}" target="_blank" class="content">📄 Doc.</a>` : ''}
          </p>
              <p>${contenidoHTML}</p>          
        </div>
    `;

  timelineContainer.appendChild(li);
  });
  buttonPdf.style.visibility = 'visible';
  buttonPdf.classList.add('fadein');  
  toggleRadioButtons();
}

function timeLinePDF() {
    
    timelinePDFContainer.innerHTML = ""; // Limpia el contenido previo
    const tempDiv = document.createElement('div');

    // Inserta el HTML dentro del div temporal
    tempDiv.innerHTML = `<div style="font-size: 9px;letter-spacing: 1.5px;display: flex;justify-content: space-between;">
    <span>Asunto:&nbsp;&nbsp;${tagFilter.value.charAt(0).toUpperCase() + tagFilter.value.slice(1)}</span>
    <span>CP MINERIA 17, Barcelona</span>
    </div>`;
    timelinePDFContainer.appendChild(tempDiv);
    jsonDataFlitered.forEach((event) => {
        const li = document.createElement("li");
        li.className = "liviano";

        let contenidoHTML = "";
        event.content.forEach((parrafo) => {
            contenidoHTML += `<p style="page-break-inside: avoid;white-space: pre-wrap;line-height: 1.5;letter-spacing: 1.2px;word-wrap: break-word;font-size:10px !important;">${parrafo.text}</p>`;
        });

        li.innerHTML = `
            <form class="form">
                <div class="header-container"> 
                    <h2>${event.date}</h2>
                    <h4>${event.title}</h4>
                </div>
                <h4>🏛️ ${event.president}</h4>
                <p>
                    ${contenidoHTML}
                </p>
            </form>
            <br>
        `;

        timelinePDFContainer.appendChild(li);
    });

    createPDF(`${tagFilter.value}`); // Llama a createPDF después de que el bucle termine
}

function createPDF(filename) {
    html2pdf(timelinePDFContainer, {
        margin: 1,
        padding: 2,
        filename: filename + '-resumen-asunto-M17.pdf',
        image: { type: 'jpeg', quality: 1 },
        html2canvas: { scale: 3, logging: true },
        pagebreak: { mode: 'avoid-all' },
        jsPDF: { unit: 'in', format: 'A4', orientation: 'P' }
    }).then(() => {
        timelinePDFContainer.innerHTML = ""; // Limpia el contenido después de generar el PDF
    });
}


function filterItems(tag) {
  
  var nRegisters = 0;

    jsonDataFlitered.length = 0; 

    jsonData.forEach(item => {
      if (tag === '' || item.tags.includes(tag)) {
        // Filtrar párrafos por tag
        var contentFiltrado = [];
        if (tag === 'actas' || tag === 'importante' || tag === '') {
          // Mostrar todos los párrafos si el tag es 'actas' o no hay tag seleccionado
          contentFiltrado = item.content;
        } else {
          // Mostrar solo los párrafos con el ID correspondiente al tag
          var idTag = tags_diccionario[tag];
          if (idTag) {
            contentFiltrado = item.content.filter(parrafo => parrafo.id === idTag);
          }
        }

        // Crear un nuevo objeto con el contenido filtrado
        var itemFiltrado = { ...item, content: contentFiltrado };
        jsonDataFlitered.push(itemFiltrado);
        nRegisters++;
      }
    });

    timeLineLoad(jsonDataFlitered);
    document.getElementById('registers').textContent = 'Nº Registros: ' + nRegisters;

    // Quita fade-out y aplica fade-in
    timelineContainer.classList.remove('fade-out');
}

tagFilter.addEventListener('change', () => {
            const selectedTag = tagFilter.value;
            
            if(selectedTag == 'liquidaciones'){
              //preCargarLiquidaciones();
              whoIs(2);
              
            } else if(selectedTag == 'gastos/ingresos'){
              //preCargarGastos();
              whoIs(1);

            } else {

              whoIs(0,selectedTag);
            }
});



function fadeInAndShow(element) {
  
  if (element) {
    element.classList.add('fadein');
    element.style.display = 'block'; // Inicia la animación fadeout
  }
}


function fadeOutAndHide(element) {
  //const element = document.getElementById(elementIdOut);
  
  if (element) {
    if(element.classList.contains('fadein')){
      //console.log('fadeOutAndHide estamos si contienes fadein')

      element.classList.replace('fadein', 'fadeout'); 

    } else {
        //console.log('fadeOutAndHide estamos si NO contienes fadein')

       element.className = 'fadeout';   
    }

    setTimeout(() => {      
      element.style.display = 'none';

    }, 500);
  }
}


function whoIs(id,selectedTag){
  
  if(id === 2){ //Opción: liquidaciones

    if(whoIsOnScreen === 0){//limpiar pantalla de timeline
      hideButtonPdf();
      timelineContainer.classList.add('fade-out');
      timelineContainer.innerHTML = '';

    } else if(whoIsOnScreen === 1){//limpiar pantalla de Gastos/Ingresos
        fadeOutAndHide(gastos_ingresos);

    }    

    //Presentamos section Liquidaciones
    fadeInAndShow(liquidaciones_id);
    buttonsCollapseLiquidaciones();
    whoIsOnScreen = id;


  } else if(id === 1){//Opción: Gastos/Ingresos


    if(whoIsOnScreen === 0){//limpiar pantalla de timeline
      hideButtonPdf();
      timelineContainer.classList.add('fade-out');
      timelineContainer.innerHTML = '';

    } else if(whoIsOnScreen === 2){//limpiar pantalla de Gastos/Ingresos
        fadeOutAndHide(liquidaciones_id);

    }
    
     whoIsOnScreen = id;
     buttonsCollapseGastos();
     fadeInAndShow(gastos_ingresos);



     modifyingPieChart();
      

  } else if(id === 0){//Opción: Timeline
    
      if(whoIsOnScreen === 2){ //Limpiar pantalla de Liquidaciones

        fadeOutAndHide(liquidaciones_id);

      } else if(whoIsOnScreen === 1){ //Limpiar pantalla de Gastos/Ingresos

        fadeOutAndHide(gastos_ingresos);

      } 

    whoIsOnScreen = id;
    // Aplica fade-out
    timelineContainer.classList.add('fade-out');

    setTimeout(() => {    
      timelineContainer.innerHTML = ''; // Limpiar el contenedor
      filterItems(selectedTag);
      showButtonPdf(); 
     },500);

   } else {
    // POR SI NECESITAMOS MÁS CONCEPTOS
  }
}


// Cambiar el texto de la primera opción al abrir el select
tagFilter.addEventListener('focus', () => {
  tagFilter.options[0].textContent = '- Seleccionar todo -';
});


function getTags() {
  const tagsFound = new Set(); // Usamos un Set para evitar duplicados

  jsonData.forEach(item => {
    if (item.tags) { // Verifica si el elemento tiene tags
      const tagsArray = item.tags.split(', '); // Divide la cadena en un array
      tagsArray.forEach(tag => {
        tagsFound.add(tag); // Agrega cada tag al Set
      });
      }
    });

  const tagsArray = Array.from(tagsFound).sort();
  let gasIndex = tagsArray.findIndex(tag => tag.includes('gas'));

  if (gasIndex !== -1) {
    tagsArray.splice(gasIndex + 1, 0, 'gastos/ingresos', 'liquidaciones');
  } else {
    tagsArray.unshift('liquidaciones', 'gastos/ingresos');
  }

    populateTagFilter(tagsArray);
  }



function populateTagFilter(tagsArray) {
  //const select = document.getElementById('tag-filter');
    tagsArray.forEach(tag => {
    
    const option = document.createElement('option');
    option.value = tag;
    option.textContent = tag;
    tagFilter.appendChild(option);
  });
}


function toggleRadioButtons() {
  const labels = document.querySelectorAll('label');
  const clickCounts = {};

  labels.forEach(label => {
    const forValue = label.getAttribute('for');
    clickCounts[forValue] = 0;

    label.addEventListener('click', () => {
      clickCounts[forValue]++;

      if (clickCounts[forValue] === 2) {
        // Desmarca todos los radio buttons después de 1 segundo
        setTimeout(() => {
          labels.forEach(otherLabel => {
            const otherRadioButton = document.getElementById(otherLabel.getAttribute('for'));
            if (otherRadioButton) {
              otherRadioButton.checked = false;
            }
          });
        }, 70); // 1000 milisegundos = 1 segundo
        clickCounts[forValue] = 0; // Reinicia el contador
      }
    });
  });
}


function buttonsCollapseGastos() {
    var buttons = document.querySelectorAll('.btn[data-toggle="collapse"]');

    buttons.forEach(function(button) {
        // Remover cualquier event listener existente
        button.removeEventListener('click', button.clickHandler);

        // Crear una función para el event listener
        button.clickHandler = function() {
            var currentText = this.textContent;
            var symbol = ' ↵';

            if (currentText.endsWith(symbol)) {
                this.textContent = currentText.slice(0, -symbol.length);
            } else {
                this.textContent = currentText + symbol;
            }
        };

        // Agregar el event listener
        button.addEventListener('click', button.clickHandler);
    });
}


function buttonsCollapseLiquidaciones() {
    var rows = document.querySelectorAll('tr.accordion-toggle[data-toggle="collapse"]');

    rows.forEach(function(row) {
        // Remover cualquier event listener existente
        row.removeEventListener('click', row.clickHandler);

        // Crear una función para el event listener
        row.clickHandler = function() {
            var firstTd = this.querySelector('td:first-child');
            var currentText = firstTd.textContent;
            var symbol1 = '▶️';
            var symbol2 = '🔽';
            var symbolEnd = ' 🔼 ';

            if (currentText.startsWith(symbol1)) {
                firstTd.textContent = currentText.replace(symbol1, symbol2);
            } else {
                firstTd.textContent = currentText.replace(symbol2, symbol1);

                // Hacer scroll al inicio del elemento con un pequeño retraso
                /*
                if (!firstTd.textContent.startsWith(symbol1)) {
                    setTimeout(function() {
                        // Mostrar la posición del elemento antes del scroll
                        var rectBeforeScroll = row.getBoundingClientRect();
                        console.log("Posición antes del scroll:", rectBeforeScroll.top, rectBeforeScroll.left);

                        row.scrollIntoView({ behavior: 'smooth', block: 'start' });

                        // Mostrar la posición del elemento después del scroll
                        var rectAfterScroll = row.getBoundingClientRect();
                        console.log("Posición después del scroll:", rectAfterScroll.top, rectAfterScroll.left);
                    }, 100);
                }*/
            }
        };

        // Mostrar la posición del elemento antes de agregar el evento de clic
        //var rectBefore = row.getBoundingClientRect();
        //console.log("Posición inicial de la fila:", rectBefore.top, rectBefore.left);

        // Agregar el event listener
        row.addEventListener('click', row.clickHandler);
    });
}



function hideButtonPdf(){
  buttonPdf.classList.replace('fadein', 'fadeout');   
  setTimeout(() => {
      buttonPdf.style.visibility = 'hidden';       
  }, 500);
}


function showButtonPdf(){
  buttonPdf.style.visibility = 'visible';       
  setTimeout(() => {
    buttonPdf.classList.replace('fadeout', 'fadein');   
  }, 500);
}


async function inicio2() {
    try {
        await cargarLiquidaciones(); // Espera a que cargarLiquidaciones termine
        await obtenerDatos();

        fetch('https://raw.githubusercontent.com/gonzashan/M17/2ea6368f9a329c3c5fc5720c8365f0970f2968b8/PROJECT_TIMELINE/json/timeline_data.json')
            .then(function (response) {
                if (!response.ok) {
                    throw new Error('No se pudo cargar el archivo JSON.');
                }
                return response.json();
            })
            .then(function (data) {
                jsonData = data;
                getTags();
                fadeInAndShow(tagFilter);                
            })
            .catch(function (error) {
                alert('Ocurrió un error:', error);
                //console.error('Ocurrió un error:', error);
            });
    } catch (error) {
        //console.error('Error en inicio2:', error);
    }
}


function modifyingPieChart(){

     
         // Busca el elemento SVG por su atributo aria-labelledby
        const svgElement1 = document.querySelector('g[aria-labelledby="id-66-title"]');
        const svgElement2 = document.querySelector('g[aria-labelledby="id-153-title"]');
        setTimeout(() => {
        const legend = document.querySelector('[aria-label="Legend"]');
        if (legend) {
            //legend.setAttribute('transform', 'translate(980, 55)');
          } else {
            console.error('No se encontró el elemento de la leyenda.');
          }
        }, 500);

        // Verifica si se encontró el elemento antes de intentar eliminarlo
        if (svgElement1 && svgElement2) {
          // Elimina el elemento SVG del DOM
          svgElement1.remove();
          svgElement2.remove();
          console.log('Elemento SVG eliminado correctamente.');
        } else {
          console.log('No se encontró el elemento SVG.');
        }


}
