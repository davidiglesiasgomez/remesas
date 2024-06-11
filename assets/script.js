const headersClientes = {
    'nombre': 'Nombre',
    'nif': 'NIF',
    'iban': 'IBAN',
    'fecha de inserción': 'Fecha de Inserción'
};

// Esperamos a que el DOM esté cargado
document.addEventListener('DOMContentLoaded', function() {
    // Mostrar los datos almacenados si existen
    const storedClientesData = JSON.parse(localStorage.getItem('clientes'));
    const storedRemesasData = JSON.parse(localStorage.getItem('remesas'));
    const storedEmisorData = JSON.parse(localStorage.getItem('emisor'));
    if (storedClientesData) {
        displayClientesData(storedClientesData, headersClientes);
    }
    if (storedEmisorData) {
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
            const targetId = this.getAttribute('href').substring(1);
            // Ocultar todas las secciones excepto la seleccionada
            sections.forEach(section => {
                if (section.id === targetId) {
                    section.style.display = 'block';
                } else {
                    section.style.display = 'none';
                }
            });
        });
    });
});

// Manejar la subida de archivos
document.getElementById('uploadClientesBtn').addEventListener('click', function() {
    const fileClientesInput = document.getElementById('fileClientesInput');
    const file = fileClientesInput.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const text = e.target.result;
            const data = parseCSV(text, ['nombre', 'iban', 'dato desconocido 1', 'domicilio', 'código postal y localidad', 'provincia', 'código de país', 'dato desconocido2', 'nif', 'fecha de inserción']);
            saveData(data, 'clientes');
            displayClientesData(data, headersClientes);
        };
        reader.readAsText(file);
    }
});

function parseCSV(text, columns) {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line);
    return lines.slice(1).map(line => {
        const values = line.split(';').map(value => value.trim());
        return Object.keys(columns).reduce((object, column, index) => {
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
    const InitgPtyNm = document.getElementById('InitgPtyNm').value
    const InitgPtyId = document.getElementById('InitgPtyId').value
    const CdtrAcct = document.getElementById('CdtrAcct').value
    const CdtrAgtBIC = document.getElementById('CdtrAgtBIC').value
    const data = {
        'InitgPtyNm': InitgPtyNm,
        'InitgPtyId': InitgPtyId,
        'CdtrAcct': CdtrAcct,
        'CdtrAgtBIC': CdtrAgtBIC
    }
    const item = 'emisor'
    saveData(data, item)
});