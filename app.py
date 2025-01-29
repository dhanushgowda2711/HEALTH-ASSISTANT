from flask import Flask, request, render_template, redirect, url_for, jsonify
from flask import Response
from flask.templating import render_template
from pydantic import BaseModel

app = Flask(__name__) #test

# Global variable to store sensor data (can be expanded if needed)
esp32_data = {
    "temperature": None,
    "humidity": None,
    "pulse": None,
    "body_temperature": None,  # Added for body temperature
    "ecg": None  # Added for ECG data (just a placeholder for now)
}

# Pydantic model to handle the data from ESP32
class SensorData(BaseModel):
    temperature: float
    humidity: float
    pulse: int
    body_temperature: float  # Added field for body temperature
    ecg: str  # Added field for ECG data (could be string, array, etc.)

# Serve the login page at the root URL
@app.route("/", methods=["GET", "POST"])
def home():
    if request.method == "POST":
        username = request.form.get("username")
        password = request.form.get("password")

        # For simplicity, assuming hardcoded credentials (you can use real validation here)
        if username == "admin" and password == "123":  # Example credentials
            return redirect(url_for('health_monitoring'))  # Redirect to the health monitoring page
        else:
            # Redirect back to login page if login fails
            return redirect(url_for('home'))

    return render_template("Login Page.html")  # Serve the login page

# Route for health monitoring system (after successful login)
@app.route("/health_monitoring_system.html")
def health_monitoring():
    return render_template("health_monitoring_system.html")

# API endpoint for ESP32 data (can remain unchanged)
@app.route("/esp32-data", methods=["POST"])
def esp32_data_route():
    data = request.get_json()

    # Store the incoming sensor data
    esp32_data["temperature"] = data.get("temperature")
    esp32_data["humidity"] = data.get("humidity")
    esp32_data["pulse"] = data.get("pulse")
    esp32_data["body_temperature"] = data.get("body_temperature")  # Store body temperature
    esp32_data["ecg"] = data.get("ecg")  # Store ECG data (as a string, or array)

    return jsonify({"message": "Data received"})

@app.route("/esp32-data", methods=["GET"])
def get_esp32_data():
    # Return the stored sensor data
    return jsonify(esp32_data)

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)

