# neoPackETH

**neoPackETH** is a modern, cross-platform ethernet packet generator. It
lets you craft and send any packet — or sequence of packets — on an
ethernet link, with fine-grained control over every field.

It is a fork of [packETH](https://github.com/jemcek/packETH) by Miha
Jemec. The original GTK desktop UI has been replaced by a new interface
built with [Electron](https://www.electronjs.org/); the C command-line
tool (`packETHcli`) is retained as the packet-sending engine.

The project now has two parts:

- [`electron/`](electron/) — the **neoPackETH** desktop app (the GUI)
- [`cli/`](cli/) — **packETHcli**, the command-line sender / receiver

## Electron GUI

A clean, GitKraken-style interface: a custom frameless title bar, a
collapsible sidebar, light/dark themes, and four views.

### Views

- **Builder** — construct a packet layer by layer (Ethernet, ARP, IPv4,
  IPv6, UDP, TCP, ICMP, ICMPv6, IGMP) with a live Wireshark-style
  hex-dump preview and a per-layer size breakdown
- **Gen-b** — burst generator: send the current packet by count,
  continuously, or for a fixed duration, with live send statistics
- **Gen-s** — sequence generator for up to 10 stored packets
- **Pcap** — open a capture file and inspect packets in a sortable,
  commit-table-style list, then load one back into the Builder

### Running

```sh
git clone https://github.com/2winkle95code/neoPackETH.git

cd neoPackETH/electron
npm install
npm start
```

Sending packets on the wire requires root privileges (raw sockets), so
launch with `sudo npm start` when you need to actually transmit.

### Building installers

```sh
cd electron
npm run build        # AppImage + deb (Linux), per electron-builder
```

## CLI (packETHcli)

The CLI can replay packets stored in a pcap file and has a receiver mode
that counts packets and checks whether everything sent was received.

### Building

```sh
cd cli
make
```

### Usage

```sh
./packETHcli -h          # list available options
```

**Receiver mode** (`-m 9`): `packETHcli` counts received packets and
displays statistics. If you embed a pattern (predefined or custom) into
the packets you send, only packets carrying a valid pattern are counted,
so you can detect drops. See the help output for details.

More background on the CLI:

- [Receiver mode](https://packeth.wordpress.com/2018/12/05/reciver-mode-check-for-dropped-packets/)
- [CLI tips](https://packeth.wordpress.com/2018/11/12/packethcli-some-practical-tips-1/)

## Credits

neoPackETH is a fork of **packETH** by Miha Jemec.

```
packETH (C) 2003-2023 by Miha Jemec <jemcek@gmail.com>
```

Original project: <https://github.com/jemcek/packETH> ·
[homepage](https://packeth.sourceforge.net/packeth/Home.html) ·
[blog](https://packeth.wordpress.com)

Covered under the GPL (see [COPYING](COPYING)).
