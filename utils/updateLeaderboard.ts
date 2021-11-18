import { writeFileSync } from "fs"
import { getCompetitions } from "./twitter"

interface Competitors {
  [key: string]: {
    wins: number
    losses: number
    ratio?: number
  }
}

async function updateLeaderboard() {
  const competitions = await getCompetitions()

  const competitors = {}

  competitions.map((competition) => {
    let [winner, loser] = competition.options.sort((a, b) => b.votes - a.votes)

    if (competitors[winner.label] === undefined) {
      competitors[winner.label] = {
        wins: 1,
        losses: 0,
      }
    } else {
      competitors[winner.label].wins += 1
    }

    if (competitors[loser.label] === undefined) {
      competitors[loser.label] = {
        wins: 0,
        losses: 1,
      }
    } else {
      competitors[loser.label].losses += 1
    }
  })

  const leaderboard = Object.keys(competitors)
    .sort((a, b) => {
      return competitors[b].wins - competitors[a].wins
    })
    .map((key) => {
      return [`"${key}"`, competitors[key].wins, competitors[key].losses].join(
        ","
      )
    })
    .join("\n")

  const csv = `emoji,wins,losses
${leaderboard}
`
  console.log(csv)

  writeFileSync("leaderboard.csv", csv)
}

updateLeaderboard()
