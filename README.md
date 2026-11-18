# NEEV · Homes

A scroll site for a custom home builder. Scrolling plays a house going up on an empty plot, from marked-out earth to handover. Below it the visitor picks a kitchen and a garden, and the estimate in the header changes with every choice. The last section lists the choices on one sheet, with a form to start the build.

"Neev" is a demo brand. The company, the house, the prices and the contact details are invented.

Plain HTML, CSS and JavaScript. No build step and no dependencies.

## Run it
```bash
python -m http.server 5192
```
Then open http://localhost:5192.

## Edit it
Everything the site says is in `config.js`: the brand, the base price, the build stages, the kitchen and garden options with what each adds, and the closing section. Money is in lakh rupees, as a low and a high figure.

## Media
- `assets/house/`: the empty plot (`plot`), the finished house (`house`), three kitchens (`kitchen-1` to `kitchen-3`) and three gardens (`garden-1` to `garden-3`).
- `assets/film/`: the build film as a frame sequence. A stage's `at` value in `config.js` says where it falls in the film. Without the film, the house rises over the plot as a still picture.

## Files
```
index.html      all sections
styles.css      all styles
config.js       all the content
app.js          the build film, the choices and the estimate
guide.html      how the pictures and the film were made
```
