/**
 * Task Recommendation Module
 * Handles fetching AI-generated task recommendations based on user input
 */

document.addEventListener('DOMContentLoaded', () => {
    // Get references to DOM elements
    const generateButton = document.getElementById('generateRecommendations');
    const promptInput = document.getElementById('recommendationPrompt');
    const recommendationsContainer = document.getElementById('recommendationsContainer');
    const recommendationsList = document.getElementById('recommendationsList');

    // Add click event listener to the generate button
    generateButton.addEventListener('click', generateRecommendations);

    // Add enter key event listener to the input field
    promptInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            generateRecommendations();
        }
    });

    /**
     * Generates task recommendations based on the user's input prompt
     */
    async function generateRecommendations() {
        const prompt = promptInput.value.trim();
        
        if (!prompt) {
            alert('Please enter a prompt for task recommendations');
            return;
        }

        // Show loading state
        generateButton.disabled = true;
        generateButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Generating...';
          try {
            // Use the Ollama API to generate recommendations
            const response = await fetch('/api/magicAI/taskRecommendations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt }),
            });

            if (!response.ok) {
                throw new Error(`Server responded with status: ${response.status}`);
            }

            let data = await response.json();
            
            // If the response is a string (JSON string), parse it
            if (typeof data === 'string') {
                try {
                    data = JSON.parse(data);
                } catch (e) {
                    // If parsing fails, wrap the text response in our own format
                    data = [{ 
                        name: "AI Generated Suggestions", 
                        description: data 
                    }];
                }
            }

            // Display recommendations
            displayRecommendations(data);
        } catch (error) {
            console.error('Error generating recommendations:', error);
            recommendationsList.innerHTML = `<div class="alert alert-danger">Error: ${error.message}</div>`;
            recommendationsContainer.style.display = 'block';
        } finally {
            // Reset button state
            generateButton.disabled = false;
            generateButton.textContent = 'Generate';
        }
    }

    /**
     * Displays the recommendations in the UI
     * @param {Array} recommendations - Array of task recommendations
     */
    function displayRecommendations(recommendations) {
        // Clear previous recommendations
        recommendationsList.innerHTML = '';
        
        if (Array.isArray(recommendations)) {
            // Create HTML for each recommendation
            recommendations.forEach((task, index) => {
                const taskElement = document.createElement('div');
                taskElement.className = 'card text-bg-dark mb-2';
                
                taskElement.innerHTML = `
                    <div class="card-body">
                        <h5 class="card-title">${task.name || `Task ${index + 1}`}</h5>
                        <p class="card-text">${task.description || 'No description available'}</p>
                        <button class="btn btn-sm btn-success add-task-btn" 
                            data-name="${encodeURIComponent(task.name || `Task ${index + 1}`)}" 
                            data-description="${encodeURIComponent(task.description || '')}"
                            >Add This Task</button>
                    </div>
                `;
                
                recommendationsList.appendChild(taskElement);
            });
            
            // Add event listeners to the "Add This Task" buttons
            document.querySelectorAll('.add-task-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const taskName = decodeURIComponent(this.dataset.name);
                    const taskDescription = decodeURIComponent(this.dataset.description);
                    
                    // Redirect to create task page with prefilled data
                    window.location.href = `/createTask?name=${encodeURIComponent(taskName)}&description=${encodeURIComponent(taskDescription)}`;
                });
            });
        } else {
            // Handle non-array response
            recommendationsList.textContent = typeof recommendations === 'string' 
                ? recommendations 
                : 'Received invalid recommendations format';
        }
        
        // Show the recommendations container
        recommendationsContainer.style.display = 'block';
    }
});
