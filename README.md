# 2048
A recreation of the 2048 game using Vue. The game is played by combining slides to get larger and larger slides all powers of 2. The initial goal is to get the slide 2048, but you can continue past that point and go until your board is full of slides.


## Local Setup

```bash
# install dependencies
$ yarn install

# run locally
$ yarn dev
```

## Deployment
This is hosted by github pages. To update the deployed version simply run `yarn build` which will run the type-check and then build the application into static files in the `docs` directory. This is what is hosted by github pages. Now simply commit the changed files and push to github.
