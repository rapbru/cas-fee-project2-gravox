import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { DB_SECRET } = process.env;

const { Pool } = pkg;

const pool = new Pool({
    user: "avnadmin",
    password: DB_SECRET,
    host: "prostgresql-gravo-x.e.aivencloud.com",
    port: 15651,
    database: "defaultdb",
    ssl: {
        rejectUnauthorized: false,
        ca: `-----BEGIN CERTIFICATE-----
MIIEQTCCAqmgAwIBAgIUKrhvfuzYXbsM5gY08dX1agA7i2EwDQYJKoZIhvcNAQEM
BQAwOjE4MDYGA1UEAwwvOWRiNTFmOTItY2E2Ni00M2NiLThkNDMtNWJmOTQxNThl
NzhiIFByb2plY3QgQ0EwHhcNMjQwOTA1MDc1NTA2WhcNMzQwOTAzMDc1NTA2WjA6
MTgwNgYDVQQDDC85ZGI1MWY5Mi1jYTY2LTQzY2ItOGQ0My01YmY5NDE1OGU3OGIg
UHJvamVjdCBDQTCCAaIwDQYJKoZIhvcNAQEBBQADggGPADCCAYoCggGBAM7BIzI9
Tww55q1YH6j9fpORYKlbNqZX3Tmshjsz2iWKDRRzTZuzxIz60pai/E3Iga3V1yYf
tx4em764X8xuly59i2Ch64RtadCIgHKUrfhgXqNXDgTOatQsnZtSd3DpqAn1jQO7
Ag1GMPN8hji1c3klam+nrRQOQltJ+UHSir9mDnFr855XGBR4eflmuWnP8bEUhYoj
Kyxwx2AaSxzbcOq4pP0U3ioZcLIgSOI2p2fKSYjr+mdqagQ3m/6PR/KH38OGd+U+
89aGRHFnr/BoykCpcUittHil05/iixGL1NrGwK56Mt8q0MGf1qH8c3q9D3I6S8p6
tlFRsI8L4x5rTm+GxTXKeBw6UH0zfRrNFpI0QLC1i2S6MNUHRFwEpoWhkcIdwSZB
KTyxZ83fmucxGBYSOQLIETsj1c15pAFgQzQBVvItvZJKz3BYaGJichBy6ObhS5+5
/W2yMDJakjwm88IM/6fQdoq8JViO2C4x6w/X/rjoSRK9yo1Dc3qnlaXkKwIDAQAB
oz8wPTAdBgNVHQ4EFgQUUhvbA5Ac2Qe2nqSTOz5zlz0/TFMwDwYDVR0TBAgwBgEB
/wIBADALBgNVHQ8EBAMCAQYwDQYJKoZIhvcNAQEMBQADggGBADbDDjTD5gHmMPlP
/3ptPhtDPN8vztstE4J9y2mXmstKhI1s0qur+WPnyR7dHkSMdshaXzdaVuEM8Ye
FQFk5o7jwkP2wRSt4LQ2kB+TEQwI/ZlqIIG/ww5GyL7FL2ShtGq67iIu+h3OKQR3
yeL9nRXlMiCcXSxi/OHJsNaI9/TaW09mBUL3raq6pO1BOMpUCykH1ORJO2RRgnaq
oZaKNsRlR9OTPVqOM84fgg+8HUww95/RhNvtAudEB+NIQoba6ylep+S0WzA+zKKr
YcUwDXVmMDCcPCb5LXfZJvmomxdpOhEGQ7l4h3GHR0ax2/qmXDtV3sqi4H2a4RSa
Ri20l6LQYmGghWBs32uAnqJ0nWFsiIYqZ1mjroV9EobFZQ6cPbuyNjWZCJ4umywZ
P31Jo09ocESi5k1MBvDOqvGT6v0jQ6wvA67/jR9r5n1zrvuWVOfuIJ0B+UzlqHpu
UCtMoYMK2vnuxa9CTwjaHfpms2EEzQSzvacFI2GFwKHrsTO5Bw==
-----END CERTIFICATE-----`,
    },
});

export default pool;
