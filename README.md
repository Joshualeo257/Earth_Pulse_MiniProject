# Earth_Pulse_MiniProject
# Earth Pulse Irrigate

**Earth Pulse Irrigate** is a smart irrigation assistant designed to optimize water usage in agricultural fields. It leverages real-time environmental data, weather forecasts, and a Vision Transformer (ViT) machine learning model to provide farmers with actionable insights and intelligent 14-day irrigation schedules.

This project combines a modern web frontend, a robust Node.js backend, and a dedicated Python ML service to deliver a comprehensive precision farming tool.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Setup and Installation](#setup-and-installation)
  - [1. Clone the Repository](#1-clone-the-repository)
  - [2. Configure Environment Variables](#2-configure-environment-variables)
- [Running the Application](#running-the-application)
  - [Part 1: Start the Python ML Service](#part-1-start-the-python-ml-service)
  - [Part 2: Start the Node.js Backend](#part-2-start-the-nodejs-backend)
  - [Part 3: Start the React Frontend](#part-3-start-the-react-frontend)
- [API Endpoints](#api-endpoints)

## Features

- **Dashboard Overview**: At-a-glance view of soil moisture, live weather forecasts, and pending irrigation recommendations.
- **Crop Management**: Add, view, and manage individual crops with specific details like growth stage and water needs.
- **AI-Powered Scheduling**: Generate a 14-day irrigation forecast using a PyTorch-based Vision Transformer model.
- **Dynamic Recommendations**: The system provides daily rule-based recommendations based on sensor data and weather.
- **Live Weather Integration**: Fetches and displays real-time weather data from the OpenWeatherMap API.

## Tech Stack

| Component            | Technology                                                                                                  |
| -------------------- | ----------------------------------------------------------------------------------------------------------- |
| **Frontend**         | [React](https://reactjs.org/), [Vite](https://vitejs.dev/), [TypeScript](https://www.typescriptlang.org/), [Tailwind CSS](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/) |
| **Backend**          | [Node.js](https://nodejs.org/), [Express](https://expressjs.com/), [Mongoose](https://mongoosejs.com/)        |
| **Machine Learning** | [Python](https://www.python.org/), [Flask](https://flask.palletsprojects.com/), [PyTorch](https://pytorch.org/), [Timm](https://timm.fast.ai/) |
| **Database**         | [MongoDB](https://www.mongodb.com/)                                                                         |

## Project Structure

The project is organized into three main parts, all within a single monorepo:

/
├── backend/ # Node.js Express server
│ ├── models/
│ ├── routes/
│ ├── services/
│ ├── .env # Backend environment variables
│ └── server.js
├── ml-service/ # Python Flask ML service
│ ├── venv/ # Python virtual environment (created on setup)
│ ├── app.py # Flask application
│ └── model_definition.py # PyTorch model class
├── public/ # Static assets for the frontend
├── src/ # React frontend source code
│ ├── components/
│ └── pages/
├── README.md # This file
└── package.json # Frontend dependencies


## Prerequisites

Before you begin, ensure you have the following installed on your system:
- [Node.js](https://nodejs.org/en/download/) (v18.x or later recommended)
- [Python](https://www.python.org/downloads/) (v3.9 or later recommended)
- [MongoDB](https://www.mongodb.com/try/download/community) (ensure the MongoDB server is running)
- [Git](https://git-scm.com/downloads/)

## Setup and Installation

### 1. Clone the Repository

First, clone this repository to your local machine.

```sh
git clone <your-repository-url>
cd <repository-folder>

2. Configure Environment Variables
The backend requires an environment file to connect to the database and use the weather API.
1. Navigate to the backend directory:
cd backend
2.Create a file named .env.
3.Copy the content from .env.example (or use the template below) and paste it into your new .env file.

backend/.env template:
# MongoDB Connection String
MONGODB_URI=mongodb://127.0.0.1:27017/earth_pulse_irrigate

# Server Port for the Node.js backend
PORT=5001

# Node Environment (development or production)
NODE_ENV=development

# API Key for OpenWeatherMap
# Get your free key from https://openweathermap.org/api
OPENWEATHER_API_KEY=your_openweathermap_api_key_here

Running the Application
This project consists of three separate services that must be run simultaneously in three different terminal windows.
Part 1: Start the Python ML Service
This service runs the Flask server that hosts the PyTorch model for predictions.
Terminal 1:
# 1. Navigate to the ml-service directory
cd ml-service

# 2. Create and activate a Python virtual environment
python -m venv venv

# On Windows (CMD/PowerShell):
.\venv\Scripts\activate
# On macOS/Linux/Git Bash:
source venv/bin/activate

# 3. Install the required Python packages
pip install -r requirements.txt

# 4. Run the Flask server
# The --host=0.0.0.0 flag is crucial for it to be accessible by the Node.js backend.
flask run --host=0.0.0.0 --port=5002

✅ The ML service should now be running on http://127.0.0.1:5002.
Part 2: Start the Node.js Backend
This service runs the Express API that communicates with the database, the ML service, and the frontend.
Terminal 2:
# 1. Navigate to the backend directory
cd backend

# 2. Install Node.js dependencies
npm install

# 3. Start the backend server in development mode
npm run dev

✅ The backend API should now be running on http://localhost:5001. You can test it by visiting http://localhost:5001/api/health in your browser.
Part 3: Start the React Frontend
This service runs the Vite development server for the user interface.
Terminal 3:
# 1. Navigate to the project's root directory
# (If you are in the backend/ or ml-service/ folder, use `cd ..` to go up)
cd ..

# 2. Install frontend dependencies
npm install

# 3. Start the Vite development server
npm run dev

✅ Your application is now live! Open your browser and go to http://localhost:5173.
API Endpoints
A brief overview of the main API routes available on the backend.
GET /api/health: Checks if the backend server is running.
GET, POST /api/crops: Manage all crop data.
GET /api/sensors/:id/readings: Fetch data from a specific sensor.
GET /api/weather/bangalore: Get the live weather forecast.
POST /api/ai/schedule/:cropId: Trigger the ML service to generate a 14-day forecast.
