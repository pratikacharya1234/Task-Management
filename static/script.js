// Fetch and display tasks when the page loads
window.onload = async () => {
    try {
        const response = await fetch('http://127.0.0.1:5000/get_tasks');
        if (!response.ok) throw new Error('Failed to fetch tasks');
        const tasks = await response.json();
        updateTaskList(tasks);
    } catch (error) {
        console.error('Error loading tasks:', error);
    }
};

// Handle form submission
document.getElementById('taskForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('taskName').value;
    const date = document.getElementById('taskDate').value;

    try {
        const response = await fetch('http://127.0.0.1:5000/add_task', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ name, date })
        });
        if (!response.ok) throw new Error('Failed to add task');
        const tasks = await response.json();
        updateTaskList(tasks);
        e.target.reset();
    } catch (error) {
        console.error('Error adding task:', error);
    }
});

// Function to update the task list on the page
function updateTaskList(tasks) {
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = ''; 
    tasks.forEach(task => {
        const li = document.createElement('li');
        li.textContent = `${task.name} - Due: ${task.date}`;
        taskList.appendChild(li);
    });
}