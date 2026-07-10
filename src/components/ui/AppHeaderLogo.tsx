/**
 * ============================================================================
 *
 *                         JDM // ENGINEERING
 *                         JONATHAN DI MARTINO
 *                  Ingénieur Fullstack | Expert IA
 *
 * ============================================================================
 *
 * @file        AppHeaderLogo.tsx
 * @description Renders the BlockyNotes logo used in application headers.
 *
 * @project     BlockyNotes
 * @module      Components / UI
 *
 * @author      Ingénieur Jonathan DI MARTINO
 * @created     2026-05-11
 * @updated     2026-07-11
 * @version     1.0.0
 *
 * @license     Proprietary
 * @copyright   Copyright (c) 2026 Jonathan DI MARTINO
 *
 * @signature   JDM::FULLSTACK_AI_ENGINEERING
 * ============================================================================
 */
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
