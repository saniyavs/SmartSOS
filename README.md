# SmartSOS Demo - Runs on your laptop (no phone, no ngrok)

## One-time installs
1. Node.js LTS, version 22.13 or newer (nodejs.org). Restart PC after. Check with:  node -v
2. VS Code (code.visualstudio.com)
3. Twilio free trial (twilio.com): copy Account SID, Auth Token, trial phone number.
   Verify your contact's phone number in Twilio (Phone Numbers > Verified Caller IDs).

## Run it
1. Unzip, then in VS Code: File > Open Folder > smartsos-demo
2. Terminal > New Terminal, then type:  npm install
3. Copy .env.example to a new file named .env and paste your 3 Twilio values.
4. Type:  npm start
   You should see: SmartSOS running on http://localhost:3000
5. Open  http://localhost:3000  in Chrome on your laptop.
6. Type name + contact number, click "Start monitoring", then click "Crash".
7. Wait 15 seconds. The SMS arrives on the contact's phone.
8. Open http://localhost:3000/incidents.html to show the database log.

## Note for presentation
Laptops have no motion sensor, so the accelerometer values are simulated.
The detection logic is the same one that will run on the phone sensor later.
