"use client";
import { supabase } from "@/lib/supabaseClient";
import { useState, type DragEvent, useEffect } from "react";
import Player from "../components/Player";
import Party from "../components/Party";
import { useSearchParams } from "next/navigation";

type PlayerRecord = {
  id: string;
  name: string;
  role1: string;
  role2: string;
  fillRole: string;
  avatar: string;
};

type SlotRecord = { id: string; role: string; player: PlayerRecord | null };
type PartyRecord = { id: string; name: string; slots: SlotRecord[] };
type SavedComp = { name: string; parties: PartyRecord[] };

export default function Home() {
  const generateSlots = () =>
    Array.from({ length: 20 }).map(() => ({
      id: crypto.randomUUID(),
      role: "",
      player: null,
    }));

  // ⭐ PLAYERS — persistent
  const [players, setPlayers] = useState<PlayerRecord[]>(() => {
    if (typeof window === "undefined") return [];
    const data = localStorage.getItem("players");
    return data ? JSON.parse(data) : [];
  });

  const [newName, setNewName] = useState("");
  const [role1, setRole1] = useState("");
  const [role2, setRole2] = useState("");
  const [fillRole, setFillRole] = useState("");
  const params = useSearchParams();
  const [playerAvatar, setPlayerAvatar] = useState("");
const [mounted, setMounted] = useState(false);
useEffect(() => {
  setMounted(true);
}, []);

  // ⭐ Save players on change
  useEffect(() => {
    localStorage.setItem("players", JSON.stringify(players));
  }, [players]);

  // ⭐ URL param auto-fill (still works)
  useEffect(() => {
    const discordName = params.get("name");
    const discordAvatar = params.get("avatar");

    if (discordName && !newName) setNewName(discordName);
    if (discordAvatar && !playerAvatar) setPlayerAvatar(discordAvatar);
  }, [params, newName, playerAvatar]);

  // ⭐ Supabase auto-fill
  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        if (!newName) setNewName(user.user_metadata.full_name || "");
        if (!playerAvatar) setPlayerAvatar(user.user_metadata.avatar_url || "");
      }
    }
    loadUser();
  }, []);

  const [isOwner, setIsOwner] = useState(true);

  // ⭐ PARTIES — persistent
  const [parties, setParties] = useState<PartyRecord[]>(() => {
    if (typeof window === "undefined")
      return [
        { id: "party1", name: "Party 1", slots: generateSlots() },
        { id: "party2", name: "Party 2", slots: generateSlots() },
        { id: "party3", name: "Party 3", slots: generateSlots() },
      ];

    const data = localStorage.getItem("parties");
    return data
      ? JSON.parse(data)
      : [
          { id: "party1", name: "Party 1", slots: generateSlots() },
          { id: "party2", name: "Party 2", slots: generateSlots() },
          { id: "party3", name: "Party 3", slots: generateSlots() },
        ];
  });

  // ⭐ Save parties on change
  useEffect(() => {
    localStorage.setItem("parties", JSON.stringify(parties));
  }, [parties]);

  // ⭐ Event settings — persistent
const [eventName, setEventName] = useState(() => {
  if (typeof window === "undefined") return "WAR HOLY MASS";
  return localStorage.getItem("eventName") || "WAR HOLY MASS";
});

const [eventTime, setEventTime] = useState(() => {
  if (typeof window === "undefined") return "19:00";
  return localStorage.getItem("eventTime") || "19:00";
});

const [eventLocation, setEventLocation] = useState(() => {
  if (typeof window === "undefined") return "Lymhurst";
  return localStorage.getItem("eventLocation") || "Lymhurst";
});

const [eventBank, setEventBank] = useState(() => {
  if (typeof window === "undefined") return "Wasteland";
  return localStorage.getItem("eventBank") || "Wasteland";
});

const [eventSets, setEventSets] = useState(() => {
  if (typeof window === "undefined") return "1+3";
  return localStorage.getItem("eventSets") || "1+3";
});
// ⭐ Save event settings on change
useEffect(() => {
  localStorage.setItem("eventName", eventName);
  localStorage.setItem("eventTime", eventTime);
  localStorage.setItem("eventLocation", eventLocation);
  localStorage.setItem("eventBank", eventBank);
  localStorage.setItem("eventSets", eventSets);
}, [eventName, eventTime, eventLocation, eventBank, eventSets]);

  const [showComps, setShowComps] = useState(false);
  const [savedComps, setSavedComps] = useState<SavedComp[]>(() => {
    if (typeof window === "undefined") return [];
    const data = localStorage.getItem("savedComps");
    return data ? JSON.parse(data) : [];
  });

  function addPlayer() {
    if (!newName || !role1 || !role2 || !fillRole) return;

    const newPlayer = {
      id: crypto.randomUUID(),
      name: newName,
      role1,
      role2,
      fillRole,
      avatar: playerAvatar,
    };

    setPlayers((prev) => [...prev, newPlayer]);

    setNewName("");
    setRole1("");
    setRole2("");
    setFillRole("");
  }

  function unsign(playerId: string) {
    let foundPlayer: PlayerRecord | null = null;

    setParties((prev) =>
      prev.map((party) => ({
        ...party,
        slots: party.slots.map((slot) => {
          if (slot.player?.id === playerId) {
            foundPlayer = slot.player;
            return { ...slot, player: null };
          }
          return slot;
        }),
      }))
    );

    setTimeout(() => {
      if (foundPlayer) {
  setPlayers((prev) => [
    ...prev.filter((p): p is PlayerRecord => p !== null),
    {
      ...foundPlayer,
      avatar: foundPlayer.avatar || "" // ⭐ FIX: ensure avatar exists
    }
  ]);
}

    }, 0);
  }

  function editSlotRole(partyId: string, slotId: string, newRole: string) {
    setParties((prev) =>
      prev.map((party) =>
        party.id === partyId
          ? {
              ...party,
              slots: party.slots.map((slot) =>
                slot.id === slotId ? { ...slot, role: newRole } : slot
              ),
            }
          : party
      )
    );
  }

  function addSlot(partyId: string) {
    setParties((prev) =>
      prev.map((party) =>
        party.id === partyId
          ? {
              ...party,
              slots: [
                ...party.slots,
                { id: crypto.randomUUID(), role: "", player: null },
              ],
            }
          : party
      )
    );
  }

  function removeSlot(partyId: string) {
    setParties((prev) =>
      prev.map((party) =>
        party.id === partyId
          ? { ...party, slots: party.slots.slice(0, -1) }
          : party
      )
    );
  }

  function onDropPlayer(partyId: string, slotId: string, playerId: string) {
  const player = players.find((p) => p.id === playerId);
  if (!player) return;

  // Remove player from unassigned list
  setPlayers((prev) => prev.filter((p) => p.id !== playerId));

  // Assign player to slot — ALWAYS include avatar
  setParties((prev) =>
    prev.map((party) =>
      party.id === partyId
        ? {
            ...party,
            slots: party.slots.map((slot) =>
              slot.id === slotId
                ? {
                    ...slot,
                    player: {
                      ...player,
                      avatar: player.avatar || "" // ⭐ FIX: avatar guaranteed
                    }
                  }
                : slot
            ),
          }
        : party
    )
  );
}

  function clearAll() {
    setPlayers([]);
    setParties((prev) =>
      prev.map((party) => ({
        ...party,
        slots: party.slots.map((slot) => ({
          id: slot.id,
          role: "",
          player: null,
        })),
      }))
    );
  }

  function clearParty(partyId: string) {
    setParties((prev) =>
      prev.map((party) =>
        party.id === partyId
          ? {
              ...party,
              slots: party.slots.map((slot) => ({
                ...slot,
                role: "",
                player: null,
              })),
            }
          : party
      )
    );
  }

  function addParty() {
    const newParty = {
      id: crypto.randomUUID(),
      name: "Party",
      slots: generateSlots(),
    };
    setParties((prev) => [...prev, newParty]);
  }

  function removeParty(partyId: string) {
    setParties((prev) => prev.filter((p) => p.id !== partyId));
  }

  function onDragStartParty(e: DragEvent<HTMLDivElement>, partyId: string) {
    e.dataTransfer.setData("partyId", partyId);
  }

  function onDragOverParty(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
  }

  function onDropParty(e: DragEvent<HTMLDivElement>, targetPartyId: string) {
    const draggedPartyId = e.dataTransfer.getData("partyId");
    if (!draggedPartyId) return;

    setParties((prev) => {
      const items = [...prev];
      const draggedIndex = items.findIndex((p) => p.id === draggedPartyId);
      const targetIndex = items.findIndex((p) => p.id === targetPartyId);

      const [dragged] = items.splice(draggedIndex, 1);
      items.splice(targetIndex, 0, dragged);

      return items;
    });
  }

  function saveCompsToStorage(comps: SavedComp[]) {
    localStorage.setItem("savedComps", JSON.stringify(comps));
  }

  function saveCurrentComp(name: string) {
    const strippedParties = parties.map((party) => ({
      ...party,
      slots: party.slots.map((slot) => ({ ...slot, player: null })),
    }));

    const comp = { name, parties: strippedParties };
    const updated = [...savedComps, comp];
    setSavedComps(updated);
    saveCompsToStorage(updated);
  }

  function loadComp(comp: SavedComp) {
    setParties(comp.parties);
    setPlayers([]);
  }

  function deleteComp(name: string) {
    const updated = savedComps.filter((c) => c.name !== name);
    setSavedComps(updated);
    saveCompsToStorage(updated);
  }

  function renameComp(oldName: string, newName: string) {
    const updated = savedComps.map((c) =>
      c.name === oldName ? { ...c, name: newName } : c
    );
    setSavedComps(updated);
    saveCompsToStorage(updated);
  }

  function editPartyName(partyId: string, newName: string) {
    setParties((prev) =>
      prev.map((party) =>
        party.id === partyId ? { ...party, name: newName } : party
      )
    );
  }

  const assignedIds = new Set(
    parties
      .flatMap((party) => party.slots)
      .map((slot) => slot.player)
      .filter((player): player is PlayerRecord => player !== null)
      .map((player) => player.id)
  );

  const unassignedPlayers = players.filter((p) => !assignedIds.has(p.id));
  const currentUser = players.find((p) => p.name === newName);

  return (
  <main className="min-h-screen bg-[#050505] px-4 py-5 text-[15px] text-neutral-100 sm:px-6 lg:px-8">

    {/* ⭐ FULL-WIDTH HORIZONTAL EVENT BAR */}
    <div className="mb-6 rounded-2xl border border-neutral-800 bg-[#0b0b0b] px-5 py-5 shadow-2xl shadow-black/40 sm:px-6">
      <div className="flex items-center gap-4 text-white font-medium flex-wrap">

        {/* ⭐ EVENT NAME */}
        {isOwner ? (
          <input
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-lg font-bold uppercase tracking-wide text-white outline-none focus:border-neutral-500 sm:w-[220px]"
          />
        ) : (
          <span className="uppercase font-bold tracking-wide">
            {eventName}
          </span>
        )}

        {/* ⭐ TIME */}
        {isOwner ? (
          <input
            value={eventTime}
            onChange={(e) => setEventTime(e.target.value)}
            className="w-28 rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-center text-sm text-neutral-200 outline-none focus:border-neutral-500"
          />
        ) : (
          <span className="text-[#cbd5ff]">
            Massing at {eventTime} UTC
          </span>
        )}

        {/* ⭐ MASS LOCATION */}
        {isOwner ? (
          <input
            value={eventLocation}
            onChange={(e) => setEventLocation(e.target.value)}
            className="w-36 rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-center text-sm text-neutral-200 outline-none focus:border-neutral-500"
          />
        ) : (
          <span className="px-3 py-1 rounded bg-green-700 text-white text-sm">
            Mass: {eventLocation}
          </span>
        )}

        {/* ⭐ BANK */}
        {isOwner ? (
          <input
            value={eventBank}
            onChange={(e) => setEventBank(e.target.value)}
            className="w-32 rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-center text-sm text-neutral-200 outline-none focus:border-neutral-500"
          />
        ) : (
          <span className="px-3 py-1 rounded bg-gray-700 text-white text-sm">
            Bank: {eventBank}
          </span>
        )}

        {/* ⭐ SETS */}
        {isOwner ? (
          <input
            value={eventSets}
            onChange={(e) => setEventSets(e.target.value)}
            className="w-20 rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-center text-sm text-neutral-200 outline-none focus:border-neutral-500"
          />
        ) : (
          <span className="px-3 py-1 rounded bg-red-700 text-white text-sm">
            Sets: {eventSets}
          </span>
        )}
      </div>
    </div>

    {/* ⭐ COLUMNS */}
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="flex-1">

        {mounted && (
          <div className="mb-4 flex items-end justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">Roster</p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight">Parties</h2>
            </div>
            <span className="rounded-full border border-neutral-700 bg-neutral-900 px-3 py-1 text-xs text-neutral-400">
              {parties.length} active
            </span>
          </div>
        )}

        {mounted && (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 2xl:grid-cols-4">
            {parties.map((party) => (
              <div
                key={party.id}
                className="rounded-xl border border-neutral-800 bg-[#0b0b0b] p-3 shadow-lg shadow-black/20"
                draggable={mounted && isOwner}
                onDragStart={(e) => isOwner && onDragStartParty(e, party.id)}
                onDragOver={(e) => isOwner && onDragOverParty(e)}
                onDrop={(e) => isOwner && onDropParty(e, party.id)}
              >
                <div className="mb-3 flex items-center gap-3">
                  {isOwner ? (
                    <input
                      type="text"
                      value={party.name}
                      onChange={(e) => editPartyName(party.id, e.target.value)}
                      className="min-w-0 flex-1 rounded bg-transparent px-0 py-1 text-lg font-semibold text-slate-100 outline-none placeholder:text-slate-500 focus:bg-slate-800 focus:px-2"
                    />
                  ) : (
                    <span className="text-lg font-semibold text-[#cbd5ff]">
                      {party.name}
                    </span>
                  )}

                  {isOwner && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => clearParty(party.id)}
                        className="rounded-md px-2 py-1 text-xs font-medium text-slate-400 hover:bg-slate-800 hover:text-slate-100"
                      >
                        Clear
                      </button>

                      <button
                        onClick={() => removeParty(party.id)}
                        className="rounded-md px-2 py-1 text-xs font-medium text-rose-300 hover:bg-rose-500/10"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>

                <Party
                  partyId={party.id}
                  slots={party.slots}
                  onDropPlayer={onDropPlayer}
                  isOwner={isOwner}
                  editSlotRole={editSlotRole}
                  addSlot={addSlot}
                  removeSlot={removeSlot}
                  unsign={unsign}
                />
              </div>
            ))}
          </div>
        )}

      </div>

      {/* RIGHT SIDE — SIGNUPS */}
      <aside className="flex flex-col gap-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">Attendance</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight">Signups</h2>
        </div>

        <div className="rounded-xl border border-neutral-800 bg-[#0b0b0b] p-4 shadow-lg shadow-black/20">
          <p className="mb-3 text-sm font-semibold">Add a player</p>
          <div className="flex flex-col gap-2">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Player name"
              className="rounded-lg border border-neutral-700 bg-black px-3 py-2.5 text-sm text-neutral-100 outline-none focus:border-neutral-500"
            />
            <input
              value={role1}
              onChange={(e) => setRole1(e.target.value)}
              placeholder="Primary role"
              className="rounded-lg border border-neutral-700 bg-black px-3 py-2.5 text-sm text-neutral-100 outline-none focus:border-neutral-500"
            />
            <input
              value={role2}
              onChange={(e) => setRole2(e.target.value)}
              placeholder="Secondary role"
              className="rounded-lg border border-neutral-700 bg-black px-3 py-2.5 text-sm text-neutral-100 outline-none focus:border-neutral-500"
            />
            <input
              value={fillRole}
              onChange={(e) => setFillRole(e.target.value)}
              placeholder="Fill role"
              className="rounded-lg border border-neutral-700 bg-black px-3 py-2.5 text-sm text-neutral-100 outline-none focus:border-neutral-500"
            />
            <button
              onClick={addPlayer}
              disabled={!newName || !role1 || !role2 || !fillRole}
              className="mt-1 rounded-lg bg-neutral-200 px-4 py-2.5 text-sm font-semibold text-black hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              Sign up
            </button>
          </div>
        </div>

        {isOwner && (
          <div className="rounded-xl border border-neutral-800 bg-[#0b0b0b] p-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-neutral-500">Manage roster</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setShowComps(true)}
                className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-medium text-slate-200 hover:border-indigo-400/60"
              >
                Comps
              </button>
              <button
                onClick={addParty}
                className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-medium text-slate-200 hover:border-indigo-400/60"
              >
                + Add Party
              </button>
              <button
                onClick={clearAll}
                className="rounded-lg border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-xs font-medium text-rose-200 hover:bg-rose-500/20"
              >
                Clear all
              </button>
            </div>
          </div>
        )}

        <button
          onClick={() =>
            window.open(
              "https://docs.google.com/spreadsheets/d/1UcbUDVV3cXakDJjPw7wVTJslZhVA4rpLOaaD9I_4-YI/edit?gid=449978425#gid=449978425",
              "_blank"
            )
          }
          className="rounded-lg border border-teal-800/80 bg-teal-950/60 px-4 py-2.5 text-sm font-medium text-teal-100 hover:border-teal-500/70 hover:bg-teal-900/70 hover:text-white"
        >
          Build
        </button>

        <button
          onClick={() => setIsOwner(!isOwner)}
          className="rounded-lg border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm font-medium text-slate-300 hover:border-indigo-400/60"
        >
          {isOwner ? "Owner mode: ON" : "Owner mode: OFF"}
        </button>

        {/* UNASSIGNED PLAYERS */}
        <div className="rounded-xl border border-neutral-800 bg-[#0b0b0b] p-4 shadow-lg shadow-black/20">
          <p className="mb-3 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
            Unassigned players
            {mounted && (
              <span className="rounded-full bg-slate-800 px-2 py-0.5 text-slate-300">
                {unassignedPlayers.length}
              </span>
            )}
          </p>
          {mounted && (
            <div className="flex flex-col gap-2">
              {unassignedPlayers.map((player) => (
                <Player
                  key={player.id}
                  player={player}
                  isOwner={isOwner}
                  isInSlot={false}
                />
              ))}
            </div>
          )}
        </div>
      </aside>
    </div>

    {/* ⭐ COMPS MODAL */}
    {showComps && (
      <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center">
        <div className="bg-[#0f1320] p-6 rounded-md w-[400px] border border-[#252b3d]">
          <h2 className="text-xl font-semibold mb-4">Saved Comps</h2>

          <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
            {savedComps.length === 0 && (
              <p className="text-[#9ca3c7] text-sm">No comps saved yet.</p>
            )}

            {savedComps.map((comp) => (
              <div
                key={comp.name}
                className="flex items-center justify-between bg-[#1f2937] px-3 py-2 rounded"
              >
                <span className="text-white">{comp.name}</span>

                <div className="flex gap-2">
                  <button
                    onClick={() => loadComp(comp)}
                    className="px-2 py-1 bg-blue-600 hover:bg-blue-500 rounded text-white text-xs"
                  >
                    Load
                  </button>

                  <button
                    onClick={() => {
                      const newName = prompt("New name:", comp.name);
                      if (newName && newName.trim())
                        renameComp(comp.name, newName.trim());
                    }}
                    className="px-2 py-1 bg-yellow-600 hover:bg-yellow-500 rounded text-white text-xs"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => deleteComp(comp.name)}
                    className="px-2 py-1 bg-red-600 hover:bg-red-500 rounded text-white text-xs"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4">
            <input
              id="newCompName"
              placeholder="New comp name"
              className="w-full rounded bg-[#1f2937] px-3 py-2 text-white outline-none"
            />

            <button
              onClick={() => {
                const input =
                  document.querySelector<HTMLInputElement>("#newCompName");
                const name = input?.value.trim();
                if (!name) return;
                saveCurrentComp(name);
              }}
              className="mt-2 w-full px-3 py-2 bg-green-600 hover:bg-green-500 rounded text-white"
            >
              Save Current Build
            </button>
          </div>

          <button
            onClick={() => setShowComps(false)}
            className="mt-4 w-full px-3 py-2 bg-red-600 hover:bg-red-500 rounded text-white"
          >
            Close
          </button>
        </div>
      </div>
    )}
      </main>
  );
}

