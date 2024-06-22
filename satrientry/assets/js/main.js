// Initialize field and data arrays
let fields = [];
let data = [];

// spinner
setInterval(
    function spinner() {
        let spinner = document.getElementById('spinner');
        let content = document.getElementById('content');
        let wrapper = document.getElementById('wrapper');
        spinner.style.display = 'none';
        content.style.display = 'block';
        wrapper.style.height = '0vh';
    }, 1500
);

document.addEventListener("DOMContentLoaded", function() {
    // Get current page URL path
    const currentPath = window.location.pathname;

    // Select all navigation links
    const navLinks = document.querySelectorAll(".navbar-nav .nav-link");

    // Loop through each nav link
    navLinks.forEach(link => {
        // Check if the link's href ends with the current path
        if (currentPath.endsWith(link.getAttribute("href"))) {
            link.classList.add("active"); // Add 'active' class to the matched link
        }
    });
});



// Load data from localStorage on page load
document.addEventListener('DOMContentLoaded', function () {
    let savedFields = localStorage.getItem('fields');
    if (savedFields) {
        fields = JSON.parse(savedFields);
        updateDynamicFields();
        renderTableHeaders();
    }

    let savedData = localStorage.getItem('data');
    if (savedData) {
        data = JSON.parse(savedData);
        renderTable();
    }
});

// Consolidated success message function
function showSuccessMessage(messageType, message) {
    let successMessage = document.getElementById(`${messageType}-success-message`);
    successMessage.innerText = message;
    successMessage.style.display = 'block';
    setTimeout(() => {
        successMessage.style.display = 'none';
    }, 2000);
}

// Toggle the dropdown menu for field type
function toggleDropdown() {
    document.getElementById('dropdown-menu').classList.toggle('show');
}

// Select a dropdown option
function selectOption(element) {
    document.getElementById('dropdown-input').value = element.innerText;
    document.getElementById('dropdown-menu').classList.remove('show');
}

// Live filter dropdown options based on input
function liveFilterOptions() {
    let input = document.getElementById('dropdown-input').value.toLowerCase();
    let options = document.getElementsByClassName('dropdown-item');
    for (let option of options) {
        if (option.innerText.toLowerCase().includes(input)) {
            option.style.display = '';
        } else {
            option.style.display = 'none';
        }
    }
}

// Add a new field
function addField(event) {
    event.preventDefault();
    let fieldName = document.getElementById('field-name').value.trim();
    let fieldType = document.getElementById('dropdown-input').value;

    // Validate field name and type
    if (!fieldName || !fieldType) {
        document.getElementById('field-error').innerText = 'Field name and type are required.';
        return;
    }

    // Check for duplicate field names
    if (fields.some(field => field.name === fieldName)) {
        document.getElementById('field-error').innerText = 'Field name already exists.';
        return;
    }

    // Clear any existing error messages
    document.getElementById('field-error').innerText = '';

    fields.push({ name: fieldName, type: fieldType });
    updateDynamicFields();
    document.getElementById('field-name').value = '';
    document.getElementById('dropdown-input').value = '';

    // Save fields to localStorage
    localStorage.setItem('fields', JSON.stringify(fields));

    showSuccessMessage('field', 'Field added successfully.');
}

// Update dynamic fields in the data form
function updateDynamicFields() {
    let dynamicFields = document.getElementById('dynamic-fields');
    dynamicFields.innerHTML = '';

    fields.forEach((field, index) => {
        let input;
        if (field.type === 'Text') {
            input = `<input type="text" name="${field.name}" placeholder="${field.name}" class="form-control mb-2">`;
        } else if (field.type === 'Number') {
            input = `<input type="number" name="${field.name}" placeholder="${field.name}" class="form-control mb-2">`;
        } else if (field.type === 'Email') {
            input = `<input type="email" name="${field.name}" placeholder="${field.name}" class="form-control mb-2">`;
        } else if (field.type === 'Phone') {
            input = `<input type="tel" name="${field.name}" placeholder="${field.name}" class="form-control mb-2">`;
        }
        dynamicFields.innerHTML += `
            <div class="input-group mb-2">
                ${input}
                <div class="input-group-append">
                    <button class="btn custom-btn btn-sm text-light ms-2" onclick="confirmDeleteField(${index})">&#10060;</button>
                </div>
            </div>`;
    });

    renderTableHeaders();
}

// Add data to the table
function addData(event) {
    event.preventDefault();

    // Check if there are any fields defined
    if (fields.length === 0) {
        document.getElementById('error-message').innerText = 'Add field firstly.';
        return;
    }

    let formData = new FormData(document.getElementById('data-form'));

    let newData = {};
    for (let field of fields) {
        let value = formData.get(field.name);
        if (!value) {
            document.getElementById('error-message').innerText = `Please fill out the ${field.name} field.`;
            return;
        }

        // Additional validation for email and phone fields
        if (field.type === 'Email') {
            if (!validateEmail(value)) {
                document.getElementById('error-message').innerText = 'Please enter a valid email address.';
                return;
            }
        }

        if (field.type === 'Phone') {
            if (!validatePhone(value)) {
                document.getElementById('error-message').innerText = 'Please enter a valid phone number.';
                return;
            }
        }

        newData[field.name] = value;
    }

    // Clear any existing error messages
    document.getElementById('error-message').innerText = '';

    // Add newData to data array
    data.push(newData);
    renderTable();
    clearForm();

    // Save data to localStorage
    localStorage.setItem('data', JSON.stringify(data));

    showSuccessMessage('add', 'Data added successfully.');
}

// Clear the form data
function clearForm() {
    document.getElementById('data-form').reset();
}


// Update table headers
function renderTableHeaders() {
    const tableHead = document.querySelector('#data-table thead tr');
    tableHead.innerHTML = '';

    // Add S.N. column header
    const snTh = document.createElement('th');
    snTh.innerText = 'S.N.';
    tableHead.appendChild(snTh);

    // Add headers for fields
    fields.forEach(field => {
        const th = document.createElement('th');
        th.innerText = field.name;
        tableHead.appendChild(th);
    });

    // Add Actions column header
    const actionsTh = document.createElement('th');
    actionsTh.innerText = 'Actions';
    tableHead.appendChild(actionsTh);
}

// Render the table
function renderTable() {
    const tableBody = document.querySelector('#data-table tbody');
    tableBody.innerHTML = '';

    data.forEach((item, index) => {
        const row = document.createElement('tr');

        // Add S.N. column
        const snTd = document.createElement('td');
        snTd.innerText = index + 1;
        row.appendChild(snTd);

        // Add data columns for each field
        fields.forEach(field => {
            const td = document.createElement('td');
            td.innerText = item[field.name];
            row.appendChild(td);
        });

        // Add Actions column
        const actionsTd = document.createElement('td');
        actionsTd.innerHTML = `
            <button class="btn custom-btn btn-sm text-dark" onclick="editData(${index})">&#9998;</button>
            <button class="btn custom-btn btn-sm text-light" onclick="confirmDeleteData(${index})">&#10060;</button>
        `;
        row.appendChild(actionsTd);

        tableBody.appendChild(row);
    });
}

// filter
function filterTable() {
    let input = document.getElementById('search-input').value.toLowerCase();
    let filteredData = data.filter(item => {
        return fields.some(field => {
            return item[field.name].toLowerCase().includes(input);
        });
    });
    renderFilteredTable(filteredData);
}

function renderFilteredTable(filteredData) {
    const tableBody = document.querySelector('#data-table tbody');
    tableBody.innerHTML = '';

    filteredData.forEach((item, index) => {
        const row = document.createElement('tr');

        // Add S.N. column
        const snTd = document.createElement('td');
        snTd.innerText = index + 1;
        row.appendChild(snTd);

        // Add data columns for each field
        fields.forEach(field => {
            const td = document.createElement('td');
            td.innerText = item[field.name];
            row.appendChild(td);
        });

        // Add Actions column
        const actionsTd = document.createElement('td');
        actionsTd.innerHTML = `
            <button class="btn custom-btn btn-sm text-dark" onclick="editData(${index})">&#9998;</button>
            <button class="btn custom-btn btn-sm text-light" onclick="confirmDeleteData(${index})">&#10060;</button>
        `;
        row.appendChild(actionsTd);

        tableBody.appendChild(row);
    });
}

function sortTable(fieldName, order) {
    let sortedData = [...data];

    sortedData.sort((a, b) => {
        let aValue = a[fieldName];
        let bValue = b[fieldName];

        if (order === 'asc') {
            if (typeof aValue === 'string') {
                return aValue.localeCompare(bValue);
            } else {
                return aValue - bValue;
            }
        } else if (order === 'desc') {
            if (typeof aValue === 'string') {
                return bValue.localeCompare(aValue);
            } else {
                return bValue - aValue;
            }
        }
    });

    renderFilteredTable(sortedData);
}

// live search
function liveSearch() {
    let input = document.getElementById('search-input').value.trim().toLowerCase();
    
    // Filter data based on input
    let filteredData = data.filter(item => {
        return fields.some(field => {
            return item[field.name].toString().toLowerCase().includes(input);
        });
    });

    // Render filtered table
    renderFilteredTable(filteredData);
}
// Event listener for live search on input change
document.getElementById('search-input').addEventListener('input', liveSearch);


// Edit data
function editData(index) {
    let editForm = document.getElementById('edit-form');
    let editDynamicFields = document.getElementById('edit-dynamic-fields');
    editDynamicFields.innerHTML = '';

    fields.forEach(field => {
        let input;
        if (field.type === 'Text') {
            input = `<input type="text" name="${field.name}" value="${data[index][field.name]}" class="form-control mb-2">`;
        } else if (field.type === 'Number') {
            input = `<input type="number" name="${field.name}" value="${data[index][field.name]}" class="form-control mb-2">`;
        } else if (field.type === 'Email') {
            input = `<input type="email" name="${field.name}" value="${data[index][field.name]}" class="form-control mb-2">`;
        } else if (field.type === 'Phone') {
            input = `<input type="tel" name="${field.name}" value="${data[index][field.name]}" class="form-control mb-2">`;
        }
        editDynamicFields.innerHTML += input;
    });

    editForm.dataset.index = index;
    document.getElementById('edit-dialog').style.display = 'block';
}

// Save edited data
function saveEdit(event) {
    event.preventDefault();
    let formData = new FormData(document.getElementById('edit-form'));
    let updatedData = {};

    for (let field of fields) {
        let value = formData.get(field.name);
        if (!value) {
            document.getElementById('edit-error-message').innerText = `Please fill out the ${field.name} field.`;
            return;
        }

        // Additional validation for email and phone fields

        if (field.type === 'Email') {
            if (!validateEmail(value)) {
                document.getElementById('error-message').innerText = 'Please enter a valid email address.';
                return;
            }
        }

        if (field.type === 'Phone') {
            if (!validatePhone(value)) {
                document.getElementById('error-message').innerText = 'Please enter a valid phone number.';
                return;
            }
        }

        updatedData[field.name] = value;
    }

    let index = document.getElementById('edit-form').dataset.index;
    data[index] = updatedData;
    renderTable();
    closeDialog();
    showSuccessMessage('edit', 'Data edited successfully.');

    // Save data to localStorage
    localStorage.setItem('data', JSON.stringify(data));
}

// Confirm delete data
function confirmDeleteData(index) {
    document.getElementById('confirm-modal').style.display = 'block';
    document.getElementById('confirm-modal').dataset.index = index;
}

// Delete data row
function deleteRow() {
    let index = document.getElementById('confirm-modal').dataset.index;
    data.splice(index, 1);
    renderTable();
    closeConfirmModal();
    showSuccessMessage('delete', 'Data deleted successfully.');

    // Save data to localStorage
    localStorage.setItem('data', JSON.stringify(data));
}

// Confirm delete field
function confirmDeleteField(index) {
    document.getElementById('confirm-field-modal').style.display = 'block';
    document.getElementById('confirm-field-modal').dataset.index = index;
}

// Delete field
function deleteField() {
    let index = document.getElementById('confirm-field-modal').dataset.index;
    fields.splice(index, 1);
    updateDynamicFields();
    renderTableHeaders();
    closeConfirmFieldModal();
    showSuccessMessage('fieldDelete', 'Field deleted successfully.');

    // Save fields to localStorage
    localStorage.setItem('fields', JSON.stringify(fields));
}

// Close the edit dialog
function closeDialog() {
    document.getElementById('edit-dialog').style.display = 'none';
}

// Close the confirm modal
function closeConfirmModal() {
    document.getElementById('confirm-modal').style.display = 'none';
}

// Close the confirm field modal
function closeConfirmFieldModal() {
    document.getElementById('confirm-field-modal').style.display = 'none';
}

// Export data to Excel
function exportToExcel() {
    let wb = XLSX.utils.book_new();
    let ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, 'Data');
    XLSX.writeFile(wb, 'data.xlsx');
}

// Export data to PDF
function exportToCSV() {
    // Prepare CSV content
    let csvContent = "data:text/csv;charset=utf-8,";

    // Add headers to CSV
    let headers = fields.map(field => field.name);
    csvContent += headers.join(",") + "\n";

    // Add rows of data to CSV
    data.forEach(item => {
        let row = headers.map(header => item[header] || '');
        csvContent += row.join(",") + "\n";
    });

    // Create CSV file and initiate download
    let encodedUri = encodeURI(csvContent);
    let downloadLink = document.createElement("a");
    downloadLink.setAttribute("href", encodedUri);
    downloadLink.setAttribute("download", "data.csv");
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
}




// Function to open modal
function openModal() {
    document.getElementById('projectTitleModal').style.display = 'block';
}

// Function to close modal
function closeModal() {
    document.getElementById('projectTitleModal').style.display = 'none';
}

// Function to print table with project title from modal input
function printWithProjectTitle() {
    // Get project title from modal input
    let projectTitle = document.getElementById('projectTitleInput').value.trim();

    if (!projectTitle) {
        alert("Please enter a project title.");
        return;
    }

    // Change header text for printing
    let originalHeaderText = document.querySelector('#data-table thead th:last-child').innerText;
    document.querySelector('#data-table thead th:last-child').innerText = 'Remarks';

    let printWindow = window.open('', '', 'width=800,height=600');
    printWindow.document.write('<html><head><title>Print Table</title>');
    printWindow.document.write('<style>table { width: 100%; border-collapse: collapse; } th, td { border: 1px solid black; padding: 8px; }</style>');
    printWindow.document.write('</head><body>');

    // Add project title to the printed page
    printWindow.document.write(`<h3>${projectTitle}</h3>`);

    printWindow.document.write('<table>');
    printWindow.document.write('<thead><tr>');

    // Add Serial Number column header
    printWindow.document.write('<th>S.N.</th>');

    // Add headers for each field
    fields.forEach(field => {
        printWindow.document.write(`<th>${field.name}</th>`);
    });
    printWindow.document.write('<th>Remarks</th>');
    printWindow.document.write('</tr></thead>');

    printWindow.document.write('<tbody>');

    // Add rows with data and serial numbers
    data.forEach((item, index) => {
        printWindow.document.write('<tr>');
        // Serial number column
        printWindow.document.write(`<td>${index + 1}</td>`);

        // Data columns
        fields.forEach(field => {
            printWindow.document.write(`<td>${item[field.name]}</td>`);
        });
        printWindow.document.write('<td></td>'); // Placeholder for Remarks column
        printWindow.document.write('</tr>');
    });

    printWindow.document.write('</tbody>');

    printWindow.document.write('</table>');
    printWindow.document.write('</body></html>');

    printWindow.document.close();
    printWindow.print();

    // Restore original header text after printing
    document.querySelector('#data-table thead th:last-child').innerText = originalHeaderText;

    // Close the modal after printing
    closeModal();
}


// Email validation function
function validateEmail(email) {
    // Regular expression for basic email validation
    let re = /\S+@\S+\.\S+/;
    return re.test(email);
}

// Phone number validation function
function validatePhone(phone) {
    // Regular expression for basic phone number validation (digits only, 10 digits)
    let re = /^\d{10}$/;
    return re.test(phone);
}

// Reset data and fields
function resetData() {
    localStorage.removeItem('data');
    localStorage.removeItem('fields');
    data = [];
    fields = [];
    renderTable();
    updateDynamicFields();
    showSuccessMessage('reset', 'All data and fields have been reset.');
}

// Render form fields dynamically
function renderFormFields() {
    const dynamicFields = document.getElementById('dynamic-fields');
    dynamicFields.innerHTML = '';

    fields.forEach(field => {
        let input;
        if (field.type === 'Text') {
            input = `<input type="text" name="${field.name}" placeholder="${field.name}" class="form-control mb-2">`;
        } else if (field.type === 'Number') {
            input = `<input type="number" name="${field.name}" placeholder="${field.name}" class="form-control mb-2">`;
        } else if (field.type === 'Email') {
            input = `<input type="email" name="${field.name}" placeholder="${field.name}" class="form-control mb-2">`;
        } else if (field.type === 'Phone') {
            input = `<input type="tel" name="${field.name}" placeholder="${field.name}" class="form-control mb-2">`;
        }
        dynamicFields.innerHTML += input;
    });
}

// Close the success message after 2 seconds
function closeSuccessMessage() {
    document.getElementById('success-message').style.display = 'none';
}

// Close the error message after 2 seconds
function closeErrorMessage() {
    document.getElementById('error-message').style.display = 'none';
}

// Event listeners
document.getElementById('add-field-form').addEventListener('submit', addField);
document.getElementById('data-form').addEventListener('submit', addData);
document.getElementById('edit-form').addEventListener('submit', saveEdit);
document.getElementById('edit-cancel').addEventListener('click', closeDialog);
document.getElementById('confirm-delete').addEventListener('click', deleteRow);
document.getElementById('confirm-cancel').addEventListener('click', closeConfirmModal);
document.getElementById('confirm-field-delete').addEventListener('click', deleteField);
document.getElementById('confirm-field-cancel').addEventListener('click', closeConfirmFieldModal);
document.getElementById('search-input').addEventListener('input', liveSearch);
document.getElementById('sort-dropdown').addEventListener('change', function () {
    let fieldName = this.value.split('-')[0];
    let order = this.value.split('-')[1];
    sortTable(fieldName, order);
});

document.getElementById('export-excel').addEventListener('click', exportToExcel);
document.getElementById('export-csv').addEventListener('click', exportToCSV);
document.getElementById('print-table').addEventListener('click', printTable);
document.getElementById('reset-data').addEventListener('click', resetData);
document.getElementById('dropdown-input').addEventListener('input', liveFilterOptions);

// Initialize data form dynamically
renderFormFields();

// Function to handle clicks outside dropdown menu
window.onclick = function (event) {
    if (!event.target.matches('.dropdown-button')) {
        let dropdowns = document.getElementsByClassName('dropdown-content');
        for (let i = 0; i < dropdowns.length; i++) {
            let openDropdown = dropdowns[i];
            if (openDropdown.classList.contains('show')) {
                openDropdown.classList.remove('show');
            }
        }
    }
}

// Function to show the dropdown menu
function toggleDropdown() {
    document.getElementById('dropdown-menu').classList.toggle('show');
}

// Function to select an option from dropdown
function selectOption(element) {
    document.getElementById('dropdown-input').value = element.innerText;
    document.getElementById('dropdown-menu').classList.remove('show');
}

// Function to filter dropdown options based on input
function liveFilterOptions() {
    let input = document.getElementById('dropdown-input').value.toLowerCase();
    let options = document.getElementsByClassName('dropdown-item');
    for (let option of options) {
        if (option.innerText.toLowerCase().includes(input)) {
            option.style.display = '';
        } else {
            option.style.display = 'none';
        }
    }
}

