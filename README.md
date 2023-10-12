# Haxball Antibot
Plugin for checking if player is a Bot. Creates a **random map challenge** to be solved by chosen players. To be used with node package [haxball.js](https://github.com/mertushka/haxball.js)
![Antibot Map](./images/map.png)

## Installation
```
npm i hax-antibot
```

## Documentation
Website documentation is available at [jakjus.github.io/hax-antibot/](https://jakjus.github.io/hax-antibot/)

## Usage
1. Init Antibot with `initAntibot(~)` as early as possible on your RoomObject. It will track script's stadium changes, so that it will turn back to the correct stadium after Antibot Map. 
2. Choose which players to test
3. Run `antibot(~)` on them
4. Kick players that failed (or do something else)

## Example

```js
// room.js

const HaxballJS = require("haxball.js");
const { initAntibot, antibot } = require("hax-antibot");

const getRoom = async () => {
  const HBInit = await HaxballJS
  const room = HBInit({
    roomName: 'test',
    token: 'thr1.AAAAAGUoFkn6N1TdUatJBg.bS6fQZYprgM'
  })
  return room
}

const run = async () => {
  const room = await getRoom()

  // Call init once on your room before any stadium changing commands
  const getStadium = initAntibot(room)

  room.onPlayerJoin = (p) => {
    room.setPlayerAdmin(p.id, true)
  }
  
  room.onPlayerChat = () => {
    performAntibot()
    return true
  }

  // Script changes the map
  room.setDefaultStadium("Big")


  // Example of your antibot function
  const performAntibot = async () => {
    // Choose who to check. You may filter the players to choose only players which are not AFK.
    const playerIdsToCheck = room.getPlayerList().map(p => p.id)

    // Run Antibot
    const result = await antibot(room, getStadium, playerIdsToCheck)

    // Perform action depending on 
    // You can choose what to do with failed player
    result.filter(p => p.failed).forEach(p => room.kickPlayer(p.id, "Failed reaching the green zone.", false))

    // Map will be changed back automatically. Set up the teams from remaining players and start the game.
  }

  room.onRoomLink = link => {
    console.log(link)
  }
}

run()
```

This code is also in [room.ts](example/room.ts).

## Build
```
npm run build
```
