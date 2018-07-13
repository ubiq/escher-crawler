# Escher-crawler

Populates mongodb with Escher data (proposals/airdrops)

### setup

```
npm install
cp config.json.template ./config.json
```

configure via config.json

```
{
  "gubiq": "127.0.0.1:8588",

  "mongodb": {
    "user": "escher",
    "password": "UBQ4Lyfe",
    "database": "escherdb",
    "address": "localhost",
    "port": 27017
  },

  "intervals": {
    "block": "10s",
    "fast": "44s",
    "full": "7200s"
  }
}
```

### intervals

```
block: how often to check for a new block
fast: fast sync, adds any new claims/votes (does not update existing)
full: full sync, updates existing claims/votes and adds new (can be quite intensive with thousands of votes/claims)
```

### run

```
npm start
```
