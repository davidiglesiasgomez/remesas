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
});
document.getElementById('FicheroIDBtn').onclick = () => ficheroIdPicker.open();

document.getElementById('nuevoReciboBtn').onclick = (e) => {
    e.preventDefault()
    document.getElementById('contadorRecibosRemesa').value = 1 + parseInt(document.getElementById('contadorRecibosRemesa').value)
    const contador = parseInt(document.getElementById('contadorRecibosRemesa').value)

    const formRecibo = '' +
    '<p>Recibo #' + contador + '</p>' +
    '<div class="recibo">' +
    '<div class="form-field">' +
    '<label for="Identificador' + contador + '" class="">Cliente</label>' +
    '<input type="text" id="Identificador' + contador + '" name="Identificador' + contador + '" class="pure-input-2-3" />' +
    '</div>' +
    '<div class="form-field">' +
    '<label for="MndtId' + contador + '" class="form-field__label">Identificador de Mandato</label>' +
    '<input type="text" id="MndtId' + contador + '" name="MndtId' + contador + '" class="pure-input-2-3" readonly />' +
    '</div>' +
    '<div class="form-field">' +
    '<label for="DtOfSgntr' + contador + '" class="form-field__label">Fecha de Firma</label>' +
    '<input type="text" id="DtOfSgntr' + contador + '" name="DtOfSgntr' + contador + '" class="pure-input-2-3" readonly />' +
    '</div>' +
    '<input type="hidden" id="AmdmntInd' + contador + '" name="AmdmntInd' + contador + '" />' +
    '<div class="form-field">' +
    '<label for="Nm' + contador + '" class="form-field__label">Nombre</label>' +
    '<input type="text" id="Nm' + contador + '" name="Nm' + contador + '" class="pure-input-2-3" readonly />' +
    '</div>' +
    '<div class="form-field">' +
    '<label for="Ctry' + contador + '" class="form-field__label">País</label>' +
    '<input type="text" id="Ctry' + contador + '" name="Ctry' + contador + '" class="pure-input-2-3" readonly />' +
    '</div>' +
    '<div class="form-field">' +
    '<label for="AdrLine1_' + contador + '" class="form-field__label">Dirección</label>' +
    '<input type="text" id="AdrLine1_' + contador + '" name="AdrLine1_' + contador + '" class="pure-input-2-3" readonly />' +
    '</div>' +
    '<div class="form-field">' +
    '<label for="AdrLine2_' + contador + '" class="form-field__label">Dirección</label>' +
    '<input type="text" id="AdrLine2_' + contador + '" name="AdrLine2_' + contador + '" class="pure-input-2-3" readonly />' +
    '</div>' +
    '<div class="form-field">' +
    '<label for="IBAN' + contador + '" class="form-field__label">IBAN</label>' +
    '<input type="text" id="IBAN' + contador + '" name="IBAN' + contador + '" class="pure-input-2-3" readonly />' +
    '</div>' +
    '<div class="form-field">' +
    '<label for="Ustrd' + contador + '" class="form-field__label">Concepto</label>' +
    '<input type="text" id="Ustrd' + contador + '" name="Ustrd' + contador + '" class="pure-input-2-3" />' +
    '</div>' +
    '<div class="form-field">' +
    '<label for="InstdAmt' + contador + '" class="form-field__label">Importe (€)</label>' +
    '<input type="text" id="InstdAmt' + contador + '" name="InstdAmt' + contador + '" class="pure-input-2-3" />' +
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

document.getElementById('nuevaRemesaForm').onsubmit = (e) => {
    e.preventDefault()
    console.log('Submit Añadir Remesa Nueva')
    const data = new FormData(e.target)
    // console.log('data', data)
    const dataObject = Object.fromEntries(data.entries())
    console.log('dataObject', dataObject)
    // data.forEach((value, key) => {
    //     console.log(`${key}: ${value}`)
    // })
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
