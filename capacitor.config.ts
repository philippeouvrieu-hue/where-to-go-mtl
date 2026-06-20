import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.whatsthemove.mtl",
  appName: "What's the Move",
  webDir: "dist",
  // En production, utilise le build local
  // En dev, décommente la ligne server pour live reload :
  // server: { url: "https://where-to-go-mtl.vercel.app", cleartext: true },
  ios: {
    contentInset: "always",
    preferredContentMode: "mobile",
    backgroundColor: "#080808",
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0, // On gère le splash nous-mêmes dans React
      backgroundColor: "#080808",
    },
    StatusBar: {
      style: "dark",
      backgroundColor: "#080808",
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
  },
};

export default config;
