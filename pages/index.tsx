import { getCompetitions, PollOption } from "../utils/twitter"
import Link from "next/link"

interface EmojiWithVoteCount {
  label: string
  victories: number
}

export default function HomePage({
  leaderboard,
}: {
  leaderboard: EmojiWithVoteCount[]
}) {
  const namedCompetitors = leaderboard.map(({ label, victories }) => {
    const emoji = label.replace(/[ a-z0-9;!'’]*/gi, "")
    const name = label.replace(emoji, "").trim()
    return {
      emoji,
      name,
      victories,
    }
  })

  return (
    <>
      <main>
        <header>
          <h1>Who Would Win?</h1>
          <p className="subheading">Bot Leaderboards</p>
        </header>
        <p>
          The{" "}
          <Link href="https://twitter.com/whowouldwinbot">
            <a>Who Would Win? bot</a>
          </Link>{" "}
          is a Twitter bot that posts daily polls pitting emoji head-to-head to
          let people vote on which one would win in a fight. Here you can see
          the leaderboard for the last 7 days, showing which emoji are coming
          out on top!
        </p>
        <ol>
          {namedCompetitors.map((competitor) => (
            <li key={competitor.name} data-name={competitor.name}>
              <p className="emoji">{competitor.emoji}</p>
              <p className="votes">{competitor.victories} victories</p>
            </li>
          ))}
        </ol>
      </main>
      <style jsx>{`
        main {
          margin: 0 auto;
          max-width: 24rem;
        }

        header {
          text-align: center;
          margin-bottom: 1.5rem;
          padding: 1.5rem 0;
        }

        h1 {
          margin: 0;
          padding: 0;
          line-height: 1;
        }

        .subheading {
          color: #888;
        }

        .emoji {
          font-size: 200%;
        }

        ol {
          counter-reset: leaderboard;
          padding: 0;
        }

        ol li p {
          margin: 0;
        }

        ol li {
          counter-increment: leaderboard;
          list-style: none;
          text-align: center;
          padding: 0.75rem;
          box-shadow: 0 0.75rem 2rem rgba(0, 0, 0, 0.1);
          border-radius: 0.5em;
          margin-bottom: 1.5rem;
          background-color: var(--card-wash-color);
        }

        ol li:first-child {
          font-size: 200%;
        }

        ol li::before {
          content: "#" counter(leaderboard) ": " attr(data-name);
          font-weight: bold;
        }
      `}</style>
      <style jsx global>{`
        :root {
          --wash-color: #f2f2f2;
          --card-wash-color: #fff;
          --text-color: #111;
        }

        @media (prefers-color-scheme: dark) {
          :root {
            --wash-color: #000;
            --card-wash-color: #222;
            --text-color: #fff;
          }
        }

        html {
          font: 125%/1.5 system-ui, -apple-system, sans-serif;
          color: var(--text-color);
          background-color: var(--wash-color);
        }

        a {
          color: red;
        }
      `}</style>
    </>
  )
}

export async function getStaticProps() {
  const competitions = await getCompetitions()

  const leaderboard: EmojiWithVoteCount[] = competitions
    .reduce<EmojiWithVoteCount[]>((leaderboard, poll) => {
      const winner = poll.options.reduce((winner, candidate) =>
        candidate.votes > winner.votes ? candidate : winner
      )

      const candidateIndex = leaderboard.findIndex(
        (value: EmojiWithVoteCount) => value.label == winner.label
      )
      if (candidateIndex !== -1) {
        leaderboard[candidateIndex].victories += 1
      } else {
        leaderboard.push({
          label: winner.label,
          victories: 1,
        })
      }

      return leaderboard
    }, [])
    .sort((a, b) => b.victories - a.victories)

  return {
    props: { leaderboard },
    // Refresh at most every 12hrs, which is twice as often as new competitions
    revalidate: 60 * 60 * 12,
  }
}
