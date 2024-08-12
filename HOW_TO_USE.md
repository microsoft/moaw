# How to use this repository

## 📚 Browse the content

The easiest way to browse the available content on the [website](https://aka.ms/aks-labs/catalog).

## 👩‍🏫 Conduct a workshop

You can link to any workshop from this repository using the following URL format: `https://aka.ms/ws?src=<workshop_folder>/`

**Example:** [https://aka.ms/ws?src=swa-gatsby-portfolio/](https://aka.ms/ws?src=swa-gatsby-portfolio/)


#### Additional tips

- You can also link to any workshop in a publicly available GitHub repository using: `https://aka.ms/ws?src=gh:<github_repo/path_to_file>`<br>
  This way you can adapt the content as you need in your fork and use it directly.

- You can link to a specific section of a workshop, by adding a `step` parameter and an anchor link to the URL: `&step=<section_index>#<heading_id>`

- You can share any individual markdown-formatted page, using the URL format: `https://aka.ms/ws/page?src=<workshop_folder/path_to_file>` or `https://aka.ms/ws/page?src=gh:<github_repo/path_to_file>`<br>
This is useful for sharing prerequisites, notes, etc.

#### Customized catalog view

You can customize the catalog view by adding the following parameters to the URL:

- `sub=<tag_list>`: Filter the catalog by tags (coma-separated). Tags defined in the `sub` parameter will not be displayed nor changeable by the users, and they'll be able to filter using search or additional tags as usual.

- `lang=<language>`: Filter the catalog by language. The language must be a valid [ISO 639-1](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes) 2-letter code. You can also disable the language filter by setting the value to `all`.

## 🚀 Create a new workshop

You can create a new workshop by creating a new folder in the `workshops` folder, and adding a `workshop.md` file inside it.

See the [contributing guide](CONTRIBUTING.md#create-a-new-workshop) for detailed instructions.

## 📝 Adapt and modify content

You're free to adapt, modify and localize the content of this repository to better fit your needs, as long as you keep the [license](#LICENSE) and credit the original authors.

The easiest way to do that is to fork this repository and make your changes in your fork. You can then link to your fork using the URL format described above.

If you made changes that you think would be useful to others, please also consider opening a pull request to [contribute](CONTRIBUTING.md) to this repository.
