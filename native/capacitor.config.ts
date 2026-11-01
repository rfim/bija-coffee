import type { CapacitorConfig } from '@capacitor/cli';

// Bija Coffee native shells. appId is a placeholder until Bija confirms its bundle id.
const config: CapacitorConfig = {
  appId: 'uk.co.bijalondon.app',
  appName: 'Bija',
  webDir: 'www',
  server: {
    androidScheme: 'https',
    // a real-looking https origin, so the app treats itself as the live app (Supabase backend) rather than localhost demo
    hostname: 'app.bijalondon.co.uk',
  },
  android: { allowMixedContent: false },
  ios: { contentInset: 'never', scheme: 'Bija' },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      launchAutoHide: false, // native-bridge.js hides it once the app has rendered
      backgroundColor: '#ffffff',
      showSpinner: false,
      androidScaleType: 'CENTER_INSIDE',
      splashFullScreen: false,
      splashImmersive: false,
    },
    // Android 15+ draws edge to edge: Capacitor passes the system bar sizes to the page as --safe-area-inset-* CSS variables
    SystemBars: { insetsHandling: 'css', style: 'LIGHT' },
    StatusBar: { style: 'LIGHT', backgroundColor: '#ffffff', overlaysWebView: false },
    PushNotifications: { presentationOptions: ['alert', 'sound'] },
    // native sign-in: only Google and Apple are bundled (no Facebook SDK); IDs live in native-bridge.js
    SocialLogin: { providers: { google: true, apple: true, facebook: false, twitter: false }, logLevel: 1 },
  },
};

export default config;
