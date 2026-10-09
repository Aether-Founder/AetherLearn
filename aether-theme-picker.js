(function() {
    'use strict';

    // Theme definitions (exact same as in AetherLearn lib/themes.ts)
    const THEMES = [
        {
            id: 'aether',
            name: 'Aether',
            supportsModeSwitching: true,
            isDefault: true,
            colors: {
                background: '#f5f5f5',
                main: '#1a1a2e',
                text: '#1a1a2e',
                shadePrimary: '#e0e0e0',
                shadeSecondary: '#d0d0d0',
            },
        },
        {
            id: '8008',
            name: '8008',
            supportsModeSwitching: false,
            colors: {
                background: '#333a45',
                main: '#f44c7f',
                text: '#e9ecf0',
                shadePrimary: '#939eae',
                shadeSecondary: '#2e343d',
            },
        },
        {
            id: '9009',
            name: '9009',
            supportsModeSwitching: false,
            colors: {
                background: '#eeebe2',
                main: '#080909',
                text: '#080909',
                shadePrimary: '#99947f',
                shadeSecondary: '#d3cfc1',
            },
        },
        {
            id: '80s-after-dark',
            name: '80s After Dark',
            supportsModeSwitching: false,
            colors: {
                background: '#1b1d36',
                main: '#fca6d1',
                text: '#e1e7ec',
                shadePrimary: '#99d6ea',
                shadeSecondary: '#17182c',
            },
        },
        {
            id: 'alduin',
            name: 'Alduin',
            supportsModeSwitching: false,
            colors: {
                background: '#1c1c1c',
                main: '#dfd7af',
                text: '#f5f3ed',
                shadePrimary: '#444444',
                shadeSecondary: '#242424',
            },
        },
        {
            id: 'alpine',
            name: 'Alpine',
            supportsModeSwitching: false,
            colors: {
                background: '#6c687f',
                main: '#ffffff',
                text: '#ffffff',
                shadePrimary: '#9994b8',
                shadeSecondary: '#77738c',
            },
        },
        {
            id: 'anti-hero',
            name: 'Anti Hero',
            supportsModeSwitching: false,
            colors: {
                background: '#00002e',
                main: '#ffadad',
                text: '#f1deef',
                shadePrimary: '#ff3d8b',
                shadeSecondary: '#060548',
            },
        },
        {
            id: 'arch',
            name: 'Arch',
            supportsModeSwitching: false,
            colors: {
                background: '#0c0d11',
                main: '#7ebab5',
                text: '#f6f5f5',
                shadePrimary: '#454864',
                shadeSecondary: '#171a25',
            },
        },
        {
            id: 'aurora',
            name: 'Aurora',
            supportsModeSwitching: false,
            colors: {
                background: '#011926',
                main: '#00e980',
                text: '#fff',
                shadePrimary: '#245c69',
                shadeSecondary: '#000c13',
            },
        },
        {
            id: 'beach',
            name: 'Beach',
            supportsModeSwitching: false,
            colors: {
                background: '#ffeead',
                main: '#96ceb4',
                text: '#5b7869',
                shadePrimary: '#ffcc5c',
                shadeSecondary: '#f7dc8f',
            },
        },
        {
            id: 'bento',
            name: 'Bento',
            supportsModeSwitching: false,
            colors: {
                background: '#2d394d',
                main: '#ff7a90',
                text: '#fffaf8',
                shadePrimary: '#4a768d',
                shadeSecondary: '#263041',
            },
        },
        {
            id: 'bingsu',
            name: 'Bingsu',
            supportsModeSwitching: false,
            colors: {
                background: '#b8a7aa',
                main: '#83616e',
                text: '#ebe6ea',
                shadePrimary: '#48373d',
                shadeSecondary: '#ab989e',
            },
        },
        {
            id: 'bliss',
            name: 'Bliss',
            supportsModeSwitching: false,
            colors: {
                background: '#262727',
                main: '#f0d3c9',
                text: '#fff',
                shadePrimary: '#665957',
                shadeSecondary: '#343231',
            },
        },
        {
            id: 'blue-dolphin',
            name: 'Blue Dolphin',
            supportsModeSwitching: false,
            colors: {
                background: '#003950',
                main: '#ffcefb',
                text: '#82eaff',
                shadePrimary: '#00e4ff',
                shadeSecondary: '#014961',
            },
        },
        {
            id: 'blueberry-dark',
            name: 'Blueberry Dark',
            supportsModeSwitching: false,
            colors: {
                background: '#212b42',
                main: '#add7ff',
                text: '#91b4d5',
                shadePrimary: '#5c7da5',
                shadeSecondary: '#1b2334',
            },
        },
        {
            id: 'blueberry-light',
            name: 'Blueberry Light',
            supportsModeSwitching: false,
            colors: {
                background: '#dae0f5',
                main: '#506477',
                text: '#678198',
                shadePrimary: '#92a4be',
                shadeSecondary: '#c1c7df',
            },
        },
        {
            id: 'botanical',
            name: 'Botanical',
            supportsModeSwitching: false,
            colors: {
                background: '#7b9c98',
                main: '#eaf1f3',
                text: '#eaf1f3',
                shadePrimary: '#495755',
                shadeSecondary: '#72908d',
            },
        },
        {
            id: 'bouquet',
            name: 'Bouquet',
            supportsModeSwitching: false,
            colors: {
                background: '#173f35',
                main: '#eaa09c',
                text: '#e9e0d2',
                shadePrimary: '#408e7b',
                shadeSecondary: '#1f4e43',
            },
        },
        {
            id: 'breeze',
            name: 'Breeze',
            supportsModeSwitching: false,
            colors: {
                background: '#e8d5c4',
                main: '#7d67a9',
                text: '#1b4c5e',
                shadePrimary: '#3a98b9',
                shadeSecondary: '#f6e6da',
            },
        },
        {
            id: 'bushido',
            name: 'Bushido',
            supportsModeSwitching: false,
            colors: {
                background: '#242933',
                main: '#ec4c56',
                text: '#f6f0e9',
                shadePrimary: '#596172',
                shadeSecondary: '#1c222d',
            },
        },
        {
            id: 'cafe',
            name: 'Cafe',
            supportsModeSwitching: false,
            colors: {
                background: '#ceb18d',
                main: '#14120f',
                text: '#14120f',
                shadePrimary: '#d4d2d1',
                shadeSecondary: '#bba180',
            },
        },
        {
            id: 'camping',
            name: 'Camping',
            supportsModeSwitching: false,
            colors: {
                background: '#faf1e4',
                main: '#618c56',
                text: '#3c403b',
                shadePrimary: '#c2b8aa',
                shadeSecondary: '#e7dccb',
            },
        },
        {
            id: 'carbon',
            name: 'Carbon',
            supportsModeSwitching: false,
            colors: {
                background: '#313131',
                main: '#f66e0d',
                text: '#f5e6c8',
                shadePrimary: '#616161',
                shadeSecondary: '#2b2b2b',
            },
        },
        {
            id: 'catppuccin',
            name: 'Catppuccin',
            supportsModeSwitching: false,
            colors: {
                background: '#1e1e2e',
                main: '#cba6f7',
                text: '#cdd6f4',
                shadePrimary: '#7f849c',
                shadeSecondary: '#181825',
            },
        },
        {
            id: 'chaos-theory',
            name: 'Chaos Theory',
            supportsModeSwitching: false,
            colors: {
                background: '#141221',
                main: '#fd77d7',
                text: '#dde5ed',
                shadePrimary: '#676e8a',
                shadeSecondary: '#1e1d2f',
            },
        },
        {
            id: 'cheesecake',
            name: 'Cheesecake',
            supportsModeSwitching: false,
            colors: {
                background: '#fdf0d5',
                main: '#8e2949',
                text: '#3a3335',
                shadePrimary: '#d91c81',
                shadeSecondary: '#f3e2bf',
            },
        },
        {
            id: 'cherry-blossom',
            name: 'Cherry Blossom',
            supportsModeSwitching: false,
            colors: {
                background: '#323437',
                main: '#d65dcc',
                text: '#d1d0c5',
                shadePrimary: '#787d82',
                shadeSecondary: '#2d2f31',
            },
        },
        {
            id: 'comfy',
            name: 'Comfy',
            supportsModeSwitching: false,
            colors: {
                background: '#4a5b6e',
                main: '#f8cdc6',
                text: '#f5efee',
                shadePrimary: '#9ec1cc',
                shadeSecondary: '#425366',
            },
        },
        {
            id: 'copper',
            name: 'Copper',
            supportsModeSwitching: false,
            colors: {
                background: '#442f29',
                main: '#b46a55',
                text: '#e7e0de',
                shadePrimary: '#7ebab5',
                shadeSecondary: '#50362e',
            },
        },
        {
            id: 'creamsicle',
            name: 'Creamsicle',
            supportsModeSwitching: false,
            colors: {
                background: '#ff9869',
                main: '#fcfcf8',
                text: '#fcfcf8',
                shadePrimary: '#ff661f',
                shadeSecondary: '#fe8954',
            },
        },
        {
            id: 'cy-red',
            name: 'Cy Red',
            supportsModeSwitching: false,
            colors: {
                background: '#6e2626',
                main: '#e55050',
                text: '#ffaaaa',
                shadePrimary: '#ff6060',
                shadeSecondary: '#3f1616',
            },
        },
        {
            id: 'cyberspace',
            name: 'Cyberspace',
            supportsModeSwitching: false,
            colors: {
                background: '#181c18',
                main: '#00ce7c',
                text: '#c2fbe1',
                shadePrimary: '#9578d3',
                shadeSecondary: '#131613',
            },
        },
        {
            id: 'dark',
            name: 'Dark',
            supportsModeSwitching: false,
            colors: {
                background: '#111',
                main: '#eee',
                text: '#eee',
                shadePrimary: '#444',
                shadeSecondary: '#191919',
            },
        },
        {
            id: 'dark-magic-girl',
            name: 'Dark Magic Girl',
            supportsModeSwitching: false,
            colors: {
                background: '#091f2c',
                main: '#f5b1cc',
                text: '#a288d9',
                shadePrimary: '#93e8d3',
                shadeSecondary: '#071823',
            },
        },
        {
            id: 'dark-note',
            name: 'Dark Note',
            supportsModeSwitching: false,
            colors: {
                background: '#1f1f1f',
                main: '#f2c17b',
                text: '#d2dff4',
                shadePrimary: '#768f95',
                shadeSecondary: '#141414',
            },
        },
        {
            id: 'darling',
            name: 'Darling',
            supportsModeSwitching: false,
            colors: {
                background: '#fec8cd',
                main: '#ffffff',
                text: '#ffffff',
                shadePrimary: '#a30000',
                shadeSecondary: '#f2babd',
            },
        },
        {
            id: 'deku',
            name: 'Deku',
            supportsModeSwitching: false,
            colors: {
                background: '#058b8c',
                main: '#b63530',
                text: '#f7f2ea',
                shadePrimary: '#255458',
                shadeSecondary: '#0e7d7e',
            },
        },
        {
            id: 'desert-oasis',
            name: 'Desert Oasis',
            supportsModeSwitching: false,
            colors: {
                background: '#fff2d5',
                main: '#d19d01',
                text: '#332800',
                shadePrimary: '#0061fe',
                shadeSecondary: '#eddebc',
            },
        },
        {
            id: 'dev',
            name: 'Dev',
            supportsModeSwitching: false,
            colors: {
                background: '#1b2028',
                main: '#23a9d5',
                text: '#ccccb5',
                shadePrimary: '#4b5975',
                shadeSecondary: '#151a21',
            },
        },
        {
            id: 'diner',
            name: 'Diner',
            supportsModeSwitching: false,
            colors: {
                background: '#537997',
                main: '#c3af5b',
                text: '#dfdbc8',
                shadePrimary: '#445c7f',
                shadeSecondary: '#4d6f8b',
            },
        },
        {
            id: 'dino',
            name: 'Dino',
            supportsModeSwitching: false,
            colors: {
                background: '#ffffff',
                main: '#40d672',
                text: '#1d221f',
                shadePrimary: '#d5d5d5',
                shadeSecondary: '#cafad8',
            },
        },
        {
            id: 'discord',
            name: 'Discord',
            supportsModeSwitching: false,
            colors: {
                background: '#313338',
                main: '#5a65ea',
                text: '#dcdee3',
                shadePrimary: '#565861',
                shadeSecondary: '#2b2d31',
            },
        },
        {
            id: 'dmg',
            name: 'DMG',
            supportsModeSwitching: false,
            colors: {
                background: '#dadbdc',
                main: '#ae185e',
                text: '#414141',
                shadePrimary: '#3846b1',
                shadeSecondary: '#bec1d2',
            },
        },
        {
            id: 'dollar',
            name: 'Dollar',
            supportsModeSwitching: false,
            colors: {
                background: '#e4e4d4',
                main: '#6b886b',
                text: '#555a56',
                shadePrimary: '#8a9b69',
                shadeSecondary: '#cbd0bf',
            },
        },
        {
            id: 'dots',
            name: 'Dots',
            supportsModeSwitching: false,
            colors: {
                background: '#121520',
                main: '#fff',
                text: '#fff',
                shadePrimary: '#676e8a',
                shadeSecondary: '#1b1e2c',
            },
        },
        {
            id: 'dracula',
            name: 'Dracula',
            supportsModeSwitching: false,
            colors: {
                background: '#282a36',
                main: '#bd93f9',
                text: '#f8f8f2',
                shadePrimary: '#6272a4',
                shadeSecondary: '#20222c',
            },
        },
        {
            id: 'drowning',
            name: 'Drowning',
            supportsModeSwitching: false,
            colors: {
                background: '#191826',
                main: '#4a6fb5',
                text: '#9393a7',
                shadePrimary: '#50688c',
                shadeSecondary: '#1e1f2f',
            },
        },
        {
            id: 'dualshot',
            name: 'Dualshot',
            supportsModeSwitching: false,
            colors: {
                background: '#737373',
                main: '#212222',
                text: '#212222',
                shadePrimary: '#aaaaaa',
                shadeSecondary: '#646464',
            },
        },
        {
            id: 'earthsong',
            name: 'Earthsong',
            supportsModeSwitching: false,
            colors: {
                background: '#292521',
                main: '#509452',
                text: '#e6c7a8',
                shadePrimary: '#f5ae2d',
                shadeSecondary: '#1d1b18',
            },
        },
        {
            id: 'everblush',
            name: 'Everblush',
            supportsModeSwitching: false,
            colors: {
                background: '#141b1e',
                main: '#8ccf7e',
                text: '#dadada',
                shadePrimary: '#838887',
                shadeSecondary: '#232a2d',
            },
        },
        {
            id: 'evil-eye',
            name: 'Evil Eye',
            supportsModeSwitching: false,
            colors: {
                background: '#0084c2',
                main: '#f7f2ea',
                text: '#171718',
                shadePrimary: '#01589f',
                shadeSecondary: '#0c79be',
            },
        },
        {
            id: 'ez-mode',
            name: 'EZ Mode',
            supportsModeSwitching: false,
            colors: {
                background: '#0068c6',
                main: '#fa62d5',
                text: '#ffffff',
                shadePrimary: '#138bf7',
                shadeSecondary: '#005bac',
            },
        },
        {
            id: 'fire',
            name: 'Fire',
            supportsModeSwitching: false,
            colors: {
                background: '#0f0000',
                main: '#b31313',
                text: '#ffffff',
                shadePrimary: '#683434',
                shadeSecondary: '#200a0a',
            },
        },
        {
            id: 'fledgling',
            name: 'Fledgling',
            supportsModeSwitching: false,
            colors: {
                background: '#3b363f',
                main: '#fc6e83',
                text: '#e6d5d3',
                shadePrimary: '#8e5568',
                shadeSecondary: '#332e38',
            },
        },
        {
            id: 'fleuriste',
            name: 'Fleuriste',
            supportsModeSwitching: false,
            colors: {
                background: '#c6b294',
                main: '#405a52',
                text: '#091914',
                shadePrimary: '#64374d',
                shadeSecondary: '#b4a389',
            },
        },
        {
            id: 'floret',
            name: 'Floret',
            supportsModeSwitching: false,
            colors: {
                background: '#00272c',
                main: '#ffdd6d',
                text: '#e5e5e5',
                shadePrimary: '#779097',
                shadeSecondary: '#173033',
            },
        },
        {
            id: 'froyo',
            name: 'Froyo',
            supportsModeSwitching: false,
            colors: {
                background: '#e1dacb',
                main: '#7b7d7d',
                text: '#7b7d7d',
                shadePrimary: '#b29c5e',
                shadeSecondary: '#d3cdc1',
            },
        },
        {
            id: 'frozen-llama',
            name: 'Frozen Llama',
            supportsModeSwitching: false,
            colors: {
                background: '#9bf2ea',
                main: '#6d44a6',
                text: '#ffffff',
                shadePrimary: '#b690fd',
                shadeSecondary: '#7fe7dd',
            },
        },
        {
            id: 'fruit-chew',
            name: 'Fruit Chew',
            supportsModeSwitching: false,
            colors: {
                background: '#d6d3d6',
                main: '#5c1e5f',
                text: '#282528',
                shadePrimary: '#b49cb5',
                shadeSecondary: '#cabfca',
            },
        },
        {
            id: 'fundamentals',
            name: 'Fundamentals',
            supportsModeSwitching: false,
            colors: {
                background: '#727474',
                main: '#7fa482',
                text: '#131313',
                shadePrimary: '#cac4be',
                shadeSecondary: '#666868',
            },
        },
        {
            id: 'future-funk',
            name: 'Future Funk',
            supportsModeSwitching: false,
            colors: {
                background: '#2e1a47',
                main: '#f7f2ea',
                text: '#f7f2ea',
                shadePrimary: '#c18fff',
                shadeSecondary: '#27173c',
            },
        },
        {
            id: 'github',
            name: 'GitHub',
            supportsModeSwitching: false,
            colors: {
                background: '#212830',
                main: '#41ce5c',
                text: '#ccdae6',
                shadePrimary: '#788386',
                shadeSecondary: '#141b23',
            },
        },
        {
            id: 'godspeed',
            name: 'Godspeed',
            supportsModeSwitching: false,
            colors: {
                background: '#eae4cf',
                main: '#9abbcd',
                text: '#646669',
                shadePrimary: '#ada998',
                shadeSecondary: '#ded9c9',
            },
        },
        {
            id: 'graen',
            name: 'Graen',
            supportsModeSwitching: false,
            colors: {
                background: '#303c36',
                main: '#a59682',
                text: '#a59682',
                shadePrimary: '#181d1a',
                shadeSecondary: '#36453c',
            },
        },
        {
            id: 'grand-prix',
            name: 'Grand Prix',
            supportsModeSwitching: false,
            colors: {
                background: '#36475c',
                main: '#c0d036',
                text: '#c1c7d7',
                shadePrimary: '#5c6c80',
                shadeSecondary: '#42536b',
            },
        },
        {
            id: 'grape',
            name: 'Grape',
            supportsModeSwitching: false,
            colors: {
                background: '#2c003e',
                main: '#ff8f00',
                text: '#fff',
                shadePrimary: '#6e225e',
                shadeSecondary: '#1f002d',
            },
        },
        {
            id: 'gruvbox-dark',
            name: 'Gruvbox Dark',
            supportsModeSwitching: false,
            colors: {
                background: '#282828',
                main: '#d79921',
                text: '#ebdbb2',
                shadePrimary: '#665c54',
                shadeSecondary: '#212121',
            },
        },
        {
            id: 'gruvbox-light',
            name: 'Gruvbox Light',
            supportsModeSwitching: false,
            colors: {
                background: '#fbf1c7',
                main: '#689d6a',
                text: '#3c3836',
                shadePrimary: '#a89984',
                shadeSecondary: '#daceae',
            },
        },
        {
            id: 'hammerhead',
            name: 'Hammerhead',
            supportsModeSwitching: false,
            colors: {
                background: '#030613',
                main: '#4fcdb9',
                text: '#e2f1f5',
                shadePrimary: '#213c53',
                shadeSecondary: '#0a1928',
            },
        },
        {
            id: 'hanok',
            name: 'Hanok',
            supportsModeSwitching: false,
            colors: {
                background: '#d8d2c3',
                main: '#513a2a',
                text: '#f7f1d6',
                shadePrimary: '#ede5b4',
                shadeSecondary: '#38502a',
            },
        },
        {
            id: 'honey',
            name: 'Honey',
            supportsModeSwitching: false,
            colors: {
                background: '#f2aa00',
                main: '#fff546',
                text: '#f3eecb',
                shadePrimary: '#a66b00',
                shadeSecondary: '#e19e00',
            },
        },
        {
            id: 'horizon',
            name: 'Horizon',
            supportsModeSwitching: false,
            colors: {
                background: '#1c1e26',
                main: '#c4a88a',
                text: '#bbbbbb',
                shadePrimary: '#db886f',
                shadeSecondary: '#17181f',
            },
        },
        {
            id: 'husqy',
            name: 'Husqy',
            supportsModeSwitching: false,
            colors: {
                background: '#000000',
                main: '#c58aff',
                text: '#ebd7ff',
                shadePrimary: '#972fff',
                shadeSecondary: '#1e001e',
            },
        },
        {
            id: 'iceberg-dark',
            name: 'Iceberg Dark',
            supportsModeSwitching: false,
            colors: {
                background: '#161821',
                main: '#84a0c6',
                text: '#c6c8d1',
                shadePrimary: '#595e76',
                shadeSecondary: '#232531',
            },
        },
        {
            id: 'iceberg-light',
            name: 'Iceberg Light',
            supportsModeSwitching: false,
            colors: {
                background: '#e8e9ec',
                main: '#2d539e',
                text: '#33374c',
                shadePrimary: '#adb1c4',
                shadeSecondary: '#ccceda',
            },
        },
        {
            id: 'incognito',
            name: 'Incognito',
            supportsModeSwitching: false,
            colors: {
                background: '#0e0e0e',
                main: '#ff9900',
                text: '#c6c6c6',
                shadePrimary: '#555555',
                shadeSecondary: '#151515',
            },
        },
        {
            id: 'ishtar',
            name: 'Ishtar',
            supportsModeSwitching: false,
            colors: {
                background: '#202020',
                main: '#91170c',
                text: '#fae1c3',
                shadePrimary: '#847869',
                shadeSecondary: '#272727',
            },
        },
        {
            id: 'iv-clover',
            name: 'IV Clover',
            supportsModeSwitching: false,
            colors: {
                background: '#a0a0a0',
                main: '#573e40',
                text: '#3b2d3b',
                shadePrimary: '#353535',
                shadeSecondary: '#bebebe',
            },
        },
        {
            id: 'iv-spade',
            name: 'IV Spade',
            supportsModeSwitching: false,
            colors: {
                background: '#0c0c0c',
                main: '#b7976a',
                text: '#d3c2c3',
                shadePrimary: '#404040',
                shadeSecondary: '#121212',
            },
        },
        {
            id: 'joker',
            name: 'Joker',
            supportsModeSwitching: false,
            colors: {
                background: '#1a0e25',
                main: '#99de1e',
                text: '#e9e2f5',
                shadePrimary: '#7554a3',
                shadeSecondary: '#14081f',
            },
        },
        {
            id: 'laser',
            name: 'Laser',
            supportsModeSwitching: false,
            colors: {
                background: '#221b44',
                main: '#009eaf',
                text: '#dbe7e8',
                shadePrimary: '#b82356',
                shadeSecondary: '#1e173b',
            },
        },
        {
            id: 'lavender',
            name: 'Lavender',
            supportsModeSwitching: false,
            colors: {
                background: '#ada6c2',
                main: '#e4e3e9',
                text: '#2f2a41',
                shadePrimary: '#e4e3e9',
                shadeSecondary: '#a19bb9',
            },
        },
        {
            id: 'leather',
            name: 'Leather',
            supportsModeSwitching: false,
            colors: {
                background: '#a86948',
                main: '#ffe4bc',
                text: '#ffe4bc',
                shadePrimary: '#81482b',
                shadeSecondary: '#9a5f3f',
            },
        },
        {
            id: 'lil-dragon',
            name: 'Lil Dragon',
            supportsModeSwitching: false,
            colors: {
                background: '#ebe1ef',
                main: '#8a5bd6',
                text: '#212b43',
                shadePrimary: '#a28db8',
                shadeSecondary: '#dac7e2',
            },
        },
        {
            id: 'lilac-mist',
            name: 'Lilac Mist',
            supportsModeSwitching: false,
            colors: {
                background: '#fffbfe',
                main: '#b94189',
                text: '#5c2954',
                shadePrimary: '#e094c2',
                shadeSecondary: '#ecdcee',
            },
        },
        {
            id: 'lime',
            name: 'Lime',
            supportsModeSwitching: false,
            colors: {
                background: '#7c878e',
                main: '#93c247',
                text: '#bfcfdc',
                shadePrimary: '#4b5257',
                shadeSecondary: '#737d82',
            },
        },
        {
            id: 'luna',
            name: 'Luna',
            supportsModeSwitching: false,
            colors: {
                background: '#221c35',
                main: '#f67599',
                text: '#ffe3eb',
                shadePrimary: '#5a3a7e',
                shadeSecondary: '#2f2346',
            },
        },
        {
            id: 'macroblank',
            name: 'Macroblank',
            supportsModeSwitching: false,
            colors: {
                background: '#b2d2c8',
                main: '#c13117',
                text: '#490909',
                shadePrimary: '#717977',
                shadeSecondary: '#c6ddd3',
            },
        },
        {
            id: 'magic-girl',
            name: 'Magic Girl',
            supportsModeSwitching: false,
            colors: {
                background: '#ffffff',
                main: '#f5b1cc',
                text: '#00ac8c',
                shadePrimary: '#93e8d3',
                shadeSecondary: '#f2f2f2',
            },
        },
        {
            id: 'masha-mashu',
            name: 'Masha/Mashu',
            supportsModeSwitching: false,
            colors: {
                background: '#2b2b2c',
                main: '#76689a',
                text: '#f1e2e4',
                shadePrimary: '#d8a0a6',
                shadeSecondary: '#27242c',
            },
        },
        {
            id: 'matcha-moccha',
            name: 'Matcha Moccha',
            supportsModeSwitching: false,
            colors: {
                background: '#523525',
                main: '#7ec160',
                text: '#ecddcc',
                shadePrimary: '#9e6749',
                shadeSecondary: '#422b1e',
            },
        },
        {
            id: 'material',
            name: 'Material',
            supportsModeSwitching: false,
            colors: {
                background: '#263238',
                main: '#80cbc4',
                text: '#e6edf3',
                shadePrimary: '#4c6772',
                shadeSecondary: '#2e3c43',
            },
        },
        {
            id: 'matrix',
            name: 'Matrix',
            supportsModeSwitching: false,
            colors: {
                background: '#000000',
                main: '#15ff00',
                text: '#d1ffcd',
                shadePrimary: '#006500',
                shadeSecondary: '#032000',
            },
        },
        {
            id: 'menthol',
            name: 'Menthol',
            supportsModeSwitching: false,
            colors: {
                background: '#00c18c',
                main: '#ffffff',
                text: '#ffffff',
                shadePrimary: '#186544',
                shadeSecondary: '#17ae7d',
            },
        },
        {
            id: 'metaverse',
            name: 'Metaverse',
            supportsModeSwitching: false,
            colors: {
                background: '#232323',
                main: '#d82934',
                text: '#e8e8e8',
                shadePrimary: '#5e5e5e',
                shadeSecondary: '#1d1d1d',
            },
        },
        {
            id: 'metropolis',
            name: 'Metropolis',
            supportsModeSwitching: false,
            colors: {
                background: '#0f1f2c',
                main: '#56c3b7',
                text: '#e4edf1',
                shadePrimary: '#326984',
                shadeSecondary: '#0b1822',
            },
        },
        {
            id: 'mexican',
            name: 'Mexican',
            supportsModeSwitching: false,
            colors: {
                background: '#f8ad34',
                main: '#b12189',
                text: '#eee',
                shadePrimary: '#333',
                shadeSecondary: '#f9b951',
            },
        },
        {
            id: 'miami',
            name: 'Miami',
            supportsModeSwitching: false,
            colors: {
                background: '#f35588',
                main: '#05dfd7',
                text: '#f0e9ec',
                shadePrimary: '#94294c',
                shadeSecondary: '#db4979',
            },
        },
        {
            id: 'miami-nights',
            name: 'Miami Nights',
            supportsModeSwitching: false,
            colors: {
                background: '#18181a',
                main: '#e4609b',
                text: '#fff',
                shadePrimary: '#47bac0',
                shadeSecondary: '#0f0f10',
            },
        },
        {
            id: 'midnight',
            name: 'Midnight',
            supportsModeSwitching: false,
            colors: {
                background: '#0b0e13',
                main: '#60759f',
                text: '#9fadc6',
                shadePrimary: '#394760',
                shadeSecondary: '#141a24',
            },
        },
        {
            id: 'milkshake',
            name: 'Milkshake',
            supportsModeSwitching: false,
            colors: {
                background: '#ffffff',
                main: '#212b43',
                text: '#212b43',
                shadePrimary: '#62cfe6',
                shadeSecondary: '#ddeff3',
            },
        },
        {
            id: 'mint',
            name: 'Mint',
            supportsModeSwitching: false,
            colors: {
                background: '#05385b',
                main: '#5cdb95',
                text: '#edf5e1',
                shadePrimary: '#20688a',
                shadeSecondary: '#07324e',
            },
        },
        {
            id: 'mizu',
            name: 'Mizu',
            supportsModeSwitching: false,
            colors: {
                background: '#afcbdd',
                main: '#fcfbf6',
                text: '#1a2633',
                shadePrimary: '#85a5bb',
                shadeSecondary: '#9fc1d4',
            },
        },
        {
            id: 'modern-dolch',
            name: 'Modern Dolch',
            supportsModeSwitching: false,
            colors: {
                background: '#2d2e30',
                main: '#7eddd3',
                text: '#e3e6eb',
                shadePrimary: '#54585c',
                shadeSecondary: '#242527',
            },
        },
        {
            id: 'modern-dolch-light',
            name: 'Modern Dolch Light',
            supportsModeSwitching: false,
            colors: {
                background: '#dbdbdb',
                main: '#8fd1c3',
                text: '#454545',
                shadePrimary: '#a3a2a2',
                shadeSecondary: '#e8e8e8',
            },
        },
        {
            id: 'modern-ink',
            name: 'Modern Ink',
            supportsModeSwitching: false,
            colors: {
                background: '#ffffff',
                main: '#ff360d',
                text: '#000000',
                shadePrimary: '#b7b7b7',
                shadeSecondary: '#ececec',
            },
        },
        {
            id: 'monokai',
            name: 'Monokai',
            supportsModeSwitching: false,
            colors: {
                background: '#272822',
                main: '#a6e22e',
                text: '#e2e2dc',
                shadePrimary: '#e6db74',
                shadeSecondary: '#1f201b',
            },
        },
        {
            id: 'moonlight',
            name: 'Moonlight',
            supportsModeSwitching: false,
            colors: {
                background: '#191f28',
                main: '#c69f68',
                text: '#ccccb5',
                shadePrimary: '#4b5975',
                shadeSecondary: '#141a22',
            },
        },
        {
            id: 'mountain',
            name: 'Mountain',
            supportsModeSwitching: false,
            colors: {
                background: '#0f0f0f',
                main: '#e7e7e7',
                text: '#e7e7e7',
                shadePrimary: '#4c4c4c',
                shadeSecondary: '#1a1a1a',
            },
        },
        {
            id: 'mr-sleeves',
            name: 'Mr Sleeves',
            supportsModeSwitching: false,
            colors: {
                background: '#d1d7da',
                main: '#daa99b',
                text: '#1d1d1d',
                shadePrimary: '#9a9fa1',
                shadeSecondary: '#bfcbd1',
            },
        },
        {
            id: 'ms-cupcakes',
            name: 'MS Cupcakes',
            supportsModeSwitching: false,
            colors: {
                background: '#ffffff',
                main: '#5ed5f3',
                text: '#0a282f',
                shadePrimary: '#d64090',
                shadeSecondary: '#edf8fa',
            },
        },
        {
            id: 'muted',
            name: 'Muted',
            supportsModeSwitching: false,
            colors: {
                background: '#525252',
                main: '#c5b4e3',
                text: '#b1e4e3',
                shadePrimary: '#939eae',
                shadeSecondary: '#494949',
            },
        },
        {
            id: 'nautilus',
            name: 'Nautilus',
            supportsModeSwitching: false,
            colors: {
                background: '#132237',
                main: '#ebb723',
                text: '#1cbaac',
                shadePrimary: '#0b4c6c',
                shadeSecondary: '#0e1a29',
            },
        },
        {
            id: 'nebula',
            name: 'Nebula',
            supportsModeSwitching: false,
            colors: {
                background: '#212135',
                main: '#be3c88',
                text: '#838686',
                shadePrimary: '#19b3b8',
                shadeSecondary: '#191928',
            },
        },
        {
            id: 'night-runner',
            name: 'Night Runner',
            supportsModeSwitching: false,
            colors: {
                background: '#212121',
                main: '#feff04',
                text: '#e8e8e8',
                shadePrimary: '#5c4a9c',
                shadeSecondary: '#1a1a1a',
            },
        },
        {
            id: 'nord',
            name: 'Nord',
            supportsModeSwitching: false,
            colors: {
                background: '#242933',
                main: '#88c0d0',
                text: '#d8dee9',
                shadePrimary: '#929aaa',
                shadeSecondary: '#2e3440',
            },
        },
        {
            id: 'nord-light',
            name: 'Nord Light',
            supportsModeSwitching: false,
            colors: {
                background: '#eceff4',
                main: '#8fbcbb',
                text: '#8fbcbb',
                shadePrimary: '#6a7791',
                shadeSecondary: '#d8dee9',
            },
        },
        {
            id: 'norse',
            name: 'Norse',
            supportsModeSwitching: false,
            colors: {
                background: '#242425',
                main: '#2b5f6d',
                text: '#ccc2b1',
                shadePrimary: '#505b5e',
                shadeSecondary: '#303333',
            },
        },
        {
            id: 'oblivion',
            name: 'Oblivion',
            supportsModeSwitching: false,
            colors: {
                background: '#313231',
                main: '#a5a096',
                text: '#f7f5f1',
                shadePrimary: '#5d6263',
                shadeSecondary: '#3a3b3b',
            },
        },
        {
            id: 'olive',
            name: 'Olive',
            supportsModeSwitching: false,
            colors: {
                background: '#e9e5cc',
                main: '#92908f',
                text: '#373731',
                shadePrimary: '#b7b39e',
                shadeSecondary: '#d4cfbc',
            },
        },
        {
            id: 'olivia',
            name: 'Olivia',
            supportsModeSwitching: false,
            colors: {
                background: '#1c1b1d',
                main: '#deaf9d',
                text: '#f2efed',
                shadePrimary: '#4e3e3e',
                shadeSecondary: '#262223',
            },
        },
        {
            id: 'onedark',
            name: 'OneDark',
            supportsModeSwitching: false,
            colors: {
                background: '#2f343f',
                main: '#61afef',
                text: '#98c379',
                shadePrimary: '#eceff4',
                shadeSecondary: '#262b34',
            },
        },
        {
            id: 'our-theme',
            name: 'Our Theme',
            supportsModeSwitching: false,
            colors: {
                background: '#ce1226',
                main: '#fcd116',
                text: '#ffffff',
                shadePrimary: '#6d0f19',
                shadeSecondary: '#9f1020',
            },
        },
        {
            id: 'pale-nimbus',
            name: 'Pale Nimbus',
            supportsModeSwitching: false,
            colors: {
                background: '#433e4c',
                main: '#94ffc2',
                text: '#feffdb',
                shadePrimary: '#ffaca3',
                shadeSecondary: '#694f5e',
            },
        },
        {
            id: 'paper',
            name: 'Paper',
            supportsModeSwitching: false,
            colors: {
                background: '#eeeeee',
                main: '#444444',
                text: '#444444',
                shadePrimary: '#b2b2b2',
                shadeSecondary: '#dddddd',
            },
        },
        {
            id: 'passion-fruit',
            name: 'Passion Fruit',
            supportsModeSwitching: false,
            colors: {
                background: '#7c2142',
                main: '#f4a3b4',
                text: '#ffffff',
                shadePrimary: '#9994b8',
                shadeSecondary: '#833c5e',
            },
        },
        {
            id: 'pastel',
            name: 'Pastel',
            supportsModeSwitching: false,
            colors: {
                background: '#e0b2bd',
                main: '#fbf4b6',
                text: '#6d5c6f',
                shadePrimary: '#b4e9ff',
                shadeSecondary: '#d29fab',
            },
        },
        {
            id: 'peach-blossom',
            name: 'Peach Blossom',
            supportsModeSwitching: false,
            colors: {
                background: '#292929',
                main: '#99b898',
                text: '#fecea8',
                shadePrimary: '#616161',
                shadeSecondary: '#2a363b',
            },
        },
        {
            id: 'peaches',
            name: 'Peaches',
            supportsModeSwitching: false,
            colors: {
                background: '#e0d7c1',
                main: '#dd7a5f',
                text: '#5f4c41',
                shadePrimary: '#e7b28e',
                shadeSecondary: '#e2caaf',
            },
        },
        {
            id: 'phantom',
            name: 'Phantom',
            supportsModeSwitching: false,
            colors: {
                background: '#001',
                main: '#7aa2f7',
                text: '#c0caf5',
                shadePrimary: '#414868',
                shadeSecondary: '#24283b',
            },
        },
        {
            id: 'pink-lemonade',
            name: 'Pink Lemonade',
            supportsModeSwitching: false,
            colors: {
                background: '#f6d992',
                main: '#f6a192',
                text: '#fcfcf8',
                shadePrimary: '#f6b092',
                shadeSecondary: '#f6cc93',
            },
        },
        {
            id: 'pulse',
            name: 'Pulse',
            supportsModeSwitching: false,
            colors: {
                background: '#181818',
                main: '#17b8bd',
                text: '#e5f4f4',
                shadePrimary: '#53565a',
                shadeSecondary: '#121212',
            },
        },
        {
            id: 'purpleish',
            name: 'Purpleish',
            supportsModeSwitching: false,
            colors: {
                background: '#1e1e32',
                main: '#7a52cc',
                text: '#a3a3cc',
                shadePrimary: '#5c5c99',
                shadeSecondary: '#181829',
            },
        },
        {
            id: 'rainbow-trail',
            name: 'Rainbow Trail',
            supportsModeSwitching: false,
            colors: {
                background: '#f5f5f5',
                main: '#363636',
                text: '#1f1f1f',
                shadePrimary: '#4f4f4f',
                shadeSecondary: '#e0e0e0',
            },
        },
        {
            id: 'red-dragon',
            name: 'Red Dragon',
            supportsModeSwitching: false,
            colors: {
                background: '#1a0b0c',
                main: '#ff3a32',
                text: '#4a4d4e',
                shadePrimary: '#e2a528',
                shadeSecondary: '#0e0506',
            },
        },
        {
            id: 'red-samurai',
            name: 'Red Samurai',
            supportsModeSwitching: false,
            colors: {
                background: '#84202c',
                main: '#c79e6e',
                text: '#e2dad0',
                shadePrimary: '#55131b',
                shadeSecondary: '#751d26',
            },
        },
        {
            id: 'repose-dark',
            name: 'Repose Dark',
            supportsModeSwitching: false,
            colors: {
                background: '#2f3338',
                main: '#d6d2bc',
                text: '#d6d2bc',
                shadePrimary: '#8f8e84',
                shadeSecondary: '#3a3c3d',
            },
        },
        {
            id: 'repose-light',
            name: 'Repose Light',
            supportsModeSwitching: false,
            colors: {
                background: '#efead0',
                main: '#5f605e',
                text: '#333538',
                shadePrimary: '#8f8e84',
                shadeSecondary: '#dbd6c4',
            },
        },
        {
            id: 'retro',
            name: 'Retro',
            supportsModeSwitching: false,
            colors: {
                background: '#dad3c1',
                main: '#1d1b17',
                text: '#1d1b17',
                shadePrimary: '#918b7d',
                shadeSecondary: '#c8c3b3',
            },
        },
        {
            id: 'retrocast',
            name: 'Retrocast',
            supportsModeSwitching: false,
            colors: {
                background: '#07737a',
                main: '#88dbdf',
                text: '#ffffff',
                shadePrimary: '#f3e03b',
                shadeSecondary: '#26858b',
            },
        },
        {
            id: 'rgb',
            name: 'RGB',
            supportsModeSwitching: false,
            colors: {
                background: '#111',
                main: '#eee',
                text: '#eee',
                shadePrimary: '#444',
                shadeSecondary: '#1a1a1a',
            },
        },
        {
            id: 'rose-pine',
            name: 'Rose Pine',
            supportsModeSwitching: false,
            colors: {
                background: '#1f1d27',
                main: '#9ccfd8',
                text: '#e0def4',
                shadePrimary: '#c4a7e7',
                shadeSecondary: '#282533',
            },
        },
        {
            id: 'rose-pine-dawn',
            name: 'Rose Pine Dawn',
            supportsModeSwitching: false,
            colors: {
                background: '#fffaf3',
                main: '#56949f',
                text: '#286983',
                shadePrimary: '#c4a7e7',
                shadeSecondary: '#f0e9df',
            },
        },
        {
            id: 'rose-pine-moon',
            name: 'Rose Pine Moon',
            supportsModeSwitching: false,
            colors: {
                background: '#2a273f',
                main: '#9ccfd8',
                text: '#e0def4',
                shadePrimary: '#c4a7e7',
                shadeSecondary: '#211f32',
            },
        },
        {
            id: 'rudy',
            name: 'Rudy',
            supportsModeSwitching: false,
            colors: {
                background: '#1a2b3e',
                main: '#af8f5c',
                text: '#c9c8bf',
                shadePrimary: '#3a506c',
                shadeSecondary: '#152231',
            },
        },
        {
            id: 'ryujinscales',
            name: 'Ryujinscales',
            supportsModeSwitching: false,
            colors: {
                background: '#081426',
                main: '#f17754',
                text: '#ffe4bc',
                shadePrimary: '#ffbc90',
                shadeSecondary: '#040e1d',
            },
        },
        {
            id: 'serika',
            name: 'Serika',
            supportsModeSwitching: false,
            colors: {
                background: '#e1e1e3',
                main: '#e2b714',
                text: '#323437',
                shadePrimary: '#aaaeb3',
                shadeSecondary: '#d1d3d8',
            },
        },
        {
            id: 'serika-dark',
            name: 'Serika Dark',
            supportsModeSwitching: false,
            colors: {
                background: '#323437',
                main: '#e2b714',
                text: '#d1d0c5',
                shadePrimary: '#646669',
                shadeSecondary: '#2c2e31',
            },
        },
        {
            id: 'sewing-tin',
            name: 'Sewing Tin',
            supportsModeSwitching: false,
            colors: {
                background: '#241963',
                main: '#f2ce83',
                text: '#ffffff',
                shadePrimary: '#446ad5',
                shadeSecondary: '#2a277a',
            },
        },
        {
            id: 'sewing-tin-light',
            name: 'Sewing Tin Light',
            supportsModeSwitching: false,
            colors: {
                background: '#ffffff',
                main: '#2d2076',
                text: '#2d2076',
                shadePrimary: '#385eca',
                shadeSecondary: '#c8cedf',
            },
        },
        {
            id: 'shadow',
            name: 'Shadow',
            supportsModeSwitching: false,
            colors: {
                background: '#000',
                main: '#eee',
                text: '#eee',
                shadePrimary: '#444',
                shadeSecondary: '#171717',
            },
        },
        {
            id: 'shoko',
            name: 'Shoko',
            supportsModeSwitching: false,
            colors: {
                background: '#ced7e0',
                main: '#81c4dd',
                text: '#3b4c58',
                shadePrimary: '#7599b1',
                shadeSecondary: '#b7cada',
            },
        },
        {
            id: 'slambook',
            name: 'Slambook',
            supportsModeSwitching: false,
            colors: {
                background: '#fffdde',
                main: '#03001c',
                text: '#13005a',
                shadePrimary: '#1c82adc4',
                shadeSecondary: '#c6dce4',
            },
        },
        {
            id: 'snes',
            name: 'SNES',
            supportsModeSwitching: false,
            colors: {
                background: '#bfbec2',
                main: '#553d94',
                text: '#2e2e2e',
                shadePrimary: '#9f8ad4',
                shadeSecondary: '#b5b0c2',
            },
        },
        {
            id: 'soaring-skies',
            name: 'Soaring Skies',
            supportsModeSwitching: false,
            colors: {
                background: '#fff9f2',
                main: '#55c6f0',
                text: '#1d1e1e',
                shadePrimary: '#1e107a',
                shadeSecondary: '#e5ddd4',
            },
        },
        {
            id: 'solarized-dark',
            name: 'Solarized Dark',
            supportsModeSwitching: false,
            colors: {
                background: '#002b36',
                main: '#859900',
                text: '#268bd2',
                shadePrimary: '#2aa198',
                shadeSecondary: '#00222b',
            },
        },
        {
            id: 'solarized-light',
            name: 'Solarized Light',
            supportsModeSwitching: false,
            colors: {
                background: '#fdf6e3',
                main: '#859900',
                text: '#181819',
                shadePrimary: '#2aa198',
                shadeSecondary: '#e2d8be',
            },
        },
        {
            id: 'solarized-osaka',
            name: 'Solarized Osaka',
            supportsModeSwitching: false,
            colors: {
                background: '#00141a',
                main: '#859900',
                text: '#eee8d5',
                shadePrimary: '#2aa198',
                shadeSecondary: '#00222b',
            },
        },
        {
            id: 'sonokai',
            name: 'Sonokai',
            supportsModeSwitching: false,
            colors: {
                background: '#2c2e34',
                main: '#9ed072',
                text: '#e2e2e3',
                shadePrimary: '#e7c664',
                shadeSecondary: '#232429',
            },
        },
        {
            id: 'spider-man',
            name: 'Spider-Man',
            supportsModeSwitching: false,
            colors: {
                background: '#0d1219',
                main: '#e23636',
                text: '#f0f0f0',
                shadePrimary: '#0476f2',
                shadeSecondary: '#0b1c2e',
            },
        },
        {
            id: 'stealth',
            name: 'Stealth',
            supportsModeSwitching: false,
            colors: {
                background: '#010203',
                main: '#383e42',
                text: '#383e42',
                shadePrimary: '#5e676e',
                shadeSecondary: '#121212',
            },
        },
        {
            id: 'strawberry',
            name: 'Strawberry',
            supportsModeSwitching: false,
            colors: {
                background: '#f37f83',
                main: '#fcfcf8',
                text: '#fcfcf8',
                shadePrimary: '#e53c58',
                shadeSecondary: '#ef6e77',
            },
        },
        {
            id: 'striker',
            name: 'Striker',
            supportsModeSwitching: false,
            colors: {
                background: '#124883',
                main: '#d7dcda',
                text: '#d6dbd9',
                shadePrimary: '#0f2d4e',
                shadeSecondary: '#104176',
            },
        },
        {
            id: 'suisei',
            name: 'Suisei',
            supportsModeSwitching: false,
            colors: {
                background: '#3b4a62',
                main: '#bef0ff',
                text: '#dbdeeb',
                shadePrimary: '#fe9841',
                shadeSecondary: '#313e55',
            },
        },
        {
            id: 'sunset',
            name: 'Sunset',
            supportsModeSwitching: false,
            colors: {
                background: '#211e24',
                main: '#f79777',
                text: '#f4e0c9',
                shadePrimary: '#5b578e',
                shadeSecondary: '#161319',
            },
        },
        {
            id: 'superuser',
            name: 'Superuser',
            supportsModeSwitching: false,
            colors: {
                background: '#262a33',
                main: '#43ffaf',
                text: '#e5f7ef',
                shadePrimary: '#526777',
                shadeSecondary: '#1f232c',
            },
        },
        {
            id: 'sweden',
            name: 'Sweden',
            supportsModeSwitching: false,
            colors: {
                background: '#0058a3',
                main: '#ffcc02',
                text: '#ffffff',
                shadePrimary: '#57abdb',
                shadeSecondary: '#024f8e',
            },
        },
        {
            id: 'tangerine',
            name: 'Tangerine',
            supportsModeSwitching: false,
            colors: {
                background: '#ffede0',
                main: '#fe5503',
                text: '#3d1705',
                shadePrimary: '#ff9562',
                shadeSecondary: '#fdd3bf',
            },
        },
        {
            id: 'taro',
            name: 'Taro',
            supportsModeSwitching: false,
            colors: {
                background: '#b3baff',
                main: '#130f1a',
                text: '#130f1a',
                shadePrimary: '#6f6c91',
                shadeSecondary: '#a3a7df',
            },
        },
        {
            id: 'terminal',
            name: 'Terminal',
            supportsModeSwitching: false,
            colors: {
                background: '#191a1b',
                main: '#79a617',
                text: '#e7eae0',
                shadePrimary: '#48494b',
                shadeSecondary: '#141516',
            },
        },
        {
            id: 'terra',
            name: 'Terra',
            supportsModeSwitching: false,
            colors: {
                background: '#0c100e',
                main: '#89c559',
                text: '#f0edd1',
                shadePrimary: '#436029',
                shadeSecondary: '#0f1d18',
            },
        },
        {
            id: 'terrazzo',
            name: 'Terrazzo',
            supportsModeSwitching: false,
            colors: {
                background: '#f1e5da',
                main: '#e0794e',
                text: '#023e3b',
                shadePrimary: '#688e8f',
                shadeSecondary: '#e3d3c6',
            },
        },
        {
            id: 'terror-below',
            name: 'Terror Below',
            supportsModeSwitching: false,
            colors: {
                background: '#0b1e1a',
                main: '#66ac92',
                text: '#dceae5',
                shadePrimary: '#015c53',
                shadeSecondary: '#041715',
            },
        },
        {
            id: 'tiramisu',
            name: 'Tiramisu',
            supportsModeSwitching: false,
            colors: {
                background: '#cfc6b9',
                main: '#c0976f',
                text: '#7d5448',
                shadePrimary: '#c0976f',
                shadeSecondary: '#d0bca7',
            },
        },
        {
            id: 'trackday',
            name: 'Trackday',
            supportsModeSwitching: false,
            colors: {
                background: '#464d66',
                main: '#e0513e',
                text: '#cfcfcf',
                shadePrimary: '#5c7eb9',
                shadeSecondary: '#3d4359',
            },
        },
        {
            id: 'trance',
            name: 'Trance',
            supportsModeSwitching: false,
            colors: {
                background: '#00021b',
                main: '#e51376',
                text: '#fff',
                shadePrimary: '#3c4c79',
                shadeSecondary: '#18214c',
            },
        },
        {
            id: 'tron-orange',
            name: 'Tron Orange',
            supportsModeSwitching: false,
            colors: {
                background: '#0d1c1c',
                main: '#f0e800',
                text: '#ffffff',
                shadePrimary: '#ff6600',
                shadeSecondary: '#9c9191',
            },
        },
        {
            id: 'vaporwave',
            name: 'Vaporwave',
            supportsModeSwitching: false,
            colors: {
                background: '#a4a7ea',
                main: '#e368da',
                text: '#f1ebf1',
                shadePrimary: '#7c7faf',
                shadeSecondary: '#989bd9',
            },
        },
        {
            id: 'vesper',
            name: 'Vesper',
            supportsModeSwitching: false,
            colors: {
                background: '#101010',
                main: '#ffc799',
                text: '#ffffff',
                shadePrimary: '#a0a0a0',
                shadeSecondary: '#1c1c1c',
            },
        },
        {
            id: 'vesper-light',
            name: 'Vesper Light',
            supportsModeSwitching: false,
            colors: {
                background: '#ffffff',
                main: '#fb7100',
                text: '#000000',
                shadePrimary: '#a0a0a0',
                shadeSecondary: '#fff8f4',
            },
        },
        {
            id: 'viridescent',
            name: 'Viridescent',
            supportsModeSwitching: false,
            colors: {
                background: '#2c3333',
                main: '#95d5b2',
                text: '#e9f5db',
                shadePrimary: '#84a98c',
                shadeSecondary: '#232828',
            },
        },
        {
            id: 'voc',
            name: 'VOC',
            supportsModeSwitching: false,
            colors: {
                background: '#190618',
                main: '#e0caac',
                text: '#eeeae4',
                shadePrimary: '#4c1e48',
                shadeSecondary: '#2c0c28',
            },
        },
        {
            id: 'vs-code',
            name: 'VS Code',
            supportsModeSwitching: false,
            colors: {
                background: '#1e1e1e',
                main: '#007acc',
                text: '#d4d4d4',
                shadePrimary: '#4d4d4d',
                shadeSecondary: '#191919',
            },
        },
        {
            id: 'watermelon',
            name: 'Watermelon',
            supportsModeSwitching: false,
            colors: {
                background: '#1f4437',
                main: '#d6686f',
                text: '#cdc6bc',
                shadePrimary: '#3e7a65',
                shadeSecondary: '#244d3f',
            },
        },
        {
            id: 'wavez',
            name: 'Wavez',
            supportsModeSwitching: false,
            colors: {
                background: '#1c292f',
                main: '#6bde3b',
                text: '#e9efe6',
                shadePrimary: '#1f5e6b',
                shadeSecondary: '#1b3238',
            },
        },
    ];

    // Configuration
    const CONFIG = {
        storageKey: 'aether-selected-theme',
        position: 'top-right', // top-right, top-left, bottom-right, bottom-left
        zIndex: '2147483646', // One less than banner
        showThemePicker: true,
        defaultTheme: 'aether',
    };

    // Fonts (matching Aether: Cormorant Garamond for headings, Inter for UI/body)
    const FONT_SERIF = "'Cormorant Garamond', Georgia, Cambria, serif";
    const FONT_SANS  = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    const FONT_URL   = 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=Inter:wght@300;400;500;600;700&display=swap';

    // State
    let currentTheme = null;
    let previewTheme = null;
    let pickerElement = null;
    let isPickerOpen = false;
    let searchQuery = '';

    // Palette icon (used on the button AND in the modal header)
    const PALETTE_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="13.5" cy="6.5" r=".5" fill="currentColor" stroke="none"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor" stroke="none"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor" stroke="none"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor" stroke="none"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>`;
    const SEARCH_ICON  = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>`;

    // Load Google Fonts (Cormorant Garamond + Inter) once
    function loadFonts() {
        if (document.querySelector('link[data-aether-theme-fonts]')) return;
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = FONT_URL;
        link.setAttribute('data-aether-theme-fonts', 'true');
        document.head.appendChild(link);

        // Ask the browser to parse the exact weights we use so there's no FOUT
        if (document.fonts && document.fonts.load) {
            document.fonts.load('600 20px "Cormorant Garamond"').catch(function() {});
            document.fonts.load('500 14px "Inter"').catch(function() {});
            document.fonts.load('400 13px "Inter"').catch(function() {});
        }
    }

    // Helper functions
    function getThemeById(id) {
        return THEMES.find(theme => theme.id === id);
    }

    function getDefaultTheme() {
        return getThemeById(CONFIG.defaultTheme) || THEMES[0];
    }

    function getContrastColor(backgroundColor) {
        let lightness;

        if (backgroundColor.startsWith('#')) {
            let hex = backgroundColor.replace('#', '');
            if (hex.length === 3) {
                hex = hex.split('').map(c => c + c).join('');
            }
            const r = parseInt(hex.substr(0, 2), 16);
            const g = parseInt(hex.substr(2, 2), 16);
            const b = parseInt(hex.substr(4, 2), 16);
            const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
            lightness = luminance / 255;
        } else {
            lightness = 0;
        }

        return lightness > 0.5 ? '#020817' : '#f8fafc';
    }

    function getPrimaryForeground(backgroundColor) {
        let lightness;

        if (backgroundColor.startsWith('#')) {
            let hex = backgroundColor.replace('#', '');
            if (hex.length === 3) {
                hex = hex.split('').map(c => c + c).join('');
            }
            const r = parseInt(hex.substr(0, 2), 16);
            const g = parseInt(hex.substr(2, 2), 16);
            const b = parseInt(hex.substr(4, 2), 16);
            const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
            lightness = luminance / 255;
        } else {
            lightness = 1;
        }

        return lightness > 0.5 ? '#020817' : '#f8fafc';
    }

    function isLightTheme(theme) {
        return !theme.supportsModeSwitching && (
            theme.colors.background === '#ffffff' ||
            theme.colors.background.startsWith('#f') ||
            theme.colors.background.startsWith('#e')
        );
    }

    // Theme application
    function applyTheme(theme, save = false) {
        const root = document.documentElement;
        const colors = theme.colors;

        root.style.setProperty('--theme-background', colors.background);
        root.style.setProperty('--theme-main', colors.main);

        const textColor = getContrastColor(colors.background);
        root.style.setProperty('--theme-text', textColor);

        const primaryForeground = getPrimaryForeground(colors.main);
        root.style.setProperty('--primary-foreground', primaryForeground);

        root.style.setProperty('--theme-shade-primary', colors.shadePrimary);
        root.style.setProperty('--theme-shade-secondary', colors.shadeSecondary);
        root.setAttribute('data-theme', 'custom');

        if (save) {
            localStorage.setItem(CONFIG.storageKey, theme.id);
            currentTheme = theme;
        }
    }

    // Inject global scrollbar-hiding CSS once
    function injectScrollbarStyles() {
        if (document.getElementById('aether-theme-picker-styles')) return;
        const style = document.createElement('style');
        style.id = 'aether-theme-picker-styles';
        style.textContent = `
            #aether-theme-grid::-webkit-scrollbar { width: 0 !important; height: 0 !important; display: none !important; }
            #aether-theme-grid { scrollbar-width: none !important; -ms-overflow-style: none !important; }
            #aether-theme-grid::-webkit-scrollbar-track { display: none !important; }
            #aether-theme-grid::-webkit-scrollbar-thumb { display: none !important; }
        `;
        document.head.appendChild(style);
    }

    // Theme picker UI
    function createThemePicker() {
        injectScrollbarStyles();

        // ---------------------------------------------------------------
        // Main trigger button (palette icon)
        // ---------------------------------------------------------------
        const pickerButton = document.createElement('button');
        pickerButton.id = 'aether-theme-picker-button';
        pickerButton.innerHTML = PALETTE_ICON;
        pickerButton.setAttribute('aria-label', 'Open theme picker');
        pickerButton.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            width: 40px;
            height: 40px;
            border-radius: 8px;
            background: rgba(30, 30, 40, 0.95);
            color: white;
            border: 1px solid rgba(255, 255, 255, 0.1);
            cursor: pointer;
            z-index: ${CONFIG.zIndex};
            display: flex;
            align-items: center;
            justify-content: center;
            transition: transform 0.2s ease, box-shadow 0.2s ease;
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
        `;

        pickerButton.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.05)';
            this.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.3)';
        });

        pickerButton.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
            this.style.boxShadow = 'none';
        });

        pickerButton.addEventListener('click', function(e) {
            // Prevent the document-level outside-click handler from instantly
            // closing the modal we are about to open.
            e.stopPropagation();
            togglePicker();
        });

        // ---------------------------------------------------------------
        // Dropdown / modal
        // ---------------------------------------------------------------
        const pickerDropdown = document.createElement('div');
        pickerDropdown.id = 'aether-theme-picker-dropdown';

        let posStyle = '';
        if (CONFIG.position === 'top-right') posStyle = 'top: 70px; right: 20px;';
        if (CONFIG.position === 'top-left') posStyle = 'top: 70px; left: 20px;';
        if (CONFIG.position === 'bottom-right') posStyle = 'bottom: 70px; right: 20px;';
        if (CONFIG.position === 'bottom-left') posStyle = 'bottom: 70px; left: 20px;';

        pickerDropdown.style.cssText = `
            position: fixed;
            ${posStyle}
            width: 1000px;
            max-width: calc(100vw - 40px);
            height: 80vh;
            max-height: 80vh;
            background: var(--background, #ffffff);
            border: 1px solid var(--border, rgba(0, 0, 0, 0.1));
            border-radius: 12px;
            z-index: ${CONFIG.zIndex};
            display: none;
            flex-direction: column;
            overflow: hidden;
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
            font-family: ${FONT_SANS};
            color: var(--foreground, #020817);
        `;

        // Clicking anywhere inside the modal must not bubble to the document
        // outside-click handler (this would otherwise close the modal when a
        // child node is removed mid-event, e.g. when picking a theme).
        pickerDropdown.addEventListener('click', function(e) {
            e.stopPropagation();
        });

        // ---------------- Header (palette icon + title) ----------------
        const header = document.createElement('div');
        header.style.cssText = `
            flex-shrink: 0;
            padding: 16px 56px 16px 16px;
            border-bottom: 1px solid var(--border, rgba(0, 0, 0, 0.1));
            display: flex;
            align-items: center;
            gap: 10px;
            font-family: ${FONT_SERIF};
        `;

        const headerIcon = document.createElement('span');
        headerIcon.innerHTML = PALETTE_ICON;
        headerIcon.style.cssText = `
            display: inline-flex;
            align-items: center;
            justify-content: center;
            color: var(--primary, #3b82f6);
        `;

        const headerTitle = document.createElement('span');
        headerTitle.textContent = 'Kies een thema.';
        headerTitle.style.cssText = `
            font-family: ${FONT_SERIF};
            font-size: 22px;
            font-weight: 600;
            line-height: 1;
            letter-spacing: -0.01em;
        `;

        header.appendChild(headerIcon);
        header.appendChild(headerTitle);

        // ---------------- Close button (in header corner) ----------------
        const closeButton = document.createElement('button');
        closeButton.innerHTML = '✕';
        closeButton.setAttribute('aria-label', 'Close theme picker');
        closeButton.style.cssText = `
            position: absolute;
            top: 14px;
            right: 14px;
            background: none;
            border: none;
            color: var(--muted-foreground, #64748b);
            cursor: pointer;
            font-size: 16px;
            padding: 6px 8px;
            border-radius: 6px;
            line-height: 1;
            font-family: ${FONT_SANS};
            transition: color 0.2s ease, background 0.2s ease;
        `;

        closeButton.addEventListener('mouseenter', function() {
            this.style.color = 'var(--foreground, #020817)';
            this.style.background = 'var(--secondary, #f1f5f9)';
        });

        closeButton.addEventListener('mouseleave', function() {
            this.style.color = 'var(--muted-foreground, #64748b)';
            this.style.background = 'transparent';
        });

        closeButton.addEventListener('click', function(e) {
            e.stopPropagation();
            closePicker();
        });

        // ---------------- Search (icon inside input, left) ----------------
        const searchSection = document.createElement('div');
        searchSection.style.cssText = `
            flex-shrink: 0;
            padding: 16px;
            border-bottom: 1px solid var(--border, rgba(0, 0, 0, 0.1));
        `;

        const searchWrapper = document.createElement('div');
        searchWrapper.style.cssText = `
            position: relative;
            width: 100%;
        `;

        const searchIcon = document.createElement('span');
        searchIcon.innerHTML = SEARCH_ICON;
        searchIcon.style.cssText = `
            position: absolute;
            left: 12px;
            top: 50%;
            transform: translateY(-50%);
            display: inline-flex;
            align-items: center;
            justify-content: center;
            color: var(--muted-foreground, #64748b);
            pointer-events: none;
            line-height: 0;
        `;

        const searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.placeholder = 'Zoek thema op naam...';
        searchInput.style.cssText = `
            width: 100%;
            box-sizing: border-box;
            padding: 10px 12px 10px 36px;
            border-radius: 8px;
            border: 1px solid var(--border, rgba(0, 0, 0, 0.1));
            background: var(--background, #ffffff);
            color: var(--foreground, #020817);
            font-size: 14px;
            outline: none;
            font-family: ${FONT_SANS};
            transition: border-color 0.15s ease, box-shadow 0.15s ease;
        `;

        searchInput.addEventListener('focus', function() {
            this.style.borderColor = 'var(--primary, #3b82f6)';
            this.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.15)';
        });

        searchInput.addEventListener('blur', function() {
            this.style.borderColor = 'var(--border, rgba(0, 0, 0, 0.1))';
            this.style.boxShadow = 'none';
        });

        searchInput.addEventListener('input', function() {
            searchQuery = this.value;
            renderThemeGrid();
        });

        searchWrapper.appendChild(searchIcon);
        searchWrapper.appendChild(searchInput);
        searchSection.appendChild(searchWrapper);

        // ---------------- Scrollable grid container ----------------
        const themeGridContainer = document.createElement('div');
        themeGridContainer.id = 'aether-theme-grid';
        themeGridContainer.style.cssText = `
            flex: 1 1 auto;
            min-height: 0;
            overflow-y: auto;
            overflow-x: hidden;
            padding: 16px;
            -webkit-overflow-scrolling: touch;
        `;

        const themeGrid = document.createElement('div');
        themeGrid.id = 'aether-theme-grid-inner';
        themeGrid.style.cssText = `
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
            width: 100%;
        `;

        function updateGridColumns() {
            const w = window.innerWidth;
            if (w >= 1280) {
                themeGrid.style.gridTemplateColumns = 'repeat(6, 1fr)';
            } else if (w >= 1024) {
                themeGrid.style.gridTemplateColumns = 'repeat(5, 1fr)';
            } else if (w >= 768) {
                themeGrid.style.gridTemplateColumns = 'repeat(4, 1fr)';
            } else if (w >= 640) {
                themeGrid.style.gridTemplateColumns = 'repeat(3, 1fr)';
            } else {
                themeGrid.style.gridTemplateColumns = 'repeat(2, 1fr)';
            }
        }
        updateGridColumns();

        themeGridContainer.appendChild(themeGrid);

        // ---------------- Sticky footer with save button ----------------
        const saveButtonContainer = document.createElement('div');
        saveButtonContainer.style.cssText = `
            flex-shrink: 0;
            padding: 14px 16px;
            border-top: 1px solid var(--border, rgba(0, 0, 0, 0.1));
            background: var(--background, #ffffff);
            display: flex;
            justify-content: flex-end;
            align-items: center;
            gap: 8px;
        `;

        const saveButton = document.createElement('button');
        saveButton.textContent = 'Opslaan';
        saveButton.style.cssText = `
            padding: 9px 18px;
            border-radius: 8px;
            background: var(--primary, #3b82f6);
            color: var(--primary-foreground, #ffffff);
            border: none;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            font-family: ${FONT_SANS};
            transition: background 0.2s ease, transform 0.15s ease;
        `;

        saveButton.addEventListener('mouseenter', function() {
            this.style.background = 'rgba(59, 130, 246, 0.9)';
        });

        saveButton.addEventListener('mouseleave', function() {
            this.style.background = 'var(--primary, #3b82f6)';
        });

        // Saves the current preview to localStorage, then closes the modal.
        saveButton.addEventListener('click', function(e) {
            e.stopPropagation();
            const themeToSave = previewTheme || currentTheme || getDefaultTheme();
            applyTheme(themeToSave, true);
            previewTheme = null;
            closePicker();
        });

        saveButtonContainer.appendChild(saveButton);

        // ---------------- Assemble ----------------
        pickerDropdown.appendChild(closeButton);
        pickerDropdown.appendChild(header);
        pickerDropdown.appendChild(searchSection);
        pickerDropdown.appendChild(themeGridContainer);
        pickerDropdown.appendChild(saveButtonContainer);

        pickerElement = {
            button: pickerButton,
            dropdown: pickerDropdown,
            grid: themeGrid,
            updateGridColumns: updateGridColumns,
        };

        return { button: pickerButton, dropdown: pickerDropdown };
    }

    function createThemeButton(theme) {
        const button = document.createElement('button');
        button.title = theme.name;
        button.dataset.themeId = theme.id;
        button.type = 'button';

        const isPreview = previewTheme && previewTheme.id === theme.id;
        const isSelected = !previewTheme && currentTheme && currentTheme.id === theme.id;

        button.style.cssText = `
            position: relative;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 8px;
            padding: 12px;
            border-radius: 8px;
            border: 2px solid ${isPreview ? 'var(--primary, #3b82f6)' : isSelected ? 'var(--primary, #3b82f6)' : 'var(--border, rgba(0, 0, 0, 0.1))'};
            background: ${isPreview ? 'var(--secondary, #f1f5f9)' : isSelected ? 'var(--secondary, #f1f5f9)' : 'transparent'};
            transition: border-color 0.2s, background 0.2s;
            cursor: pointer;
            font-family: ${FONT_SANS};
        `;

        button.addEventListener('mouseenter', function() {
            if (!isPreview && !isSelected) {
                this.style.borderColor = 'rgba(59, 130, 246, 0.5)';
                this.style.backgroundColor = 'var(--secondary, #f1f5f9)';
            }
        });

        button.addEventListener('mouseleave', function() {
            if (!isPreview && !isSelected) {
                this.style.borderColor = 'var(--border, rgba(0, 0, 0, 0.1))';
                this.style.backgroundColor = 'transparent';
            }
        });

        // Selected checkmark
        if (isSelected) {
            const checkmark = document.createElement('div');
            checkmark.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary, #3b82f6)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;
            checkmark.style.cssText = `position: absolute; right: 8px; top: 8px;`;
            button.appendChild(checkmark);
        }

        // Preview indicator
        if (isPreview) {
            const previewIndicator = document.createElement('div');
            previewIndicator.textContent = 'Preview';
            previewIndicator.style.cssText = `
                position: absolute;
                right: 8px;
                top: 8px;
                border-radius: 9999px;
                background: var(--primary, #3b82f6);
                padding: 2px 7px;
                font-size: 10px;
                font-weight: 600;
                color: var(--primary-foreground, #ffffff);
                letter-spacing: 0.02em;
                font-family: ${FONT_SANS};
            `;
            button.appendChild(previewIndicator);
        }

        // Default badge
        if (theme.isDefault) {
            const defaultBadge = document.createElement('div');
            defaultBadge.textContent = 'Default';
            defaultBadge.style.cssText = `
                position: absolute;
                left: 8px;
                top: 8px;
                border-radius: 9999px;
                background: var(--primary, #3b82f6);
                padding: 2px 7px;
                font-size: 10px;
                font-weight: 600;
                color: var(--primary-foreground, #ffffff);
                letter-spacing: 0.02em;
                font-family: ${FONT_SANS};
            `;
            button.appendChild(defaultBadge);
        }

        // Theme preview thumbnail
        const preview = document.createElement('div');
        preview.style.cssText = `
            height: 80px;
            width: 100%;
            border-radius: 6px;
            overflow: hidden;
            border: 1px solid ${theme.colors.shadePrimary};
            background: ${theme.colors.background};
        `;

        const previewContent = document.createElement('div');
        previewContent.style.cssText = `display: flex; flex-direction: column; height: 100%;`;

        const headerBar = document.createElement('div');
        headerBar.style.cssText = `
            height: 32px;
            width: 100%;
            display: flex;
            align-items: center;
            padding: 0 8px;
            gap: 4px;
            background: ${theme.colors.main};
        `;

        const dot = document.createElement('div');
        dot.style.cssText = `
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: ${theme.colors.text};
        `;

        const bar = document.createElement('div');
        bar.style.cssText = `
            width: 32px;
            height: 8px;
            border-radius: 4px;
            background: ${theme.colors.text};
            opacity: 0.7;
        `;

        headerBar.appendChild(dot);
        headerBar.appendChild(bar);

        const contentArea = document.createElement('div');
        contentArea.style.cssText = `
            flex: 1;
            padding: 8px;
            display: flex;
            flex-direction: column;
            gap: 4px;
        `;

        const line1 = document.createElement('div');
        line1.style.cssText = `width: 100%; height: 8px; border-radius: 4px; background: ${theme.colors.shadeSecondary};`;

        const line2 = document.createElement('div');
        line2.style.cssText = `width: 75%; height: 8px; border-radius: 4px; background: ${theme.colors.shadeSecondary}; opacity: 0.6;`;

        const line3 = document.createElement('div');
        line3.style.cssText = `width: 50%; height: 8px; border-radius: 4px; background: ${theme.colors.shadeSecondary}; opacity: 0.4;`;

        contentArea.appendChild(line1);
        contentArea.appendChild(line2);
        contentArea.appendChild(line3);

        previewContent.appendChild(headerBar);
        previewContent.appendChild(contentArea);
        preview.appendChild(previewContent);

        // Theme name
        const themeName = document.createElement('span');
        themeName.textContent = theme.name;
        themeName.style.cssText = `
            text-align: center;
            font-size: 12px;
            font-weight: 500;
            color: var(--foreground, #020817);
            line-height: 1.2;
            font-family: ${FONT_SANS};
        `;

        // Light/Dark indicator
        if (!theme.supportsModeSwitching) {
            const indicator = document.createElement('span');
            indicator.textContent = isLightTheme(theme) ? 'Light' : 'Dark';
            indicator.style.cssText = `
                font-size: 10px;
                color: var(--muted-foreground, #64748b);
                line-height: 1;
                font-family: ${FONT_SANS};
            `;
            button.appendChild(indicator);
        }

        button.appendChild(preview);
        button.appendChild(themeName);

        // Clicking a theme applies a preview — modal MUST stay open.
        // stopPropagation is critical: renderThemeGrid() rebuilds the grid,
        // detaching this button from the DOM. Without stopping the event the
        // document outside-click handler would see a detached target and
        // close the modal.
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            previewTheme = theme;
            applyTheme(theme, false); // preview only, not saved
            renderThemeGrid();        // re-render so preview state updates
        });

        return button;
    }

    function renderThemeGrid() {
        const grid = document.getElementById('aether-theme-grid-inner');
        if (!grid) return;

        grid.innerHTML = '';

        const filteredThemes = THEMES.filter(theme =>
            theme.name.toLowerCase().includes(searchQuery.toLowerCase())
        );

        if (filteredThemes.length === 0) {
            const noResults = document.createElement('div');
            noResults.style.cssText = `
                grid-column: 1 / -1;
                text-align: center;
                padding: 32px;
                color: var(--muted-foreground, #64748b);
                font-family: ${FONT_SANS};
            `;
            noResults.textContent = `Geen thema's gevonden met "${searchQuery}"`;
            grid.appendChild(noResults);
            return;
        }

        filteredThemes.forEach(theme => {
            const button = createThemeButton(theme);
            grid.appendChild(button);
        });
    }

    function togglePicker() {
        if (!pickerElement) return;

        isPickerOpen = !isPickerOpen;
        pickerElement.dropdown.style.display = isPickerOpen ? 'flex' : 'none';

        if (isPickerOpen) {
            renderThemeGrid();
        } else {
            previewTheme = null;
            renderThemeGrid();
        }
    }

    function closePicker() {
        if (!pickerElement) return;

        isPickerOpen = false;
        pickerElement.dropdown.style.display = 'none';
        previewTheme = null;
        renderThemeGrid();
    }

    // Close picker when clicking outside
    document.addEventListener('click', function(event) {
        if (!isPickerOpen || !pickerElement) return;

        const target = event.target;

        // Ignore clicks on detached nodes (e.g. a theme button that was just
        // replaced by renderThemeGrid). Their original click handler has
        // already run and stopped propagation, but as a belt-and-braces
        // guard, never close on a detached target.
        if (!document.body.contains(target)) return;

        if (!pickerElement.button.contains(target) &&
            !pickerElement.dropdown.contains(target)) {
            closePicker();
        }
    });

    // Escape key closes the modal
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && isPickerOpen) {
            closePicker();
        }
    });

    // Handle window resize for responsive grid
    window.addEventListener('resize', function() {
        if (pickerElement && pickerElement.updateGridColumns) {
            pickerElement.updateGridColumns();
        }
    });

    // Initialize
    function init() {
        loadFonts();

        const savedThemeId = localStorage.getItem(CONFIG.storageKey);

        if (savedThemeId) {
            const savedTheme = getThemeById(savedThemeId);
            if (savedTheme) {
                currentTheme = savedTheme;
            }
        }

        if (!currentTheme) {
            currentTheme = getDefaultTheme();
        }

        applyTheme(currentTheme, true);

        if (CONFIG.showThemePicker) {
            const picker = createThemePicker();
            document.body.appendChild(picker.button);
            document.body.appendChild(picker.dropdown);
        }
    }

    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Export for external use
    window.AetherThemePicker = {
        THEMES,
        applyTheme,
        getCurrentTheme: () => currentTheme,
        getPreviewTheme: () => previewTheme,
        setTheme: (themeId) => {
            const theme = getThemeById(themeId);
            if (theme) {
                previewTheme = theme;
                applyTheme(theme, false);
            }
        },
        saveTheme: () => {
            if (previewTheme) {
                applyTheme(previewTheme, true);
            }
        },
        CONFIG,
    };

})();