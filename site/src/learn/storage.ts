// What /learn keeps in the browser: the chosen language (sp-lang, shared with the rest of the site) and the learner
// code (sp-code). Storage can be unavailable (private mode, blocked site data): then the code is only shown on screen.
export const storage = {
  get(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key: string, value: string) {
    try {
      localStorage.setItem(key, value);
    } catch {
      /* storage unavailable */
    }
  },
};
