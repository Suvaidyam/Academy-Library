import ENV from "../config/config.js";
import { FrappeApiClient } from "./FrappeApiClient.js";
export async function authService() {
        let frappe_client = new FrappeApiClient();
        async function login(username,password){
            try {
                // Await if it's async
                let response = await frappe_client.login('/login', username, password);
                console.log("response", response);
                // Optional: Close modal or redirect
                document.getElementById('id01').style.display = 'none';
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        }
        
}