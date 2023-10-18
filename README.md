# marlin POSTMORTEM_DEBUGGING backtrace analyzer

really badly written script to analyze backtraces from marlin firmware.

## Usage

```
<postmortem_analyzer> [<addr2line_path>] [<firmware.elf>] <backtrace.txt>
<postmortem_analyzer> [<addr2line_path>] [<firmware.elf>]

 - <addr2line_path> - path to the addr2line executable. defaults to 'arm-none-eabi-addr2line'
 - <firmware.elf> - path to the firmware elf file. defaults to './firmware.elf'
 - <backtrace.txt> - path to the backtrace file to analyze. if not provided, will prompt for input

 ALL PARAMETERS ARE POSITIONAL
```

example:

```
$ npm start -- arm-none-eabi-addr2line /path/to/firmware.elf
```
