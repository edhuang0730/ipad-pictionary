# 🎨 Pictionary Party (iPad Host + Phone Web Controllers)

A local-multiplayer Pictionary party game built with **React Native (Expo + TypeScript)** where an **iPad acts as both the drawing studio and the embedded local web server**, and **players connect with their phones' web browsers via QR code**.

---

## ✨ Features

- **Embedded Local HTTP + WebSocket Server on iPad**:
  - Uses `react-native-tcp-socket` + custom RFC 6455 WebSocket framing (`src/server/wsProtocol.ts` & `src/server/EmbeddedServer.ts`) to serve the mobile web client on `GET /` and stream real-time drawing strokes on `GET /ws`.
- **Phone Web Onboarding (Name + Selfie Simplification + Fullscreen)**:
  - Players scan the QR code on the iPad to open `http://<ipad-ip>:8080`.
  - Uses `<input type="file" accept="image/*" capture="user">` so the front-facing selfie camera works over plain local HTTP without HTTPS certificate warnings.
  - Automatically crops, posterizes/simplifies the selfie into a `128×128` circular cartoon avatar (`~5 KB`), and requests browser fullscreen mode (`requestFullscreen()` + persistent `[⛶ Fullscreen]` toggle + `100dvh` viewport lock).
- **Rapid-Fire Drawing & Real-Time Phone Mirroring**:
  - The player holding the iPad draws the secret word/phrase using a 12-color palette, 4 brush thicknesses, eraser, undo, clear, and a **Skip Word** button.
  - Connected phones mirror every stroke live at 60fps and prompt players to shout out their guesses.
  - When a player shouts the right answer, the drawer taps that player's selfie avatar on the iPad to award points (`+100` to guesser, `+50` to drawer) and immediately load the next word until the turn timer expires.
- **10-Second Intermissions & Multi-Round Podium**:
  - Between turns, a 10-second intermission screen announces who gets the iPad next and shows live standings.
  - After every player completes the configured number of rounds, the game finishes with a 1st/2nd/3rd place podium and MVP awards.

---

## 📦 Getting the `.IPA` File to Sideload onto Your iPad (from Windows)

Because Apple's iOS compiler (`xcodebuild`) only runs on macOS, this project includes an automated **GitHub Actions `.ipa` Builder** ([`.github/workflows/build-ipa.yml`](.github/workflows/build-ipa.yml)) that builds the native iOS app on GitHub's free macOS runners and packages an unsigned `Pictionary-iPad.ipa` ready for **Sideloadly**, **AltStore**, or **SideStore**.

### Step-by-Step Sideload Instructions
1. Push this repository to a GitHub repo (public repositories get free macOS Action minutes).
2. Open the **Actions** tab on GitHub and select **"Build Unsigned iPad .IPA for Sideloading"** $\rightarrow$ click **Run workflow**.
3. Once the workflow finishes (~4–6 minutes), download the **`Pictionary-iPad-IPA`** zip artifact and extract **`Pictionary-iPad.ipa`**.
4. Connect your iPad to your Windows PC and open **[Sideloadly](https://sideloadly.io/)** (or AltStore):
   - Drag `Pictionary-iPad.ipa` into Sideloadly.
   - Enter your Apple ID to sign and install the app onto your iPad.
   - On your iPad, go to **Settings $\rightarrow$ General $\rightarrow$ VPN & Device Management** and trust your developer certificate (and enable Developer Mode under **Privacy & Security** if on iPadOS 16+).
5. Launch **Pictionary Party** on your iPad and allow **Local Network Access** when prompted so phones can connect to the iPad's server!

---

## 💻 Instant Local Testing on Windows (Before Sideloading)

You can also play and test the entire iPad + Phone experience right away on your Windows machine:

1. **Start the LAN Companion Server** (Terminal 1):
   ```bash
   npm run lan-host
   ```
2. **Start the Host UI** (Terminal 2):
   ```bash
   npm run web
   ```
3. Scan the QR code displayed on the Host Lobby screen with your phone(s) connected to the same Wi-Fi network!

---

## 🧪 Running Tests & Typechecking

```bash
npm run typecheck
npm test
```
