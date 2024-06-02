import { Middleware } from "@reduxjs/toolkit";
import { Action } from "redux";
import { RootState } from "../store/store";

// Middleware для обработки действий
export const counterMiddleware: Middleware<{}, RootState> = (store) => (next) => (action: unknown) => {
    if ((action as Action<string>).type === "ok") {
        const { payload } = action as Action<string> & { payload?: any };
        if (payload) {
            console.info(`[Middleware] -- token saved`);
            localStorage.setItem('token', payload); // Сохранение токена в localStorage
        } else {
            console.warn(`[Middleware] -- token saved, but payload is empty`);
        }
    }
    return next(action as Action<string>);
};
