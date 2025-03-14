
const liquidaciones = document.getElementById('liquidaciones-container');
const tagFilter = document.getElementById('tag-filter');
const filteredItems = document.getElementById('filtered-items');
const timelineContainer = document.getElementById("timeline");
let numeroAnios = 0;

const timeFadeout = 800; 
var tags_diccionario = {"cerramiento": 1, "cuenta bancaria": 2, "gas": 3, "importante": 4, "mancomunidad": 5, "parking": 6, "portería": 7, "portería-juicio": 8, "portería-venta": 9};
var jsonData = {};

// Cambiar el texto de la primera opción al abrir el select
tagFilter.addEventListener('focus', () => {
  tagFilter.options[0].textContent = '- Seleccionar todo -';
});


async function inicio2() {
    try {
        await cargarLiquidaciones(); // Espera a que cargarLiquidaciones termine

        fetch('timeline_data.json')
            .then(function (response) {
                if (!response.ok) {
                    throw new Error('No se pudo cargar el archivo JSON.');
                }
                return response.json();
            })
            .then(function (data) {
                jsonData = data;
                getTags();
                fadeInAndShow('tag-filter');                
            })
            .catch(function (error) {
                alert('Ocurrió un error:', error);
                console.error('Ocurrió un error:', error);
            });
    } catch (error) {
        console.error('Error en inicio2:', error);
    }
}

inicio2();




function fadeOutAndHide(elementId) {
  const element = document.getElementById(elementId);

  if (element) {
    element.className = 'fadeout'; // Inicia la animación fadeout

    setTimeout(() => {

      element.style.display = 'none';
      timelineContainer.innerHTML = '';
      fadeInAndShow('tag-filter');

       // Oculta el elemento después del tiempo especificado
    }, timeFadeout);
  }
}


function fadeInAndShow(elementId) {
  const element = document.getElementById(elementId);
  if (element) {
    element.className = 'fadein select';
    element.style.display = 'block'; // Inicia la animación fadeout
  }
  setTimeout(() => {
    
       // Oculta el elemento después del tiempo especificado
    }, timeFadeout);  
}


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
        <p>🏛️ ${event.president}<a href="${event.link}" target="_blank" class="content">📄 Doc.</a> </p>

            <p>${contenidoHTML}</p>
            
        </div>
    `;

  timelineContainer.appendChild(li);
  });
  toggleRadioButtons();
}



function filterItems(data, tag) {
  const jsonDataFlitered = [];
  var nRegisters = 0;
  

  // Aplica fade-out
  timelineContainer.classList.add('fade-out');
 

  setTimeout(() => {
    liquidaciones.style.display = "none";
    timelineContainer.innerHTML = ''; // Limpiar el contenedor

    data.forEach(item => {
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
    timelineContainer.classList.add('fade-in');
  }, 800); // Ajusta el tiempo para que coincida con la duración de tu animación fade-out
}



tagFilter.addEventListener('change', () => {
            const selectedTag = tagFilter.value;
            
            if(selectedTag == 'liquidaciones'){
              preCargarLiquidaciones();
              
            } else {
              filterItems(jsonData,selectedTag);
            }
            
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
    tagsArray.splice(gasIndex + 1, 0, 'liquidaciones');
  } else {
      tagsArray.unshift('liquidaciones');
  }

  populateTagFilter(tagsArray);
}


function populateTagFilter(tagsArray) {
  const select = document.getElementById('tag-filter');
    tagsArray.forEach(tag => {
    
    const option = document.createElement('option');
    option.value = tag;
    option.textContent = tag;
    select.appendChild(option);
  });
}



function preCargarLiquidaciones(){
  
  timelineContainer.classList.add('fade-out');
  setTimeout(() => {
    
    timelineContainer.innerHTML = '';
    fadeInAndShow('liquidaciones-container');
    document.getElementById('registers').textContent = 'Nº Registros: ' + `${numeroAnios}`;
  }, 800);
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
        }, 50); // 1000 milisegundos = 1 segundo
        clickCounts[forValue] = 0; // Reinicia el contador
      }
    });
  });
}

