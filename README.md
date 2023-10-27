# 🚀 CrashAlyzer

Welcome to the CrashAlzyer project!
Take your postmortem debugging to the next level with CrashAlyzer! 🎉

## What is CrashAlyzer?

CrashAlyzer is your easy-to-use(™) crashlog analyzer for ARM Cortex-M microcontrollers.

### Key Features

- 🛠️ Crashlog & Fault Log Analysis: With CrashAlyzer, you can effortlessly dissect crash logs and fault logs like a pro. Say goodbye to endless hours of manual log interpretation.
- 🚀 [Marlin](https://github.com/MarlinFirmware/Marlin/) `POSTMORTEM_DEBUGGING` Support: Yes, you heard it right! CrashAlyzer supports Marlin `POSTMORTEM_DEBUGGING`, ensuring that you can effortlessly analyze and debug your Marlin-powered projects.
- 🧐 [arduino-HC32F46x](https://github.com/shadow578/framework-arduino-hc32f46x/) Fault Logs: HC32F46x users, you're in for a treat! CrashAlyzer offers comprehensive support for HC32F46x fault logs, making your debugging process as smooth as silk.
- 📚 Register Parsing & Backtrace Analysis: Dive deep into the heart of your microcontroller's crash with our built-in register parsing and backtrace analysis tools. Uncover the root cause of those pesky issues!
- 🌐 Automatic Addr2line Lookup: We've got your back with automatic addr2line lookup. No more manual address translation headaches!
- 🛠️ Fully Guided TUI: Our user-friendly user interface (TUI) guides you through the entire analysis process. Whether you're a seasoned developer or just starting, CrashAlyzer is here to help.
- 💻 Powerful CLI: CrashAlyzer provides a powerful command-line interface (CLI) for those who prefer a more streamlined and scriptable debugging experience. Analyze logs with precision using command-line options.
- 🧩 Easily Extendable: CrashAlyzer is designed with extensibility in mind. Add support for more platforms and microcontrollers with ease. Our open architecture lets you expand your debugging toolkit effortlessly.

## Getting Started

Getting started with CrashAlyzer is a breeze. Follow these simple steps to unleash the power of Cortex M debugging:

### 1. **Installation**: Install CrashAlyzer.

Install CrashAlyzer quickly and easily with your favorite package manager\*.

```bash
$ npm install -g @shadow578/crashalyzer
```

> [!NOTE] > \* only applies if your favorite package manager happens to be **npm**

### 2. **Analyzer Your Logs**: Analyze crash logs effortlessly.

CrashAlyzer offers a flexible and user-friendly experience.
Simply run `crashalyzer` and follow the on-screen instructions to analyze your crash logs.

```bash
$ crashalyzer
    ? Crash Log » (...)
    ? Path to ELF File » firmware.elf
```

If you'd rather not use the interactive mode, you can also pass the crash log and ELF file paths as command-line arguments.

```bash
$ crashalyzer
    --log /path/to/crash.log
    --input /path/to/firmware.elf
    --addr2line /path/to/addr2line
```

All arguments are optional, and CrashAlyzer will prompt you for any missing information.

### 3. **Discover the Magic**: Become the Cortex M debugging hero you were always meant to be.

Dive deep into the crash log analysis, unlock the secrets of your microcontroller, and conquer your project like a true hero! 🦸‍♂️

## Contributing

We encourage you to join the CrashAlyzer community and contribute to this awesome project. Together, we can make microcontroller debugging better for everyone! 🤝

## License

CrashAlyzer is open-source software released under the MIT License. Use it, extend it, and conquer the microcontroller world!

Let's take your Cortex M microcontroller debugging to the next level! 🚀✨

## About this README

This exciting and _slightly_ overhyped README was crafted with love and enthusiasm by [ChatGPT](https://openai.com/chatgpt). While I'm here to provide information and help you with your projects, remember that I'm just a machine learning model, and the real heroes behind CrashAlyzer are the dedicated developers and contributors who've brought this project to life. 🤖❤️
