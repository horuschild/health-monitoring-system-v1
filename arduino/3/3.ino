#include <WiFi.h>
#include <Firebase_ESP_Client.h>
#include <DHT.h>
#include <time.h>

// ================= WiFi =================
#define WIFI_SSID "Socrates"
#define WIFI_PASSWORD "14010598"

// ================= Firebase =================
#define API_KEY "AIzaSyCSLFfQsVK7rwvKz1CoQgUT709RTVWm52M"
#define DATABASE_URL "https://health-monitoring-9f325-default-rtdb.asia-southeast1.firebasedatabase.app/"
#define FIREBASE_PROJECT_ID "health-monitoring-9f325"

// ================= DHT =================
#define DHTPIN 1
#define DHTTYPE DHT11
DHT dht(DHTPIN, DHTTYPE);

// ================= Firebase Objects =================
FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

// Device Info
char deviceEmail[64];
const char* devicePass = "defaultpass123";
String uid;

// Timer for Firestore compression
unsigned long lastFirestoreSave = 0;
const unsigned long FIRESTORE_INTERVAL = 120000; // 2 menit = 120.000 ms

void setup() {
  Serial.begin(115200);

  // Unique email dari chipID
  uint64_t chipid = ESP.getEfuseMac();
  snprintf(deviceEmail, sizeof(deviceEmail), "esp32_%llx@device.local", chipid);
  Serial.printf("Device Email: %s\n", deviceEmail);

  // WiFi Connect
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to Wi-Fi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(300);
    Serial.print(".");
  }
  Serial.printf("\nConnected! IP: %s\n", WiFi.localIP().toString().c_str());

  // Setup NTP (WIB GMT+7)
  configTime(7 * 3600, 0, "pool.ntp.org", "time.nist.gov");
  Serial.print("Syncing time...");
  time_t now = time(nullptr);
  while (now < 100000) {
    delay(500);
    Serial.print(".");
    now = time(nullptr);
  }
  Serial.println(" done!");

  // Firebase config
  config.api_key = API_KEY;
  config.database_url = DATABASE_URL;

  // SignUp / SignIn
  if (Firebase.signUp(&config, &auth, deviceEmail, devicePass)) {
    if (auth.token.uid.length()) {
      uid = auth.token.uid.c_str();
      Serial.println("SignUp OK, UID: " + uid);
    }
  } else {
    if (config.signer.signupError.message == "EMAIL_EXISTS") {
      auth.user.email = deviceEmail;
      auth.user.password = devicePass;
      Serial.println("Email exists → using SignIn");
    } else {
      Serial.printf("Auth Error: %s\n", config.signer.signupError.message.c_str());
    }
  }

  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);

  dht.begin();
}

void loop() {
  float t = dht.readTemperature();
  float h = dht.readHumidity();

  if (isnan(t) || isnan(h)) {
    Serial.println("Failed read DHT");
    delay(10000);
    return;
  }

  // Timestamp WIB
  time_t now = time(nullptr);
  struct tm timeinfo;
  localtime_r(&now, &timeinfo);
  char timestamp[40];
  strftime(timestamp, sizeof(timestamp), "%Y-%m-%dT%H:%M:%S+07:00", &timeinfo);

  if (Firebase.ready() && uid.length()) {
    // ==== RTDB Latest (Realtime) ====
    String basePath = "/users/" + uid;
    FirebaseJson ts;
    ts.set(".sv", "timestamp");

    Firebase.RTDB.setFloat(&fbdo, basePath + "/temperature", t);
    Firebase.RTDB.setFloat(&fbdo, basePath + "/humidity", h);
    Firebase.RTDB.setJSON(&fbdo, basePath + "/timestamp", &ts);

    Serial.println("RTDB updated (Realtime)");

    // ==== Firestore History (Compressed: tiap 2 menit) ====
    if (millis() - lastFirestoreSave >= FIRESTORE_INTERVAL) {
      lastFirestoreSave = millis();

      char docPath[128];
      snprintf(docPath, sizeof(docPath), "users/%s/history/%lu", uid.c_str(), millis());

      char content[256];
      snprintf(content, sizeof(content),
        "{\"fields\":{"
        "\"temperature\":{\"stringValue\":\"%.2f\"},"
        "\"humidity\":{\"stringValue\":\"%.2f\"},"
        "\"timestamp\":{\"stringValue\":\"%s\"}"
        "}}",
        t, h, timestamp);

      if (Firebase.Firestore.createDocument(&fbdo, FIREBASE_PROJECT_ID, "(default)", docPath, content)) {
        Serial.println("Firestore saved (compressed): " + String(docPath));
      } else {
        Serial.println("Firestore Error: " + fbdo.errorReason());
      }
    }
  }

  delay(10000); // tetap cek DHT & update RTDB tiap 10 detik
}
