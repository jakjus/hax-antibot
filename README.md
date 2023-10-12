# Haxball Standard Elo
Plugin for calculating ranking points according to Elo system. To be used with node package [haxball.js](https://github.com/mertushka/haxball.js)

## Installation
```
npm i hax-standard-elo
```

## Documentation
Website documentation is available at [jakjus.github.io/hax-standard-elo/](https://jakjus.github.io/hax-standard-elo/)

## Usage
Haxball rooms can use different kinds of data storage. It can be in-memory database, SQL database or other.

To use the library, you have to implement the following interfaces:
- `GetElo` - getting data of a player (including Elo) 
- `ChangeElo` - changing data of a player

You can find these definitions at [docs](https://jakjus.github.io/hax-standard-elo/).


For SQL database, `getEloOfPlayer` could be:
```js
// ...init sqlite package and db

const getEloOfPlayer = async (playerId) => 
{ 
  db.all(`SELECT elo FROM player WHERE playerId = ?`, [playerId], (err, rows) => {
    rows.forEach((row) => return row.elo)
  })
}

// do the same for changeEloOfPlayer
// const changeEloOfPlayer = ...
```
Then, you pass these in `room.onTeamVictory` in `calculateChanges` and `execChanges`, as shown in an example below.


## Example

The following example uses in-process memory within Haxball.js room script.

```js
// room.js

const HaxballJS = require("haxball.js");
const { calculateChanges, execChanges } = require("hax-standard-elo");

const getRoom = async () => {
  const HBInit = await HaxballJS
  const room = HBInit({
    roomName: 'test',
    token: 'yourtokenhere'
  })
  return room
}

// example of in-memory data storage
const memory = {}

const run = async () => {
  const room = await getRoom()

  room.onPlayerJoin = (player) => {
    room.setPlayerAdmin(player.id, true)
    if (!memory[player.id]) {
      memory[player.id] = {...player, elo: 1200}
    }
  }

  // implement get and change functions for our memory type
  const getEloOfPlayer = async (playerId) => memory[playerId].elo
  const changeEloOfPlayer = (playerId, change) => {
    memory[playerId].elo += change
  }

  room.onTeamVictory = async _ => {
    try {
      const changeList = await calculateChanges(room, getEloOfPlayer)
      console.log(changeList)
      await execChanges(changeList, getEloOfPlayer, changeEloOfPlayer)
      console.log(memory)
    } catch(e) {
      console.log(e)
    }
  }

  room.onRoomLink = link => {
    console.log(link)
  }
}

run()
```

The equivalent example for TypeScript is in [room.ts](example/room.ts).

## Logic
This library uses Elo rating system as shown in the [Wikipedia](https://en.wikipedia.org/wiki/Elo_rating_system). Elo was designed for *1v1* (2 entities competing against each other) with *no draws*. Therefore, to make it feasible in *many players* vs *many players* scenario, each player is changed using his *individual* elo and enemy *team average* elo. It helps having normally distributed Elo rankings across playerbase with smaller variance.

## Build
```
npm run build
```

## Sidenotes
### Getting data
For performance purposes, you may want to get all the players data in one query. Then `getEloOfPlayer` should read individual players Elo from parsed data.
