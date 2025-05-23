![Static Badge](https://img.shields.io/badge/BCIT%20-%20Comp2800%20-%20blue)
![Static Badge](https://img.shields.io/badge/group%20-%20BBY6%20-%20blue?color=%23f60665)

## Japples - Comp 2800 Group Project Overview
 **Japples** is a web app designed to help users stay healthy by gamifying their habits. Core features include daily check-ins with login streaks and integration with wearable device APIs to track walking, food intake, sleep, and additional health metrics.

## Team Members
- David Martinez, Term 1 set A
- Jacob Lebl, Term 1 set C
- Yehor Skudilov, Term 1 set A
- Daniel Do, Term 1 set A
- Hazel Fullijames, Term 1 set A

## Features

- Task creation (options for either user generated and AI assisted)
- In-app game to encourage continued healthy habits through point generation
- Food diary and calorie tracker
- AI assisted Recipe generator
- Connect to Health Connect API to share fitness data and generate various health charts
- User can setup a gym 'homebase' and check in to gain more points
- Profiles

## Technologies Used

- **Frontend**: HTML, Bootstrap, CSS, JavaScript, GMS2
- **Backend**: NodeJS, ExpressJS, EJS, Mongoose, WebSockets
- **Database**: MongoDB
- **API**: Health Connect API, DeepSeek API

## Usage

1. git clone the repo
2. cd into `web_app` and run `npm i` to install the required packages
3. get the required env strings from a trusted dev
4. run the server with `npm run server` and the server should start listening on localhost:8101

- SEE LIMITATIONS FOR MORE INFORMATION

## Project Structure

### Companion App
```
└── 📁app
    └── 📁android
        └── .gitignore
        └── 📁app
            └── build.gradle
            └── debug.keystore
            └── google-services-template.json
            └── proguard-rules.pro
            └── 📁src
                └── 📁debug
                    └── AndroidManifest.xml
                └── 📁main
                    └── AndroidManifest.xml
                    └── 📁java
                        └── 📁com
                            └── 📁yehorskudilov
                                └── 📁Japples
                                    └── MainActivity.kt
                                    └── MainApplication.kt
                                    └── PermissionRationaleActivity.kt
                    └── 📁res
                        └── 📁drawable
                        └── 📁drawable-hdpi
                            └── splashscreen_image.png
                        └── 📁drawable-mdpi
                            └── splashscreen_image.png
                        └── 📁drawable-xhdpi
                            └── splashscreen_image.png
                        └── 📁drawable-xxhdpi
                            └── splashscreen_image.png
                        └── 📁drawable-xxxhdpi
                            └── splashscreen_image.png
                            └── rn_edit_text_material.xml
                            └── splashscreen.xml
                        └── 📁mipmap-anydpi-v26
                            └── ic_launcher_round.xml
                            └── ic_launcher.xml
                        └── 📁mipmap-hdpi
                            └── ic_launcher_foreground.png
                            └── ic_launcher_round.png
                            └── ic_launcher.png
                        └── 📁mipmap-mdpi
                            └── ic_launcher_foreground.png
                            └── ic_launcher_round.png
                            └── ic_launcher.png
                        └── 📁mipmap-xhdpi
                            └── ic_launcher_foreground.png
                            └── ic_launcher_round.png
                            └── ic_launcher.png
                        └── 📁mipmap-xxhdpi
                            └── ic_launcher_foreground.png
                            └── ic_launcher_round.png
                            └── ic_launcher.png
                        └── 📁mipmap-xxxhdpi
                            └── ic_launcher_foreground.png
                            └── ic_launcher_round.png
                            └── ic_launcher.png
                        └── 📁values
                        └── 📁values-night
                            └── colors.xml
                            └── colors.xml
                            └── strings.xml
                            └── styles.xml
        └── build.gradle
        └── 📁gradle
        └── gradle.properties
            └── 📁wrapper
                └── gradle-wrapper.jar
                └── gradle-wrapper.properties
        └── gradlew
        └── gradlew.bat
        └── sentry.properties
        └── settings.gradle
    └── 📁assets
        └── adaptive-icon.png
        └── favicon.png
        └── icon.png
        └── splash.png
    └── 📁firebase
        └── google-services-template.json
    └── 📁patches
        └── @supersami+rn-foreground-service+2.1.1.patch
    └── .gitignore
    └── App.js
    └── app.json
    └── babel.config.js
    └── eas.json
    └── metro.config.js
    └── package-lock.json
    └── package.json
    └── yarn.lock
```
### Webapp (Japples)
```
└── 📁web_app
    └── 📁backend
        └── 📁config
            └── config_template.js
            └── 📁db_schemas
                └── Food.js
                └── Gym.js
                └── Task.js
                └── User.js
            └── db.js
            └── game_interface.js
        └── 📁routes
            └── authentication.js
            └── db.js
            └── diary.js
            └── files.js
            └── game.js
            └── gym.js
            └── healthConnect.js
            └── magicAI.js
            └── task.js
            └── user.js
    └── 📁frontend
        └── 📁assets
            └── 📁files
                └── Japples.apk
            └── 📁images
                └── login_banner.jpg
                └── logo.png
                └── nothing.png
                └── profile.png
                └── trash.png
        └── 📁css
            └── account.css
            └── base.css
            └── diary.css
            └── gymLog.css
            └── healthConnectTest.css
            └── home.css
            └── login.css
            └── register.css
            └── stats.css
        └── 📁game
            └── favicon.ico
            └── 📁html5game
                └── 📁builtinfonts
                    └── FONT_builtin.png
                    └── FONT_builtin.yy
                └── Ladder2800_texture_0.png
                └── Ladder2800_texture_1.png
                └── Ladder2800.js
                └── 📁particles
                    └── IDR_GIF1.png
                    └── IDR_GIF10.png
                    └── IDR_GIF11.png
                    └── IDR_GIF12.png
                    └── IDR_GIF13.png
                    └── IDR_GIF14.png
                    └── IDR_GIF15.png
                    └── IDR_GIF2.png
                    └── IDR_GIF3.png
                    └── IDR_GIF4.png
                    └── IDR_GIF5.png
                    └── IDR_GIF6.png
                    └── IDR_GIF7.png
                    └── IDR_GIF8.png
                    └── IDR_GIF9.png
                └── snd_LvlUp.mp3
                └── snd_LvlUp.ogg
                └── snd_Road.mp3
                └── snd_Road.ogg
                └── 📁sound
                    └── 📁worklets
                        └── audio-worklet.js
                └── splash.png
            └── index.html
            └── options.ini
        └── 📁js
            └── account.js
            └── base.js
            └── createTask.js
            └── diary.js
            └── gymLog.js
            └── healthConnectTest.js
            └── home.js
            └── login.js
            └── register.js
            └── stats.js
            └── taskRecommendations.js
        └── 📁views
            └── 📁autoRoute
                └── about.ejs
                └── account.ejs
                └── calorieChart.ejs
                └── createTask.ejs
                └── healthConnectInstructions.ejs
                └── healthConnectTest.ejs
                └── home.ejs
                └── stats.ejs
            └── diary.ejs
            └── gymLog.ejs
            └── index.ejs
            └── 📁layouts
                └── default.ejs
                └── 📁partials
                    └── footer.ejs
                    └── header.ejs
                    └── mobile-nav.ejs
            └── login.ejs
            └── register.ejs
            └── viewLogs.ejs
    └── .env
    └── .env.sample
    └── .gitignore
    └── app.js
    └── package-lock.json
    └── package.json
    └── server.log
```

## Acknowledgments

- Health Connect API from [HealthConnect](https://github.com/shuchirj/HCGateway).
- Select icons and elements sourced from [Bootstrap](https://getbootstrap.com/) and [Bootstrap Icons](https://icons.getbootstrap.com/).
- Map API from [OpenLayers](https://github.com/openlayers/openlayers).
- Geolocation API from [Nominatim](https://github.com/osm-search/Nominatim);


## Limitations and Future Work

### Limitations

- The game websocket needs to be manually configured for every different deployed location, it is currently listening for the tailscale test site
- To use the tailscale test site make a [Tailscale](https://tailscale.com/download) account, download the app, use the [Invite Link](https://login.tailscale.com/admin/invite/r3C4WScg45PRV8rtjvpM11), and then connect to it in your browser under 100.78.233.113:8101

### Future Work

- Host Japples on a public website

## License

Example:
This project is licensed under the MIT License. See the LICENSE file for details.
