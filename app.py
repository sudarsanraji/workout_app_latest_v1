from flask import Flask, render_template, request, jsonify
import os
import time

app = Flask(__name__)

# Exercise data
EXERCISES = {
    "Kettlebell": [
        "Kettlebell Swing", "Kettlebell Goblet Squat", "Kettlebell Deadlift",
        "Kettlebell Clean", "Kettlebell Snatch", "Kettlebell Press",
        "Kettlebell Push Press", "Kettlebell Turkish Get-Up", "Kettlebell Windmill",
        "Kettlebell High Pull", "Kettlebell Thruster", "Kettlebell Row",
        "Kettlebell Floor Press", "Kettlebell Halo", "Kettlebell Figure Eight",
        "Kettlebell Lunge", "Kettlebell Step-Up", "Kettlebell Russian Twist",
        "Kettlebell Side Bend", "Kettlebell Overhead Squat", "Kettlebell Single-Leg Deadlift",
        "Kettlebell Clean and Press", "Kettlebell Clean and Jerk", "Kettlebell Bottoms-Up Press",
        "Kettlebell Farmer's Walk", "Kettlebell Suitcase Carry", "Kettlebell Rack Carry",
        "Kettlebell Overhead Carry", "Kettlebell Swing to Squat", "Kettlebell Swing to High Pull",
        "Kettlebell Swing to Clean", "Kettlebell Swing to Snatch", "Kettlebell Swing to Press",
        "Kettlebell Swing to Thruster", "Kettlebell Swing to Row", "Kettlebell Swing to Floor Press",
        "Kettlebell Swing to Halo", "Kettlebell Swing to Figure Eight", "Kettlebell Swing to Lunge",
        "Kettlebell Swing to Step-Up"
    ],
    "Bodyweight": [
        "Push-Ups", "Squats", "Lunges", "Plank", "Burpees", "Mountain Climbers",
        "Jumping Jacks", "Tricep Dips", "Bicycle Crunches", "Leg Raises", "Side Plank",
        "Glute Bridges", "High Knees", "Inchworms", "Superman", "Russian Twists",
        "Wall Sit", "Donkey Kicks", "Flutter Kicks", "Bear Crawls"
    ],
    "Stretch": [
        "Neck Stretch", "Shoulder Stretch", "Arm Stretch", "Chest Stretch",
        "Back Stretch", "Hip Flexor Stretch", "Hamstring Stretch", "Quad Stretch",
        "Calf Stretch", "Ankle Stretch", "Full Body Stretch"
    ],
    "Daily Routines": [
        "Wake Up Early", "Hydrate", "Stretch or Exercise", "Meditate or Practice Mindfulness",
        "Healthy Breakfast", "Plan Your Day", "Personal Hygiene", "Read or Listen to Something Inspirational"
    ]
}

# Exercise descriptions
EXERCISE_DESCRIPTIONS = {
    "Stretch": "Builds greater overall flexibility, relieves stress, helps your body get back to its pre-exercise state, gives your mind and body a chance to reflect on the workout, may reduce post-exercise muscle soreness and stiffness"
}

@app.route('/')
def index():
    return render_template('index.html', exercises=EXERCISES, descriptions=EXERCISE_DESCRIPTIONS)

@app.route('/get_exercise_image/<exercise_name>')
def get_exercise_image(exercise_name):
    # Simple mapping of exercise names to image filenames
    image_map = {
        "Kettlebell Swing": "kettlebell_swing.jpg",
        "Push-Ups": "pushups.jpg",
        "Squats": "squats.jpg",
        # Add more mappings as needed
    }
    
    default_image = "default_exercise.jpg"
    image_file = image_map.get(exercise_name, default_image)
    
    if not os.path.exists(f"static/images/{image_file}"):
        image_file = default_image
    
    return jsonify({"image": image_file})

if __name__ == '__main__':
    app.run(debug=True)