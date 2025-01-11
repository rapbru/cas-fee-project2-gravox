const mockPositions = [
    {
        "id": 1,
        "number": 1,
        "name": "Airgenex",
        "flightbar": 0,
        "articleName": "Artikel",
        "customerName": "Kunde",
        "time": {
            "actual": 0,
            "preset": 900
        },
        "temperature": {
            "actual": 84.5,
            "preset": 84.5,
            "isPresent": true
        },
        "current": {
            "actual": 0,
            "preset": 0,
            "isPresent": false
        },
        "voltage": {
            "actual": 0,
            "preset": 0,
            "isPresent": false
        }
    },
    {
        "id": 2,
        "number": 2,
        "name": "Reserve",
        "flightbar": 0,
        "articleName": "Artikel",
        "customerName": "Kunde",
        "time": {
            "actual": 0,
            "preset": 60
        },
        "temperature": {
            "actual": 50,
            "preset": 50,
            "isPresent": false
        },
        "current": {
            "actual": 0,
            "preset": 0,
            "isPresent": false
        },
        "voltage": {
            "actual": 0,
            "preset": 0,
            "isPresent": false
        }
    },
    {
        "id": 3,
        "number": 3,
        "name": "Blaupassivieren",
        "flightbar": 0,
        "articleName": "Artikel",
        "customerName": "Kunde",
        "time": {
            "actual": 0,
            "preset": 60
        },
        "temperature": {
            "actual": 0,
            "preset": 0,
            "isPresent": true
        },
        "current": {
            "actual": 0,
            "preset": 0,
            "isPresent": true
        },
        "voltage": {
            "actual": 0,
            "preset": 0,
            "isPresent": true
        }
    },
    {
        "id": 4,
        "number": 4,
        "name": "Blaupassivieren",
        "flightbar": 0,
        "articleName": "Artikel",
        "customerName": "Kunde",
        "time": {
            "actual": 0,
            "preset": 60
        },
        "temperature": {
            "actual": 0,
            "preset": 0,
            "isPresent": true
        },
        "current": {
            "actual": 0,
            "preset": 0,
            "isPresent": true
        },
        "voltage": {
            "actual": 0,
            "preset": 0,
            "isPresent": true
        }
    },
    {
        "id": 5,
        "number": 5,
        "name": "Kreislaufspülen",
        "flightbar": 0,
        "articleName": "Artikel",
        "customerName": "Kunde",
        "time": {
            "actual": 0,
            "preset": 30
        },
        "temperature": {
            "actual": 22.299999237060547,
            "preset": 30,
            "isPresent": true
        },
        "current": {
            "actual": 0,
            "preset": 0,
            "isPresent": false
        },
        "voltage": {
            "actual": 0,
            "preset": 0,
            "isPresent": false
        }
    },
    {
        "id": 6,
        "number": 6,
        "name": "Kreislaufspülen",
        "flightbar": 0,
        "articleName": "Artikel",
        "customerName": "Kunde",
        "time": {
            "actual": 0,
            "preset": 690
        },
        "temperature": {
            "actual": 82,
            "preset": 82,
            "isPresent": false
        },
        "current": {
            "actual": 0,
            "preset": 0,
            "isPresent": false
        },
        "voltage": {
            "actual": 0,
            "preset": 0,
            "isPresent": false
        }
    },
    {
        "id": 8,
        "number": 8,
        "name": "Standspülen",
        "flightbar": 0,
        "articleName": "Artikel",
        "customerName": "Kunde",
        "time": {
            "actual": 0,
            "preset": 60
        },
        "temperature": {
            "actual": 29.799999237060547,
            "preset": 30,
            "isPresent": false
        },
        "current": {
            "actual": 0,
            "preset": 0,
            "isPresent": false
        },
        "voltage": {
            "actual": 0,
            "preset": 0,
            "isPresent": false
        }
    },
    {
        "id": 9,
        "number": 9,
        "name": "Standspülen",
        "flightbar": 0,
        "articleName": "Artikel",
        "customerName": "Kunde",
        "time": {
            "actual": 0,
            "preset": 30
        },
        "temperature": {
            "actual": 0,
            "preset": 0,
            "isPresent": false
        },
        "current": {
            "actual": 0,
            "preset": 0,
            "isPresent": false
        },
        "voltage": {
            "actual": 0,
            "preset": 0,
            "isPresent": false
        }
    },
    {
        "id": 10,
        "number": 10,
        "name": "Abkochentfetten",
        "flightbar": 0,
        "articleName": "Artikel",
        "customerName": "Kunde",
        "time": {
            "actual": 0,
            "preset": 1680
        },
        "temperature": {
            "actual": 54.5,
            "preset": 54.5,
            "isPresent": true
        },
        "current": {
            "actual": 0,
            "preset": 0,
            "isPresent": false
        },
        "voltage": {
            "actual": 0,
            "preset": 0,
            "isPresent": false
        }
    },
    {
        "id": 11,
        "number": 11,
        "name": "Beizen",
        "flightbar": 0,
        "articleName": "Artikel",
        "customerName": "Kunde",
        "time": {
            "actual": 0,
            "preset": 1500
        },
        "temperature": {
            "actual": 54.5,
            "preset": 54.5,
            "isPresent": true
        },
        "current": {
            "actual": 0,
            "preset": 0,
            "isPresent": false
        },
        "voltage": {
            "actual": 0,
            "preset": 0,
            "isPresent": false
        }
    },
    {
        "id": 12,
        "number": 12,
        "name": "Kreislaufspülen",
        "flightbar": 0,
        "articleName": "Artikel",
        "customerName": "Kunde",
        "time": {
            "actual": 0,
            "preset": 1680
        },
        "temperature": {
            "actual": 84.5,
            "preset": 84.5,
            "isPresent": true
        },
        "current": {
            "actual": 0,
            "preset": 0,
            "isPresent": false
        },
        "voltage": {
            "actual": 0,
            "preset": 0,
            "isPresent": false
        }
    },
    {
        "id": 13,
        "number": 13,
        "name": "Standspülen",
        "flightbar": 0,
        "articleName": "Artikel",
        "customerName": "Kunde",
        "time": {
            "actual": 0,
            "preset": 540
        },
        "temperature": {
            "actual": 84.5,
            "preset": 84.5,
            "isPresent": false
        },
        "current": {
            "actual": 0,
            "preset": 0,
            "isPresent": false
        },
        "voltage": {
            "actual": 0,
            "preset": 0,
            "isPresent": false
        }
    },
    {
        "id": 14,
        "number": 14,
        "name": "El. Entfetten",
        "flightbar": 0,
        "articleName": "Artikel",
        "customerName": "Kunde",
        "time": {
            "actual": 0,
            "preset": 60
        },
        "temperature": {
            "actual": 0,
            "preset": 0,
            "isPresent": true
        },
        "current": {
            "actual": 0,
            "preset": 0,
            "isPresent": true
        },
        "voltage": {
            "actual": 0,
            "preset": 0,
            "isPresent": true
        }
    },
    {
        "id": 15,
        "number": 15,
        "name": "Dekapieren",
        "flightbar": 0,
        "articleName": "Artikel",
        "customerName": "Kunde",
        "time": {
            "actual": 0,
            "preset": 60
        },
        "temperature": {
            "actual": 39.79999923706055,
            "preset": 40,
            "isPresent": false
        },
        "current": {
            "actual": 0,
            "preset": 0,
            "isPresent": false
        },
        "voltage": {
            "actual": 0,
            "preset": 0,
            "isPresent": false
        }
    },
    {
        "id": 16,
        "number": 16,
        "name": "Kreislaufspülen",
        "flightbar": 0,
        "articleName": "Artikel",
        "customerName": "Kunde",
        "time": {
            "actual": 0,
            "preset": 60
        },
        "temperature": {
            "actual": 39.79999923706055,
            "preset": 40,
            "isPresent": false
        },
        "current": {
            "actual": 0,
            "preset": 0,
            "isPresent": false
        },
        "voltage": {
            "actual": 0,
            "preset": 0,
            "isPresent": false
        }
    },
    {
        "id": 17,
        "number": 17,
        "name": "Zink 1",
        "flightbar": 0,
        "articleName": "Artikel",
        "customerName": "Kunde",
        "time": {
            "actual": 0,
            "preset": 60
        },
        "temperature": {
            "actual": 28,
            "preset": 28,
            "isPresent": true
        },
        "current": {
            "actual": 0,
            "preset": 0,
            "isPresent": true
        },
        "voltage": {
            "actual": 0,
            "preset": 0,
            "isPresent": true
        }
    },
    {
        "id": 18,
        "number": 18,
        "name": "Zink 2",
        "flightbar": 0,
        "articleName": "Artikel",
        "customerName": "Kunde",
        "time": {
            "actual": 0,
            "preset": 60
        },
        "temperature": {
            "actual": 30,
            "preset": 30,
            "isPresent": true
        },
        "current": {
            "actual": 0,
            "preset": 0,
            "isPresent": true
        },
        "voltage": {
            "actual": 0,
            "preset": 0,
            "isPresent": true
        }
    },
    {
        "id": 19,
        "number": 19,
        "name": "Zink 3",
        "flightbar": 0,
        "articleName": "Artikel",
        "customerName": "Kunde",
        "time": {
            "actual": 0,
            "preset": 60
        },
        "temperature": {
            "actual": 24,
            "preset": 24,
            "isPresent": true
        },
        "current": {
            "actual": 0,
            "preset": 0,
            "isPresent": true
        },
        "voltage": {
            "actual": 0,
            "preset": 0,
            "isPresent": true
        }
    },
    {
        "id": 20,
        "number": 20,
        "name": "Zink 4",
        "flightbar": 0,
        "articleName": "Artikel",
        "customerName": "Kunde",
        "time": {
            "actual": 0,
            "preset": 30
        },
        "temperature": {
            "actual": 35.20000076293945,
            "preset": 35,
            "isPresent": true
        },
        "current": {
            "actual": 0,
            "preset": 0,
            "isPresent": true
        },
        "voltage": {
            "actual": 0,
            "preset": 0,
            "isPresent": true
        }
    },
    {
        "id": 21,
        "number": 21,
        "name": "Standspülen",
        "flightbar": 0,
        "articleName": "Artikel",
        "customerName": "Kunde",
        "time": {
            "actual": 0,
            "preset": 600
        },
        "temperature": {
            "actual": 35,
            "preset": 35,
            "isPresent": false
        },
        "current": {
            "actual": 0,
            "preset": 0,
            "isPresent": false
        },
        "voltage": {
            "actual": 0,
            "preset": 0,
            "isPresent": false
        }
    },
    {
        "id": 50,
        "number": 50,
        "name": "Laden/Entladen",
        "flightbar": 0,
        "articleName": "Artikel",
        "customerName": "Kunde",
        "time": {
            "actual": 0,
            "preset": 1
        },
        "temperature": {
            "actual": 0,
            "preset": 0,
            "isPresent": false
        },
        "current": {
            "actual": 0,
            "preset": 0,
            "isPresent": false
        },
        "voltage": {
            "actual": 0,
            "preset": 0,
            "isPresent": false
        }
    },
    {
        "id": 51,
        "number": 51,
        "name": "Speicher",
        "flightbar": 1,
        "articleName": "Artikel",
        "customerName": "Kunde",
        "time": {
            "actual": 10303,
            "preset": 1
        },
        "temperature": {
            "actual": 0,
            "preset": 0,
            "isPresent": false
        },
        "current": {
            "actual": 0,
            "preset": 0,
            "isPresent": false
        },
        "voltage": {
            "actual": 0,
            "preset": 0,
            "isPresent": false
        }
    },
    {
        "id": 52,
        "number": 52,
        "name": "Speicher",
        "flightbar": 0,
        "articleName": "Artikel",
        "customerName": "Kunde",
        "time": {
            "actual": 0,
            "preset": 0
        },
        "temperature": {
            "actual": 0,
            "preset": 0,
            "isPresent": false
        },
        "current": {
            "actual": 0,
            "preset": 0,
            "isPresent": false
        },
        "voltage": {
            "actual": 0,
            "preset": 0,
            "isPresent": false
        }
    }
];

export default mockPositions;