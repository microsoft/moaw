# Contributing

We welcome all contributions, including translations, new workshops, bug fixes, etc.

As a contributor, help us keep this project open and inclusive.
Please read and follow our [Code of Conduct](CODE_OF_CONDUCT.md).

- If you find something not working as expected, please [open an issue](https://github.com/microsoft/moaw/issues) and explain what you did and what you expected to happen.

- If you would like to contribute some changes, fork the repository and open a [Pull Request](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request).
  Make sure to follow the guidelines below, and briefly explain the motivation behind your changes.

## Add translations

You can localize any workshop in this repository by creating a new folder `translations` in the same directory as the original folder, and naming any translated file `<original_name>.<country_code>.<extension>`.
For example, the French translation of `workshop.md` would be `translations/workshop.fr.md`.

You can follow the same rule if you need to localize any asset, for example `assets/image.png` should be localized to `assets/translations/image.fr.png`.

> ⚠️ **Important note:** do not forget to update all relative links and URLs accordingly in localized files!

## Create a new workshop

New workshops should be created in their own repository, so you can more easily manage and update them.

You can use the [workshop template](template/workshop/) as a starting point, and look at existing [workshops](workshops) for examples.

The easier way to get started is to follow this step-by-step tutorial: [Create a workshop](https://microsoft.github.io/moaw/workshop/create-workshop/).

### Workshop format

A workshop is built from a single [markdown](https://commonmark.org/help/) file named `workshop.md`, that contains all the content of the workshop.

You can create multiple workshop sections (pages) by separating them with `---` (three dashes), preceded and followed by empty lines.

At the top of the document, you will find a [front matter](https://jekyllrb.com/docs/front-matter/) section, that contains metadata about the workshop.

```yaml
---
published: false                        # Optional. Set to true to publish the workshop (default: false)
type: workshop                          # Required.
title: Full workshop title              # Required. Full title of the workshop
short_title: Short title for header     # Optional. Short title displayed in the header
description: This is a workshop for...  # Required.
level: beginner                         # Required. Can be 'beginner', 'intermediate' or 'advanced'
authors:                                # Required. You can add as many authors as needed      
  - Name
contacts:                               # Required. Must match the number of authors
  - Author's email, Twitter...
duration_minutes: 20                    # Required. Estimated duration in minutes
tags: javascript, api, node.js          # Required. Tags for filtering and searching
banner_url: assets/banner.jpg           # Optional. Should be a 1280x640px image
video_url: https://youtube.com/link     # Optional. Link to a video of the workshop
audience: students                      # Optional. Audience of the workshop (students, pro devs, etc.)
wt_id: <cxa_tracking_id>                # Optional. Set advocacy tracking code for supported links
oc_id: <marketing_tracking_id>          # Optional. Set marketing tracking code for supported links
sections_title:                         # Optional. Set custom titles for each section to be displayed in the side bar
  - Section 1 title
  - Section 2 title
---
```

### Assets

Any asset (image, files, etc.) should be located in the `/assets` folder inside your workshop folder.

You can also put in there sample code if needed, but it's usually more convenient to put them in a separate repository so people can use it as a template. Code solutions for the workshop can be also put in this folder if needed.

### Additional pages

You can add additional pages to your workshop by creating new markdown files in the same folder as the `workshop.md` file.
This may be useful for proctor instructions, or any other information you want to provide to the workshop participants.

### Testing locally

You can test your workshop locally by running the following command:

```bash
npm install
npm start
```

This will start a local development server at `http://localhost:4200/`.

You can open your local workshop by navigating to `http://localhost:4200/workshop/?src=<workshop_folder_name>/`.

### Admonitions

You can special syntax around blockquotes to create admonitions, to highlight important information in your workshop.

**Examples:**

```markdown
<!-- This is a standard blockquote -->
> Lorep ipsum dolor sit amet

<!-- This is an information note -->
<div class="info">

> Lorep ipsum dolor sit amet

</div>

<!-- You can add an optional title -->
<div class="info" data-title="note">

> Lorep ipsum dolor sit amet

</div>

<!-- This is a warning note -->
<div class="warning">

> Lorep ipsum dolor sit amet

</div>

<!-- This is an important note -->
<div class="important">

> Lorep ipsum dolor sit amet

</div>

<!-- This is a tip note -->
<div class="tip">

> Lorep ipsum dolor sit amet

</div>

<!-- This is a task or assigment -->
<div class="task">

> Lorep ipsum dolor sit amet

</div>
```

## Reference an existing workshop

If you already have a workshop hosted somewhere, you can reference it in this repository by adding an entry to the [`packages/database/external.yml`](packages/database/external.yml) file.

```yaml
- title: Full workshop title              # Required. Title of the workshop
  description: This is a workshop for...  # Required. Short description of the workshop
  url: https://workshop.url               # Required. URL of the workshop
  language: en                            # Required. Language of the workshop, using 2-letter ISO code
  last_updated: 2019-10-21                # Required. Date of the last update of the workshop
  type: workshop                          # Required. Only 'workshop' is supported for now
  level: beginner                         # Required. Can be 'beginner', 'intermediate' or 'advanced'
  github_url: https://github.url          # Optional. URL of the workshop's GitHub repository
  authors:                                # Required. You can add as many authors as needed
    - Name                          
  contacts:                               # Required. Must match the number of authors
    - Author's email, Twitter...
  banner_url: https://banner.url          # Optional. URL of a banner image for the workshop (1280x640px)
  video_url: https://youtube.com/link     # Optional. Link to a video of the workshop
  duration_minutes: 120                   # Required. Estimated duration in minutes
  audience: students, pro devs            # Optional. Audience of the workshop (students, pro devs, etc.)
  tags: javascript, api, node.js          # Required. Tags for filtering and searching
```

After your PR is merged, your workshop will be listed in the workshop catalog page.

### Convert an existing workshop

Another option is to convert your workshop to the [format described above](#create-a-new-workshop), and submit it as a new workshop.
If your workshop is already in markdown format, it should be fairly quick to convert it.

This would allow you to benefit from the full features of the MOAW platform, such as:

- Ability to localize your workshop
- Additional pages (proctor instructions, prerequisites, etc.)
- Allows other people to update, fork and improve your workshop
- Detailed analytics
- Companion slides in markdown (coming soon!)
