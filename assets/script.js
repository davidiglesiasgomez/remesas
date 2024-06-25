const headersClientes = {
    'nombre': 'Nombre',
    'nif': 'NIF',
    'iban': 'IBAN',
    'fecha de inserción': 'Fecha de Inserción'
};

const headersRemesas = {
    'FicheroID': 'Recibo de la Remesa',
    'NumRows': 'Número de Recibos',
    'CtrlSum': 'Suma de Control',
    'CreationDate': 'Fecha de Creación'
};

var storedClientesData = []
var storedRemesasData = []
var storedEmisorData = {}
var actualRemesaData = {}

// Esperamos a que el DOM esté cargado
document.addEventListener('DOMContentLoaded', function() {
    // Mostrar los datos almacenados si existen
    storedClientesData = JSON.parse(localStorage.getItem('clientes'));
    storedRemesasData = JSON.parse(localStorage.getItem('remesas'));
    storedEmisorData = JSON.parse(localStorage.getItem('emisor'));
    actualRemesaData = JSON.parse(localStorage.getItem('actual'));
    if (storedClientesData) {
        displayClientesData(storedClientesData, headersClientes);
    }
    if (storedRemesasData) {
        displayRemesasData(storedRemesasData, headersRemesas);
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
    if (actualRemesaData && JSON.stringify(actualRemesaData) !== '{}') {
        cargarRemesa(actualRemesaData)
        document.getElementById('navNuevaBtn').innerHTML = 'Editar remesa'
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
            // navLinks.forEach(link => {
            //     link.parentElement.classList.remove('pure-menu-selected')
            // });
            // this.parentElement.classList.add('pure-menu-selected')
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

    addSortingAndFilteringToTable(document.getElementById('dataClientesTable'));
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
        if (header.textContent === '') {
            filterRow.appendChild(td);
            return
        }
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
        if (header.textContent === '') {
            return
        }
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
    // addSortingAndFilteringToTable(document.getElementById('dataClientesTable'));
    // addSortingAndFilteringToTable(document.getElementById('dataRemesasTable'));
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
    showToast("Datos grabados correctamente", "success", 5000);
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

    if (!document.getElementById('FicheroID').value) {
        showToast("Es imprescindible indicar el fichero de remesa", "danger", 5000);
        return;
    }

    document.getElementById('contadorRecibosRemesa').value = 1 + parseInt(document.getElementById('contadorRecibosRemesa').value)
    const contador = parseInt(document.getElementById('contadorRecibosRemesa').value)

    insertarRecibo(contador)

    recalcularTotalRecibos()

    showToast("Recibo añadido", "success", 5000);
}

function insertarRecibo(contador, recibo={}) {
    const formRecibo = '' +
    '<p><span id="LabelRecibo' + contador + '" class="labelRecibo">Recibo #' + contador + '</span> <button type="button" class="btnEliminarRecibo" contador="' + contador + '">🗑️</button></p>' +
    '<div class="form-field">' +
    '<label for="Identificador' + contador + '" class="">Cliente</label>' +
    '<input type="text" id="Identificador' + contador + '" name="recibos[' + contador + '][Identificador]" class="pure-u-5-5" value="' + ( recibo.Identificador || '' ) + '" />' +
    '</div>' +
    '<input type="hidden" id="MndtId' + contador + '" name="recibos[' + contador + '][MndtId]" value="' + ( recibo.MndtId || '' ) + '" />' +
    '<input type="hidden" id="DtOfSgntr' + contador + '" name="recibos[' + contador + '][DtOfSgntr]" value="' + ( recibo.DtOfSgntr || '' ) + '" />' +
    '<input type="hidden" id="Nm' + contador + '" name="recibos[' + contador + '][Nm]" value="' + ( recibo.Nm || '' ) + '" />' +
    '<input type="hidden" id="Ctry' + contador + '" name="recibos[' + contador + '][Ctry]" value="' + ( recibo.Ctry || '' ) + '" />' +
    '<input type="hidden" id="AdrLine1_' + contador + '" name="recibos[' + contador + '][AdrLine1_]" value="' + ( recibo.AdrLine1_ || '' ) + '" />' +
    '<input type="hidden" id="AdrLine2_' + contador + '" name="recibos[' + contador + '][AdrLine2_]" value="' + ( recibo.AdrLine2_ || '' ) + '" />' +
    '<input type="hidden" id="IBAN' + contador + '" name="recibos[' + contador + '][IBAN]" value="' + ( recibo.IBAN || '' ) + '" />' +
    '<div class="form-field">' +
    '<label for="Ustrd' + contador + '" class="">Concepto' + '&nbsp;' +
    '<button type="button" class="btnConcepto" concepto="auto" contador="' + contador + '">🚗 <span class="conceptoRemesa">Auto</span></button>' + '&nbsp;' +
    '<button type="button" class="btnConcepto" concepto="hogar" contador="' + contador + '">🏠 <span class="conceptoRemesa">Hogar</span></button>' + '&nbsp;' +
    '<button type="button" class="btnConcepto" concepto="comunidad" contador="' + contador + '">🏢 <span class="conceptoRemesa">Comunidad</span></button>' + '&nbsp;' +
    '<button type="button" class="btnConcepto" concepto="decesos" contador="' + contador + '">⚰️ <span class="conceptoRemesa">Decesos</span></button>' + '&nbsp;' +
    '<button type="button" class="btnConcepto" concepto="salud" contador="' + contador + '">⚕️ <span class="conceptoRemesa">Salud</span></button>' + '&nbsp;' +
    '<button type="button" class="btnConcepto" concepto="generica" contador="' + contador + '">❔ <span class="conceptoRemesa">Genérica</span></button>' + '&nbsp;' +
    '</label>' +
    '<input type="text" id="Ustrd' + contador + '" name="recibos[' + contador + '][Ustrd]" class="pure-u-5-5" value="' + ( recibo.Ustrd || '' ) + '" />' +
    '</div>' +
    '<div class="form-field">' +
    '<label for="InstdAmt' + contador + '" class="">Importe (€)</label>' +
    '<input type="text" id="InstdAmt' + contador + '" name="recibos[' + contador + '][InstdAmt]" value="' + ( recibo.InstdAmt || '' ) + '" class="pure-u-5-5" />' +
    '</div>' +
    ''

    const nuevoRecibo = document.createElement('div')
    nuevoRecibo.classList.add('recibo')
    nuevoRecibo.setAttribute('contador', contador)
    nuevoRecibo.setAttribute('id', 'Recibo' + contador)
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

    var inputInstdAmt = document.getElementById("InstdAmt" + contador)
    inputInstdAmt.addEventListener('blur', (event) => {
        recalcularTotalRecibos()
    })
    inputInstdAmt.addEventListener('change', (event) => {
        recalcularTotalRecibos()
    })
    inputInstdAmt.addEventListener('input', (event) => {
        recalcularTotalRecibos()
    })

    document.querySelectorAll('.btnEliminarRecibo[contador="' + contador + '"]').forEach((element) => {
        var contadorRecibo = parseInt(element.getAttribute('contador')) || 0
        element.addEventListener('click', (event) => {
            eliminarRecibo(contadorRecibo)
        })
    })

    document.querySelectorAll('.btnConcepto[contador="' + contador + '"]').forEach((element) => {
        var concepto = element.getAttribute('concepto') || '';
        var contadorRecibo = parseInt(element.getAttribute('contador')) || 0
        element.addEventListener('click', (event) => {
            rellenarConceptoRemesa(concepto, contadorRecibo)
        })
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

    showToast("Grabando la información de la remesa", "info", 5000)

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
    data.recibos = Object.keys(data.recibos).map(key => data.recibos[key])
    // console.log('data', data)

    showToast("Validando la información de la remesa", "info", 5000)

    // Almacenar remesa actual
    saveData(data, 'actual')

    // Almacenar remesa en la lista de remesas
    if (storedRemesasData === null) {
        storedRemesasData = []
    }
    storedRemesasData.push(data)
    saveData(storedRemesasData, 'remesas')

    // Actualizar tabla
    displayRemesasData(storedRemesasData, headersRemesas);

    // Limpiar remesa actual
    resetearRemesa()

    // Ir al listado
    mostrarSeccion('remesas')

    // Nueva remesa
    document.getElementById('navNuevaBtn').innerHTML = 'Nueva remesa'
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
})

document.getElementById('navNuevaBtn').addEventListener('click', function(e) {
    mostrarSeccion('nueva')
})

document.getElementById('irNuevaRemesaBtn').addEventListener('click', function(e) {
    resetearRemesa()
    document.getElementById('navNuevaBtn').innerHTML = 'Nueva remesa'
    mostrarSeccion('nueva')
})

function eliminarRecibo(contador)
{
    contador = contador || 0
    if (!confirm('¿Está seguro que quiere eliminar el recibo?')) {
        return;
    }
    document.getElementById('Recibo' + contador).remove()
    recalcularTotalRecibos()
    showToast("Recibo eliminado", "success", 5000);
}

function recalcularTotalRecibos()
{
    var total = 0.0
    var numero = 0
    const recibos = document.querySelectorAll('.recibo')
    recibos.forEach((recibo) => {
        const importe = parseFloat(recibo.querySelector('input[name*="[InstdAmt]"]').value || 0.0)
        total += importe
        numero += 1
        recibo.querySelector('span.labelRecibo').textContent = 'Recibo #' + numero
    })
    document.getElementById('CtrlSum').value = total
    document.getElementById('NumRows').value = numero
}

let icon = {
    success:
    '<span class="">✔️</span>',
    danger:
    '<span class="">❌</span>',
    warning:
    '<span class="">⚠️</span>',
    info:
    '<span class="">ℹ️</span>',
};

const showToast = (
    message = "Sample Message",
    toastType = "info",
    duration = 5000) => {
    if (!Object.keys(icon).includes(toastType)) {
        toastType = "info"
    }

    let box = document.createElement("div")
    box.classList.add("toast", `toast-${toastType}`)
    box.innerHTML = ` <div class="toast-content-wrapper">
                      <div class="toast-icon">
                      ${icon[toastType]}
                      </div>
                      <div class="toast-message">${message}</div>
                      <div class="toast-progress"></div>
                      </div>`
    duration = duration || 5000
    box.querySelector(".toast-progress").style.animationDuration = `${duration / 1000}s`

    document.getElementById('toast-overlay').appendChild(box)

    setTimeout(() => {
        box.remove()
    }, duration)
}

function displayRemesasData(data, headers) {
    const container = document.getElementById('dataRemesasContainer');
    container.innerHTML = ''; // Limpiar el contenedor anterior

    if (data.length === 0) {
        container.innerHTML = '<p>No hay datos disponibles.</p>';
        return;
    }

    const table = document.createElement('table');
    table.id = 'dataRemesasTable';
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
    const th = document.createElement('th')
    th.textContent = ''
    headerRow.appendChild(th);
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
        const cell = document.createElement('td');
        const editBtn = document.createElement('button')
        editBtn.classList.add('btnEditRemesa')
        editBtn.setAttribute('remesa', item.FicheroID)
        editBtn.textContent = '📝'
        cell.appendChild(editBtn)
        const downloadBtn = document.createElement('button')
        downloadBtn.classList.add('btnDownloadRemesa')
        downloadBtn.setAttribute('remesa', item.FicheroID)
        downloadBtn.textContent = '💾'
        cell.appendChild(downloadBtn)
        const deleteBtn = document.createElement('button')
        deleteBtn.classList.add('btnDeleteRemesa')
        deleteBtn.setAttribute('remesa', item.FicheroID)
        deleteBtn.textContent = '🗑️'
        cell.appendChild(deleteBtn)
        row.appendChild(cell);

        bodySection.appendChild(row);
    });
    table.appendChild(bodySection);

    container.appendChild(table);

    addSortingAndFilteringToTable(document.getElementById('dataRemesasTable'));

    document.querySelectorAll('.btnEditRemesa').forEach((element) => {
        const remesa = element.getAttribute('remesa')
        element.addEventListener('click', (event) => {
            editarRemesa(remesa)
        })
    })

    document.querySelectorAll('.btnDeleteRemesa').forEach((element) => {
        const remesa = element.getAttribute('remesa')
        element.addEventListener('click', (event) => {
            eliminarRemesa(remesa)
        })
    })

    document.querySelectorAll('.btnDownloadRemesa').forEach((element) => {
        const remesa = element.getAttribute('remesa')
        element.addEventListener('click', (event) => {
            descargarRemesa(remesa)
        })
    })
}

function editarRemesa(remesaFicheroId) {
    actualRemesaData = storedRemesasData.find(remesa => remesa.FicheroID === remesaFicheroId)

    saveData(actualRemesaData, 'actual')

    cargarRemesa(actualRemesaData)

    mostrarSeccion('nueva')

    document.getElementById('navNuevaBtn').innerHTML = 'Editar remesa'
}

function eliminarRemesa(remesaFicheroId) {
    if (!confirm('¿Está seguro que quiere eliminar la remesa?')) {
        return;
    }
    storedRemesasData = storedRemesasData.filter(remesa => remesa.FicheroID !== remesaFicheroId);

    saveData(storedRemesasData, 'remesas')

    displayRemesasData(storedRemesasData, headersRemesas)
}

function cargarRemesa(remesa) {
    document.getElementById('InitgPtyNm').value = remesa.InitgPtyNm || ''
    document.getElementById('InitgPtyId').value = remesa.InitgPtyId || ''
    document.getElementById('CdtrAcct').value = remesa.CdtrAcct || ''
    document.getElementById('CdtrAgtBIC').value = remesa.CdtrAgtBIC || ''
    document.getElementById('MessageID').value = remesa.MessageID || ''
    document.getElementById('CreationDate').value = remesa.CreationDate || ''
    document.getElementById('FicheroIDDate').value = remesa.FicheroIDDate || ''
    document.getElementById('FicheroIDPicker').value = remesa.FicheroIDPicker || ''
    document.getElementById('FicheroID').value = remesa.FicheroID || ''
    document.getElementById('NumRows').value = remesa.NumRows || ''
    document.getElementById('CtrlSum').value = remesa.CtrlSum || ''
    document.getElementById('contadorRecibosRemesa').value = 0
    document.getElementById('recibosRemesaLista').innerHTML = ''
    if (typeof remesa.recibos === 'object' && remesa.recibos.length) {
        document.getElementById('contadorRecibosRemesa').value = remesa.recibos.length
        remesa.recibos.forEach((element, key) => {
            insertarRecibo(1+parseInt(key), element)
        })
    }
}

function resetearRemesa() {
    actualRemesaData = {}
    saveData(actualRemesaData, 'actual')
    cargarRemesa(actualRemesaData)
}

function mostrarSeccion(seccionId) {
    const secciones = document.querySelectorAll('section')
    secciones.forEach(seccion => {
        seccion.style.display = 'none'
    })
    const seccionMostrar = document.getElementById(seccionId)
    if (seccionMostrar) {
        seccionMostrar.style.display = 'block'
    }
}

function descargarRemesa(remesaFicheroId) {
    actualRemesaData = storedRemesasData.find(remesa => remesa.FicheroID === remesaFicheroId)

    let now = new Date();
    let nowString = now.getFullYear()+(now.getMonth()+1).toString(10).padStart(2,"0")+now.getDate().toString(10).padStart(2,"0")+now.getHours().toString(10).padStart(2,"0")+now.getMinutes().toString(10).padStart(2,"0")+now.getSeconds().toString(10).padStart(2,"0")+now.getMilliseconds().toString(10).padStart(3,"0")+"00";

    // Realizar sustituciones (si es necesario)
    xmlContent = content;
	xmlContent = xmlContent.replace(/{MessageId}/g, "PRE" + nowString + actualRemesaData.FicheroID.padStart(13, '0').toUpperCase() );
	xmlContent = xmlContent.replace(/{CreationDate}/g, '');
	xmlContent = xmlContent.replace(/{PmtInfId}/g, '');
	xmlContent = xmlContent.replace(/{SeqDate}/g, '');
	xmlContent = xmlContent.replace(/{InitgPtyNm}/g, actualRemesaData.InitgPtyNm)
	xmlContent = xmlContent.replace(/{InitgPtyId}/g, actualRemesaData.InitgPtyId)
	xmlContent = xmlContent.replace(/{CdtrAcct}/g, actualRemesaData.CdtrAcct)
	xmlContent = xmlContent.replace(/{CdtrAgtBIC}/g, actualRemesaData.CdtrAgtBIC)
	xmlContent = xmlContent.replace(/{CtrlSum}/g, convertirImporte(actualRemesaData.CtrlSum))
	xmlContent = xmlContent.replace(/{NumRows}/g, actualRemesaData.NumRows)
    actualRemesaData.recibos.forEach((recibo, index) => {
        xmlRow = row
        xmlRow = xmlRow.replace(/{InstrId}/g, '');
        xmlRow = xmlRow.replace(/{EndToEndId}/g, '');
        xmlRow = xmlRow.replace(/{InstdAmt}/g, convertirImporte(recibo.InstdAmt));
        xmlRow = xmlRow.replace(/{MndtId}/g, recibo.MndtId);
        xmlRow = xmlRow.replace(/{DtOfSgntr}/g, convertirFecha(recibo.DtOfSgntr));
        xmlRow = xmlRow.replace(/{Nm}/g, recibo.Nm);
        xmlRow = xmlRow.replace(/{Ctry}/g, recibo.Ctry);
        xmlRow = xmlRow.replace(/{AdrLine_1}/g, recibo.AdrLine1_);
        xmlRow = xmlRow.replace(/{AdrLine_2}/g, recibo.AdrLine2_);
        xmlRow = xmlRow.replace(/{IBAN}/g, recibo.IBAN);
        xmlRow = xmlRow.replace(/{Ustrd}/g, recibo.Ustrd);
        xmlContent = xmlContent.replace(/{DrctDbtTxInf}/g, xmlRow + '{DrctDbtTxInf}')
    })
    xmlContent = xmlContent.replace(/{DrctDbtTxInf}/g, '')

    // Crear un Blob con el contenido XML
    const blob = new Blob([xmlContent], { type: 'application/xml' });

    // Crear un enlace de descarga
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = remesaFicheroId + '.xml';

    // Añadir el enlace al DOM y simular un clic
    document.body.appendChild(link);
    link.click();

    // Eliminar el enlace del DOM
    document.body.removeChild(link);
}

function convertirImporte(importeOriginal)
{
    return parseFloat(importeOriginal).toFixed(2)
}

function convertirFecha(formatoOriginal) {
    const partes = formatoOriginal.split('/');
    if (partes.length !== 3) {
        throw new Error('Formato de fecha inválido. Debe ser dd/mm/yyyy');
    }

    const [dia, mes, año] = partes;

    if (dia.length !== 2 || mes.length !== 2 || año.length !== 4) {
        throw new Error('Formato de fecha inválido. Debe ser dd/mm/yyyy');
    }

    const mesConDosDigitos = mes.padStart(2, '0');
    const diaConDosDigitos = dia.padStart(2, '0');

    const formatoNuevo = `${año}-${mesConDosDigitos}-${diaConDosDigitos}`;
    return formatoNuevo;
}

// Toast
// showToast("Article Submitted Successfully", "success", 5000);
// showToast("Do POTD and Earn Coins", "info", 5000);
// showToast("Failed unexpected error", "danger", 5000);
// showToast("!warning! server error", "warning", 5000);
