#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// --- Configuration ---
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// Vercel API URL (replace with your actual deployed URL)
const char* serverUrl = "https://your-app.vercel.app/api/solar"; 

// Pin for Voltage Sensor
const int voltagePin = 34; 

// Voltage Divider Calibration
const float R1 = 30000.0; // 30k
const float R2 = 7500.0;  // 7.5k
const float refVoltage = 3.3;
const float adcResolution = 4095.0;

void setup() {
  Serial.begin(115200);
  
  // WiFi Connection
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nConnected to WiFi");
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    // 1. Read Analog Voltage
    int rawADC = analogRead(voltagePin);
    float pinVoltage = (rawADC / adcResolution) * refVoltage;
    
    // 2. Calculate Actual Solar Voltage (based on divider)
    // Actual = PinVal * (R1 + R2) / R2
    float actualVoltage = pinVoltage * ((R1 + R2) / R2);
    
    // 3. Prepare JSON
    StaticJsonDocument<200> doc;
    doc["voltage"] = actualVoltage;
    doc["timestamp"] = millis();
    
    String jsonString;
    serializeJson(doc, jsonString);
    
    // 4. Send HTTPS POST
    WiFiClientSecure client;
    client.setInsecure(); // Use setInsecure for simpler testing (skips cert verification)
    
    HTTPClient http;
    http.begin(client, serverUrl);
    http.addHeader("Content-Type", "application/json");
    
    Serial.print("Sending Data: ");
    Serial.println(jsonString);
    
    int httpResponseCode = http.POST(jsonString);
    
    if (httpResponseCode > 0) {
      String response = http.getString();
      Serial.println("HTTP Response code: " + String(httpResponseCode));
      Serial.println("Response: " + response);
    } else {
      Serial.print("Error code: ");
      Serial.println(httpResponseCode);
    }
    
    http.end();
  } else {
    Serial.println("WiFi Disconnected");
  }
  
  // Send data every 5 seconds
  delay(5000);
}
