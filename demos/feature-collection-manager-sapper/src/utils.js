import { UserSession } from "@esri/arcgis-rest-auth";

export function retryWithNewSession(error, fetch) {
  if (error.name === "ArcGISAuthError") {
    return fetch("/auth/exchange-token")
      .then(exchangeTokenResponse => {
        return exchangeTokenResponse.json();
      })
      .then(sessionInfo => {
        console.log(sessionInfo);
        const newSession = new UserSession(session);
        if (process.browser) {
          this.store.set({ session: newSession });
        } else {
          this.store.set({ session: sessionInfo });
        }
        return error.retry(newSession, 1);
      });
  }

  throw error;
}