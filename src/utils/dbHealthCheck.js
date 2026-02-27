import supabase from "../config/supabase.js";

const dbConnectionCheck = async () => {
  try {
    const { error } = await supabase.from("users").select().limit(1);
    if (error) {
      console.log("Database connection Failed!");
      process.exit(1);
    }
    console.log("Database Connection Successful!");
  } catch (error) {
    console.log("Error Occured while Connecting to database!");
  }
};
export default dbConnectionCheck;
