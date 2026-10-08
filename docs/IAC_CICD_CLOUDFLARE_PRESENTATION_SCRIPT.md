# Presentation Script: Infrastructure as Code, Automated Compliance & CI/CD Pipeline with Cloudflare
**Project:** CT Live / Bassac Live Concert Ticketing Platform  
**Target Audience:** Evaluation Panel, Technical Judges & Operations Manager (Mr. Ratana)  
**Repository:** [`mai12122/CT`](https://github.com/mai12122/CT)

---

## 🎯 Presentation Overview & Delivery Guide

* **Section Duration:** Approximately 5 to 7 minutes.
* **Tone:** Confident, engineering-driven, security-first, and data-backed.
* **Visual Aids to Show on Screen:**
  1. Slide 8 (IaC & Automated Compliance Testing) from the presentation deck.
  2. GitHub Actions CI/CD Pipeline execution UI (`.github/workflows/ci-cd.yml`).
  3. Live terminal showing `python terraform/tests/test_iac.py` passing 21/21 tests.
  4. Live phone demo connecting through Cloudflare Tunnel (`npm run demo:cloudflare`).

---

## 🎙️ PART 1: Infrastructure as Code (IaC) & Automated Compliance Testing

### 🗣️ Spoken Script (Word-for-Word):

> "Good morning, members of the evaluation committee and Mr. Ratana.
>
> In high-concurrency event platforms, the number-one cause of catastrophic cloud outages and security breaches is **human error**—what the cloud industry calls 'ClickOps'—where an engineer manually configures a setting in the AWS Web Console, forgets to document it, or accidentally leaves a port open to the internet.
>
> In our project, **manual cloud configuration is strictly forbidden**. Every single server, database, firewall, subnet, and alarm is codified declaratively in **Terraform** inside our `terraform/` directory. If it isn’t defined in code, it does not exist in our cloud.
>
> But we took this a critical step further. Having Terraform code is not enough if a developer can accidentally write an insecure Terraform resource. That is why we built an **Automated Compliance Testing Engine** using Python, codified in `terraform/tests/test_iac.py` and `test_security_rules.py`.
>
> Before any infrastructure code can touch AWS, our automated test suite runs 21 deterministic assertions that mathematically prove our architecture adheres to every architectural and security rule:
>
> 1. **Rule S1 — Physical Database Isolation:** Our test inspects `database.tf` and `network.tf` to verify that `publicly_accessible` is set to `false`, and that our database route table contains **zero route to `0.0.0.0/0`**. The database is physically unroutable from the public internet.
>
> 2. **Rule S2 — Zero Public S3 Exposure:** The test suite verifies that all four Amazon S3 'Block Public Access' flags are enabled, and that CloudFront is explicitly configured with **Origin Access Control (OAC)** using AWS Signature Version 4 (`sigv4`).
>
> 3. **Rule S3 — Enterprise Encryption:** It verifies that AWS KMS Customer-Managed Keys (CMK) with automated 365-day rotation are wired to encrypt our PostgreSQL storage, S3 asset buckets, and SNS alerting topics.
>
> 4. **Rule S4 — Chained Security Groups:** The test verifies that our database security group on port 5432 accepts ingress **strictly from the Application Security Group ID**. It asserts that zero IP CIDR ranges exist in the rule.
>
> 5. **Rule R2 & R6 — High Availability & Surge Readiness:** The test asserts that our Auto Scaling Group includes our scheduled pre-warming action at **08:50 AM** to jump to 6 instances before the 09:00 AM rush, and confirms that Multi-AZ is enabled across both compute and database tiers.
>
> 6. **Production Guardrails:** It validates that IMDSv2 token enforcement is required on all EC2 instances to eliminate SSRF attacks, deletion protection is active, and no credentials are hardcoded into variables.
>
> *(Point to screen or execute terminal command)*:
> When we run `python terraform/tests/test_iac.py`, all **21 tests pass with 100% compliance** in under two seconds. Security is not an afterthought; it is an automated build gate."

---

## 🎙️ PART 2: The CI/CD Pipeline & Cloudflare Processing

### 🗣️ Spoken Script (Word-for-Word):

> "Now, let’s examine how this translates into our automated delivery pipeline. 
>
> Our production deployment is managed through a fully automated GitHub Actions workflow defined in `.github/workflows/ci-cd.yml`. This pipeline consists of **five automated stages**, operating on every push and pull request:
>
> ### Stage 1: Backend Integration & IaC Compliance Verification
> The pipeline spins up a real PostgreSQL 16 container service in GitHub Actions, initializes Prisma, pushes the database schema, runs our backend integration test suite, and immediately executes our Python IaC compliance tests. If an engineer makes even a one-line mistake in a firewall rule or database config, **the pipeline fails here and halts the deployment**.
>
> ### Stage 2: Frontend Lint, Typecheck & Expo Web Export
> Next, the pipeline validates our React Native / Expo application. It runs strict TypeScript typechecking with `tsc --noEmit`, runs ESLint, and exports our production web application into optimized static bundles using `npm run build:web`.
>
> ### Stage 3: Multi-Stage Container Matrix
> The pipeline utilizes Docker Buildx to build three isolated container targets in parallel: our production Node.js API runtime, our database migration container, and our web runner.
>
> ### Stage 4: Production Edge Deployment with Cloudflare
> This brings us to our edge deployment layer. In high-demand ticketing, routing all frontend traffic through traditional servers is obsolete. 
>
> In Stage 4, our pipeline uses **Wrangler** to deploy our frontend application directly to the **Cloudflare Global Anycast Edge Network**. 
>
> Look at our configuration in `wrangler.json` and `worker.js`:
> - Cloudflare serves all static assets, concert posters, and seat maps directly from edge caches across 300+ global cities with **0ms cold-start latency**.
> - For dynamic API operations, our Cloudflare Worker acts as an intelligent edge reverse-proxy: any request to `/api/*` is routed with sub-millisecond precision to our AWS Application Load Balancer in Singapore.
> - This delivers two massive benefits: first, our AWS EC2 instances experience zero traffic for static media. Second, Cloudflare absorbs Layer 3, Layer 4, and Layer 7 DDoS floods at the edge before any malicious packet can touch our AWS VPC."

---

## 🎙️ PART 3: The Cloudflare Zero-Trust Tunnel Demonstration

### 🗣️ Spoken Script (Word-for-Word):

> "To prove the power of our architecture during today's live defense, we have also implemented **Cloudflare Tunnel (`cloudflared`)**, configured in `scripts/start-cloudflare-demo.js`.
>
> *(Hold up your mobile phone or point to the live browser)*:
>
> Right now, our ticketing application is running live on this laptop on local port 8000. Through Cloudflare Quick Tunnel, it is accessible to the entire world over the internet on our mobile devices via HTTPS.
>
> But here is the critical engineering question the evaluators must ask: **How is this application published to the public internet?**
>
> - **We have NO public IP address.**
> - **We have NO custom domain DNS record.**
> - **We have ZERO open inbound firewall ports.**
>
> If we inspect the network on this machine using `netstat -an | findstr "8000"`, you can see that port 8000 is listening strictly on `127.0.0.1`—the loopback interface. No outside computer can connect to it.
>
> How does Cloudflare make it accessible?
>
> When `cloudflared` launches, it establishes a secure, encrypted **outbound-only tunnel** over QUIC/HTTP2 to the nearest Cloudflare edge data center. When a fan visits the URL on their mobile phone, Cloudflare terminates their request at the edge and relays it down that existing outbound tunnel.
>
> **This mirrors the exact defense-in-depth philosophy of our AWS architecture:**
> Just like this laptop, our AWS EC2 application servers and RDS database reside in **Private and Isolated Subnets with zero public IP addresses**. No internet attacker can ever initiate a connection directly to our compute or database nodes. All traffic flows strictly through controlled, authenticated edge proxies.
>
> And the moment I terminate the local process, the public tunnel URL immediately returns a 502 Bad Gateway, proving that no persistent or insecure backdoor was ever opened."

---

## 💡 PART 4: Evaluator Q&A Defense Script (Anticipated Tough Questions)

### Q1: "Why did you write custom Python tests for Terraform instead of just running `terraform validate`?"
> **Your Answer:**  
> "`terraform validate` only checks syntax and internal consistency—for example, whether brackets match and whether resource types exist. It does NOT enforce business security policies. `terraform validate` will gladly allow an S3 bucket with `public_read` or an RDS database with `publicly_accessible = true`. Our Python test suite in `test_security_rules.py` parses the AST and resource declarations to enforce semantic security compliance: verifying the absence of `0.0.0.0/0` in database routes, demanding chained security group IDs, and ensuring pre-warming schedules exist ahead of the flash sale."

### Q2: "How does Cloudflare compare with AWS CloudFront for this ticketing project?"
> **Your Answer:**  
> "Both are enterprise-grade CDNs, but they offer distinct advantages:
> 1. **Cold Starts:** AWS EC2 takes 3 to 5 minutes to scale and boot, requiring scheduled pre-warming at 08:50 AM. Cloudflare Workers run on V8 isolates with **0ms cold start**, handling immediate 10,000-user surges instantly without pre-warming.
> 2. **Bandwidth Costs:** AWS charges up to $0.09 per gigabyte for data egress. Cloudflare R2 and Cloudflare CDN offer **$0 egress fees**, which cuts media distribution costs by over 75% for heavy concert posters and seat maps.
> 3. **Hybrid Synergy:** In our production design, using Cloudflare at the edge in front of our AWS multi-AZ VPC gives us the best of both worlds: unmetered edge protection and DDoS mitigation upfront, backed by AWS's robust Multi-AZ relational ACID PostgreSQL database at the core."

### Q3: "What happens if a developer tries to push code with hardcoded credentials or disabled deletion protection?"
> **Your Answer:**  
> "Our CI/CD pipeline immediately catches it in Job 1. The tests `test_no_hardcoded_credentials_in_variables` and `test_rds_deletion_protection_enabled` will fail with exit code 1. GitHub Actions blocks the merge, the deployment never triggers, and production remains protected."

---

## 🛠️ PART 5: Live Defense Command Cheatsheet

Keep this cheatsheet open during your presentation to run the live commands smoothly:

```bash
# 1. Run Automated IaC Security Compliance Tests (Shows 21/21 PASS)
python terraform/tests/test_iac.py

# 2. Run Backend Unit & Auth Integration Tests
npm test

# 3. Start Cloudflare Tunnel Demo (Generates Live Public Phone URL)
npm run demo:cloudflare

# 4. Prove Zero Inbound Ports on Windows (Loopback Only)
netstat -an | findstr "8000"
```
