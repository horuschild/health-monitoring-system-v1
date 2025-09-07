#include <WiFi.h>
#include <Firebase_ESP_Client.h>
#include <DHT.h>
// #include <addons/TokenHelper.h>
// #include <addons/RTDBHelper.h>
#include <time.h>

// WiFi
#define WIFI_SSID "Socrates"
#define WIFI_PASSWORD "14010598"

// Firebase
#define API_KEY "AIzaSyCSLFfQsVK7rwvKz1CoQgUT709RTVWm52M"
#define DATABASE_URL "https://health-monitoring-9f325-default-rtdb.asia-southeast1.firebasedatabase.app/"
#define FIREBASE_PROJECT_ID "health-monitoring-9f325"

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

  // Setup NTP (GMT+7 WIB)
  configTime(7 * 3600, 0, "pool.ntp.org", "time.nist.gov");
  Serial.print("⏳ Syncing time with NTP");
  time_t now = time(nullptr);
  while (now < 100000) {
    delay(500);
    Serial.print(".");
    now = time(nullptr);
  }
  Serial.println("\n✅ NTP time synced!");

  // Firebase config
  config.api_key = API_KEY;
  config.database_url = DATABASE_URL;

  // Coba SignUp atau SignIn
  if (Firebase.signUp(&config, &auth, deviceEmail.c_str(), devicePass.c_str())) {
    if (auth.token.uid.length() > 0) {
      uid = auth.token.uid.c_str();
      Serial.println("✅ SignUp success, UID: " + uid);
    }
  } else {
    if (config.signer.signupError.message == "EMAIL_EXISTS") {
      Serial.println("⚠️ Email already exists, coba SignIn...");
      auth.user.email = deviceEmail.c_str();
      auth.user.password = devicePass.c_str();
    } else {
      Serial.printf("❌ Auth Error: %s\n", config.signer.signupError.message.c_str());
    }
  }

  // Mulai Firebase
  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);

  fbdo.setResponseSize(8192);

  while (uid.length() == 0) {
    if (auth.token.uid.length() > 0) {
      uid = auth.token.uid.c_str();
      Serial.println("Got UID after wait: " + uid);
    }
    delay(500);
  }

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

  // Ambil timestamp NTP (WIB)
  time_t now = time(nullptr);
  struct tm timeinfo;
  localtime_r(&now, &timeinfo);

  char buf[40];
  strftime(buf, sizeof(buf), "%Y-%m-%dT%H:%M:%S+07:00", &timeinfo);
  String timestamp = String(buf);

  // Pastikan Firebase siap & UID tidak kosong
  if (Firebase.ready() && uid.length() > 0) {
    // ===== Simpan ke RTDB (by UID) =====
    String latestPath = "/users/" + uid;
    FirebaseJson ts;
    ts.set(".sv", "timestamp");

    if (!Firebase.RTDB.setFloat(&fbdo, latestPath + "/temperature", t))
      Serial.println("RTDB Temp Error: " + fbdo.errorReason());

    if (!Firebase.RTDB.setFloat(&fbdo, latestPath + "/humidity", h))
      Serial.println("RTDB Hum Error: " + fbdo.errorReason());

    if (!Firebase.RTDB.setJSON(&fbdo, latestPath + "/timestamp", &ts))
      Serial.println("RTDB Time Error: " + fbdo.errorReason());

    // ===== Simpan ke Firestore (history) =====
    String documentPath = "users/" + uid + "/history/" + String(millis());

    String content =
      "{"
        "\"fields\":{"
          "\"temperature\":{\"stringValue\":\"" + String(t) + "\"},"
          "\"humidity\":{\"stringValue\":\"" + String(h) + "\"},"
          "\"timestamp\":{\"stringValue\":\"" + timestamp + "\"}"
        "}"
      "}";


    if (Firebase.Firestore.createDocument(&fbdo,
      FIREBASE_PROJECT_ID,
      "(default)",
      documentPath.c_str(),
      content.c_str())) {
      Serial.println("✅ History saved to Firestore: " + documentPath);
    } else {
      Serial.println("❌ Firestore Error: " + fbdo.errorReason());
    }

    Serial.println("✅ Latest updated in RTDB");
  } else {
    Serial.println("⚠️ Skip Firestore, UID belum siap atau Firebase not ready");
  }

  delay(10000);
}
