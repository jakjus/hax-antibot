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
