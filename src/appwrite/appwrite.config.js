"use client";

import { useState } from "react";
import { Client, Databases, Query, Account } from "appwrite";

const client = new Client();
const account = new Account(client);
const database = new Databases(client);

client
  .setEndpoint("https://cloud.appwrite.io/v1") // Replace with your endpoint
  .setProject("674ea8a5003cd595686f"); // Replace with your project ID

async function uniqueUsername(username) {
  try {
    const response = await database.listDocuments("usernames", [
      Query.equal("username", username),
    ]);
    return response.documents.length === 0;
  } catch (error) {
    console.log("Error while checking username uniqueness:", error);
    throw error;
  }
}

async function uniqueEmail(email) {
  try {
    const response = await database.listDocuments("emails", [
      Query.equal("email", email),
    ]);
    return response.documents.length === 0;
  } catch (error) {
    console.log("Error while checking email uniqueness:", error);
    throw error;
  }
}

export async function signUpUser(username, email, password, name, phone) {
  try {
    if (!username || !email || !password || !name || !phone) {
      return { error: "All fields are required" };
    }

    // Create user account
    const user = await account.create("unique()", email, password, name);

    // Add data to database collections
    await database.createDocument("usernames", "unique()", { username, userId: user.$id });
    await database.createDocument("emails", "unique()", { email, userId: user.$id });
    await database.createDocument("names", "unique()", { name, userId: user.$id });
    await database.createDocument("phones", "unique()", { phone, userId: user.$id });

    return {
      success: true,
      message: "User signed up successfully",
      userId: user.$id,
    };
  } catch (error) {
    console.log("Error while signing up the user:", error);
    return { error: error.message || "An unexpected error occurred" };
  }
}

