import { Image } from "react-native";

const appLogo = require("../../../assets/logo.png");

export function AppHeaderLogo() {
  return (
    <Image
      source={appLogo}
      resizeMode="contain"
      style={{
        width: 58,
        height: 58
      }}
    />
  );
}
