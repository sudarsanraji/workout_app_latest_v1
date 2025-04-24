document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
	
	console.log("Available Kettlebell Exercises:", EXERCISES.kettlebell);
    console.log("Available Bodyweight Exercises:", EXERCISES.bodyweight);
    console.log("Available Stretch Exercises:", EXERCISES.stretch);

    const startWorkoutBtn = document.getElementById('start-workout');
    const resetSelectionBtn = document.getElementById('reset-selection');
    const pauseTimerBtn = document.getElementById('pause-timer');
    const resumeTimerBtn = document.getElementById('resume-timer');
    const stopTimerBtn = document.getElementById('stop-timer');
    const timerDisplay = document.getElementById('timer');
    const currentExerciseDisplay = document.getElementById('current-exercise');
    const setInfoDisplay = document.getElementById('set-info');
    const progressBar = document.getElementById('progress-bar');
    const selectedList = document.getElementById('selected-list');
    const exerciseImage = document.getElementById('exercise-image');

    // Audio elements
    const startSound = document.getElementById('start-sound');
    const processSound = document.getElementById('process-sound');
    const restSound = document.getElementById('rest-sound');
    const stopSound = document.getElementById('stop-sound');
    
    // Timer variables
    let timer;
    let timeLeft = 0;
    let totalTime = 0;
    let isPaused = false;
    let currentSet = 0;
    let totalSets = 0;
    let currentExerciseIndex = 0;
    let selectedExercises = [];
    let isRestPeriod = false;
    let isSetRestPeriod = false;
    
    // Exercise settings
    let exerciseDuration = 30;
    let exerciseRest = 15;
    let setRest = 60;
    
    // Initialize the app
    init();
    
    function init() {
        // Load saved settings if any
        loadSettings();
        
        // Update selected exercises list
        updateSelectedExercisesList();
        
        // Event listeners
        document.querySelectorAll('.exercise-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', updateSelectedExercisesList);
        });
        
        startWorkoutBtn.addEventListener('click', startWorkout);
        resetSelectionBtn.addEventListener('click', resetSelection);
        pauseTimerBtn.addEventListener('click', pauseTimer);
        resumeTimerBtn.addEventListener('click', resumeTimer);
        stopTimerBtn.addEventListener('click', stopTimer);
        
        // Settings inputs
        document.getElementById('exercise-duration').addEventListener('change', updateSettings);
        document.getElementById('exercise-rest').addEventListener('change', updateSettings);
        document.getElementById('set-rest').addEventListener('change', updateSettings);
        document.getElementById('num-sets').addEventListener('change', updateSettings);
        
        // Initialize tabs - show first tab by default
        document.querySelector('.tab-button').classList.add('active');
        document.querySelector('.tab-content').style.display = 'block';
        
        // Add tab click handlers
        document.querySelectorAll('.tab-button').forEach(button => {
            button.addEventListener('click', function() {
                const tabName = this.getAttribute('onclick').match(/'(.*?)'/)[1];
                openTab(tabName, this);
            });
        });
    }
    
    function loadSettings() {
        exerciseDuration = parseInt(document.getElementById('exercise-duration').value) || 30;
        exerciseRest = parseInt(document.getElementById('exercise-rest').value) || 15;
        setRest = parseInt(document.getElementById('set-rest').value) || 60;
        totalSets = parseInt(document.getElementById('num-sets').value) || 3;
    }
    
    function updateSettings() {
        loadSettings();
    }
    
    function updateSelectedExercisesList() {
        selectedExercises = [];
        document.querySelectorAll('.exercise-checkbox:checked').forEach(checkbox => {
            selectedExercises.push(checkbox.value);
        });
        
        selectedList.innerHTML = '';
        if (selectedExercises.length === 0) {
            selectedList.innerHTML = '<p>No exercises selected</p>';
        } else {
            selectedExercises.forEach(exercise => {
                const item = document.createElement('div');
                item.className = 'selected-exercise-item';
                item.textContent = exercise;
                selectedList.appendChild(item);
            });
        }
    }
    
    function resetSelection() {
        document.querySelectorAll('.exercise-checkbox').forEach(checkbox => {
            checkbox.checked = false;
        });
        updateSelectedExercisesList();
    }
	
	async function verifyImageExists(exercise, category) {
    const cleanName = exercise.toLowerCase().replace(/ /g, '_');
    const response = await fetch(`/check_image/${category}/${cleanName}`);
    return response.json();
}
	
async function displayExerciseImage(exercise) {
    const imgElement = document.getElementById('exercise-image');
    let categories = [];
    
    if (EXERCISES.kettlebell.includes(exercise)) categories.push('kettlebell');
    if (EXERCISES.bodyweight.includes(exercise)) categories.push('bodyweight');
    if (EXERCISES.stretch.includes(exercise)) categories.push('stretch');
    
    // Try each possible category
    for (const category of categories) {
        const cleanName = exercise.toLowerCase().replace(/ /g, '_');
        const imagePath = `/static/images/${category}/${cleanName}.jpg`;
        
        const exists = await verifyImageExists(exercise, category);
        if (exists) {
            imgElement.src = imagePath;
            imgElement.style.display = 'block';
            return;
        }
    }
    
    // If no image found
    imgElement.src = '/static/images/default_exercise.jpg';
    imgElement.style.display = 'block';
}	
	
	
	
	
	
	
    
    function startWorkout() {
        if (selectedExercises.length === 0) {
            alert('Please select at least one exercise');
            return;
        }
        
        loadSettings();
        
        // Reset workout variables
        currentSet = 1;
        currentExerciseIndex = 0;
        isRestPeriod = false;
        isSetRestPeriod = false;
        
        // Disable/enable buttons
        startWorkoutBtn.disabled = true;
        resetSelectionBtn.disabled = true;
        pauseTimerBtn.disabled = false;
        stopTimerBtn.disabled = false;
        
        // Start the first exercise
        startExercise();
    }
	
	const EXERCISE_IMAGES = {
    // Kettlebell exercises
    "Kettlebell Swing": "kettlebell-swing.jpg",
    "Kettlebell Goblet Squat": "kettlebell-goblet-squat.jpg",
    "Kettlebell Deadlift": "kettlebell-deadlift.jpg",
    // Add more kettlebell exercises as needed
    
    // Bodyweight exercises
    "Push-Ups": "push-ups.jpg",
    "Squats": "squats.jpg",
    "Lunges": "lunges.jpg",
    // Add more bodyweight exercises as needed
    
    // Stretch exercises
    "Neck Stretch": "neck-stretch.jpg",
    "Shoulder Stretch": "shoulder-stretch.jpg",
    // Add more stretch exercises as needed
    
    // Daily routines
    "Wake Up Early": "wake-up.jpg",
    "Hydrate": "hydrate.jpg"
    // Add more daily routines as needed
};

	
    
    // Modified startExercise function with error handling
function startExercise() {
    isRestPeriod = false;
    const exercise = selectedExercises[currentExerciseIndex];
    currentExerciseDisplay.textContent = exercise;
    
    // Handle exercise image
    const imgElement = document.getElementById('exercise-image');
    const imagePath = getExerciseImagePath(exercise);
    
    // Preload image to verify it exists
    const testImage = new Image();
    testImage.src = imagePath;
    
    testImage.onload = function() {
        imgElement.src = imagePath;
        imgElement.style.display = 'block';
    };
    
    testImage.onerror = function() {
        imgElement.style.display = 'none';
        console.warn(`Image not found: ${imagePath}`);
    };
    
    // Rest of the function...
    setInfoDisplay.textContent = `Set: ${currentSet}/${totalSets}`;
    timeLeft = exerciseDuration;
    totalTime = exerciseDuration;
    updateTimerDisplay();
    progressBar.style.width = '100%';
    progressBar.style.backgroundColor = '#2ecc71';
    
    startSound.play();
    clearInterval(timer);
    timer = setInterval(updateTimer, 1000);
}

    
    function startRestPeriod() {
        isRestPeriod = true;
        currentExerciseDisplay.textContent = 'Rest';
		    exerciseImage.style.display = 'none';
        timeLeft = exerciseRest;
        totalTime = exerciseRest;
        updateTimerDisplay();
        progressBar.style.width = '100%';
        progressBar.style.backgroundColor = '#3498db';
        
        // Play rest sound
        restSound.play();
        
        // Start timer
        clearInterval(timer);
        timer = setInterval(updateTimer, 1000);
    }
    
    function startSetRestPeriod() {
        isSetRestPeriod = true;
        currentExerciseDisplay.textContent = 'Set Rest';
		    exerciseImage.style.display = 'none';
        timeLeft = setRest;
        totalTime = setRest;
        updateTimerDisplay();
        progressBar.style.width = '100%';
        progressBar.style.backgroundColor = '#e74c3c';
        
        // Play rest sound
        restSound.play();
        
        // Start timer
        clearInterval(timer);
        timer = setInterval(updateTimer, 1000);
    }
    
   
   function updateTimer() {
    if (isPaused) return;
    
    timeLeft--;
    updateTimerDisplay();
    
    // Update progress bar
    const progress = (timeLeft / totalTime) * 100;
    progressBar.style.width = `${progress}%`;
    
    // Play process sound when 5 seconds left
    if (timeLeft === 5) {
        processSound.play();
    }
    
    if (timeLeft <= 0) {
        clearInterval(timer);
        
        if (isSetRestPeriod) {
            // Move to next set or end workout
            currentSet++;
            isSetRestPeriod = false;
            
            if (currentSet > totalSets) {
                endWorkout();
            } else {
                currentExerciseIndex = 0;
                startExercise();
            }
        } else if (isRestPeriod) {
            // Move to next exercise or set rest
            isRestPeriod = false;
            currentExerciseIndex++;
            
            if (currentExerciseIndex >= selectedExercises.length) {
                if (currentSet < totalSets) {
                    startSetRestPeriod();
                } else {
                    endWorkout();
                }
            } else {
                startExercise();
            }
        } else {
            // Start rest period after exercise only if not last exercise of set
            if (currentExerciseIndex < selectedExercises.length - 1) {
                startRestPeriod();
            } else {
                // Last exercise of set - move to set rest or end workout
                if (currentSet < totalSets) {
                    startSetRestPeriod();
                } else {
                    endWorkout();
                }
            }
        }
    }
}
   
    
    function updateTimerDisplay() {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    function pauseTimer() {
        isPaused = true;
        pauseTimerBtn.disabled = true;
        resumeTimerBtn.disabled = false;
    }
    
    function resumeTimer() {
        isPaused = false;
        pauseTimerBtn.disabled = false;
        resumeTimerBtn.disabled = true;
    }
    
    function stopTimer() {
        clearInterval(timer);
        endWorkout();
    }
    
    function endWorkout() {
    timerDisplay.textContent = '00:00';
    currentExerciseDisplay.textContent = 'Workout Complete!';
    setInfoDisplay.textContent = '';
    progressBar.style.width = '0%';
        exerciseImage.style.display = 'none';

    // Play stop sound
    stopSound.play();
    
    // Reset buttons
    startWorkoutBtn.disabled = false;
    resetSelectionBtn.disabled = false;
    pauseTimerBtn.disabled = true;
    resumeTimerBtn.disabled = true;
    stopTimerBtn.disabled = true;
    
    // Reset workout state
    currentSet = 0;
    currentExerciseIndex = 0;
    isRestPeriod = false;
    isSetRestPeriod = false;
}
   
function getExerciseImagePath(exerciseName) {
    // Clean the exercise name for filename
    const cleanName = exerciseName.toLowerCase()
        .replace(/ /g, '_')
        .replace(/'/g, '')
        .replace(/-/g, '_');
    
    // Determine category
    let category = '';
    if (EXERCISES.kettlebell.includes(exerciseName)) category = 'kettlebell';
    else if (EXERCISES.bodyweight.includes(exerciseName)) category = 'bodyweight';
    else if (EXERCISES.stretch.includes(exerciseName)) category = 'stretch';
    
    // Return the correct URL path
    return `/static/images/${category}/${cleanName}.jpg`;
}
	
	
	
	
    // Tab functionality
    function openTab(tabName, button) {
        const tabContents = document.getElementsByClassName('tab-content');
        for (let i = 0; i < tabContents.length; i++) {
            tabContents[i].style.display = 'none';
        }
        
        const tabButtons = document.getElementsByClassName('tab-button');
        for (let i = 0; i < tabButtons.length; i++) {
            tabButtons[i].classList.remove('active');
        }
        
        document.getElementById(tabName).style.display = 'block';
        button.classList.add('active');
    }
});