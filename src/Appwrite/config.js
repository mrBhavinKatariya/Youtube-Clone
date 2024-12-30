import conf from "../conf/conf";
import { Client, ID, Databases, Storage, Query, Permission, Role } from "appwrite";

export class Service {
    client = new Client();
    databases;
    bucket;

    constructor() {
        // Ensure conf has necessary values
        if (!conf.appwriteUrl || !conf.appwriteProjectId) {
            throw new Error("Appwrite configuration is missing or incomplete.");
        }

        this.client
            .setEndpoint(conf.appwriteUrl)
            .setProject(conf.appwriteProjectId);

        this.databases = new Databases(this.client);
        this.bucket = new Storage(this.client);
    }

    async createPost({ title, slug, content, featuredImage, status, userId }) {
        try {
            const permissions = [
                Permission.read(Role.user(userId)), // Allow only the creator to read
                Permission.update(Role.user(userId)), // Allow only the creator to update
                Permission.delete(Role.user(userId)) // Allow only the creator to delete
            ];

            return await this.databases.createDocument(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionId,
                slug,
                {
                    title,
                    content,
                    featuredImage,
                    status,
                    userId,
                },
                permissions
            );
        } catch (error) {
            console.error("Appwrite Service :: createPost :: Error:", error.message);
            throw new Error("Failed to create post. Ensure the user has appropriate permissions.");
        }
    }

    async updatePost(slug, { title, content, featuredImage, status }) {
        try {
            return await this.databases.updateDocument(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionId,
                slug,
                {
                    title,
                    content,
                    featuredImage,
                    status,
                }
            );
        } catch (error) {
            console.error("Appwrite Service :: updatePost :: Error:", error.message);
            throw new Error("Failed to update post. Ensure the user has appropriate permissions.");
        }
    }

    async deletePost(slug) {
        try {
            await this.databases.deleteDocument(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionId,
                slug
            );
            return true;
        } catch (error) {
            console.error("Appwrite Service :: deletePost :: Error:", error.message);
            return false;
        }
    }

    async getPost(slug) {
        try {
            return await this.databases.getDocument(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionId,
                slug
            );
        } catch (error) {
            console.error("Appwrite Service :: getPost :: Error:", error.message);
            throw new Error("Failed to fetch post. Ensure the user has appropriate permissions.");
        }
    }

    async getPosts(queries = [Query.equal("status", "active")]) {
        try {
            return await this.databases.listDocuments(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionId,
                queries
            );
        } catch (error) {
            console.error("Appwrite Service :: getPosts :: Error:", error.message);
            throw error;
        }
    }

    async uploadFile(file, userId) {
        try {
            const permissions = [
                Permission.read(Role.user(userId)),
                Permission.update(Role.user(userId)),
                Permission.delete(Role.user(userId)),
            ];

            return await this.bucket.createFile(
                conf.appwriteBucketId,
                ID.unique(),
                file,
                permissions
            );
        } catch (error) {
            console.error("Appwrite Service :: uploadFile :: Error:", error.message);
            throw new Error("Failed to upload file. Ensure the user has appropriate permissions.");
        }
    }

    async deleteFile(fileId) {
        try {
            await this.bucket.deleteFile(
                conf.appwriteBucketId,
                fileId
            );
            return true;
        } catch (error) {
            console.error("Appwrite Service :: deleteFile :: Error:", error.message);
            return false;
        }
    }

    getFilePreview(fileId) {
        try {
            return this.bucket.getFilePreview(
                conf.appwriteBucketId,
                fileId
            );
        } catch (error) {
            console.error("Appwrite Service :: getFilePreview :: Error:", error.message);
            throw new Error("Failed to get file preview.");
        }
    }
}

const service = new Service();

export default service;
