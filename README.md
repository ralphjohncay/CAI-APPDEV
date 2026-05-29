This is a new [**React Native**](https://reactnative.dev) project, bootstrapped using [`@react-native-community/cli`](https://github.com/react-native-community/cli).

# RALPHS Footwear — React Native app

Mobile client for the **RALPHS Footwear** Symfony 7 + API Platform backend. Catalog, cart, checkout, and orders use the **same MySQL database** as the website (no local mock catalog).

## Backend API URL

**Production (default)** — `src/config/api.js`:

```js
export const API_BASE_URL = 'https://finalscay-production.up.railway.app';
```

Health check: `GET https://finalscay-production.up.railway.app/health` → `OK`  
API docs: https://finalscay-production.up.railway.app/api/docs

Copy `.env.example` → `.env` (optional). All requests use `${API_BASE_URL}/api/...` via `getApiBaseUrl()` — never hardcode URLs in screens.

### Railway (production)

No env var needed; the app points at Railway by default. Use a **user that exists in the production MySQL database**.

```powershell
npm start
npm run android   # or npm run ios
```

### Local Symfony (`symfony serve`)

Override before starting Metro (restart Metro after changing):

| Target | `EXPO_PUBLIC_API_URL` |
|--------|------------------------|
| iOS Simulator / web | `http://127.0.0.1:8000` |
| Android Emulator | `http://10.0.2.2:8000` |
| Physical device (Wi‑Fi) | `http://<YOUR_PC_LAN_IP>:8000` |

```powershell
$env:EXPO_PUBLIC_API_URL="http://127.0.0.1:8000"
npm start
```

Or copy `src/config/api.local.example.ts` → `api.local.ts` and set `API_URL_OVERRIDE`.

### Dev login (after `doctrine:fixtures:load`)

| Email | Password | Role |
|-------|----------|------|
| customer@shoes.com | customer123 | Customer |
| staff@shoes.com | staff123 | Staff |
| admin@shoes.com | admin123 | Admin |

Users can log in **without email verification** (only disabled accounts are blocked).

### Live sync with the admin website

- Products, services, prices, stock, and `active` flags come from `GET /api/products` and `GET /api/services` (same MySQL tables as admin).
- Deactivating a product in admin hides it on the next app refresh or when revisiting Shop/Services.
- Checkout uses `POST /api/orders/checkout` (writes the same `orders` / `order_items` tables the staff panel uses).
- Order status changes in admin (approve, complete, cancel) appear after pull-to-refresh or reopening **Orders**.

### API endpoints used by the app

| Action | Endpoint |
|--------|----------|
| Login | `POST /api/login` |
| Register | `POST /api/register` |
| Profile | `GET /api/me` |
| Catalog | `GET /api/products`, `GET /api/services` (public; auto-retries with JWT if required) |
| Checkout | `POST /api/orders` (`items` or `orderItems`; customer from JWT) |
| My orders | `GET /api/my-orders` (alias `/api/orders/mine`) → `{ "success", "orders": [...] }` |
| App notifications | `GET /api/notifications` → `{ "success", "notifications": [...] }` (public; polls every 60s) |
| Login | `{ "success", "token", "user": { id, email, name, roles } }` |

### Notification bar (mobile + admin)

- **Admin:** **App Notifications** in the admin sidebar (`/admin/notifications`) — create/edit messages; they sync to the app via the same Railway API.
- **API:** `GET /api/notifications` (no auth required; logged-in users also see `customers` audience).
- **Deploy backend:** run `php bin/console doctrine:migrations:migrate` on Railway/local Symfony before notifications appear.
- **App:** bar at the top; dismiss is local; pull-to-refresh on screens still works; new admin messages show within ~60s or when returning to the app.

### Test checklist (Railway)

1. Log in with a production DB user (`POST /api/login`).
2. Shop loads from `GET /api/products` (pull-to-refresh / reopen screen).
3. Add a product in website admin → appears in app after refresh.
4. Place order in app → visible in website admin orders.
5. `GET /api/orders/mine` shows the new order.

---

# Getting Started

> **Note**: Make sure you have completed the [Set Up Your Environment](https://reactnative.dev/docs/set-up-your-environment) guide before proceeding.

## Step 1: Start Metro

First, you will need to run **Metro**, the JavaScript build tool for React Native.

To start the Metro dev server, run the following command from the root of your React Native project:

```sh
# Using npm
npm start

# OR using Yarn
yarn start
```

## Step 2: Build and run your app

With Metro running, open a new terminal window/pane from the root of your React Native project, and use one of the following commands to build and run your Android or iOS app:

### Android

```sh
# Using npm
npm run android

# OR using Yarn
yarn android
```

### iOS

For iOS, remember to install CocoaPods dependencies (this only needs to be run on first clone or after updating native deps).

The first time you create a new project, run the Ruby bundler to install CocoaPods itself:

```sh
bundle install
```

Then, and every time you update your native dependencies, run:

```sh
bundle exec pod install
```

For more information, please visit [CocoaPods Getting Started guide](https://guides.cocoapods.org/using/getting-started.html).

```sh
# Using npm
npm run ios

# OR using Yarn
yarn ios
```

If everything is set up correctly, you should see your new app running in the Android Emulator, iOS Simulator, or your connected device.

This is one way to run your app — you can also build it directly from Android Studio or Xcode.

## Step 3: Modify your app

Now that you have successfully run the app, let's make changes!

Open `App.tsx` in your text editor of choice and make some changes. When you save, your app will automatically update and reflect these changes — this is powered by [Fast Refresh](https://reactnative.dev/docs/fast-refresh).

When you want to forcefully reload, for example to reset the state of your app, you can perform a full reload:

- **Android**: Press the <kbd>R</kbd> key twice or select **"Reload"** from the **Dev Menu**, accessed via <kbd>Ctrl</kbd> + <kbd>M</kbd> (Windows/Linux) or <kbd>Cmd ⌘</kbd> + <kbd>M</kbd> (macOS).
- **iOS**: Press <kbd>R</kbd> in iOS Simulator.

## Congratulations! :tada:

You've successfully run and modified your React Native App. :partying_face:

### Now what?

- If you want to add this new React Native code to an existing application, check out the [Integration guide](https://reactnative.dev/docs/integration-with-existing-apps).
- If you're curious to learn more about React Native, check out the [docs](https://reactnative.dev/docs/getting-started).

# Troubleshooting

If you're having issues getting the above steps to work, see the [Troubleshooting](https://reactnative.dev/docs/troubleshooting) page.

# Learn More

To learn more about React Native, take a look at the following resources:

- [React Native Website](https://reactnative.dev) - learn more about React Native.
- [Getting Started](https://reactnative.dev/docs/environment-setup) - an **overview** of React Native and how setup your environment.
- [Learn the Basics](https://reactnative.dev/docs/getting-started) - a **guided tour** of the React Native **basics**.
- [Blog](https://reactnative.dev/blog) - read the latest official React Native **Blog** posts.
- [`@facebook/react-native`](https://github.com/facebook/react-native) - the Open Source; GitHub **repository** for React Native.
