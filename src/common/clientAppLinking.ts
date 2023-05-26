/**
 * paths to build our callback urls for an in-app browser redirection
 */
export enum DEEP_LINKING_PATHS {
  Navigation = "navigation",
  "Available Days Selection" = "available-days-selection/",
  "Available Event Days Selection" = "available-event-days-selection/",
}

export const combineUrlPaths = (paths: string[]): string => paths.join("/")
