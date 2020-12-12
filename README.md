# Uncontained
Uncontained is a Platformer Puzzle Game.

This project was created for FBLA by me, Elijah Lieu.
It is licensed under the MIT license.

While this was coded using Javascript, similar principles would apply in any
game library. This game was made through Javascript to demonstrate that a
developer does not need to use a game-engine to make an engaging game (such
as Unity or Unreal Engine, which both are wonderful and very powerful tools).

If you are reading through the code, I highly recommend using an intelligent
editor that can collapse all code on certain depths. I used Visual Studio
Code, which has this feature. This will allow you to look through the method
headers (depth 2) to find specific code faster.

This game was developed similar to how a progressive web app is developed.

### Use
For installation, see the Installation section.

The game is a graphical program that requires both a mouse and keyboard to
play. The mouse is used to navigate the menus and move Containers within
levels. The keyboard functions as controls within levels. Additionally,
the user can press `Escape` at any time to exit the game.

The leaderboard for each level is stored in the user's appdata folder.

* On Mac: `~/Library/Application Support/uncontained`
* On Linux: `~/.config/uncontained`
* On Windows: `C:\Users\youruser\AppData\Roaming\uncontained`

These are local files, so the leaderboard is a **local** leaderboard.
By default, these files do not exist and are created as necessary.
If the user wishes to manually change the leaderboard, they will have to
modify the `.json` files listed in the directory above.

### Dependencies
This program uses only a few primary dependencies:

* Node.js, an open-source runtime for JavaScript.
* npm, Node.js's package manager.
* React, an open-source front end JavaScript framework.
* Electron, an open-source JavaScript framework for building progressive web
apps.
* JSDoc, an open-source JavaScript framework for generating static
documentation pages.

More dependencies can be found in `package.json`. None of these dependencies
need to be manually installed by the user unless they wish to modify the
game's source code.

## Installation
**DISCLAIMER**: This code is not publically available. I have a private
repository on GitHub, but this is for backup storage only. If the user
would like to view this repository, please email me at
`elijahlieu@protonmail.com`.

To install the application, the user can install one of the prebuilt
versions. There are prebuilt versions for Mac, Linux, and Windows. After,
simply open the application in the same manner that you would with any other
app.

Alternatively, the user can build the application from source. This requires
the version of node.js listed in `package.json` and for the user to run
`npm run build` in the working directory.

### Mac
Navigate to the folder, then double click Uncontained.

### Linux
Navigate to the folder, and execute the AppImage. Different distributions
may need to run the AppImage differently.

### Windows
Navigate to the folder and run the `.exe` file. Alternatively, the user can
create a shortcut. On Windows, it is important to keep the `.exe` file in the
same folder with other important files, such as `.dll` files. This is
natural for all Windows applications.

## Documentation
The source code for this game is fully documented. React uses both class and
functional components, but JSDoc, the documentation package, does not
recognize functional components. However, the source code still retains its
comments. Additionally, JavaScript arrow functions do not appear on JSDoc.

The user can read the JSDoc in the `docs/` folder. Each `.html` file is a
page of the generated documentation.

The folder `src/data/` is solely for `.json` files. None of thse are
documented; by nature, `.json` does not allow comments. Because of this
I will document those files here.

### Keybinds
`keybinds.json` is a file for the controls. The JSON object has key value
pairs, where the key is the keyboard key and the value is the action.

### Levels
`levelx.json` where `x` is a number represents a level. Each level must have
a name, an id (the same as the `x`), a description, a difficulty (from 1 to
100), a character object, and an array of containers. The 10 provided levels
serve as examples and premade levels for the user to play through.

### Leaderboards
`leaderboardx.json` where `x` is a number represents a leaderboard for the
level of the same `x` value. Leaderboards are kept separate; see the Use
section. Each leaderboard is an array of objects, and each object has an id,
initials, and a score.

### How To Play Pages
The how to play pages are pages that tell the user how to play. These are
read from the How To Play page within the application.

## Copyrighted Material
All code within this project was created by me, except for
automatically generated files (such as `package-lock.json`),
or installed dependencies through the open-source package
manager `npm`. See Dependencies for more information.

## Future Development
Although this game was created to have a modular amount of levels, I do not
see myself developing this game further. JavaScript is an interpreted
language, which means it fundamentally will run slower than similar code
in compiled languages. While this does not largely affect this game, it could
should it be developed further.

However, I may develop a newer version of this game in another language.

## Special Thanks
This game could not have been developed without the following people:
* Mr. Stormes and Mr. Hakim, my FBLA advisers
* Mr. Dubose, my AP Computer Science A teacher
* My friends and family, who helped me stay motivated while developing the
game.