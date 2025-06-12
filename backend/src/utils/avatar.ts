import { createAvatar } from '@dicebear/core';
import { pixelArt } from '@dicebear/collection';

/**
 * Generate an avatar SVG string with a random seed.
 * @returns {Object} SVG string of the generated avatar.
 */
export default function generateAvatar(): { url: string; name: string } {
  const seed = Math.floor(Math.random() * 100000) + 1; // Random seed between 1 and 100000
  const avatar = createAvatar(pixelArt, {
    seed: seed.toString(),
    // Add other options here if needed
  });
  const baseUrl = `https://api.dicebear.com/9.x/personas/svg?seed=${seed}&backgroundColor=c0aede`
  return {
    url: baseUrl,
    name: seed.toString()
  };
}