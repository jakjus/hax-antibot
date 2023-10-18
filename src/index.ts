import fs from "node:fs"
import path from "node:path"

interface Options {
  secondsToComplete: number
}

const defaultOptions: Options = {
  secondsToComplete: 8
}

const setBarriers = (room: RoomObject) => {
  // index 12 to 28 including
  const beginY = -140
  const rows = [
    { beginX: -100 }, 
    { beginX: -20 },
    { beginX: 60}
  ]

  let discIdToMove = 10
  const rowSizeWithGap = 7

  for (const row of rows) {
    const gap = Math.floor(Math.random()*rowSizeWithGap)
    for (let i = 0; i < rowSizeWithGap; i++) {
      if (i == gap) continue;
      room.setDiscProperties(discIdToMove, { x: row.beginX, y: beginY+40*i })
      discIdToMove++
    }
  }
}

const antibot = async (room: RoomObject, getStadium: any, playerIds: number[], options: Options = defaultOptions) => {
  if (room.getScores()) {
    console.error("[Jakjus Antibot] Antibot can be called only when game is stopped.")
    return
  }
  const greenZoneX = 160
  const { stadium, isCustom } = getStadium()
  const mapPath = path.join(__dirname, '..', 'maps', 'antibot.hbs');
  const antibotMap = fs.readFileSync(mapPath).toString()
  room.setCustomStadium(antibotMap)
  room.startGame()

  const pidToTeam = {}
  room.getPlayerList().filter(p => playerIds.includes(p.id)).forEach(p => pidToTeam[p.id] = p.team)

  room.getPlayerList()
  .filter(p => playerIds.includes(p.id))
  .forEach(p => {
    room.setPlayerTeam(p.id, 1)
    room.setPlayerDiscProperties(p.id, {cGroup: room.CollisionFlags.c1})
  })

  setBarriers(room)
  for (let i = 0; i < options.secondsToComplete; i++) {
    room.sendAnnouncement(`[Jakjus Antibot] Reach the green zone in ${options.secondsToComplete-i} seconds!`, null, 0xa19b7a, "small", 2)
    await new Promise(r => setTimeout(r, 1000));
  }
  // Set teams back
  room.getPlayerList().forEach(p => room.setPlayerTeam(p.id, pidToTeam[p.id]))
  const result = room.getPlayerList()
  .filter(p => playerIds.includes(p.id))
  .filter(p => p.position).map(p => { return { id: p.id, failed: p.position.x < greenZoneX }})
  room.stopGame()
  if (stadium) {
    isCustom ? 
      room.setCustomStadium(stadium) : room.setDefaultStadium(stadium)
  }
  return result
}

const initAntibot = (room: RoomObject) => {
  // using closure
  let stadium: string
  let isCustom: boolean
  const preSetCustomMethod = room.setCustomStadium
  const preSetDefaultMethod = room.setDefaultStadium
  room.setCustomStadium = st => {
    stadium = st
    isCustom = true
    preSetCustomMethod(st)
  }
  room.setDefaultStadium = st => {
    stadium = st
    isCustom = false
    preSetDefaultMethod(st)
  }
  room.onStadiumChange = (_, byPlayer) => {
    if (byPlayer && byPlayer.id != 0) {
      console.error("[Jakjus Antibot] Stadium was changed manually by Room Admin, so Stadium data is unknown. Antibot will NOT change the stadium back after execution. Stadium has to be changed through Haxball script for this to work.")
    }
  }
  return () => { return { stadium, isCustom } }
}

export { initAntibot, antibot, Options }
