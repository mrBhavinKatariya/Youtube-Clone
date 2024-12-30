import conf from "../conf/conf";
import { Client, Account, ID } from "appwrite";

export class AuthService {
    client = new Client();
    account;

    constructor() {
        if (!conf.appwriteUrl || !conf.appwriteProjectId) {
            throw new Error("Appwrite configuration is missing or incomplete.");
        }

        this.client
            .setEndpoint(conf.appwriteUrl)
            .setProject(conf.appwriteProjectId);
        this.account = new Account(this.client);
    }

    async createAccount({ email, password, name }) {
        try {
            const userAccount = await this.account.create(ID.unique(), email, password, name);
            console.log(userAccount);
            
            if (userAccount) {
                console.log("Account created successfully:", userAccount);
                return await this.login({ email, password });
            }
            throw new Error("Account creation failed.");
        } catch (error) {
            console.error("Error creating account:", error.message, error.response);
            throw error;
        }
    }

    // Updated login function using createEmailSession instead of createSession
    async login({ email, password }) {
        try {
            console.log("Login successful, session created:");
            // Use createEmailSession instead of createSession
            const session = await this.account.createEmailSession(email, password);
            return session;
        } catch (error) {
            console.error("Login error:", error.message, error.response);
            throw error;
        }
    }

    async getCurrentUser() {
        try {
            console.log("Fetching current user...");
            const user = await this.account.get();
            console.log("User details:", user);
            return user;
        } catch (error) {
            console.error("Error fetching current user:", error.code, error.message, error.response);
            throw error;
        }
    }

    async logout() {
        try {
            await this.account.deleteSessions();
            console.log("User logged out successfully.");
        } catch (error) {
            console.error("Logout error:", error.message, error.response);
            throw error;
        }
    }
}

const authService = new AuthService();

export default authService;
