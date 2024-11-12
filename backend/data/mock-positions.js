const mockPositions = [
    {
        "number": 50,
        "name": "Laden/Entladen",
        "flightbar": 0,
        "articleName": "Artikel",
        "customerName": "Kunde",
        "time": {
            "actual": 0,
            "preset": 0.016666666666666666
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
        "number": 51,
        "name": "Speicher 1",
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
    },
    {
        "number": 1,
        "name": "Airgenex",
        "flightbar": 8,
        "articleName": "Artikel",
        "customerName": "Kunde",
        "time": {
            "actual": 1.9666666666666666,
            "preset": 2.5
        },
        "temperature": {
            "actual": 2,
            "preset": 2,
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
        "number": 2,
        "name": "Reserve",
        "flightbar": 0,
        "articleName": "Artikel",
        "customerName": "Kunde",
        "time": {
            "actual": 0,
            "preset": 1
        },
        "temperature": {
            "actual": 2,
            "preset": 2,
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
        "number": 3,
        "name": "Reserve",
        "flightbar": 0,
        "articleName": "Artikel",
        "customerName": "Kunde",
        "time": {
            "actual": 0,
            "preset": 1
        },
        "temperature": {
            "actual": 2,
            "preset": 2,
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
        "number": 4,
        "name": "Blaupassivieren",
        "flightbar": 0,
        "articleName": "Artikel",
        "customerName": "Kunde",
        "time": {
            "actual": 0,
            "preset": 0.1
        },
        "temperature": {
            "actual": 25,
            "preset": 25,
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
        "number": 5,
        "name": "Kreislaufspülen",
        "flightbar": 0,
        "articleName": "Artikel",
        "customerName": "Kunde",
        "time": {
            "actual": 0,
            "preset": 5
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
        "number": 6,
        "name": "Kreislaufspülen",
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
        "number": 8,
        "name": "Standspülen",
        "flightbar": 0,
        "articleName": "Artikel",
        "customerName": "Kunde",
        "time": {
            "actual": 0,
            "preset": 1
        },
        "temperature": {
            "actual": 8,
            "preset": 8,
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
        "number": 9,
        "name": "Standspülen",
        "flightbar": 0,
        "articleName": "Artikel",
        "customerName": "Kunde",
        "time": {
            "actual": 0,
            "preset": 1
        },
        "temperature": {
            "actual": 8,
            "preset": 8,
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
        "number": 10,
        "name": "Abkochentfetten",
        "flightbar": 0,
        "articleName": "Artikel",
        "customerName": "Kunde",
        "time": {
            "actual": 0,
            "preset": 4
        },
        "temperature": {
            "actual": 8,
            "preset": 8,
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
        "number": 11,
        "name": "Beizen",
        "flightbar": 0,
        "articleName": "Artikel",
        "customerName": "Kunde",
        "time": {
            "actual": 0,
            "preset": 1
        },
        "temperature": {
            "actual": 8,
            "preset": 8,
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
        "number": 12,
        "name": "Kreislaufspülen",
        "flightbar": 9,
        "articleName": "Artikel",
        "customerName": "Kunde",
        "time": {
            "actual": 0,
            "preset": 0.5
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
        "number": 13,
        "name": "Standspülen",
        "flightbar": 0,
        "articleName": "Artikel",
        "customerName": "Kunde",
        "time": {
            "actual": 0,
            "preset": 50
        },
        "temperature": {
            "actual": 30,
            "preset": 30,
            "isPresent": false
        },
        "current": {
            "actual": 0,
            "preset": 10,
            "isPresent": false
        },
        "voltage": {
            "actual": 0,
            "preset": 25,
            "isPresent": false
        }
    },
    {
        "number": 14,
        "name": "El. Entfetten",
        "flightbar": 0,
        "articleName": "Artikel",
        "customerName": "Kunde",
        "time": {
            "actual": 0,
            "preset": 50
        },
        "temperature": {
            "actual": 20,
            "preset": 20,
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
        "number": 15,
        "name": "Dekapieren",
        "flightbar": 0,
        "articleName": "Artikel",
        "customerName": "Kunde",
        "time": {
            "actual": 0,
            "preset": 55
        },
        "temperature": {
            "actual": 20,
            "preset": 20,
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
        "number": 16,
        "name": "Kreislaufspülen",
        "flightbar": 0,
        "articleName": "Artikel",
        "customerName": "Kunde",
        "time": {
            "actual": 0,
            "preset": 1
        },
        "temperature": {
            "actual": 20,
            "preset": 20,
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
        "number": 17,
        "name": "Zink 1",
        "flightbar": 0,
        "articleName": "Artikel",
        "customerName": "Kunde",
        "time": {
            "actual": 0,
            "preset": 5
        },
        "temperature": {
            "actual": 17,
            "preset": 17,
            "isPresent": true
        },
        "current": {
            "actual": 0,
            "preset": 64,
            "isPresent": true
        },
        "voltage": {
            "actual": 0,
            "preset": 0,
            "isPresent": true
        }
    },
    {
        "number": 18,
        "name": "Zink 2",
        "flightbar": 0,
        "articleName": "Artikel",
        "customerName": "Kunde",
        "time": {
            "actual": 0,
            "preset": 3
        },
        "temperature": {
            "actual": 17,
            "preset": 17,
            "isPresent": true
        },
        "current": {
            "actual": 0,
            "preset": 64,
            "isPresent": true
        },
        "voltage": {
            "actual": 0,
            "preset": 0,
            "isPresent": true
        }
    },
    {
        "number": 19,
        "name": "Zink 3",
        "flightbar": 0,
        "articleName": "Artikel",
        "customerName": "Kunde",
        "time": {
            "actual": 0,
            "preset": 0
        },
        "temperature": {
            "actual": 17,
            "preset": 17,
            "isPresent": true
        },
        "current": {
            "actual": 0,
            "preset": 64,
            "isPresent": true
        },
        "voltage": {
            "actual": 0,
            "preset": 0,
            "isPresent": true
        }
    },
    {
        "number": 20,
        "name": "Zink 4",
        "flightbar": 0,
        "articleName": "Artikel",
        "customerName": "Kunde",
        "time": {
            "actual": 0,
            "preset": 0
        },
        "temperature": {
            "actual": 17,
            "preset": 17,
            "isPresent": true
        },
        "current": {
            "actual": 0,
            "preset": 64,
            "isPresent": true
        },
        "voltage": {
            "actual": 0,
            "preset": 0,
            "isPresent": true
        }
    },
    {
        "number": 21,
        "name": "Standspülen",
        "flightbar": 0,
        "articleName": "Artikel",
        "customerName": "Kunde",
        "time": {
            "actual": 0,
            "preset": 10
        },
        "temperature": {
            "actual": 20,
            "preset": 20,
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