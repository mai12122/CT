# Section 2: Cloudflare Self-Hosting Demo Guide

**Scenario:** CT Live Concert & Festival Ticketing (Scenario 2)  
**Goal:** Publish the event web application from a laptop to the public internet with **no domain**, **no public IP**, and **zero open inbound firewall ports**, live during defense.

---

## 📋 Step-by-Step Defense Procedure

### Step 1: Start the Local Web App (Port 8000)
In Terminal 1 on your laptop, run:
```bash
node scripts/start-demo.js
```
* The server will boot on `http://localhost:8000`.
* Notice that it binds strictly to `127.0.0.1` (loopback).

---

### Step 2: Publish via Cloudflare Quick Tunnel
In Terminal 2, run:
```bash
cloudflared tunnel --url http://localhost:8000
```
* `cloudflared` connects **outbound** to CloudFront/Cloudflare edge servers.
* It will output a random public Quick Tunnel URL:
  ```text
  +--------------------------------------------------------------------------------------------+
  |  Your quick Tunnel has been created! Visit it at (it may take some time to be reachable):  |
  |  https://random-words-here.trycloudflare.com                                               |
  +--------------------------------------------------------------------------------------------+
  ```

---

### Step 3: Demonstrate Live on Mobile Phone
1. Disconnect your mobile phone from the local Wi-Fi and switch to **Mobile Data (4G/5G)**.
2. Open the `https://....trycloudflare.com` URL in your mobile browser.
3. **Show the evaluation panel:**
   * CT Live Music Hall header (2,000 capacity).
   * Event Poster (`posters/event-1.jpg`).
   * Hall Seat Map (`seatmaps/event-1.png`).
   * Ticket order interaction with buyer name and phone number.

---

### Step 4: Prove Zero Public IP & Zero Inbound Ports
In Terminal 3 on your laptop, run the network inspection command to prove to the evaluators that no inbound port is open to the internet:

* **On Windows (PowerShell):**
  ```powershell
  netstat -an | findstr "8000"
  ```
  *Show that port 8000 is listening on `127.0.0.1:8000` ONLY (not `0.0.0.0:8000`), meaning no machine on the internet or local LAN can reach it directly.*

* **On Linux / macOS:**
  ```bash
  ss -tlnp | grep 8000
  # or: netstat -an | grep 8000
  ```

* **Verify Public IP is absent on laptop interface:**
  ```bash
  curl -s ifconfig.me
  ```
  *(Show that the laptop's Wi-Fi interface only holds a private RFC 1918 IP like `192.168.x.x` or `10.x.x.x`).*

---

### Step 5: Stop the Tunnel & Prove URL Dies
1. Press `Ctrl + C` in Terminal 2 to terminate `cloudflared`.
2. Refresh the browser on your phone.
3. Show the screen: **"502 Bad Gateway"** or **"Error 1033: Argo Tunnel error"**.
4. This proves traffic was routed purely through the ephemeral tunnel, not through any port forwarding or persistent public route.

---

### Step 6: Defense Explanation (Question 7 Script)

> **Evaluator Question:**  
> *"Explain which direction the connection goes, and compare it with how your AWS design protects its own servers."*

> **Team Answer (Script):**  
> *"In a traditional web server setup, connections are **inbound**: internet clients initiate TCP connections directly to a public IP on the server, which requires punching a hole in the firewall (e.g. open port 80/443).  
> 
> With **Cloudflare Tunnel**, the connection is strictly **outbound-only**. The local `cloudflared` daemon on our laptop initiates an outbound TLS connection on port 7844 (QUIC/HTTP2) to the nearest Cloudflare Edge data centers. No inbound ports are ever opened on our laptop or home router. When a mobile buyer requests the website, Cloudflare terminates their request at the edge and proxies it back down the pre-existing outbound tunnel.
> 
> **Comparison with our AWS Architecture:**  
> We use the exact same security philosophy in our AWS design for CT Live:
> 1. Our EC2 application servers and RDS database live in **Private and Isolated Subnets with zero public IP addresses**.
> 2. No internet entity can directly connect inbound to our EC2 instances or database.
> 3. Only the Application Load Balancer accepts inbound traffic, while our EC2 instances communicate outbound via NAT Gateways strictly for system updates and CloudWatch telemetry—mirroring the outbound-only isolation demonstrated in this Cloudflare demo."*
