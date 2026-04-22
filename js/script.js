// State Management
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

// DOM Elements
const taskBody = document.getElementById('task-body');
const addTaskBtn = document.getElementById('add-task-btn');
const downloadPdfBtn = document.getElementById('download-pdf');

// Inputs for new task
const newNameInput = document.getElementById('new-task-name');
const newDescInput = document.getElementById('new-task-desc');
const newDateInput = document.getElementById('new-task-date');
const newPriorityInput = document.getElementById('new-task-priority');

// Initialize
function init() {
    renderTasks();
    
    // Event Listeners
    addTaskBtn.addEventListener('click', addTask);
    downloadPdfBtn.addEventListener('click', downloadPDF);
    
    // Add task on Enter in any of the new task inputs
    [newNameInput, newDescInput, newDateInput, newPriorityInput].forEach(input => {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') addTask();
        });
    });
}

function saveToLocalStorage() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function renderTasks() {
    taskBody.innerHTML = '';
    
    tasks.forEach((task, index) => {
        const tr = document.createElement('tr');
        if (task.completed) tr.classList.add('task-done');
        
        tr.innerHTML = `
            <td style="text-align: center;">
                <input type="checkbox" ${task.completed ? 'checked' : ''} data-index="${index}" class="task-checkbox">
            </td>
            <td>
                <input type="text" value="${task.name}" data-field="name" data-index="${index}" class="edit-input">
            </td>
            <td>
                <input type="text" value="${task.description}" data-field="description" data-index="${index}" class="edit-input">
            </td>
            <td>
                <input type="date" value="${task.dueDate}" data-field="dueDate" data-index="${index}" class="edit-input">
            </td>
            <td>
                <select data-field="priority" data-index="${index}" class="edit-input">
                    <option value="Low" ${task.priority === 'Low' ? 'selected' : ''}>Low</option>
                    <option value="Medium" ${task.priority === 'Medium' ? 'selected' : ''}>Medium</option>
                    <option value="High" ${task.priority === 'High' ? 'selected' : ''}>High</option>
                </select>
            </td>
            <td>
                <button class="btn btn-danger delete-btn" data-index="${index}">Delete</button>
            </td>
        `;
        
        taskBody.appendChild(tr);
    });

    // Attach listeners to newly created elements
    document.querySelectorAll('.task-checkbox').forEach(cb => {
        cb.addEventListener('change', toggleTask);
    });
    
    document.querySelectorAll('.edit-input').forEach(input => {
        input.addEventListener('change', updateTask);
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', deleteTask);
    });
}

function addTask() {
    const name = newNameInput.value.trim();
    if (!name) return; // Basic validation

    const newTask = {
        name: name,
        description: newDescInput.value.trim(),
        dueDate: newDateInput.value,
        priority: newPriorityInput.value,
        completed: false
    };

    tasks.push(newTask);
    saveToLocalStorage();
    renderTasks();

    // Reset inputs
    newNameInput.value = '';
    newDescInput.value = '';
    newDateInput.value = '';
    newPriorityInput.value = 'Low';
    newNameInput.focus();
}

function updateTask(e) {
    const index = e.target.dataset.index;
    const field = e.target.dataset.field;
    tasks[index][field] = e.target.value;
    saveToLocalStorage();
    
    // If name changes, we might want to re-render to handle potential sorting or UI updates, 
    // but for true Excel feel, we just keep the focus.
    if (field === 'name' || field === 'completed') renderTasks();
}

function toggleTask(e) {
    const index = e.target.dataset.index;
    tasks[index].completed = e.target.checked;
    saveToLocalStorage();
    renderTasks();
}

function deleteTask(e) {
    const index = e.target.dataset.index;
    tasks.splice(index, 1);
    saveToLocalStorage();
    renderTasks();
}

function downloadPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Add Title
    doc.setFontSize(18);
    doc.text('TaskGrid - Task Report', 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);

    // Prepare Table Data
    const tableColumn = ["Status", "Task Name", "Description", "Due Date", "Priority"];
    const tableRows = [];

    tasks.forEach(task => {
        const taskData = [
            task.completed ? "Done" : "Pending",
            task.name,
            task.description,
            task.dueDate || "N/A",
            task.priority
        ];
        tableRows.push(taskData);
    });

    // Generate Table
    doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 35,
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246] }, // Accent color
        styles: { fontSize: 9 }
    });

    doc.save(`tasks_${new Date().getTime()}.pdf`);
}

// Start the app
init();
