// Everything the site says lives here. Change the words, save, and reload the page.
// The company, the house, the prices and the contact details are invented for the demo.
//
// Pictures go in assets/house. A "file" is a picture's name without .jpg.
// Money is in lakh rupees (100 lakh = 1 crore), as a range: [low, high].
window.NEEV = {
  brand: "Neev",
  sub: "Homes",
  city: "Bengaluru",
  email: "build@neevhomes.example",
  phone: "+91 80 5550 0164",

  // The house in the film, and what it costs before any choices.
  house: {
    name: "The Courtyard House",
    line: "4 bedrooms, 3,200 sq ft, on a 50 × 80 ft plot",
  },
  base: [240, 270],

  // The opening film: one stage per stop on the way up.
  // "weekNo" is the week of the build the stage is reached.
  // Only the first and last stage need a picture ("file"); the film fills the rest.
  // When the film is in assets/film, "at" says where a stage falls in it
  // (0 = start, 1 = end). Without "at", the stages are spread evenly.
  stages: [
    {
      file: "plot",
      weekNo: 0,
      name: "Plot",
      title: "Your plot today. Your home in 44 weeks.",
      text: "Neev designs and builds one-off houses in Bengaluru. Scroll to watch one go up.",
    },
    {
      weekNo: 14,
      at: 0.45,
      name: "Structure",
      title: "Concrete first.",
      text: "Footings, columns and two slabs, each cured for 21 days. Nothing else starts until our engineer signs it off.",
    },
    {
      weekNo: 26,
      at: 0.64,
      name: "Walls",
      title: "Then brick by brick.",
      text: "Walls up, lintels cast, and every pipe and wire buried before the first coat of plaster.",
    },
    {
      file: "house",
      weekNo: 44,
      name: "Handover",
      title: "Keys in your hand.",
      text: "Plastered, painted, glazed and planted, and handed over on the date written in your contract.",
      button: "Choose your finishes",
    },
  ],

  // Rooms where the visitor picks a finish. The first option of each is
  // included in the base price; "add" is what the others add to it.
  // "swatch" is the colour of the dot on the option's button.
  rooms: [
    {
      id: "kitchen",
      name: "Kitchen",
      label: "Step inside · Kitchen",
      title: "Make it yours.",
      next: { text: "Next: the garden", href: "#garden" },
      options: [
        { file: "kitchen-1", name: "Ivory and teak", swatch: "#e6dcc6", add: [0, 0], text: "Ivory lacquer cabinets, a teak island and white quartz worktops." },
        { file: "kitchen-2", name: "Sage and terrazzo", swatch: "#93a383", add: [4, 6], text: "Sage green panelled cabinets with brass knobs and terrazzo worktops." },
        { file: "kitchen-3", name: "Charcoal and marble", swatch: "#3b3f44", add: [9, 13], text: "Charcoal fluted cabinets and white marble with a grey vein." },
      ],
    },
    {
      id: "garden",
      name: "Garden",
      label: "Step out back · Garden",
      title: "Finish the garden.",
      next: { text: "See your estimate", href: "#start" },
      options: [
        { file: "garden-1", name: "Lawn and frangipani", swatch: "#6c9a4a", add: [0, 0], text: "A flat lawn, a stepping-stone path and three frangipani trees." },
        { file: "garden-2", name: "Lap pool", swatch: "#37a3c2", add: [18, 24], text: "A 12 metre pool along the lawn, with a pale stone deck and two loungers." },
        { file: "garden-3", name: "Pavilion and fire pit", swatch: "#b6773c", add: [8, 11], text: "A teak pavilion with a table for eight, and a stone fire pit to sit around." },
      ],
    },
  ],

  start: {
    title: "Your build, on one sheet.",
    text: "This is an estimate, not a quote. After one visit to your plot we fix the price in writing, and it does not move unless you change the design.",
    button: "Start my build",
  },

  promises: [
    { title: "One fixed price", text: "Every bag of cement and every tap is listed before work starts." },
    { title: "Photos every Friday", text: "You see the site every week, wherever you are." },
    { title: "10 years on the structure", text: "Footings, columns, slabs and roof, in writing." },
  ],
};
