const headersClientes = {
    'nombre': 'Nombre',
    'nif': 'NIF',
    'iban': 'IBAN',
    'fecha de inserción': 'Fecha de Inserción'
};

var storedClientesData = []
var storedRemesasData = []
var storedEmisorData = {}

// Esperamos a que el DOM esté cargado
document.addEventListener('DOMContentLoaded', function() {
    // Mostrar los datos almacenados si existen
    storedClientesData = JSON.parse(localStorage.getItem('clientes'));
    storedRemesasData = JSON.parse(localStorage.getItem('remesas'));
    storedEmisorData = JSON.parse(localStorage.getItem('emisor'));
    if (storedClientesData) {
        displayClientesData(storedClientesData, headersClientes);
    }
    if (storedEmisorData) {
        document.getElementById('EmisorInitgPtyNm').value = storedEmisorData.InitgPtyNm || ''
        document.getElementById('EmisorInitgPtyId').value = storedEmisorData.InitgPtyId || ''
        document.getElementById('EmisorCdtrAcct').value = storedEmisorData.CdtrAcct || ''
        document.getElementById('EmisorCdtrAgtBIC').value = storedEmisorData.CdtrAgtBIC || ''
        document.getElementById('InitgPtyNm').value = storedEmisorData.InitgPtyNm || ''
        document.getElementById('InitgPtyId').value = storedEmisorData.InitgPtyId || ''
        document.getElementById('CdtrAcct').value = storedEmisorData.CdtrAcct || ''
        document.getElementById('CdtrAgtBIC').value = storedEmisorData.CdtrAgtBIC || ''
    }

    // Ocultar todas las secciones excepto la introducción
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        if (section.id !== 'home') {
            section.style.display = 'none';
        }
    });

    // Manejar los clics en los enlaces de navegación
    const navLinks = document.querySelectorAll('nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            event.preventDefault();
            const targetId = this.getAttribute('href').substring(1)
            // Ocultar todas las secciones excepto la seleccionada
            sections.forEach(section => {
                if (section.id === targetId) {
                    section.style.display = 'block';
                } else {
                    section.style.display = 'none';
                }
            });
            navLinks.forEach(link => {
                link.parentElement.classList.remove('pure-menu-selected')
            });
            this.parentElement.classList.add('pure-menu-selected')
        });
    });
});

// Manejar la subida de archivos
document.getElementById('fileClientesInput').addEventListener('click', function() {
    const progressBarClientesContainer = document.getElementById('progressBarClientesContainer');
    progressBarClientesContainer.innerHTML = ''
})

document.getElementById('uploadClientesBtn').addEventListener('click', function() {

    const progressBarClientesContainer = document.getElementById('progressBarClientesContainer');
    var progressBarClientesCounter = 0
    var progressBarClientesInterval = setInterval(() => {
        progressBar(progressBarClientesContainer, progressBarClientesCounter++, 'Subiendo archivo...')
        if (progressBarClientesCounter > 100) clearInterval(progressBarClientesInterval)
    }, 50)

    const fileClientesInput = document.getElementById('fileClientesInput');
    const file = fileClientesInput.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const text = e.target.result;
            const data = parseCSV(text, ['nombre', 'iban', 'dato desconocido 1', 'domicilio', 'código postal y localidad', 'provincia', 'código de país', 'dato desconocido2', 'nif', 'fecha de inserción']);
            saveData(data, 'clientes');
            displayClientesData(data, headersClientes);

            clearInterval(progressBarClientesInterval)
            progressBarClientesInterval = setInterval(() => {
                progressBar(progressBarClientesContainer, progressBarClientesCounter++, 'Subiendo archivo...')
                if (progressBarClientesCounter > 100) clearInterval(progressBarClientesInterval)
            }, 1)
        };
        reader.readAsText(file);
    }
});

function parseCSV(text, columns) {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line);
    return lines.slice(1).map(line => {
        const values = line.split(';').map(value => value.trim());
        return columns.reduce((object, column, index) => {
            object[column] = values[index] || '';
            return object;
        }, {});
    });
}

function saveData(data, item) {
    localStorage.setItem(item, JSON.stringify(data));
}

function displayClientesData(data, headers) {
    const container = document.getElementById('dataClientesContainer');
    container.innerHTML = ''; // Limpiar el contenedor anterior

    if (data.length === 0) {
        container.innerHTML = '<p>No hay datos disponibles.</p>';
        return;
    }

    const table = document.createElement('table');
    table.id = 'dataClientesTable';
    table.className = 'pure-table pure-table-bordered'; // Aplicar estilos de PureCSS para tablas

    // Crear la fila de encabezado
    const headerSection = document.createElement('thead');
    const headerRow = document.createElement('tr');
    Object.keys(headers).forEach(key => {
        if (key === 'dato desconocido 1' || key === 'dato desconocido2' || key === 'fecha de inserción') {
            return;
        }
        const th = document.createElement('th');
        th.textContent = headers[key];
        headerRow.appendChild(th);
    });
    headerSection.appendChild(headerRow);
    table.appendChild(headerSection);

    const bodySection = document.createElement('tbody');
    // Crear filas para cada registro de datos
    data.forEach((item) => {
        const row = document.createElement('tr');
        Object.keys(headers).forEach(key => {
            if (key === 'dato desconocido 1' || key === 'dato desconocido2' || key === 'fecha de inserción') {
                return;
            }
            const cell = document.createElement('td');
            cell.textContent = item[key];
            row.appendChild(cell);
        });
        bodySection.appendChild(row);
    });
    table.appendChild(bodySection);

    container.appendChild(table);
}

// Función para añadir el ordenamiento y filtrado a las columnas de la tabla
function addSortingAndFilteringToTable(table) {
    if (!table) {
        return
    }
    const headers = table.querySelectorAll('thead th');

    // Crear fila de filtro
    const filterRow = document.createElement('tr');
    headers.forEach((header, index) => {
        const td = document.createElement('td');
        const input = document.createElement('input');
        input.setAttribute('type', 'text');
        input.setAttribute('placeholder', 'Filtrar...');
        input.addEventListener('input', () => {
            const searchText = input.value.toLowerCase().trim();
            const rows = Array.from(table.querySelectorAll('tbody tr'));

            rows.forEach(row => {
                const cellText = row.querySelectorAll('td')[index].textContent.toLowerCase().trim();
                row.style.display = cellText.includes(searchText) ? '' : 'none';
            });
        });
        td.appendChild(input);
        filterRow.appendChild(td);
    });
    table.querySelector('thead').appendChild(filterRow);

    // Añadir ordenamiento a las columnas
    headers.forEach((header, index) => {
        let sortOrder = 1; // 1 para orden ascendente, -1 para orden descendente
        header.addEventListener('click', () => {
            const rows = Array.from(table.querySelectorAll('tbody tr'));
            const isNumeric = !isNaN(parseFloat(rows[0].querySelectorAll('td')[index].textContent));

            rows.sort((a, b) => {
                const aValue = a.querySelectorAll('td')[index].textContent.trim();
                const bValue = b.querySelectorAll('td')[index].textContent.trim();

                if (isNumeric) {
                    return (parseFloat(aValue) - parseFloat(bValue)) * sortOrder;
                } else {
                    return aValue.localeCompare(bValue) * sortOrder;
                }
            });

            // Cambiar el sentido de ordenamiento para la próxima vez que se haga clic
            sortOrder *= -1;

            const sortedRows = rows.map(row => row.outerHTML);
            const tbody = table.querySelector('tbody');
            tbody.innerHTML = sortedRows.join('');
        });

        // Cambiar el cursor al pasar por encima de los encabezados de columna
        header.style.cursor = 'pointer';
    });
}

// Llamar a la función addSortingAndFilteringToTable después de cargar el contenido
document.addEventListener('DOMContentLoaded', () => {
    const table = document.getElementById('dataClientesTable');
    addSortingAndFilteringToTable(table);
}, false);

// Manejar la actualización de datos del emisor
document.getElementById('updateEmisorForm').addEventListener('submit', function(e) {
    e.preventDefault()

    const progressBarEmisorContainer = document.getElementById('progressBarEmisorContainer');
    var progressBarEmisorCounter = 0
    var progressBarEmisorInterval = setInterval(() => {
        progressBar(progressBarEmisorContainer, progressBarEmisorCounter++, 'Actualizando datos...')
        if (progressBarEmisorCounter > 100) clearInterval(progressBarEmisorInterval)
    }, 1)

    const InitgPtyNm = document.getElementById('EmisorInitgPtyNm').value
    const InitgPtyId = document.getElementById('EmisorInitgPtyId').value
    const CdtrAcct = document.getElementById('EmisorCdtrAcct').value
    const CdtrAgtBIC = document.getElementById('EmisorCdtrAgtBIC').value
    const data = {
        'InitgPtyNm': InitgPtyNm,
        'InitgPtyId': InitgPtyId,
        'CdtrAcct': CdtrAcct,
        'CdtrAgtBIC': CdtrAgtBIC
    }
    const item = 'emisor'
    saveData(data, item)
});

const ficheroIdPicker = MCDatepicker.create({
    el: '#FicheroIDPicker',
    bodyType: 'modal',
    dateFormat: 'dd mm yy',
    autoClose: true,
    closeOndblclick: true,
    closeOnBlur: true
});
ficheroIdPicker.onSelect((date, formatedDate) => {
    document.getElementById('FicheroID').value = 'R' + formatedDate.replaceAll(' ', '')
    document.getElementById('FicheroIDDate').value = date
});
document.getElementById('FicheroIDBtn').onclick = () => ficheroIdPicker.open();

document.getElementById('nuevoReciboBtn').onclick = (e) => {
    e.preventDefault()
    document.getElementById('contadorRecibosRemesa').value = 1 + parseInt(document.getElementById('contadorRecibosRemesa').value)
    const contador = parseInt(document.getElementById('contadorRecibosRemesa').value)

    const formRecibo = '' +
    '<div id="Recibo' + contador + '">' +
    '<p>Recibo #' + contador + ' <button type="button" class="pure-button" onclick="if (confirm(\'¿Está seguro que quiere eliminar el recibo?\')) document.getElementById(\'Recibo' + contador + '\').remove()">🗑️</button></p>' +
    '<div class="recibo">' +
    '<div class="form-field">' +
    '<label for="Identificador' + contador + '" class="">Cliente</label>' +
    '<input type="text" id="Identificador' + contador + '" name="recibos[' + contador + '][Identificador]" class="pure-input-2-3" />' +
    '</div>' +
    '<input type="hidden" id="MndtId' + contador + '" name="recibos[' + contador + '][MndtId]" />' +
    '<input type="hidden" id="DtOfSgntr' + contador + '" name="recibos[' + contador + '][DtOfSgntr]" />' +
    '<input type="hidden" id="Nm' + contador + '" name="recibos[' + contador + '][Nm]" />' +
    '<input type="hidden" id="Ctry' + contador + '" name="recibos[' + contador + '][Ctry]" />' +
    '<input type="hidden" id="AdrLine1_' + contador + '" name="recibos[' + contador + '][AdrLine1_]" />' +
    '<input type="hidden" id="AdrLine2_' + contador + '" name="recibos[' + contador + '][AdrLine2_]" />' +
    '<input type="hidden" id="IBAN' + contador + '" name="recibos[' + contador + '][IBAN]" />' +
    '<div class="form-field">' +
    '<label for="Ustrd' + contador + '" class="form-field__label">Concepto' + '&nbsp;' +
    '<button type="button" class="pute-button" onclick="rellenarConceptoRemesa(\'auto\', ' + contador + ')">🚗 Auto</button>' + '&nbsp;' +
    '<button type="button" class="pute-button" onclick="rellenarConceptoRemesa(\'hogar\', ' + contador + ')">🏠 Hogar</button>' + '&nbsp;' +
    '<button type="button" class="pute-button" onclick="rellenarConceptoRemesa(\'comunidad\', ' + contador + ')">🏢 Comunidad</button>' + '&nbsp;' +
    '<button type="button" class="pute-button" onclick="rellenarConceptoRemesa(\'decesos\', ' + contador + ')">⚰️ Decesos</button>' + '&nbsp;' +
    '<button type="button" class="pute-button" onclick="rellenarConceptoRemesa(\'salud\', ' + contador + ')">⚕️ Salud</button>' + '&nbsp;' +
    '<button type="button" class="pute-button" onclick="rellenarConceptoRemesa(\'generica\', ' + contador + ')">❔ Genérica</button>' + '&nbsp;' +
    '</label>' +
    '<input type="text" id="Ustrd' + contador + '" name="recibos[' + contador + '][Ustrd]" class="pure-input-2-3" />' +
    '</div>' +
    '<div class="form-field">' +
    '<label for="InstdAmt' + contador + '" class="form-field__label">Importe (€)</label>' +
    '<input type="text" id="InstdAmt' + contador + '" name="recibos[' + contador + '][InstdAmt]" class="pure-input-2-3" />' +
    '</div>' +
    '</div>' +
    '</div>' +
    ''

    const nuevoRecibo = document.createElement('div')
    nuevoRecibo.classList.add('recibo')
    nuevoRecibo.setAttribute('contador', contador)
    nuevoRecibo.innerHTML = formRecibo

    document.getElementById('recibosRemesaLista').append(nuevoRecibo)

    new autoComplete({
        selector: () => {return document.getElementById("Identificador" + contador)},
        placeHolder: "Buscar Cliente...",
        data: {
            src: storedClientesData.map((cliente) => {
                cliente.key = `${cliente.nif} - ${cliente.nombre} - ${cliente.iban} - ${cliente["fecha de inserción"]}`
                return cliente
            }),
            keys: ["key"],
        },
        resultItem: {
            highlight: true,
        }
    })
    document.getElementById("Identificador" + contador).addEventListener("selection", function (event) {
        if (!event.detail.selection.value) {
            return
        }
        document.getElementById("Identificador" + contador).value = event.detail.selection.value.key
        document.getElementById("MndtId" + contador).value = event.detail.selection.value.nif
        document.getElementById("DtOfSgntr" + contador).value = event.detail.selection.value["fecha de inserción"]
        document.getElementById("Nm" + contador).value = event.detail.selection.value.nombre
        document.getElementById("Ctry" + contador).value = event.detail.selection.value["código de país"]
        document.getElementById("AdrLine1_" + contador).value = event.detail.selection.value.domicilio
        document.getElementById("AdrLine2_" + contador).value = event.detail.selection.value["código postal y localidad"]
        document.getElementById("IBAN" + contador).value = event.detail.selection.value.iban
    })
}

function rellenarConceptoRemesa(tipo, contador) {
    tipo = tipo || 'generica'
    contador = contador || 0
    var fecha = new Date(document.getElementById('FicheroIDDate').value)
    var desde = fecha.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    })
    fecha.setFullYear(fecha.getFullYear() + 1);
    var hasta = fecha.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    })
    var concepto = ''
    switch (tipo) {
        case 'auto':
            concepto = 'SEGURO AUTO / VALIDO DESDE ' + desde + ' HASTA ' + hasta + ' / POLIZA X-XX-######### / MATRICULA #### XXX'
            break
        case 'hogar':
            concepto = 'SEGURO HOGAR / VALIDO DESDE ' + desde + ' HASTA ' + hasta + ' / POLIZA X-XX-######### / DOMICILIO RIESGO '
            break
        case 'comunidad':
            concepto = 'SEGURO COMUNIDAD / VALIDO DESDE ' + desde + ' HASTA ' + hasta + ' / POLIZA X-XX-#########'
            break
        case 'decesos':
            concepto = 'SEGURO DECESOS / VALIDO DESDE ' + desde + ' HASTA ' + hasta + ' / POLIZA X-XX-#########'
            break
        case 'salud':
            concepto = 'SEGURO SALUD / VALIDO DESDE ' + desde + ' HASTA ' + hasta + ' / POLIZA X-XX-#########'
            break
        default:
            concepto = 'SEGURO / VALIDO DESDE ' + desde + ' HASTA ' + hasta + ' / POLIZA X-XX-#########'
            break
    }
    document.getElementById('Ustrd' + contador).value = concepto
}

document.getElementById('nuevaRemesaForm').onsubmit = (e) => {
    e.preventDefault()
    console.log('Submit Añadir Remesa Nueva')
    const data = new FormData(e.target)
    // console.log('data', data)
    // const dataObject = Object.fromEntries(data.entries())
    // console.log('dataObject', dataObject)
    data.forEach((value, key) => {
        // console.log(`${key}: ${value}`)
        const keys = key.match(/[^[\]]+/g); // Extrae las claves
        if (keys.length === 3) {
            if (!data[keys[0]]) {
                data[keys[0]] = {};
            }
            if (!data[keys[0]][keys[1]]) {
                data[keys[0]][keys[1]] = {};
            }
            data[keys[0]][keys[1]][keys[2]] = value;
        } else if (keys.length === 1) {
            data[keys[0]] = value;
        }
    })
    // console.log('data', data)
}

function progressBar(parentElement, progress, text)
{
    progress = progress || 0
    progress = ( progress > 100 ? 100 : progress )
    text = text || ''
    const progressBar = '' +
    '<div class="progressBarWrap">' +
    '<div class="progress-bar">' +
    '<span class="progress-bar-fill" style="width: ' + progress + '%;"></span>' +
    '</div>' +
    '</div>' +
    ''
    parentElement.innerHTML = progressBar
}

document.getElementById('navEmisorBtn').addEventListener('click', function(e) {
    const progressBarEmisorContainer = document.getElementById('progressBarEmisorContainer');
    progressBarEmisorContainer.innerHTML = ''
})