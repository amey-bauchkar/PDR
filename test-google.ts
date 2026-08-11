import { google } from "npm:googleapis@126.0.1"

const email = "test@example.com"
const key = "-----BEGIN PRIVATE KEY-----\nMIIC+...\n-----END PRIVATE KEY-----"

try {
  const auth = new google.auth.JWT({ 
    email, 
    key, 
    scopes: ['https://www.googleapis.com/auth/spreadsheets'] 
  })
  console.log("JWT initialized successfully")
  
  // We can't actually authenticate without a real key, but we can see if it throws on init.
} catch (e) {
  console.error("Error:", e)
}
