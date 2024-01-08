# Clip Xtractor

![GitHub license](https://img.shields.io/github/license/le-pepe/clip-xtractor)

Simple tool to extract clips from video files.

# Prerequisites

Before you begin, you need to download FFmpeg and add to resources folder by OS.

> https://ffbinaries.com/downloads

```
- resources
    - linux
        - ffmpeg
    - mac
        - ffmpeg
    - win
        - ffmpeg.exe
```


## Project Setup

### Install

```bash
$ yarn
```

### Development

```bash
$ yarn dev
```


### Build

You need to compile **TailwindCSS** for dev .

```bash
$ npx tailwindcss -i .\src\renderer\src\assets\css\styles.css -o .\src\renderer\src\assets\css\app.css --watch --minify
````

> Before build, you need to build vue project.
```bash
$ electron-vite build
```

```bash
# For windows
$ yarn build:win

# For macOS
$ yarn build:mac

# For Linux
$ yarn build:linux
```
