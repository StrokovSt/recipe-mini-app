import "dotenv/config";

import { createAccount } from "../api/telegraph";

const account = await createAccount("RecipeBot");
console.log("Твой TELEGRAPH_TOKEN:", account.access_token);