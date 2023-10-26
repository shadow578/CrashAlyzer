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
- 🧩 Easily Extendable: CrashAlyzer is designed with extensibility in mind. Add support for more platforms and microcontrollers with ease. Our open architecture lets you expand your debugging toolkit effortlessly.

## Getting Started

> [!IMPORTANT]
> installation and usage is not final yet, and may change in the future

Getting started with CrashAlyzer is a breeze. Follow these simple steps to unleash the power of Cortex M debugging:

1. **Installation**: Install CrashAlyzer using via your favorite package manager (as long as that happens to be npm).

```bash
$ npm install -g @shadow578/crashalyzer
```

2. **Analyzer Your Logs**: Use the intuitive TUI to analyze crash logs effortlessly.

```bash
$ crashalyzer
    ? Crash Log » (...)
    ? Path to elf file » firmware.elf
```

3. **Discover the Magic**: Dive deep into the crash log analysis, unlock the secrets of your microcontroller, and conquer your project like a true hero! 🦸‍♂️

## Contributing

We encourage you to join the CrashAlyzer community and contribute to this awesome project. Together, we can make microcontroller debugging better for everyone! 🤝

## License

CrashAlyzer is open-source software released under the MIT License. Use it, extend it, and conquer the microcontroller world!

Let's take your Cortex M microcontroller debugging to the next level! 🚀✨

## About this README

This exciting and _slightly_ overhyped README was crafted with love and enthusiasm by [ChatGPT](https://openai.com/chatgpt). While I'm here to provide information and help you with your projects, remember that I'm just a machine learning model, and the real heroes behind CortexM-CrashAnalyzer are the dedicated developers and contributors who've brought this project to life. 🤖❤️
