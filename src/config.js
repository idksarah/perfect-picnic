// Single place for numbers you'll tweak a lot.
export const GAME = {
  width: 960,
  height: 640,
  minigameDuration: 45, // seconds, per the design doc
};

export const PALETTE = {
  sky: [168, 214, 236],
  grass: [122, 176, 92],
  blanket: [230, 126, 110],
  cream: [247, 240, 220],
  ink: [40, 44, 38],
  border: [235, 152, 179],
  accent: [242, 187, 68],
  basket: [143, 89, 54],
  target: [255, 255, 255],
  sand: [251, 245, 226],
  sandwichBorder: [143, 89, 54],
  lemonadeBorder: [242, 187, 68],
  chipsBorder: [26, 97, 128]
};

// Score thresholds that pick which outro you get.
export const OUTCOMES = [
  { id: "perfect", min: 120, title: "AWESOME picnic!!" },
  { id: "good", min: 70, title: "good picnic!" },
  { id: "rough", min: 0, title: "rough-ahh picnic" },
];
