// Variables globales
const tagFilter = document.getElementById('tag-filter');
var tags_diccionario = {"cerramiento": 1, "cuenta bancaria": 2, "gas": 3, "importante": 4, "mancomunidad": 5, "parking": 6, "portería": 7, "portería-juicio": 8, "portería-venta": 9};
const filteredItems = document.getElementById('filtered-items');
const timelineContainer = document.getElementById("timeline");
const timeFadeout = 1000; 

var jsonData = {};

inicio2();

function inicio2(){

fetch('https://raw.githubusercontent.com/gonzashan/M17/1e368272fcf15288ac26bc09abacebe14a85a2aa/PROJECT_TIMELINE/timeline_data.json')

  .then(function(response) {
    // Verifica si la solicitud fue exitosa (código de estado 200)
    if (!response.ok) {
      throw new Error('No se pudo cargar el archivo JSON.');
    }
    // Convierte la respuesta a formato JSON
    return response.json();
  })
  .then(function(data) {
    // Los datos del archivo JSON están disponibles en la variable 'data'
    jsonData= data;
    fadeOutAndHide('file');    
    // Puedes trabajar con los datos aquí, por ejemplo, mostrarlos en una página web
    // o procesarlos de alguna manera.
  })
  .catch(function(error) {
    // Maneja cualquier error que ocurra durante la solicitud
    alert('Ocurrió un error:', error);
    console.error('Ocurrió un error:', error);
  });
}


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
    getTags();
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
}


function filterItems(data, tag) {
  const jsonDataFlitered = [];
  var nRegisters = 0;
  timelineContainer.innerHTML = ''; // Limpiar el contenedor

  data.forEach(item => {
    if (tag === '' || item.tags.includes(tag)) {
      // Filtrar párrafos por tag
      var contentFiltrado = [];
      if (tag === 'actas' || tag === '') {
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
}

/*
function filterItems(data,tag) {
                      
            const jsonDataFlitered = [];
            var nRegisters = 0;
            timelineContainer.innerHTML = ''; // Limpiar el contenedor 


            data.forEach(item => {
                if (tag === '' || item.tags.includes(tag)) {
                    jsonDataFlitered.push(item);
                    nRegisters++;
                }
            });
              timeLineLoad(jsonDataFlitered);
              document.getElementById('registers').textContent = 'Nº Registros: ' + nRegisters;

}

*/

tagFilter.addEventListener('change', () => {
            const selectedTag = tagFilter.value;
            filterItems(jsonData,selectedTag);
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

  const tagsArray = Array.from(tagsFound).sort(); // Convierte el Set a un array y lo ordena
  
  populateTagFilter(tagsArray);
}


function populateTagFilter(tagsArray) {
  const select = document.getElementById('tag-filter');
  
  // Limpia las opciones existentes (excepto la primera)
  
   
  // Agrega las nuevas opciones desde tagsArray
    tagsArray.forEach(tag => {
    
    const option = document.createElement('option');
    option.value = tag;
    option.textContent = tag;
    select.appendChild(option);
  });
}
