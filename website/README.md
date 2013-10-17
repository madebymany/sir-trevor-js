# Sir Trevor JS Website

The website is created with Middleman and deployed to Github pages.

To update the website you're going to need Ruby and bundler installed. You can read a full guide to [getting started with Middleman here](http://12devs.co.uk/articles/204/).

The `build` folder points to an orphaned git branch that goes up to Github pages on the `gh-pages` branch.

First off init the submodule (assuming you're in the website directory)

    cd ../ && git submodule init

Next, make changes to the website **in the `source` directory** and commit these changes. Then, when you're ready to push run:

    bundle exec middleman build

Change into the `website/build` directory push your changes:

    git push origin gh-pages

Then, switch back to the website folder and commit your changes:

    cd ../ && git push origin master




