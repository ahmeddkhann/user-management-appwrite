import { Client, Databases, Query, Account } from "appwrite";

const client = new Client ();
const account = new Account(client);
const database = new Databases (client)

client.setEndpoint(process.env.APPWRITE_ENDPOINT)
       .setProject(process.env.APPWRITE_PROJECT_ID)


async function uniqueUsername (username){
  try {
    const response = await database.listDocuments("usernames", 
      [Query.equal("username", username)]
    )
    if (response.documents.length > 0){
      return false
    }else{
      return true
    }
  } catch (error) {
    console.log("error while checking username uniqueness: ", error);
    
  }
}