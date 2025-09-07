#include <WiFi.h>
#include <Firebase_ESP_Client.h>
#include <DHT.h>
#include <addons/TokenHelper.h>
#include <addons/RTDBHelper.h>

// WiFi
#define WIFI_SSID "Socrates"
#define WIFI_PASSWORD "14010598"

// Firebase
#define API_KEY "AIzaSyDK5ZeKFnidZSP_owpvtzwcaAxp2rwgtb8"
#define DATABASE_URL "https://testsys-14ad3-default-rtdb.asia-southeast1.firebasedatabase.app/"
#define FIREBASE_PROJECT_ID "testsys-14ad3"

// DHT
#define DHTPIN 1
#define DHTTYPE DHT11
DHT dht(DHTPIN, DHTTYPE);

// Firebase objects
FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

// Device info
String deviceEmail;
String devicePass = "defaultpass123";
String uid;

void setup() {
  Serial.begin(115200);

  // Generate unique email dari chipID
  String chipID = String((uint32_t)ESP.getEfuseMac(), HEX);
  deviceEmail = "esp32_" + chipID + "@device.local";

  Serial.println("Device Email: " + deviceEmail);

  // WiFi connect
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to Wi-Fi");
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(300);
  }
  Serial.println("\nConnected with IP: " + WiFi.localIP().toString());

  // Firebase config
  config.api_key = API_KEY;
  config.database_url = DATABASE_URL;

 
  // Coba SignUp
  if (Firebase.signUp(&config, &auth, deviceEmail.c_str(), devicePass.c_str())) {
    if (auth.token.uid.length() > 0) {
      Serial.println("✅ SignUp success (or already signed in)");
      uid = auth.token.uid.c_str();
    }
  } else {
    if (config.signer.signupError.message == "EMAIL_EXISTS") {
      Serial.println("⚠️ Email already exists, set credentials for SignIn...");
      auth.user.email = deviceEmail.c_str();
      auth.user.password = devicePass.c_str();
    } else {
      Serial.printf("❌ Auth Error: %s\n", config.signer.signupError.message.c_str());
    }
  }


  // Mulai Firebase
  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);

  dht.begin();
}

void loop() {
  float t = dht.readTemperature();
  float h = dht.readHumidity();

  if (isnan(t) || isnan(h)) {
    Serial.println("❌ Failed to read from DHT");
    delay(5000);
    return;
  }

  Serial.printf("Temp: %.2f °C, Hum: %.2f %%\n", t, h);

  if (Firebase.ready()) {
    // ===== Simpan ke RTDB (by UID) =====
    String latestPath = "/users/" + uid;  // ✅ langsung simpan di dalam UID

    FirebaseJson ts;
    ts.set(".sv", "timestamp");

    Firebase.RTDB.setFloat(&fbdo, latestPath + "/temperature", t);
    Firebase.RTDB.setFloat(&fbdo, latestPath + "/humidity", h);
    Firebase.RTDB.setJSON(&fbdo, latestPath + "/timestamp", &ts);

    // ===== Simpan ke Firestore (history) =====
    FirebaseJson content;
    content.set("fields/temperature/doubleValue", t);
    content.set("fields/humidity/doubleValue", h);
    content.set("fields/timestamp/timestampValue", "REQUEST_TIME"); // ✅ fix timestamp

    String documentPath = "users/" + uid + "/history/" + String(millis());

    if (Firebase.Firestore.createDocument(&fbdo, FIREBASE_PROJECT_ID, "", documentPath.c_str(), content.raw())) {
      Serial.println("✅ History saved to Firestore");
    } else {
      Serial.println("❌ Firestore Error: " + fbdo.errorReason());
    }

    Serial.println("✅ Latest updated in RTDB");
  }


  delay(5000);
}
