# Quantum TLS Security Scanner

This project is a full-stack application that scans target web servers for cryptographic vulnerabilities, analyzes their quantum safety, and generates a detailed Cryptographic Bill of Materials (CBOM) report.

## Project Structure

- `backend/`: A Django-based backend API handling the TLS scanning logic.
- `frontend/`: A modern HTML/CSS/JS frontend user interface for running scans.
- `requirements.txt`: Python package dependencies.

## Prerequisites

- **Python 3.8+** installed on your system.
- A modern web browser.

---

## 🛠 How to Run the Application

This guide covers setup and execution for both **Mac/Linux** and **Windows** operating systems.

### 1. Setup the Python Virtual Environment & Dependencies

Before running the backend, you need to set up the virtual environment to ensure all cryptography libraries are isolated.

**For Mac/Linux:**
```bash
# Navigate to the project root
cd path/to/backend_demo_pnb

# Create the virtual environment
python3 -m venv venv

# Activate the virtual environment
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

**For Windows:**
```powershell
# Navigate to the project root
cd path\to\backend_demo_pnb

# Create the virtual environment
python -m venv venv

# Activate the virtual environment
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Start the Backend API

The frontend relies on the backend API running locally on **port 9000**. Guarantee that your virtual environment is activated before proceeding.

**For Mac/Linux:**
```bash
cd backend
python3 manage.py runserver 9000
```

**For Windows:**
```powershell
cd backend
python manage.py runserver 9000
```

> **Note:** Leave this terminal window open and running in the background.

### 3. Launch the Frontend UI

Since the frontend consists of static files without a build step, it is extremely easy to use:

1. Open a **new terminal window** or use your file explorer (Finder/Windows Explorer).
2. Locate the `index.html` file inside the `frontend/` directory.
3. Open it in any modern web browser.

**Quick commands to open from terminal:**

**Mac:**
```bash
open ../frontend/index.html
```
**Windows:**
```powershell
start ..\frontend\index.html
```
*(Or simply double-click `index.html` in your file explorer)*

**Running a Scan:**
- Enter a target domain (e.g., `google.com`) in the input field.
- Click **"Scan Now"**.
- The page will communicate with your local backend API and display a comprehensive layout, including the T2QB risk level, actionable remediation steps, and potential W3C Verifiable Credentials.

---

### 🚀 Alternative: Running in Command Line (CLI) Mode

If you prefer to run scans directly from the command line without spinning up the Django server or using the UI frontend:

**For Mac/Linux:**
```bash
# Ensure virtual environment is activated
cd path/to/backend_demo_pnb/backend/api
python3 scanner.py google.com
```

**For Windows:**
```powershell
# Ensure virtual environment is activated
cd path\to\backend_demo_pnb\backend\api
python scanner.py google.com
```

This will execute the scan logic, print results directly to your terminal console, and automatically dump a `cbom_report.json` file in your active directory.
