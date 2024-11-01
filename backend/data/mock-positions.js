const mockPositions = {
    "positions": {
        "1": {
            "name": "Airgenex",
            "flightbar": 8,
            "articleName": "Artikel",
            "customerName": "Kunde",
            "time": {
                "actual": 25,
                "preset": 150
            },
            "temperature": {
                "actual": 0,
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
        "2": {
            "name": "Reserve",
            "flightbar": 0,
            "articleName": "Artikel",
            "customerName": "Kunde",
            "time": {
                "actual": 0,
                "preset": 60
            },
            "temperature": {
                "actual": 0,
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
        "3": {
            "name": "Reserve",
            "flightbar": 0,
            "articleName": "Artikel",
            "customerName": "Kunde",
            "time": {
                "actual": 0,
                "preset": 60
            },
            "temperature": {
                "actual": 0,
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
        "4": {
            "name": "Blaupassivieren",
            "flightbar": 0,
            "articleName": "Artikel",
            "customerName": "Kunde",
            "time": {
                "actual": 0,
                "preset": 6
            },
            "temperature": {
                "actual": 0,
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
        "5": {
            "name": "Kreislaufspülen",
            "flightbar": 0,
            "articleName": "Artikel",
            "customerName": "Kunde",
            "time": {
                "actual": 0,
                "preset": 300
            },
            "temperature": {
                "actual": 0,
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
        "6": {
            "name": "Kreislaufspülen",
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
        "8": {
            "name": "Standspülen",
            "flightbar": 0,
            "articleName": "Artikel",
            "customerName": "Kunde",
            "time": {
                "actual": 0,
                "preset": 60
            },
            "temperature": {
                "actual": 0,
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
        "9": {
            "name": "Standspülen",
            "flightbar": 0,
            "articleName": "Artikel",
            "customerName": "Kunde",
            "time": {
                "actual": 0,
                "preset": 60
            },
            "temperature": {
                "actual": 0,
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
        "10": {
            "name": "Abkochentfetten",
            "flightbar": 0,
            "articleName": "Artikel",
            "customerName": "Kunde",
            "time": {
                "actual": 0,
                "preset": 240
            },
            "temperature": {
                "actual": 0,
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
        "11": {
            "name": "Beizen",
            "flightbar": 0,
            "articleName": "Artikel",
            "customerName": "Kunde",
            "time": {
                "actual": 0,
                "preset": 60
            },
            "temperature": {
                "actual": 0,
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
        "12": {
            "name": "Kreislaufspülen",
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
        "13": {
            "name": "Standspülen",
            "flightbar": 0,
            "articleName": "Artikel",
            "customerName": "Kunde",
            "time": {
                "actual": 0,
                "preset": 3000
            },
            "temperature": {
                "actual": 0,
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
        "14": {
            "name": "El. Entfetten",
            "flightbar": 0,
            "articleName": "Artikel",
            "customerName": "Kunde",
            "time": {
                "actual": 0,
                "preset": 3000
            },
            "temperature": {
                "actual": 0,
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
        "15": {
            "name": "Dekapieren",
            "flightbar": 0,
            "articleName": "Artikel",
            "customerName": "Kunde",
            "time": {
                "actual": 0,
                "preset": 3300
            },
            "temperature": {
                "actual": 0,
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
        "16": {
            "name": "Kreislaufspülen",
            "flightbar": 0,
            "articleName": "Artikel",
            "customerName": "Kunde",
            "time": {
                "actual": 0,
                "preset": 60
            },
            "temperature": {
                "actual": 0,
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
        "17": {
            "name": "Zink 1",
            "flightbar": 0,
            "articleName": "Artikel",
            "customerName": "Kunde",
            "time": {
                "actual": 0,
                "preset": 300
            },
            "temperature": {
                "actual": 0,
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
        "18": {
            "name": "Zink 2",
            "flightbar": 0,
            "articleName": "Artikel",
            "customerName": "Kunde",
            "time": {
                "actual": 0,
                "preset": 180
            },
            "temperature": {
                "actual": 0,
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
        "19": {
            "name": "Zink 3",
            "flightbar": 0,
            "articleName": "Artikel",
            "customerName": "Kunde",
            "time": {
                "actual": 0,
                "preset": 0
            },
            "temperature": {
                "actual": 0,
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
        "20": {
            "name": "Zink 4",
            "flightbar": 0,
            "articleName": "Artikel",
            "customerName": "Kunde",
            "time": {
                "actual": 0,
                "preset": 0
            },
            "temperature": {
                "actual": 0,
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
        "21": {
            "name": "Standspülen",
            "flightbar": 0,
            "articleName": "Artikel",
            "customerName": "Kunde",
            "time": {
                "actual": 0,
                "preset": 600
            },
            "temperature": {
                "actual": 0,
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
        "50": {
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
        "51": {
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
        }
    }
};
  
export default mockPositions;