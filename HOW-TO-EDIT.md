# How to edit this website

Everything on the site comes from plain text files. Change a file, save it (on GitHub: "Commit changes"), and the site updates itself after a minute or two.

You can also just ask Claude to make a change.

## Change a model's status

Open the model's file in the `_projects` folder, for example `_projects/04-c001.md`. Near the top, change:

```
status: in progress
```

to `done`, `in progress` or `planned`. The label next to the title updates on the home page and the model page.

## Edit the text on a model page

In the same file, everything below the second `---` line is the page text. It uses Markdown:

- `## Heading` makes a heading
- `- item` makes a bullet point
- `**bold**` makes **bold** text
- Equations go between `$$` lines, written in LaTeX

## Add a plot from MATLAB

1. In MATLAB, save the figure: `exportgraphics(gcf, 'c001-ggv.png', 'Resolution', 200)`
2. Put the PNG in the `assets/img` folder.
3. In the model's file, add this line where you want it to appear:

   ```
   ![GGV envelope](/vehicle_dynamics/assets/img/c001-ggv.png)
   ```

To show it as a small picture next to the model in the home page list, add `image: /assets/img/c001-ggv.png` near the top of the file.

## Add a new model

1. Copy an existing file in `_projects`, for example `05-d001.md`, and rename it, for example `07-e001.md`.
2. Change `title`, `order` (its position on the home page), `code`, `status`, `dof`, `purpose` and `summary`.
3. Replace the page text.

## Change your name, email or LinkedIn

Edit `_config.yml`. Those details appear in the header and footer of every page.

## Change the home page or About page

- Home page intro text: `index.md`
- About page: `about.md`

## Where the MATLAB code goes

Put each model's code in the `models` folder, for example `models/C001-four-wheel-ggv/`. Then remove the `#` in front of `code_path` near the top of that model's page, and a "code on GitHub" link appears next to its title.
