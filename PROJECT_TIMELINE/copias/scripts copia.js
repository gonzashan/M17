// Variables globales
const tagFilter = document.getElementById('tag-filter');
const filteredItems = document.getElementById('filtered-items');
const timelineContainer = document.getElementById("timeline");
const timeFadeout = 1000; 

var jsonData = {};

const inputArchivo = document.getElementById('fileUpload');
      inputArchivo.addEventListener('change', () => {
      const archivo = inputArchivo.files[0];
      const lector = new FileReader();

      lector.onload = (evento) => {
        try {
          jsonData = JSON.parse(evento.target.result);

          fadeOutAndHide('file');          
          //timeLineLoad(jsonData); // Muestra los datos en la consola        
          // Ejemplo: Mostrar los datos en el div 'contenido'
        } catch (error) {
          alert('Error al analizar JSON:', error);
          console.error('Error al analizar JSON:', error);
        }
      };

      lector.readAsText(archivo);
      

    });

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
  // Reemplazamos los saltos de línea con <br>
  const contenidoConBr = event.content.replace(/\*(.*?)\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
  li.innerHTML = `
        <input class='radio' id='${event.id}' name='works' type='radio'>
        <div class="relative">
            
            <span class='date'>${event.date}</span>
            <span class='circle'></span>
        </div>
        <div class='content'>
        <label for='${event.id}'>${event.title}</label>
        <p>🏛️ ${event.president}<a href="${event.link}" target="_blank" class="content">📄 Doc.</a> </p>

            <p>${contenidoConBr}</p>
            
        </div>
    `;

  timelineContainer.appendChild(li);
  });
}


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