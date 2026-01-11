# SOS Safety Web App

## Setup Instructions

Since Node.js was just installed, you need to install the dependencies manually.

1.  **Frontend Setup**:
    Open a new terminal in this folder and run:
    ```bash
    npm install
    npm run dev
    ```

2.  **Backend Setup** (Optional for Location Tracking):
    Open a second terminal:
    ```bash
    cd server
    npm install
    node index.js
    ```

## Features
- **SOS Button**: Triggers `tel:112` and location logic.
- **Theme Toggle**: Switch between Light and Dark "Premium" modes.
- **Battery Monitor**: Displays current battery level.
- **Location**: Fetches GPS coordinates.
