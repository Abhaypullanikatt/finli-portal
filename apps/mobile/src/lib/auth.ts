import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "financial-companion-access-token";
let webSessionToken: string | null = null;

export const getAccessToken = async () => {
  if (process.env.EXPO_OS === "web") {
    return webSessionToken ?? (__DEV__ ? "demo-token" : null);
  }
  const token = await SecureStore.getItemAsync(TOKEN_KEY);
  if (token) return token;
  return __DEV__ ? "demo-token" : null;
};

export const setAccessToken = async (token: string) => {
  if (process.env.EXPO_OS === "web") {
    webSessionToken = token;
    return;
  }
  await SecureStore.setItemAsync(TOKEN_KEY, token);
};

export const clearAccessToken = async () => {
  if (process.env.EXPO_OS === "web") {
    webSessionToken = null;
    return;
  }
  await SecureStore.deleteItemAsync(TOKEN_KEY);
};
