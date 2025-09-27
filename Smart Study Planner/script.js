/**
 * Smart Study Planner - Main JavaScript File
 * Author: Bolt AI
 * Description: A comprehensive study planning application with task management,
 * calendar view, progress tracking, and local storage persistence.
 */

// Application State
let tasks = [];
let currentEditingTask = null;
let currentDate = new Date();
let currentTheme = localStorage.getItem('studyPlannerTheme') || 'light';

// DOM Elements
const elements = {
    // Navigation
    navTabs: document.querySelectorAll('.nav-tab'),
    tabContents: document.querySelectorAll('.tab-content'),
    
    // Theme
    themeToggle: document.getElementById('themeToggle'),
    
    // Task Form
    taskForm: document.getElementById('taskForm'),
    taskName: document.getElementById('taskName'),
    taskSubject: document.getElementById('taskSubject'),
    taskDueDate: document.getElementById('taskDueDate'),
    taskPriority: document.getElementById('taskPriority'),
    
    // Tasks List
    tasksList: document.getElementById('tasksList'),
    filterPriority: document.getElementById('filterPriority'),
    
    // Calendar
    calendar: document.getElementById('calendar'),
    currentMonth: document.getElementById('currentMonth'),
    prevMonth: document.getElementById('prevMonth'),
    nextMonth: document.getElementById('nextMonth'),
    
    // Progress
    completedTasks: document.getElementById('completedTasks'),
    totalTasks: document.getElementById('totalTasks'),
    completionRate: document.getElementById('completionRate'),
    progressBar: document.getElementById('progressBar'),
    progressText: document.getElementById('progressText'),
    subjectStats: document.getElementById('subjectStats'),
    
    // Modal
    editModal: document.getElementById('editModal'),
    editTaskForm: document.getElementById('editTaskForm'),
    editTaskName: document.getElementById('editTaskName'),
    editTaskSubject: document.getElementById('editTaskSubject'),
    editTaskDueDate: document.getElementById('editTaskDueDate'),
    editTaskPriority: document.getElementById('editTaskPriority'),
    modalClose: document.querySelector('.modal-close'),
    modalCancel: document.querySelector('.modal-cancel'),
    
    // FAB
    fabButton: document.getElementById('fabButton'),
    
    // Notifications
    notifications: document.getElementById('notifications')
};

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

/**
 * Initialize the application
 */
function initializeApp() {
    loadTasks();
    setupEventListeners();
    setupTheme();
    updateProgressStats();
    renderCalendar();
    checkDeadlines();
    
    // Set minimum date for date inputs to today
    const today = new Date().toISOString().slice(0, 16);
    elements.taskDueDate.min = today;
    elements.editTaskDueDate.min = today;
}

/**
 * Setup all event listeners
 */
function setupEventListeners() {
    // Navigation tabs
    elements.navTabs.forEach(tab => {
        tab.addEventListener('click', () => switchTab(tab.dataset.tab));
    });
    
    // Theme toggle
    elements.themeToggle.addEventListener('click', toggleTheme);
    
    // Task form
    elements.taskForm.addEventListener('submit', handleTaskSubmit);
    
    // Filter
    elements.filterPriority.addEventListener('change', filterTasks);
    
    // Calendar navigation
    elements.prevMonth.addEventListener('click', () => navigateMonth(-1));
    elements.nextMonth.addEventListener('click', () => navigateMonth(1));
    
    // Modal events
    elements.editModal.addEventListener('click', (e) => {
        if (e.target === elements.editModal) closeModal();
    });
    elements.modalClose.addEventListener('click', closeModal);
    elements.modalCancel.addEventListener('click', closeModal);
    elements.editTaskForm.addEventListener('submit', handleTaskEdit);
    
    // FAB
    elements.fabButton.addEventListener('click', () => {
        switchTab('tasks');
        elements.taskName.focus();
    });
    
    // Close notifications on click
    elements.notifications.addEventListener('click', (e) => {
        if (e.target.classList.contains('notification-close')) {
            e.target.parentElement.remove();
        }
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
}

/**
 * Handle keyboard shortcuts
 */
function handleKeyboardShortcuts(e) {
    if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
            case '1':
                e.preventDefault();
                switchTab('tasks');
                break;
            case '2':
                e.preventDefault();
                switchTab('calendar');
                break;
            case '3':
                e.preventDefault();
                switchTab('progress');
                break;
            case 'n':
                e.preventDefault();
                switchTab('tasks');
                elements.taskName.focus();
                break;
        }
    }
    
    if (e.key === 'Escape' && elements.editModal.classList.contains('show')) {
        closeModal();
    }
}

/**
 * Switch between tabs
 */
function switchTab(tabName) {
    // Update nav tabs
    elements.navTabs.forEach(tab => {
        tab.classList.toggle('active', tab.dataset.tab === tabName);
    });
    
    // Update tab content
    elements.tabContents.forEach(content => {
        content.classList.toggle('active', content.id === `${tabName}-tab`);
    });
    
    // Refresh content based on tab
    if (tabName === 'calendar') {
        renderCalendar();
    } else if (tabName === 'progress') {
        updateProgressStats();
    }
}

/**
 * Setup and toggle theme
 */
function setupTheme() {
    document.documentElement.setAttribute('data-theme', currentTheme);
    updateThemeIcon();
}

function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);
    localStorage.setItem('studyPlannerTheme', currentTheme);
    updateThemeIcon();
}

function updateThemeIcon() {
    const icon = elements.themeToggle.querySelector('.theme-icon');
    icon.textContent = currentTheme === 'light' ? '🌙' : '☀️';
}

/**
 * Load tasks from localStorage
 */
function loadTasks() {
    const savedTasks = localStorage.getItem('studyPlannerTasks');
    if (savedTasks) {
        tasks = JSON.parse(savedTasks);
        // Convert date strings back to Date objects
        tasks.forEach(task => {
            task.dueDate = new Date(task.dueDate);
            task.createdAt = new Date(task.createdAt);
        });
    }
    renderTasks();
}

/**
 * Save tasks to localStorage
 */
function saveTasks() {
    localStorage.setItem('studyPlannerTasks', JSON.stringify(tasks));
}

/**
 * Generate unique ID for tasks
 */
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Handle task form submission
 */
function handleTaskSubmit(e) {
    e.preventDefault();
    
    const taskData = {
        id: generateId(),
        name: elements.taskName.value.trim(),
        subject: elements.taskSubject.value.trim(),
        dueDate: new Date(elements.taskDueDate.value),
        priority: elements.taskPriority.value,
        completed: false,
        createdAt: new Date()
    };
    
    if (!taskData.name) {
        showNotification('Please enter a task name', 'error');
        return;
    }
    
    tasks.push(taskData);
    saveTasks();
    renderTasks();
    updateProgressStats();
    
    // Reset form
    elements.taskForm.reset();
    
    showNotification('Task added successfully!', 'success');
}

/**
 * Render tasks in the tasks list
 */
function renderTasks() {
    const filterValue = elements.filterPriority.value;
    const filteredTasks = filterValue === 'all' 
        ? tasks 
        : tasks.filter(task => task.priority === filterValue);
    
    if (filteredTasks.length === 0) {
        elements.tasksList.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📝</div>
                <div class="empty-state-text">No tasks found</div>
                <div class="empty-state-subtitle">
                    ${filterValue === 'all' ? 'Add your first task to get started!' : 'No tasks match the current filter.'}
                </div>
            </div>
        `;
        return;
    }
    
    // Sort tasks by due date and priority
    filteredTasks.sort((a, b) => {
        if (a.completed && !b.completed) return 1;
        if (!a.completed && b.completed) return -1;
        if (a.dueDate.getTime() === b.dueDate.getTime()) {
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            return priorityOrder[b.priority] - priorityOrder[a.priority];
        }
        return a.dueDate - b.dueDate;
    });
    
    elements.tasksList.innerHTML = filteredTasks.map(task => {
        const timeUntilDue = getTimeUntilDue(task.dueDate);
        const dueDateClass = getDueDateClass(task.dueDate, task.completed);
        
        return `
            <div class="task-card ${task.completed ? 'completed' : ''}" data-task-id="${task.id}">
                <div class="task-priority-indicator priority-${task.priority}"></div>
                <div class="task-header">
                    <div class="task-content">
                        <div class="task-name">${escapeHtml(task.name)}</div>
                        ${task.subject ? `<div class="task-subject">${escapeHtml(task.subject)}</div>` : ''}
                        <div class="task-due-date ${dueDateClass}">
                            📅 ${formatDate(task.dueDate)} ${timeUntilDue ? `(${timeUntilDue})` : ''}
                        </div>
                    </div>
                    <div class="task-checkbox ${task.completed ? 'completed' : ''}" 
                         onclick="toggleTaskComplete('${task.id}')">
                        ${task.completed ? '✓' : ''}
                    </div>
                </div>
                <div class="task-actions">
                    <button class="btn btn-sm btn-secondary" onclick="editTask('${task.id}')">
                        ✏️ Edit
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteTask('${task.id}')">
                        🗑️ Delete
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

/**
 * Filter tasks based on priority
 */
function filterTasks() {
    renderTasks();
}

/**
 * Toggle task completion status
 */
function toggleTaskComplete(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        task.completed = !task.completed;
        saveTasks();
        renderTasks();
        updateProgressStats();
        
        const message = task.completed ? 'Task completed! 🎉' : 'Task marked as incomplete';
        showNotification(message, task.completed ? 'success' : 'info');
    }
}

/**
 * Edit task
 */
function editTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        currentEditingTask = task;
        
        // Populate edit form
        elements.editTaskName.value = task.name;
        elements.editTaskSubject.value = task.subject || '';
        elements.editTaskDueDate.value = task.dueDate.toISOString().slice(0, 16);
        elements.editTaskPriority.value = task.priority;
        
        // Show modal
        elements.editModal.classList.add('show');
        elements.editTaskName.focus();
    }
}

/**
 * Handle task edit form submission
 */
function handleTaskEdit(e) {
    e.preventDefault();
    
    if (!currentEditingTask) return;
    
    const updatedData = {
        name: elements.editTaskName.value.trim(),
        subject: elements.editTaskSubject.value.trim(),
        dueDate: new Date(elements.editTaskDueDate.value),
        priority: elements.editTaskPriority.value
    };
    
    if (!updatedData.name) {
        showNotification('Please enter a task name', 'error');
        return;
    }
    
    // Update task
    Object.assign(currentEditingTask, updatedData);
    
    saveTasks();
    renderTasks();
    updateProgressStats();
    closeModal();
    
    showNotification('Task updated successfully!', 'success');
}

/**
 * Delete task
 */
function deleteTask(taskId) {
    if (confirm('Are you sure you want to delete this task?')) {
        tasks = tasks.filter(t => t.id !== taskId);
        saveTasks();
        renderTasks();
        updateProgressStats();
        showNotification('Task deleted successfully!', 'success');
    }
}

/**
 * Close modal
 */
function closeModal() {
    elements.editModal.classList.remove('show');
    currentEditingTask = null;
}

/**
 * Render calendar
 */
function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Update month display
    elements.currentMonth.textContent = new Intl.DateTimeFormat('en-US', {
        month: 'long',
        year: 'numeric'
    }).format(currentDate);
    
    // Get first day of month and days in month
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    // Get previous month days to fill in calendar
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    
    let calendarHTML = '';
    
    // Add day headers
    const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    dayHeaders.forEach(day => {
        calendarHTML += `<div class="calendar-day-header" style="background: var(--bg-tertiary); padding: var(--space-sm); text-align: center; font-weight: 600;">${day}</div>`;
    });
    
    let dayCount = 1;
    let nextMonthDayCount = 1;
    
    // Generate 6 weeks (42 days) for calendar grid
    for (let i = 0; i < 42; i++) {
        let dayNumber, isCurrentMonth, dateObj, isToday = false;
        
        if (i < startingDayOfWeek) {
            // Previous month days
            dayNumber = prevMonthLastDay - startingDayOfWeek + i + 1;
            isCurrentMonth = false;
            dateObj = new Date(year, month - 1, dayNumber);
        } else if (dayCount <= daysInMonth) {
            // Current month days
            dayNumber = dayCount;
            isCurrentMonth = true;
            dateObj = new Date(year, month, dayNumber);
            isToday = isDateToday(dateObj);
            dayCount++;
        } else {
            // Next month days
            dayNumber = nextMonthDayCount;
            isCurrentMonth = false;
            dateObj = new Date(year, month + 1, dayNumber);
            nextMonthDayCount++;
        }
        
        // Get tasks for this day
        const dayTasks = getTasksForDate(dateObj);
        
        const dayClass = [
            'calendar-day',
            !isCurrentMonth && 'other-month',
            isToday && 'today'
        ].filter(Boolean).join(' ');
        
        const tasksHTML = dayTasks.slice(0, 3).map(task => {
            return `<div class="calendar-task priority-${task.priority}" title="${escapeHtml(task.name)}">${escapeHtml(task.name)}</div>`;
        }).join('');
        
        const moreTasksHTML = dayTasks.length > 3 ? `<div class="calendar-more">+${dayTasks.length - 3} more</div>` : '';
        
        calendarHTML += `
            <div class="${dayClass}">
                <div class="calendar-day-number">${dayNumber}</div>
                <div class="calendar-tasks">
                    ${tasksHTML}
                    ${moreTasksHTML}
                </div>
            </div>
        `;
    }
    
    elements.calendar.innerHTML = calendarHTML;
}

/**
 * Navigate calendar months
 */
function navigateMonth(direction) {
    currentDate.setMonth(currentDate.getMonth() + direction);
    renderCalendar();
}

/**
 * Get tasks for specific date
 */
function getTasksForDate(date) {
    return tasks.filter(task => {
        const taskDate = new Date(task.dueDate);
        return taskDate.toDateString() === date.toDateString();
    });
}

/**
 * Check if date is today
 */
function isDateToday(date) {
    const today = new Date();
    return date.toDateString() === today.toDateString();
}

/**
 * Update progress statistics
 */
function updateProgressStats() {
    const totalTasksCount = tasks.length;
    const completedTasksCount = tasks.filter(task => task.completed).length;
    const completionPercentage = totalTasksCount > 0 
        ? Math.round((completedTasksCount / totalTasksCount) * 100)
        : 0;
    
    // Update DOM elements
    elements.totalTasks.textContent = totalTasksCount;
    elements.completedTasks.textContent = completedTasksCount;
    elements.completionRate.textContent = `${completionPercentage}%`;
    elements.progressText.textContent = `${completionPercentage}%`;
    
    // Update progress bar
    const progressFill = elements.progressBar.querySelector('.progress-fill');
    progressFill.style.width = `${completionPercentage}%`;
    
    // Update subject breakdown
    updateSubjectBreakdown();
}

/**
 * Update subject breakdown statistics
 */
function updateSubjectBreakdown() {
    const subjectStats = {};
    
    tasks.forEach(task => {
        const subject = task.subject || 'No Subject';
        if (!subjectStats[subject]) {
            subjectStats[subject] = { total: 0, completed: 0 };
        }
        subjectStats[subject].total++;
        if (task.completed) {
            subjectStats[subject].completed++;
        }
    });
    
    const subjectEntries = Object.entries(subjectStats);
    
    if (subjectEntries.length === 0) {
        elements.subjectStats.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-text">No subjects yet</div>
                <div class="empty-state-subtitle">Add tasks to see subject breakdown</div>
            </div>
        `;
        return;
    }
    
    elements.subjectStats.innerHTML = subjectEntries.map(([subject, stats]) => {
        const percentage = Math.round((stats.completed / stats.total) * 100);
        return `
            <div class="subject-stat">
                <div>
                    <div style="font-weight: 600; color: var(--text-primary);">${escapeHtml(subject)}</div>
                    <div style="font-size: var(--font-size-sm); color: var(--text-secondary);">
                        ${stats.completed}/${stats.total} completed
                    </div>
                </div>
                <div style="text-align: right;">
                    <div style="font-weight: 600; color: var(--primary-color);">${percentage}%</div>
                </div>
            </div>
        `;
    }).join('');
}

/**
 * Check for upcoming deadlines and show notifications
 */
function checkDeadlines() {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    
    tasks.forEach(task => {
        if (task.completed) return;
        
        const timeDiff = task.dueDate.getTime() - now.getTime();
        const hoursUntilDue = timeDiff / (1000 * 60 * 60);
        
        // Show notification for tasks due within 24 hours
        if (hoursUntilDue > 0 && hoursUntilDue <= 24) {
            const timeText = hoursUntilDue < 1 
                ? `${Math.round(hoursUntilDue * 60)} minutes`
                : `${Math.round(hoursUntilDue)} hours`;
            
            showNotification(
                `⚠️ Task "${task.name}" is due in ${timeText}!`,
                'warning',
                5000
            );
        }
    });
}

/**
 * Get time until due date
 */
function getTimeUntilDue(dueDate) {
    const now = new Date();
    const diff = dueDate.getTime() - now.getTime();
    
    if (diff < 0) {
        return 'Overdue';
    }
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) {
        return `${days} day${days > 1 ? 's' : ''}`;
    } else if (hours > 0) {
        return `${hours} hour${hours > 1 ? 's' : ''}`;
    } else {
        return 'Due soon';
    }
}

/**
 * Get CSS class for due date styling
 */
function getDueDateClass(dueDate, isCompleted) {
    if (isCompleted) return '';
    
    const now = new Date();
    const diff = dueDate.getTime() - now.getTime();
    const hoursUntilDue = diff / (1000 * 60 * 60);
    
    if (diff < 0) {
        return 'overdue';
    } else if (hoursUntilDue <= 24) {
        return 'due-soon';
    }
    
    return '';
}

/**
 * Format date for display
 */
function formatDate(date) {
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
    }).format(date);
}

/**
 * Show notification
 */
function showNotification(message, type = 'info', duration = 3000) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        ${message}
        <button class="notification-close">&times;</button>
    `;
    
    elements.notifications.appendChild(notification);
    
    // Auto remove after duration
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, duration);
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Run deadline check every 5 minutes
setInterval(checkDeadlines, 5 * 60 * 1000);

// Auto-save tasks when page is about to unload
window.addEventListener('beforeunload', saveTasks);

// Service Worker for offline functionality (optional enhancement)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Service worker registration would go here
        // For now, we're keeping it simple without offline functionality
    });
}