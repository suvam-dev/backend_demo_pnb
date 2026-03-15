# Quantum TLS Security Scanner

This project is a full-stack application that scans target web servers for cryptographic vulnerabilities, analyzes their quantum safety, and generates a detailed Cryptographic Bill of Materials (CBOM) report.

## Project Structure

- `backend/`: A Django-based backend API handling the TLS scanning logic.
- `frontend/`: A modern HTML/CSS/JS frontend user interface for running scans.
- `venv/`: The Python virtual environment setup for this project.

## Prerequisites

- **Python 3.8+** installed on your system.
- A modern web browser.

## How to Run the Application

### 1. Start the Backend API

The frontend relies on the backend running on **port 9000**. To start the backend, open a terminal and follow these steps:

1. **Navigate to the root directory:**
   ```bash
   cd /Users/suvanghosh/backend_demo_pnb
   ```

2. **Activate the Virtual Environment:**
   ```bash
   source venv/bin/activate
   ```
   *(If you encounter missing module errors later, you can ensure requirements are installed by running: `pip install django cryptography PyJWT` inside the active environment).*

3. **Navigate to the Backend directory:**
   ```bash
   cd backend
   ```

4. **Run the Django Development Server:**
   Start the server explicitly on port 9000 so the frontend can reach it:
   ```bash
   python manage.py runserver 9000
   ```
   Leave this terminal open and running.

### 2. Launch the Frontend UI

Since the frontend consists of static files without a build step, it is extremely easy to use:

1. **Open the HTML File:**
   Open a new terminal window (or just use Finder) and open `index.html` in your web browser:
   ```bash
   open /Users/suvanghosh/backend_demo_pnb/frontend/index.html
   ```

2. **Run a Scan:**
   - Enter a target domain (e.g., `google.com`) in the input field.
   - Click **"Scan Now"**.
   - The page will communicate with your local backend API and display a comprehensive report, including the T2QB risk level, actionable remediation steps, and potential W3C Verifiable Credentials.

### 3. Alternative: Running CLI Mode

If you prefer to run scans directly from the command line without spinning up the Django server or using the UI frontend:

1. Activate your virtual environment and navigate to the `api` directory:
   ```bash
   cd /Users/suvanghosh/backend_demo_pnb/backend/api
   ```
   
2. Execute the scanner module directly with a target domain:
   ```bash
   python scanner.py google.com
   ```
   
This will execute the scan logic, print results to your console, and automatically dump a `cbom_report.json` file in your active directory.
