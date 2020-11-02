export class StorageManager {

    private static readonly USERNAME_KEY = "username";
    private static readonly PASSWORD_KEY = "password";
    private static readonly CONFIG_DIR_KEY = "configDir";

    static retrieveUsername(): string {
        return localStorage.getItem(this.USERNAME_KEY);
    }

    static saveUsername(username: string) {
        localStorage.setItem(this.USERNAME_KEY, username);
    }

    static retrievePassword(): string {
        return localStorage.getItem(this.PASSWORD_KEY);
    }

    static savePassword(password: string) {
        localStorage.setItem(this.PASSWORD_KEY, password);
    }

    static retrieveConfigDir(): string {
        return localStorage.getItem(this.CONFIG_DIR_KEY);
    }

    static saveConfigDir(configDir: string) {
        localStorage.setItem(this.CONFIG_DIR_KEY, configDir);
    }

}

