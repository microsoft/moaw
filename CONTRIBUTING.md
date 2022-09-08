# Contributing

We welcome all contributions, including translations, new workshops, bug fixes, etc.

As a contributor, help us keep this project open and inclusive.
Please read and follow our [Code of Conduct](CODE_OF_CONDUCT).

- If you find something not working as expected, please [open an issue](https://github.com/themoaw/moaw/issues) and explain what you did and what you expected to happen.

- If you would like to contribute some changes, fork the repository and open a [Pull Request](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request).
  Make sure to follow the guidelines below, and briefly explain the motivation behind your changes.

## Translations

You can localize any workshop in this repository by creating a new folder `translations` in the same directory as the original folder, and naming any translated file `<original_name>.<country_code>.<extension>`.
For example, the French translation of `workshop.md` would be `translations/workshop.fr.md`.

You can follow the same rule if you need to localize any asset, for example `assets/image.png` should be localized to `assets/translations/image.fr.png`.

> ⚠️ **Important note:** do not forget to update all relative links and URLs accordingly in localized files!

## New workshops

All workshops should be located under the `/workshops` folder, that's where you should create a new folder for your workshop.
Try to be descriptive with the folder name, and use only lowercase letters, numbers and dashes.

You can use the [workshop template](template/workshop/) as a starting point, and look at existing [workshops](workshops) for examples.

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
oc_id: <marketing_tracking_id>          # Optional. Set advocacy tracking code for supported links
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
