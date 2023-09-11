#!/usr/bin/env bun

/** 
 * Reddit username.
 * @type {string}
 */
const username = "thisisbillgates";

/** 
 * Directory to save comments.
 * @type {string}
 */
const dir = Bun.file("reddit-comments");

/**
 * Fetch user's latest comments from Reddit.
 *
 * @param {string} username - The Reddit username.
 * @param {?string} after - The ID after which to fetch comments.
 * @returns {Promise<void>} - A promise that resolves when the operation is complete.
 * @throws Will throw an error if the HTTP request is not successful.
 */
async function fetchUserComments(username, after = null) {
  let url = `https://www.reddit.com/user/${username}/comments/.json`;
  if (after) {
    url += `?after=${after}`;
  }

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("HTTP error " + response.status);
  }

  const json = await response.json();

  const file = await Bun.file(`comments.txt`);
  const writer = file.writer();

  // Save each comment body to a text file
  for (const comment of json.data.children) {
    const encoder = new TextEncoder();
    const data = encoder.encode(comment.data.body);
    writer.write(data);
  }

  // If there are more comments, fetch the next page
  if (json.data.after) {
    await fetchUserComments(username, json.data.after);
  }
}

// /**
//  * Ensure the directory exists.
//  *
//  * @param {string} dir - The directory to check or create.
//  * @returns {Promise<void>} - A promise that resolves when the operation is complete.
//  * @throws Will throw an error if the operation is not successful.
//  */
// async function ensureDir(dir) {
//   try {
//     await Deno.stat(dir);
//   } catch (error) {
//     if (error instanceof Deno.errors.NotFound) {
//       await Deno.mkdir(dir);
//     } else {
//       throw error;
//     }
//   }
// }

// // Ensure directory and fetch user comments
// ensureDir(dir)
//   .then(() => fetchUserComments(username))
//   .catch(console.error);

fetchUserComments(username);