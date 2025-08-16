# CrashAlyzer

CrashAlyzer is a tool for easy-to-use(™) crashlog analysis for ARM Cortex-M microcontrollers.
It makes postmortem debugging easier.

## Key Features

- Analyze crash & fault logs for ARM Cortex-M microcontrollers
- Support for [Marlin](https://github.com/MarlinFirmware/Marlin/) `POSTMORTEM_DEBUGGING`
- Support for [arduino-HC32F46x](https://github.com/shadow578/framework-arduino-hc32f46x/) fault logs
- Register parsing and backtrace analysis
- Automatic addr2line lookup
- Guided TUI & useable CLI
- Extensible architecture for adding support for more platforms and microcontrollers


## Getting Started

### 1. Installation

install using your favourite package manager\*.

```bash
$ npm install -g @shadow578/crashalyzer
```

> [!NOTE] 
> \* only applies if your favorite package manager happens to be **npm**. 
> otherwise, i'm sorry.


### 2. Usage

run the `crashalyzer` command to access the interactive mode, where you'll be ask for all needed details.

```bash
$ crashalyzer
    ? Crash Log » (...)
    ? Path to ELF File » firmware.elf
```

there's also a CLI mode if you prefer that.

```bash
$ crashalyzer
    --log /path/to/crash.log
    --input /path/to/firmware.elf
    --addr2line /path/to/addr2line
```

if a required argument is not provided, you'll be prompted to enter it interactively.



## Contributing

feel free to contribute to CrashAlyzer!
all kinds of contributions are welcome, whether it's fixing bugs, adding new features, or improving documentation.


## License

CrashAlyzer is licensed under the [MIT License](LICENSE).
