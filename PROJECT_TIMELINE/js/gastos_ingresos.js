// URL de tu script de Google Apps Script publicado como aplicación web
const urlScript = '/json/liquidacion_ordinaria_multiples_anios.json';
// Objeto que mapea códigos a nombres de apartados
var tags_apartados = {0: "ERROR", 1: "SEGURO COMUNIDAD", 2: "ARQUITECTO", 3: "OBRAS COMUNIDAD", 4: "HONORARIOS ADMINISTRADOR", 5: "HONORARIOS ADMINISTRADOR", 6: "RECIBOS MANCOMUNIDAD", 7: "PREVENCIÓN RIESGOS", 8: "CONSUMO ELECTRICO", 9: "AGUA", 10: "LIMPIEZA ESCALERA", 11: "MANTENIMIENTO ASCENSOR", 12: "REPARACION ASCENSOR", 13: "MANTENIMIENTO INTERFONO", 14: "MANTENIMIENTO ANTENA", 15: "MANTENIMIENTO EXTINTORES", 16: "FACTURAS ELECTRICISTA", 17: "FACTURA CERREJERlA", 18: "FACTURA LAMPISTA AGUA", 19: "FACTURA DESINFECCIONES", 20: "INSTALACIÓN NUEVA GAS", 21: "IMPRESOS SUPLIDOS", 22: "ALQUILER SALA REUNIONES"};



// Función para obtener los datos JSON usando async/await
async function obtenerDatos() {
  try {
    const response = await fetch(urlScript);
    const datos = await response.json();  
    generarTabla(datos); // Pasa el nombre del archivo a generarTabla
  } catch (error) {
    console.error('Error al obtener los datos:', error);
  }
}

// Función para formatear importes con separador de miles y coma decimal
function formatearImportePersonalizado(importe) {
  if (typeof importe !== 'number') {
    return '0,00'; // Devuelve 0,00 si el importe no es un número
  }

  const importeStr = importe.toFixed(2).replace('.', ','); // Formatea con 2 decimales y reemplaza el punto por coma
  const partes = importeStr.split(',');
  partes[0] = partes[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.'); // Añade separador de miles
  return partes.join(',');
}

function generarTabla(datos) {
  //var tablaHtml = ''; // Contenedor principal
  var idTabla = '';
  var chartData = [];

  datos.forEach(anioData => {
    var anio = anioData.anio;
    chartData.anio = anio;
    var tablaHtml = '';
    var idAnio = 'anio-' + anio; // Genera un ID único para cada año

    idTabla += '<div id="' + idAnio + '" class="anio-container">';

    var totalGeneral = 0;
    tablaHtml += '<div class="table encabezados">';
    tablaHtml += '<div style="display: flex; justify-content: space-between;">';


    //tablaHtml += '<h1 style="margin-left: 0.4em;">Liquidación Ordinaria ' + anio + '</h1>';
    tablaHtml += '<a href="../LIQUIDACIONES/liquidacion_ordinaria_' + anio + '.pdf" target="_blank" style="font-size: 30px;font-weight: 400;padding-left: 15px; padding-top: 20px;"> 📄 Liquidación ordinaria ' + anio + '.pdf</a>';
    //tablaHtml += '<button onclick="toggleContenido(' + anio + ')">Mostrar/ocultar contenido</button>';
    var datosAnio = []; // Array para almacenar los datos de este año
    for (var seccion in anioData) {
      if (seccion !== 'titulo' && seccion !== 'anio') {
        var totalSeccion = anioData[seccion].reduce((acumulador, codigo) => {
          var total = parseFloat(codigo.Totales);
          return isNaN(total) ? acumulador : acumulador + total;
        }, 0);
        totalGeneral += totalSeccion;
      }
    }

    tablaHtml += '<h2 style="padding: 20px 20px 0px 0px;">Total General: ' + formatearImportePersonalizado(totalGeneral) + '</h2>';
    tablaHtml += '<button onclick="toggleContenido(' + anio + ')" style="margin-top: 19px;margin-right: 20px;">Mostrar/ocultar contenido</button></div>';
    tablaHtml += '<div id="'+ anio +'" style="display: none;">';

    for (var seccion in anioData) {
      if (seccion !== 'titulo' && seccion !== 'anio') {
        var totalSeccion = anioData[seccion].reduce((acumulador, codigo) => {
          var total = parseFloat(codigo.Totales);
          return isNaN(total) ? acumulador : acumulador + total;
        }, 0);

        tablaHtml += '<div class="rencabezados"><h2>' + seccion + ': ' + formatearImportePersonalizado(totalSeccion) + '</h2></div>';

        tablaHtml += '<table class="table table-bordered">';
        var aux = 0;
        for (var i = 0; i < anioData[seccion].length; i++) {
          var codigo = anioData[seccion][i].cod;
          var categoriaEncontrada = null;


 // Verificar si el código actual está en el array codigos de esta categoría
           
          var transacciones = anioData[seccion][i].transacciones;
          var total = parseFloat(anioData[seccion][i].Totales);
          var alerta = transacciones.some(transaccion => transaccion.alerta === '❗');
          var botonStyle = alerta ? 'style="background-color: orange;"' : '';
          var nombreApartado = tags_apartados[codigo] || 'Código: ' + codigo;
          //console.log(codigo);
          var collapseId = 'collapse-' + anio + '-' + codigo;

          // Agrega datos al array datosAnio
          datosAnio.push({
            "code": codigo,
            "subject": nombreApartado.trim(),
            "total": ((total) * -1),
            "hidden": true
          });


          tablaHtml += '<tr><td>' +
            '<button class="btn btn-default btn-block" type="button" data-toggle="collapse" data-target="#' + collapseId + '" ' + botonStyle + '>' +
            nombreApartado + ' (Total: ' + formatearImportePersonalizado(total) + ')' +
            '</button>' +
            '<div id="' + collapseId + '" class="collapse">' +
            '<table class="table table-bordered">' +
            '<thead>' +
            '<tr>' +
            '<th class="descripcion-columna">Descripción</th>' +
            '<th>Importe</th>' +
            '<th>Fecha</th>' +
            '<th>Empresa</th>' +
            '<th>Número Documento</th>' +
            '<th>Doc</th>' +
            '<th>Alerta</th>' +
            '</tr>' +
            '</thead>' +
            '<tbody>';

          for (var j = 0; j < transacciones.length; j++) {
            var importe = parseFloat(transacciones[j].importe);

            tablaHtml += '<tr>' +
              '<td class="descripcion-columna">' + transacciones[j].descripcion + '</td>' +
              '<td class="importe-right">' + formatearImportePersonalizado(importe) + '</td>' +
              '<td>' + transacciones[j].fecha + '</td>' +
              '<td>' + transacciones[j].empresa + '</td>' +
              '<td>' + transacciones[j].numero_documento + '</td>' +
              '<td><a href="' + transacciones[j].url + '" target="_blank">Ver</a></td>' +
              '<td>' + transacciones[j].alerta + '</td>' +
              '</tr>';
          }

          tablaHtml += '</tbody></table></div>' + '</td></tr>';
        }

        tablaHtml += '</table>';
      }

    }
    idTabla += tablaHtml + '</div>';
    idTabla += '<div id="chartdiv-'+ anio +'" class="chart-container"></div>';
    idTabla += '</div>'; // Cierra el contenedor del año
    idTabla += '</div>';
    document.getElementById('gastos-ingresos-container').innerHTML = idTabla;
    chartData.push({
      "anio": anio,
      "datos": datosAnio
    });
  });
  
   // Cierra el contenedor principal
  charResults(chartData);
}


function toggleContenido(idContenido) {
  var contenido = document.getElementById(idContenido);
  if (contenido.style.display === "none") {
    contenido.style.display = "block";
  } else {
    contenido.style.display = "none";
  }
}


function calcularTotalesPorCuentas(anioData) {
    var codigosPorCuentas = {
        622: { subject: "MANTENIMIENTOS", codigos: [11, 12, 13, 14, 15, 16] },
        6280: { subject: "SUMINISTRO ELÉCTRICO", codigos: [8] },
        6281: { subject: "AGUA", codigos: [9] },
        6292: { subject: "LIMPIEZA", codigos: [10] },
        6221: { subject: "CONSTRUCCIONES", codigos: [3] },
        640: { subject: "ADMINISTRADOR", codigos: [4, 5, 7] },
        623: { subject: "PROFESIONALES", codigos: [2] },
        625: { subject: "SEGUROS", codigos: [1] },
        629: { subject: "MANCOMUNIDAD", codigos: [6] },
        6222: { subject: "INSTALACIONES TÉCNICAS", codigos: [17, 18, 19] },
        6222: { subject: "DERRAMAS", codigos: [20] },
    };

    var totalesPorCuentas = {};

    anioData.datos.forEach(dato => {
        var codigo = parseInt(dato.code);
        var cantidad = parseInt(dato.total);

        Object.keys(codigosPorCuentas).forEach(cod_cta => {
            if (codigosPorCuentas[cod_cta].codigos.includes(codigo)) {
                if (!totalesPorCuentas[cod_cta]) {
                    totalesPorCuentas[cod_cta] = {
                        subject: codigosPorCuentas[cod_cta].subject,
                        total: 0
                    };
                }
                totalesPorCuentas[cod_cta].total += cantidad;
            }
        });
    });

    // Transformación dentro de la función
    const arrayDeDatos = Object.entries(totalesPorCuentas).map(([cta, datos]) => ({
        cta: cta,
        subject: datos.subject,
        total: datos.total
    }));


    return arrayDeDatos;
}



function charResults(chartData) {


  // Themes begin
  am4core.useTheme(am4themes_animated);

  chartData.forEach(anioData => {
    // Create chart instance for each year
    var chart = am4core.create("chartdiv-" + anioData.anio, am4charts.PieChart);

    
    // Assign data to the chart
    var resultados = calcularTotalesPorCuentas(anioData);
    chart.data = resultados;
    const chartDataJSON = JSON.stringify(anioData.datos, null, 2); // Convierte a cadena JSON con 2 espacios de sangría
    //alert(chartDataJSON);
  
    // Add and configure Series
    var pieSeries = chart.series.push(new am4charts.PieSeries());
    //pieSeries.colors.list = am4core.colorSets.material.list; no funciona
    /*
    pieSeries.colors.list = [
      am4core.color("#FF0000"), // Rojo
      am4core.color("#00FF00"), // Verde
      am4core.color("#0000FF"), // Azul
      am4core.color("#FFFF00"), // Amarillo
      am4core.color("#FF00FF"), // Magenta
      am4core.color("#00FFFF"), // Cian
      am4core.color("#FFA500"), // Naranja
      am4core.color("#800080"), // Púrpura
      am4core.color("#A52A2A"), // Marrón
      am4core.color("#408080")  // Gris
    ]*/;
    //console.log(chart.series);
    pieSeries.dataFields.value = "total";
    pieSeries.dataFields.category = "subject";
    pieSeries.dataFields.hidden = "hidden"; // Asignar el campo 'hidden'
    pieSeries.slices.template.stroke = am4core.color("#fff");
    pieSeries.slices.template.strokeWidth = 2;
    pieSeries.slices.template.strokeOpacity = 1;

    // Add a legend
    chart.legend = new am4charts.Legend();
    chart.legend.position = "right";
    chart.legend.valueLabels.template.text = "{value.value}";
    chart.legend.labels.template.fontSize = 8.5;


    // Aplicar el formateador a las etiquetas de valor de la leyenda
    
    /*
    chart.legend.adapter.add("labelText", function(labeltext, target) {

      return target.dataItem.value.value.toLocaleString('es-ES', { maximumFractionDigits: 2 });
      // o si no funciona toLocaleString
      // return chart.numberFormatter.format(target.dataItem.value.value) + " (" + target.dataItem.percent.percent.toFixed(2) + "%)";
    });*/

    // This creates initial animation
    pieSeries.hiddenState.properties.opacity = 1;
    pieSeries.hiddenState.properties.endAngle = -90;
    pieSeries.hiddenState.properties.startAngle = -90;
    // Agregar interactividad (opcional)
    /*pieSeries.slices.template.events.on("hit", function(ev) {
      ev.target.dataItem.dataContext.hidden = !ev.target.dataItem.dataContext.hidden;
      ev.target.dataItem.slice.hide();
      ev.target.dataItem.slice.show();
    });*/
  });

}






