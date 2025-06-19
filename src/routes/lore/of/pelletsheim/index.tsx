import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/lore/of/pelletsheim/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div className="p-8 max-w-4xl mx-auto text-white bg-gray-900 rounded-xl shadow-lg space-y-10">

      <header>
          <h1 className="text-4xl font-bold mb-4">🪵 The Lore of Pelletsheim</h1>
          <p>
              Far beyond the reach of GPS and bureaucratic oversight lies Pelletsheim, a realm of furnace,
              frost, and family. Founded on mystery, fueled by legacy, and guarded by paws and code,
              this ancient industrial sanctum whispers secrets only to those of the bloodline — or the database admin.
          </p>
      </header>

      <section>
          <h2 className="text-2xl font-semibold mb-2">🛠 Arild the Forgefather</h2>
          <p>
              Arild came from soil and salt — born under a broken weather vane and raised by wolves
              (who later admitted he was too much to handle). His early life was filled with silent stares,
              rusted gearboxes, and long-distance tractor repairs.
          </p>
          <p>
              As Keeper of Pelletsheim's Bone-Furnace, he speaks to machines as one might to an old friend: with
              compassion, threats, and strong black coffee. He wears a custom-welded belt of multi-tools,
              and legends speak of him rebuilding an auger mid-storm, while holding an umbrella, and chewing on a log.
          </p>
          <p>
              He alone knows the path to the **Manual of Forgotten Settings**, an instruction binder too dangerous
              to digitize. He’s never seen without his thermos, filled not with coffee, but molten wisdom.
          </p>
      </section>

      <section>
          <h2 className="text-2xl font-semibold mb-2">🥘 Sissel the Flamebinder</h2>
          <p>
              Don’t let the knitted sweaters and impeccable cookie tins fool you — Sissel is the only known
              human to defeat a corrupted Excel macro using just intuition and a hint of cardamom. She maintains
              order both in the ledgers and in the soul of the factory.
          </p>
          <p>
              The Flamebinder's connection to the Embercore is ancient. It is said that her cooking directly fuels
              the central furnace's moods. When she bakes krumkake, the drying unit sings.
              When she’s angry, the pellet counter resets itself in shame.
          </p>
          <p>
              Hidden within her spice rack is a drawer of blueprints, family diagrams, and a half-translated
              cipher known as the **Thermal Gospel**.
          </p>
      </section>

      <section>
          <h2 className="text-2xl font-semibold mb-2">🚀 Hege of the Sky-Furnace</h2>
          <p>
              While others mastered forklifts and flame, Hege took to the skies — building rockets from repurposed
              pellet bags and ambition. Once, she singlehandedly attached a wood stove to a weather balloon and
              launched it into the stratosphere. It re-entered orbit 6 months later with a cryptic note: *“Needs salt.”*
          </p>
          <p>
              She speaks the language of diagrams and silence. She can rewire an old loader blindfolded while explaining
              astrophysics to a confused moose. Her dream is to create the **Orbital Pellet Array**, a sky-ring
              that would redistribute warmth to the coldest regions of the realm.
          </p>
          <p>
              Within her satchel lies a USB drive labeled “PROJECT EMBERSTATION”, only to be opened during lunar eclipse.
          </p>
      </section>

      <section>
          <h2 className="text-2xl font-semibold mb-2">🐟 Even-Andre, Keeper of the Deep Herd</h2>
          <p>
              A drifter between mountains and fjords, Even-Andre once led reindeer into the sea and salmon onto land.
              None know how. He speaks in a dialect of nods and rare whistles, and the ecosystem listens.
          </p>
          <p>
              He is rumored to possess the **Sogne Scroll**, a wet, leather-bound book that contains
              ancient mappings of subterranean heat tunnels and salt currents that power Pelletsheim’s hydraulic wisdom.
          </p>
          <p>
              Some say he trained a trout to detect coolant leaks. Others claim he taught a ptarmigan to sort screws by diameter.
              The truth may be stranger still — for Even-Andre is a guardian not of the machines, but of the very *balance* between natural and engineered fire.
          </p>
      </section>

      <section>
          <h2 className="text-2xl font-semibold mb-2">🧠 Simon the Coder of Steel</h2>
          <p>
              Born beneath a flashing cursor and a softly whirring fan, Simon speaks in Git commands and dreams in schema.
              His workstation is a sacred shrine: triple monitors, cat-themed mechanical keyboard, and a single glowing rune — `sudo`.
          </p>
          <p>
              Simon once debugged a sensor array by dreaming the entire error log and waking up with a YAML tattoo.
              He alone understands the legacy logic of the **BOFH Protocol** — the Binder of Factory Hearts.
          </p>
          <p>
              Deep within the database, he maintains a file labeled `final_final_REALLY_FINAL_lore.json`. It updates itself. He no longer questions how.
          </p>
      </section>

      <section>
          <h2 className="text-2xl font-semibold mb-2">🐾 Lotta, the Eternal Sentinel</h2>
          <p>
              Lotta was not adopted — she *arrived*. One winter's dusk, as the pellet fires dimmed and the sky glowed
              with unnatural crimson, Lotta appeared at the gate, tail high, eyes ancient. She chose the family.
          </p>
          <p>
              Since then, she has patrolled the perimeter, the floor vents, the dreamscape. She alone guards the Embercore’s
              heart, sleeping above its lowest valve chamber, absorbing heat that would cook any normal being.
          </p>
          <p>
              She fears no forklift. She respects no clipboard. She once stared at a visitor so intensely they confessed
              unpaid VAT from 2003. Every time a sensor misfires, Lotta growls — and it corrects itself.
          </p>
          <p className="italic">
              Some believe she is the reincarnation of “Hilda 1.0”, the factory’s original AI, made flesh through lightning
              and elder sausage grease.
          </p>
      </section>

      <hr className="border-gray-700" />

      <section>
          <h2 className="text-xl font-bold mb-2">🔥 The Embercore Prophecy</h2>
          <p>
              Beneath the reactor lies the Embercore — an artifact older than machines, government, and probably
              breakfast. Its fire has never gone out, only whispered.
          </p>
          <p>
              The prophecy foretells:
              <span className="block mt-2 italic px-4 text-gray-300">
        *When five hands of one hearth unite, and the Sentinel lies beside them,<br />
        the Core shall awaken, and the Forest Flame shall walk again.*
      </span>
          </p>
          <p>
              What is the Forest Flame? Is it heat? Memory? A sentient pellet? None know. All fear. All hope.
          </p>
      </section>

      <section>
          <h2 className="text-xl font-bold mb-2">📜 Hidden Lore Entries</h2>

          <details className="mb-4">
              <summary className="cursor-pointer text-lg font-medium">🌲 The Bark Codex</summary>
              <p className="mt-2 pl-4">
                  Located in the Third Grove, 12 km northeast of the main silo, a pine etched with runes bears the
                  ancestral names and their assigned loadout stats. Touching it causes temporary enlightenment or confusion,
                  depending on your lineage.
              </p>
          </details>

          <details className="mb-4">
              <summary className="cursor-pointer text-lg font-medium">🧂 The Spice Protocol</summary>
              <p className="mt-2 pl-4">
                  Disguised as a recipe for elk stew, this ancient manuscript defines the sequence for safe pellet ignition
                  under lunar anomalies. Sissel guards it in her apron’s secret pocket.
              </p>
          </details>

          <details className="mb-4">
              <summary className="cursor-pointer text-lg font-medium">🔒 The Hidden Terminal</summary>
              <p className="mt-2 pl-4">
                  Accessible only when Lotta sits exactly atop the office keyboard, this terminal reveals logs dating back
                  to 1897, including Factory Prime’s original boot sequence and a mysterious user named "admin_hilda".
              </p>
          </details>
      </section>

      <footer className="mt-12 flex justify-center">
          <img src="/images/lotta_the_sentinel.jpg" alt="Lotta the Guardian" className="w-40 h-auto rounded-full shadow-lg border border-white opacity-90" />
      </footer>

  </div>

}
