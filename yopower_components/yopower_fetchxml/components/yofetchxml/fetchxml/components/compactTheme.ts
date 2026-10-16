import { Theme, webLightTheme } from "@fluentui/react-components";

/**
 * webLightTheme with the type ramp stepped down one notch, so the near full-screen designer fits
 * more on screen. Done through theme tokens rather than CSS overrides, so every Fluent component
 * (including those rendered in portals - popups, dialogs) scales consistently.
 */
export const compactTheme: Theme = {
    ...webLightTheme,
    fontSizeBase100: "9px",
    fontSizeBase200: "11px",
    fontSizeBase300: "12px",
    fontSizeBase400: "14px",
    fontSizeBase500: "16px",
    fontSizeBase600: "18px",
    lineHeightBase100: "12px",
    lineHeightBase200: "14px",
    lineHeightBase300: "16px",
    lineHeightBase400: "18px",
    lineHeightBase500: "22px",
    lineHeightBase600: "24px",
};
