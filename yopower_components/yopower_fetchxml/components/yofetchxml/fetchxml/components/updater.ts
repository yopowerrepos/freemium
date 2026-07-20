import * as React from "react";

/** Resolves a React.SetStateAction against a known previous value, for callbacks that accept either form. */
export function resolveUpdate<T>(action: React.SetStateAction<T>, prev: T): T {
    return typeof action === "function" ? (action as (p: T) => T)(prev) : action;
}
