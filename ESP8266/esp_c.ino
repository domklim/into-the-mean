#include <ESP8266WiFi.h>  //WiFi library
#include <PubSubClient.h>  //
#include <ShiftLCD.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include <TimeLib.h>
#include <WiFiUdp.h>
#include <EEPROM.h>

#define ONE_WIRE_BUS 0

int initEEPROM = 0;

char tempStr[6];

//insert topics for MQTT separated by a forward slash ie x/y/z
char *topicSubscribed = "";
char *topicTemperature = "";
char *topicActuators = "";
char *topicReply = "";

char ntpServerName[] = "us.pool.ntp.org";
int timeZone = 1; //CET time

int relay1Status;
int relay2Status;
int relay3Status;

int cnt = 0;

byte degree[8] = {
  0b00110,
  0b01001,
  0b01001,
  0b00110,
  0b00000,
  0b00000,
  0b00000,
  0b00000
};

//Connection to WiFi
const char *ssid =  "";
const char *pass =  ""; 

//dns name resolution of test.mosquitto.org
IPAddress server(37, 187, 106, 16); 
char *strServer = "test.mosquitto.org";

WiFiUDP Udp;
int localPort = 9876;
time_t getNtpTime();
time_t prevDisplay = 0;
void digitalClockDisplay();
void sendNTPpacket(IPAddress &address);

WiFiClient wifiClient;
PubSubClient client(wifiClient,server);

ShiftLCD lcd(12,15,13);

OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature DS18B20(&oneWire);

void callback(const MQTT::Publish& pub) {
   String payload = pub.payload_string();
   String receivedStr = "Received: ";
   receivedStr += pub.payload_string();
   String printStr = receivedStr;
   printStr.toUpperCase();

   if(payload == "relay1:on"){
    digitalWrite(5, 1);
    client.publish(MQTT::Publish(topicReply,payload)
                .set_retain()
                .set_qos(2)
                .set_dup());
    EEPROM.write(0, 1);
    EEPROM.commit();
    lcdPrintScrolled(printStr, 0, 1);    
   } else if(payload == "relay2:on"){
    digitalWrite(16, 1);
    client.publish(MQTT::Publish(topicReply,payload)
                .set_retain()
                .set_qos(2)
                .set_dup());
    EEPROM.write(2, 1);
    EEPROM.commit();
    lcdPrintScrolled(printStr, 0, 1);    
   } else if(payload == "relay1:off"){
    digitalWrite(5, 0);
    client.publish(MQTT::Publish(topicReply,payload)
                .set_retain()
                .set_qos(2)
                .set_dup());
    EEPROM.write(0, 0);
    EEPROM.commit();
    lcdPrintScrolled(printStr, 0, 1);
   } else if( payload == "relay2:off"){
    digitalWrite(16, 0);
    client.publish(MQTT::Publish(topicReply,payload)
                .set_retain()
                .set_qos(2)
                .set_dup());
    EEPROM.write(2, 0);
    EEPROM.commit();
    lcdPrintScrolled(printStr, 0, 1);
   } else if(payload == "relay3:on"){
    digitalWrite(4, 1);
    client.publish(MQTT::Publish(topicReply,payload)
                .set_retain()
                .set_qos(2)
                .set_dup());
    EEPROM.write(4, 1);
    EEPROM.commit();
    lcdPrintScrolled(printStr, 0, 1);    
   } else if(payload == "relay3:off"){
    digitalWrite(4, 0);
    client.publish(MQTT::Publish(topicReply,payload)
                .set_retain()
                .set_qos(2)
                .set_dup());
    EEPROM.write(4, 0);
    EEPROM.commit();
    lcdPrintScrolled(printStr, 0, 1);
   } else if(payload == "temp:now"){
    client.publish(MQTT::Publish(topicTemperature,getTemperature())
                .set_retain()
                .set_qos(0)
                .set_dup());
   } else if(payload == "temp:show"){
    String temperature = "Temperature is: " + getTemperature() + char(0x08) + "C";
    lcdPrintScrolled(temperature, 0, 1);
    client.publish(MQTT::Publish(topicTemperature,getTemperature())
                .set_retain()
                .set_qos(2)
                .set_dup());
   } else {
    lcdPrintScrolled("INVALID REQUEST!", 0, 1);
    abort();
   } 
}

void lcdPrintScrolled(String str, int index, int line){
  for(int ii = 0; ii < (str.length() - 15); ii++){
    lcd.setCursor(index, line);
    lcd.print(str.substring(ii, str.length()));
    delay(350);
  }
}

String macToStr(const uint8_t *mac){
  String result;
  for (int i = 0; i < 6; ++i) {
    result += String(mac[i], 16);
    if (i < 5)
      result += ':';
  }
  return result;
}

String getTemperature() {
  delay(250);
  DS18B20.requestTemperatures(); 
  float tempC = DS18B20.getTempCByIndex(0);
  dtostrf(tempC, 3, 2, tempStr);;
  return tempStr;
}

void setup() {
  digitalWrite(0, HIGH);   //PULLUP for ds18b20
  pinMode(0, OUTPUT);
  pinMode(16, OUTPUT);
  pinMode(5, OUTPUT);
  pinMode(4, OUTPUT);

  DS18B20.begin();
  
  lcd.createChar(0, degree);
  lcd.begin(16, 2);
  
  client.set_callback(callback);
  
  EEPROM.begin(6);
    relay1Status = EEPROM.read(0);
    if(relay1Status == 1){
      digitalWrite(5, HIGH);
    };
    relay2Status = EEPROM.read(2);
    if(relay2Status == 1){
      digitalWrite(16, HIGH);
    };  
    relay3Status = EEPROM.read(4);
    if(relay3Status == 1){
      digitalWrite(4, HIGH);
    };
    
    lcd.setCursor(0,0);
    lcd.print("Initializing...");
    Udp.begin(localPort);
    setSyncProvider(getNtpTime);
    setSyncInterval(300);
    lcd.setCursor(0,0);
    lcd.print("Connecting: ");
    
    if (WiFi.status() != WL_CONNECTED) {
      lcd.setCursor(cnt,1);
      lcd.print(".");
      cnt++;
      WiFi.begin(ssid, pass);
      if (WiFi.waitForConnectResult() != WL_CONNECTED){
        return;
      }
  }

  if (WiFi.status() == WL_CONNECTED){
    lcd.clear();
    lcd.setCursor(0,1);
    lcd.print("Wifi connected!");
    delay(1000);
    lcd.clear();
    lcd.setCursor(0,0);
    lcd.print("IP: ");
    lcd.setCursor(3,0);
    lcd.print(WiFi.localIP());
    delay(1000);
    uint8_t mac[6];
    WiFi.macAddress(mac);
    lcdPrintScrolled("MAC : " + macToStr(mac), 0, 1);
    if (!client.connected()) {
      if (client.connect("arduinoClient")) {
        lcd.clear();
        lcd.setCursor(0,0);
        lcd.print("Connected to mqtt");
        client.set_callback(callback);
        lcdPrintScrolled(strcat("Connected to mqtt: ", strServer), 0, 0);
        delay(1000);
        lcd.clear();
        delay(1000);
        client.subscribe(topicSubscribed);
        if(client.subscribe("x/y/z")){
        } else {
          lcdPrintScrolled("Error subscribing", 0, 1);
        }
      }
    } else {
      lcdPrintScrolled("MQTT connection failed! Reconnecting",0,1);
    }
  }
}

void loop() {
  if (client.connected()){
      client.loop();
      if (timeStatus() != timeNotSet){
        if (now() != prevDisplay){
          prevDisplay = now();
          digitalClockDisplay();
        }
      }
  }
}

  void digitalClockDisplay(){
    lcd.setCursor(0,0);
    lcd.print(digitsPadded(hour()));
    lcd.setCursor(2, 0);
    lcd.print(":");
    lcd.setCursor(3, 0);
    lcd.print(digitsPadded(minute()));
    lcd.setCursor(5, 0);
    lcd.print(":");
    lcd.setCursor(6, 0);
    lcd.print(digitsPadded(second()));
    lcd.setCursor(8, 0);
    lcd.print("  ");
    lcd.setCursor(10, 0);
    lcd.print(digitsPadded(day()));
    lcd.setCursor(12,0);
    lcd.print(" ");
    lcd.setCursor(13,0);
    lcd.print(monthStr(month()));
  }

String digitsPadded(int digits){
  String digitsZeroPadded;
  if (digits < 10){
    digitsZeroPadded += "0";
  } 
  digitsZeroPadded += digits;
  return digitsZeroPadded;
}

String monthStr(int month){
  switch(month){
    case 1:
    return "JAN";
    case 2:
    return "FEB";
    case 3:
    return "MAR";
    case 4:
    return "APR";
    case 5:
    return "MAY";
    case 6:
    return "JUN";
    case 7:
    return "JUL";
    case 8:
    return "AUG";
    case 9:
    return "SEP";
    case 10:
    return "OCT";
    case 11:
    return "NOV";
    case 12:
    return "DEC";
  }
}

//Ntp code example @Time-master/TimeNTP - Boilerplate
const int NTP_PACKET_SIZE = 48; 
byte packetBuffer[NTP_PACKET_SIZE];

time_t getNtpTime(){
  IPAddress ntpServerIP; 

  while (Udp.parsePacket() > 0) ;
  WiFi.hostByName(ntpServerName, ntpServerIP);
  sendNTPpacket(ntpServerIP);
  uint32_t beginWait = millis();
  while (millis() - beginWait < 1500) {
    int size = Udp.parsePacket();
    if (size >= NTP_PACKET_SIZE) {
      lcd.clear();
      lcdPrintScrolled("Received NTP response",0, 0);
      delay(1000);
      Udp.read(packetBuffer, NTP_PACKET_SIZE);
      unsigned long secsSince1900;
      secsSince1900 =  (unsigned long)packetBuffer[40] << 24;
      secsSince1900 |= (unsigned long)packetBuffer[41] << 16;
      secsSince1900 |= (unsigned long)packetBuffer[42] << 8;
      secsSince1900 |= (unsigned long)packetBuffer[43];
      return secsSince1900 - 2208988800UL + timeZone * SECS_PER_HOUR;
    }
  }
  lcdPrintScrolled("No NTP response :(", 0, 0);
  return 0; 
}

void sendNTPpacket(IPAddress &address){
  memset(packetBuffer, 0, NTP_PACKET_SIZE);
  packetBuffer[0] = 0b11100011;   // LI, Version, Mode
  packetBuffer[1] = 0;     // Stratum, or type of clock
  packetBuffer[2] = 6;     // Polling Interval
  packetBuffer[3] = 0xEC;  // Peer Clock Precision
  // 8 bytes of zero for Root Delay & Root Dispersion
  packetBuffer[12] = 49;
  packetBuffer[13] = 0x4E;
  packetBuffer[14] = 49;
  packetBuffer[15] = 52;

  Udp.beginPacket(address, 123);
  Udp.write(packetBuffer, NTP_PACKET_SIZE);
  Udp.endPacket();
}
