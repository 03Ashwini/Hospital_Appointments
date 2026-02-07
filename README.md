🏥 Healthcare India - Multi-Hospital Appointment Portal
Healthcare India is a centralized, enterprise-grade platform that allows patients to discover and book appointments across multiple hospitals throughout India. 
It eliminates the need for separate apps for different clinics, providing a unified healthcare experience.

🌟 Key Features
Multi-Hospital Ecosystem: Users can search for doctors and book slots across various registered hospitals nationwide.

Integrated Payments: Secure fee collection using the Razorpay Payment Gateway.

Google Social Auth: One-click secure login for patients using OAuth 2.0.

Automated Onboarding: Uses Django Signals to automatically assign roles to new Google sign-ups without breaking the flow.

Asynchronous Alerts: Celery & Redis handle background tasks like email notifications to keep the system fast.

🛠️ Tech Stack
Frontend: React.js (Premium UI with Glassmorphism)

Backend: Django REST Framework (DRF)

Task Queue: Celery & Redis

Payment: Razorpay API

Auth: Google OAuth 2.0 & JWT

⚙️ Quick Setup
1 Backend:
# Clone the repository
git clone https://github.com/03Ashwini/Hospital_Appointments.git

# Create & Activate Virtual Environment
python -m venv venv
 venv\Scripts\activate

# Install Dependencies
pip install -r requirements.txt

# Run Migrations
python manage.py migrate

# Start Redis & Celery Worker
 Celery Worker:
celery -A Hospital_Appointments worker --loglevel=info -P solo
celery -A Hospital_Appointments beat --loglevel=info

3 Frontend:
npm install && npm start

📂 Core Architecture
/accounts: Custom User models and Social Auth integration.

/appointments: Cross-hospital scheduling and slot management.

/payments: Razorpay transaction and refund handling.

/hospitals: Onboarding and profile management for multiple medical institutions.

/analytics:analysis for whole appointents

🚀 Impact
This project solves the fragmentation in the Indian healthcare sector by providing a scalable, multi-tenant architecture capable of handling thousands of appointments across diverse geographical locations.
