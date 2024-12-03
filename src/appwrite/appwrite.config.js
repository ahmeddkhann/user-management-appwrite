import { Client, Databases, Query, Account } from "appwrite";

// Initialize Appwrite Client and Services
const client = new Client();
client
  .setEndpoint("https://cloud.appwrite.io/v1")
  .setProject("674ea8a5003cd595686f");

const database = new Databases(client);
const account = new Account(client);

// Sign up a new user without checking for unique username or email
export async function signUpUser(username, email, name, phone, password, role) {
  if (!username || !email || !name || !phone || !password || !role) {
    return { error: "All of the fields are required." };
  }

  try {
    // Create user in Appwrite
    const user = await account.create("unique()", email, password, name);

    // Save username in the database without checking for uniqueness
    await database.createDocument("usernames", "unique()", {
      username: username,
      userId: user.$id,
    });

    // Save email in the database without checking for uniqueness
    await database.createDocument("emails", "unique()", {
      email: email,
      userId: user.$id,
    });

    // Save additional fields in a user profile collection
    await database.createDocument("users", "unique()", {
      userId: user.$id,
      phone: phone,
      role: role,
    });

    return {
      success: true,
      message: "User signed up successfully.",
      userId: user.$id,
    };
  } catch (error) {
    console.log("Error during signup process: ", error);
    return { error: "An error occurred during signup. Please try again." };
  }
}

// Log in a user using email and password
export async function loginUser(email, password) {
  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  try {
    // Step 1: Check if the email exists
    const emailResponse = await database.listDocuments("emails", [
      Query.equal("email", email),
    ]);

    if (emailResponse.total === 0) {
      return { error: "Invalid email. Please try again." };
    }

    // Step 2: Log in using the email and password
    const session = await account.createEmailSession(email, password);

    // Step 3: Retrieve the user's role from the 'users' collection using userId
    const userRecord = emailResponse.documents[0];
    const userProfileResponse = await database.listDocuments("users", [
      Query.equal("userId", userRecord.userId),
    ]);

    if (userProfileResponse.total === 0) {
      return { error: "User profile not found. Please try again." };
    }

    const userProfile = userProfileResponse.documents[0];
    const userRole = userProfile.role; // Retrieve the role from the user profile

    return {
      success: true,
      message: "Login successful.",
      sessionId: session.$id,
      role: userRole, // Return the role along with the login success
    };
  } catch (error) {
    console.log("Error during login: ", error);
    return { error: "Invalid credentials. Please try again." };
  }
}

// Log out a user
export async function logoutUser() {
  try {
    // Delete the current user session
    await account.deleteSession("current");
    return { success: true, message: "Logout successful." };
  } catch (error) {
    console.log("Error during logout: ", error);
    return { error: "An error occurred during logout. Please try again." };
  }
}
