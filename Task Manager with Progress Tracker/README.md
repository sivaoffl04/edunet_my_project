 # Modern Task Manager with Progress Tracker

 ## Overview

 This is a sleek, responsive web-based Task Manager application designed to help users organize their daily tasks efficiently. It features a clean user interface with light and dark mode options, task persistence using local storage, a progress tracker, and the ability to add, edit, delete, and mark tasks as complete. Each task also tracks its creation and completion timestamps for better management.

 ## Features

 *   **Task Management:**
    *   Add new tasks with a simple input field.
    *   Edit existing task descriptions directly within the list.
    *   Delete tasks with a confirmation animation.
    *   Mark tasks as complete or incomplete using checkboxes.
 *   **Progress Tracking:** A dynamic progress bar visually represents the percentage of completed tasks.
 *   **Persistence:** All tasks are automatically saved to the browser's local storage, so they remain even after closing and reopening the browser.
 *   **Theming:** Toggle between a light and dark mode for a personalized viewing experience.
 *   **Timestamps:** Each task displays its creation date and time, and its completion date and time once marked as finished.
 *   **Responsive Design:** The application is fully responsive and works well on various screen sizes, from desktops to mobile devices.
 *   **Animations:** Smooth animations for adding and deleting tasks enhance the user experience.

 ## Technologies Used

 *   **HTML5:** For the structure and content of the web page.
 *   **CSS3:** For styling, including responsive design, animations, and theming (using CSS variables).
 *   **JavaScript (ES6+):** For all interactive functionalities, task logic, local storage management, and DOM manipulation.
 *   **Font Awesome:** For icons (edit, delete, sun, moon).

 ## Installation

 To get a local copy up and running, follow these simple steps:

 1.  **Clone the repository:**
     ```bash
     git clone https://github.com/sivaoffl04/edunet_my_project.git
     ```
 2.  **Navigate to the project directory:**
     ```bash
     cd edunet_my_project/"Task Manager with Progress Tracker"
     ```
 3.  **Open `index.html`:** Simply open the `index.html` file in your preferred web browser. No server setup is required as it's a purely client-side application.

 ## Usage

 1.  **Add a Task:** Type your task into the input field at the top and click the "Add Task" button or press `Enter`.
 2.  **Mark as Complete:** Click the checkbox next to a task to toggle its completion status. The progress bar will update accordingly.
 3.  **Edit a Task:** Click the pencil icon next to a task. The task text will become editable. Type your changes and click the save icon (which replaces the pencil) or press `Enter` to save. Clicking outside the text field will also save.
 4.  **Delete a Task:** Click the trash can icon next to a task to remove it from the list.
 5.  **Toggle Theme:** Use the switch in the header to change between light and dark mode. Your theme preference will be saved.
 6.  **View Timestamps:** Below each task, you'll see when it was "Added" and, if completed, when it was "Finished".

 ## Future Enhancements

 *   **Task Filtering:** Add options to filter tasks by "All", "Active", and "Completed".
 *   **Due Dates:** Implement functionality to assign due dates to tasks and potentially sort them.
 *   **Categories/Tags:** Allow users to categorize tasks for better organization.
 *   **Drag-and-Drop Reordering:** Enable reordering tasks within the list.

 ## License

 This project is licensed under the MIT License.

 ## Acknowledgments

 *   Font Awesome for the icons.
 *   Google Fonts (Inter) for the typography.