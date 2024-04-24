import fs from "node:fs"; // This is a file system (fs) API provided by Node.js

import sql from "better-sqlite3";
import slugify from "slugify"; // This will create a slug.
import xss from "xss"; // This will help protect against cross-site scripting attacks. See dangerouslySetInnerHTML in MealDetailsPage() function.

const db = sql("meals.db");

// getMeals
export async function getMeals() {
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // throw new Error("Loading meals failed");
  return db.prepare("SELECT * FROM meals").all();
}

// getMeal
export function getMeal(slug) {
  return db.prepare("SELECT * FROM meals WHERE slug = ?").get(slug);
}

// saveMeal
export async function saveMeal(meal) {
  meal.slug = slugify(meal.title, { lower: true }); // Here we are using the slugify function that we imported to convert title to lowercase.
  meal.instructions = xss(meal.instructions); // Here we are using the xss function that we imported to clean and sanitize the instructions.

  // Here we are storing the images in the public folder on the file system. We store on the file system (not database) because storing files on databases is bad for performance.
  // There are also disadvantages to storing user - uploaded images on the file system.
  // For example - storing uploaded files(or any other files that are generated at runtime) on the local filesystem is not a great idea - because those files will simply not be available in the running NextJS applications.Instead, it's recommended that you store such files (e.g., uploaded images) via some cloud file storage - like AWS S3, or Vercel Blob.
  const extension = meal.image.name.split(".").pop(); // Here we are splitting the image name at . and popping the extension off the end
  const fileName = `${meal.slug}.${extension}`; // Here we are using template literal to generate unique file name string and not file name of the user.

  const stream = fs.createWriteStream(`public/images/${fileName}`);
  const bufferedImage = await meal.image.arrayBuffer(); // arrayBuffer method will give a promise so that's why we use async await

  stream.write(Buffer.from(bufferedImage), (error) => {
    if (error) {
      throw new Error("Saving image failed!");
    }
  });

  meal.image = `/images/${fileName}`;

  db.prepare(
    `
    INSERT INTO meals
      (title, summary, instructions, creator, creator_email, image, slug)
    VALUES (
      @title,
      @summary,
      @instructions,
      @creator,
      @creator_email,
      @image,
      @slug
    )
  `
  ).run(meal);
}

//// update meal image after it's already submitted based on id
// const update = db.prepare("UPDATE meals SET image = ? WHERE id = ?");
// const mealsUpdate = update.run("/images/cookies.jpg", 8);
// console.log(mealsUpdate);
////

//// delete meal after it's already submitted based on id
// const deleteMeal = db.prepare("DELETE FROM meals WHERE id = ?");
// const mealsDelete = deleteMeal.run(8);
// console.log(mealsDelete);
////

//// console.log all meals
// const query = "SELECT * FROM meals";
// const meals = db.prepare(query).all();
// console.log(meals);
////
