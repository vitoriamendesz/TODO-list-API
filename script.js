const apiUrl = 'http://localhost:3000/tasks';
let tasks = [];
let filteredTasks = [];
let currentPage = 1;
const tasksPerPage = 3;

document.addEventListener('DOMContentLoaded', fetchTasks);

async function fetchTasks() {
    console.log('Fetching tasks...');
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error('Network response was not ok');
        tasks = await response.json();
        console.log('Tasks fetched:', tasks);
        filteredTasks = tasks;
        displayTasks();
    } catch (error) {
        console.error('Error fetching tasks:', error);
    }
}

function displayTasks() {
    console.log('Displaying tasks...');
    const list = document.getElementById('todo-list');
    if (!list) {
        console.error('todo-list element not found');
        return;
    }
    list.innerHTML = '';

    const start = (currentPage - 1) * tasksPerPage;
    const end = start + tasksPerPage;
    const tasksToDisplay = filteredTasks.slice(start, end);

    tasksToDisplay.forEach(task => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `
            <div>
                <strong>Title:</strong> <input type="text" value="${task.title}" disabled />
            </div>
            <div>
                <strong>Description:</strong> <textarea disabled>${task.description}</textarea>
            </div>
            <button onclick="editTask('${task.id}', this)">Edit</button>
            <button onclick="deleteTask('${task.id}')">Delete</button>
        `;
        list.appendChild(listItem);
    });

    updatePagination();
}

function updatePagination() {
    console.log('Updating pagination...');
    const pageInfo = document.getElementById('page-info');
    if (!pageInfo) {
        console.error('page-info element not found');
        return;
    }
    const totalPages = Math.ceil(filteredTasks.length / tasksPerPage);
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;

    const prevButton = document.getElementById('prev-page');
    const nextButton = document.getElementById('next-page');
    if (prevButton && nextButton) {
        prevButton.disabled = currentPage === 1;
        nextButton.disabled = currentPage === totalPages;
    } else {
        console.error('Pagination buttons not found');
    }
}

function changePage(direction) {
    currentPage += direction;
    displayTasks();
}

async function addTask() {
    console.log('Adding task...');
    const titleInput = document.getElementById('todo-input-title');
    const descriptionInput = document.getElementById('todo-input-description');
    if (!titleInput || !descriptionInput) {
        console.error('Input elements not found');
        return;
    }
    const title = titleInput.value.trim();
    const description = descriptionInput.value.trim();

    if (title && description) {
        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ title, description })
            });

            if (response.ok) {
                console.log('Task added successfully');
                titleInput.value = '';
                descriptionInput.value = '';
                fetchTasks();
            } else {
                console.error('Error adding task:', response.statusText);
            }
        } catch (error) {
            console.error('Error adding task:', error);
        }
    } else {
        console.error('Title and description are required');
    }
}

async function deleteTask(id) {
    console.log('Deleting task with id:', id);
    try {
        const response = await fetch(`${apiUrl}/id/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            console.log('Task deleted successfully');
            fetchTasks();
        } else {
            console.error('Error deleting task:', response.statusText);
        }
    } catch (error) {
        console.error('Error deleting task:', error);
    }
}

async function editTask(id, button) {
    console.log('Editing task with id:', id);
    const listItem = button.parentNode;
    const titleInput = listItem.querySelector('div input[type="text"]');
    const descriptionInput = listItem.querySelector('div textarea');

    if (!titleInput || !descriptionInput) {
        console.error('Title or description input not found');
        return;
    }

    if (titleInput.disabled && descriptionInput.disabled) {
        titleInput.disabled = false;
        descriptionInput.disabled = false;
        button.textContent = 'Save';
        listItem.classList.add('editing');
    } else {
        titleInput.disabled = true;
        descriptionInput.disabled = true;
        button.textContent = 'Edit';
        listItem.classList.remove('editing');
        const title = titleInput.value.trim();
        const description = descriptionInput.value.trim();

        if (title && description) {
            try {
                const response = await fetch(`${apiUrl}/id/${id}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ title, description })
                });

                if (response.ok) {
                    console.log('Task updated successfully');
                    fetchTasks();
                } else {
                    console.error('Error updating task:', response.statusText);
                }
            } catch (error) {
                console.error('Error updating task:', error);
            }
        } else {
            console.error('Title and description are required for updating');
        }
    }
}

function filterTasks() {
    console.log('Filtering tasks...');
    const filterInput = document.getElementById('filter-input');
    if (!filterInput) {
        console.error('filter-input element not found');
        return;
    }
    filteredTasks = tasks.filter(task => task.title.toLowerCase().includes(filterInput.value.toLowerCase()));
    currentPage = 1;
    displayTasks();
}

// Event listeners for pagination buttons
document.getElementById('prev-page')?.addEventListener('click', () => changePage(-1));
document.getElementById('next-page')?.addEventListener('click', () => changePage(1));

// Event listener for filter input
document.getElementById('filter-input')?.addEventListener('input', filterTasks);

// Event listener for adding a task
document.getElementById('add-task-button')?.addEventListener('click', addTask);
