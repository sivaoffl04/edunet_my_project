document.addEventListener('DOMContentLoaded', () => {
    const taskForm = document.getElementById('task-form');
    const newTaskInput = document.getElementById('new-task-input');
    const taskList = document.getElementById('task-list');
    const progressBar = document.querySelector('.progress-bar');
    const progressText = document.querySelector('.progress-text');
    const themeSwitch = document.getElementById('theme-switch');

    let tasks = [];

    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function loadTasks() {
        const storedTasks = localStorage.getItem('tasks');
        if (storedTasks) {
            tasks = JSON.parse(storedTasks);
            renderAllTasks();
            updateProgressBar();
        }
    }

    function addTask(text) {
        const newTask = {
            id: Date.now().toString(),
            text: text,
            completed: false,
            createdAt: new Date().toISOString(),
            completedAt: null
        };
        tasks.push(newTask);
        saveTasks();
        renderSingleTask(newTask, true);
        updateProgressBar();
        newTaskInput.value = '';
    }

    function editTask(id, newText) {
        const taskIndex = tasks.findIndex(task => task.id === id);
        if (taskIndex > -1) {
            tasks[taskIndex].text = newText;
            saveTasks();
            const taskElement = document.querySelector(`.task-item[data-id="${id}"] .task-text`);
            if (taskElement) {
                taskElement.textContent = newText;
            }
        }
    }

    function toggleComplete(id) {
        const taskIndex = tasks.findIndex(task => task.id === id);
        if (taskIndex > -1) {
            tasks[taskIndex].completed = !tasks[taskIndex].completed;
            if (tasks[taskIndex].completed) {
                tasks[taskIndex].completedAt = new Date().toISOString();
            } else {
                tasks[taskIndex].completedAt = null;
            }
            saveTasks();
            const taskElement = document.querySelector(`.task-item[data-id="${id}"]`);
            if (taskElement) {
                taskElement.classList.toggle('completed', tasks[taskIndex].completed);
                taskElement.classList.toggle('pending', !tasks[taskIndex].completed);
                // Re-render the task to update timestamps
                taskElement.parentNode.replaceChild(createTaskElement(tasks[taskIndex]), taskElement);
            }
            updateProgressBar();
        }
    }

    function deleteTask(id) {
        const taskElement = document.querySelector(`.task-item[data-id="${id}"]`);
        if (taskElement) {
            taskElement.classList.add('fade-out');
            taskElement.addEventListener('transitionend', () => {
                tasks = tasks.filter(task => task.id !== id);
                saveTasks();
                taskElement.remove();
                updateProgressBar();
            }, { once: true });
        }
    }

    function formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true
        });
    }

    function createTaskElement(task, animate = false) {
        const taskItem = document.createElement('div');
        taskItem.classList.add('task-item');
        taskItem.classList.add(task.completed ? 'completed' : 'pending');
        taskItem.setAttribute('data-id', task.id);

        if (animate) {
            taskItem.classList.add('fade-in');
        }

        const createdDate = formatDate(task.createdAt);
        const completedDate = task.completed ? formatDate(task.completedAt) : '';

        taskItem.innerHTML = `
            <input type="checkbox" id="task-${task.id}" ${task.completed ? 'checked' : ''}>
            <label for="task-${task.id}" class="task-text" contenteditable="false">${task.text}</label>
            <div class="task-meta">
                <span class="created-date">Added: ${createdDate}</span>
                ${task.completed ? `<span class="completed-date">Finished: ${completedDate}</span>` : ''}
            </div>
            <div class="task-actions">
                <button class="edit-btn" title="Edit Task"><i class="fas fa-edit"></i></button>
                <button class="delete-btn" title="Delete Task"><i class="fas fa-trash-alt"></i></button>
            </div>
        `;

        const checkbox = taskItem.querySelector('input[type="checkbox"]');
        checkbox.addEventListener('change', () => toggleComplete(task.id));

        const taskTextLabel = taskItem.querySelector('.task-text');
        const editButton = taskItem.querySelector('.edit-btn');
        const deleteButton = taskItem.querySelector('.delete-btn');

        editButton.addEventListener('click', () => {
            if (taskTextLabel.contentEditable === 'true') {
                taskTextLabel.contentEditable = 'false';
                taskTextLabel.classList.remove('editing');
                editButton.innerHTML = '<i class="fas fa-edit"></i>';
                editTask(task.id, taskTextLabel.textContent.trim());
            } else {
                taskTextLabel.contentEditable = 'true';
                taskTextLabel.classList.add('editing');
                taskTextLabel.focus();
                const range = document.createRange();
                const sel = window.getSelection();
                range.selectNodeContents(taskTextLabel);
                range.collapse(false);
                sel.removeAllRanges();
                sel.addRange(range);

                editButton.innerHTML = '<i class="fas fa-save"></i>';
            }
        });

        taskTextLabel.addEventListener('blur', () => {
            if (taskTextLabel.contentEditable === 'true') {
                taskTextLabel.contentEditable = 'false';
                taskTextLabel.classList.remove('editing');
                editButton.innerHTML = '<i class="fas fa-edit"></i>';
                editTask(task.id, taskTextLabel.textContent.trim());
            }
        });

        taskTextLabel.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                taskTextLabel.blur();
            }
        });

        deleteButton.addEventListener('click', () => deleteTask(task.id));

        return taskItem;
    }

    function renderAllTasks() {
        tasks.forEach(task => {
            taskList.appendChild(createTaskElement(task));
        });
    }

    function renderSingleTask(task, animate = false) {
        const taskElement = createTaskElement(task, animate);
        taskList.prepend(taskElement);
    }

    function updateProgressBar() {
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(task => task.completed).length;
        const percentage = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

        progressBar.style.width = `${percentage}%`;
        progressText.textContent = `${percentage}% Complete`;
    }

    taskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const taskText = newTaskInput.value.trim();
        if (taskText) {
            addTask(taskText);
        }
    });

    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }

    function loadTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        applyTheme(savedTheme);
        themeSwitch.checked = savedTheme === 'dark';
    }

    themeSwitch.addEventListener('change', () => {
        if (themeSwitch.checked) {
            applyTheme('dark');
        } else {
            applyTheme('light');
        }
    });

    loadTheme();
    loadTasks();
});