// Single place for numbers you'll tweak a lot.
export const GAME = {
  width: 960,
  height: 640,
  minigameDuration: 45, // seconds, per the design doc
};

export const PALETTE = {
  sky: [168, 214, 236],
  grass: [122, 176, 92],
  blanket: [212, 84, 84],
  cream: [247, 240, 220],
  ink: [40, 44, 38],
  accent: [242, 187, 68],
};

// Score thresholds that pick which outro you get.
export const OUTCOMES = [
  { id: "perfect", min: 120, title: "A Perfect Picnic" },
  { id: "good", min: 70, title: "A Pretty Good Picnic" },
  { id: "okay", min: 30, title: "A Slightly Soggy Picnic" },
  { id: "rough", min: 0, title: "The Ants Won" },
];
