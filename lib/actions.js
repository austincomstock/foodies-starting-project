"use server"; // Since we are importing this to a 'use client' component, we add the 'use server' directive to explicitly keep this code server side.

import { redirect } from "next/navigation";
import { saveMeal } from "./meals";
import { revalidatePath } from "next/cache";

function isInvalidText(text) {
  return !text || text.trim() === "";
}

// Here we are creating our form object for the share meal form
// Since we are passing shareMeal as a value in useFormState in ShareMealPage, we need to include prevState as a parameter here so useFormState can pass it to shareMeal when the form gets submitted.
// We aren't using prevState here but we still need to accept it because formData is the second argument we are getting, not the first.
export async function shareMeal(prevState, formData) {
  // This is our form object
  const meal = {
    title: formData.get("title"),
    summary: formData.get("summary"),
    instructions: formData.get("instructions"),
    image: formData.get("image"),
    creator: formData.get("name"),
    creator_email: formData.get("email"),
  };

  if (
    isInvalidText(meal.title) ||
    isInvalidText(meal.summary) ||
    isInvalidText(meal.instructions) ||
    isInvalidText(meal.creator) ||
    isInvalidText(meal.creator_email) ||
    !meal.creator_email.includes("@") ||
    !meal.image ||
    meal.image.size === 0
  ) {
    return {
      message: "Invalid input.",
    };
  }

  console.log(meal);
  await saveMeal(meal);
  revalidatePath("/meals"); // This tells Next.js to revalidate the cache that belongs to a certain route path. Here we are only revalidating /meals. If we wanted to revalidate all the pages of our website we could do revalidatePath('/', 'layout');.
  redirect("/meals");
}
