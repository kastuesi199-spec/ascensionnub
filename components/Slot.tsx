"use client";

import { useState } from "react";
import Player from "./Player";

type SlotProps = {
  slot: { id: string; role: string; player: { id: string; name: string; role1: string; role2: string; fillRole: string } | null };
  partyId: string;
  onDropPlayer: (partyId: string, slotId: string, playerId: string) => void;
  isOwner: boolean;
  editSlotRole: (partyId: string, slotId: string, role: string) => void;
  unsign: (playerId: string) => void;
};

export default function Slot({
  slot,
  partyId,
  onDropPlayer,
  isOwner,
  editSlotRole,
  unsign,
}: SlotProps) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(slot.role || "");

  const fontSize = 14;

  function saveRole() {
    setEditing(false);
    editSlotRole(partyId, slot.id, value.trim());
  }

  return (
    <div className="flex items-stretch gap-2">

      {/* ROLE BOX */}
      <div className="w-28 shrink-0">
        {editing ? (
          <textarea
            autoFocus
            rows={2}
            value={value}
            onChange={(e) => {
              const text = e.target.value;
              setValue(text);
            }}
            onBlur={saveRole}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                saveRole();
              }
            }}
            className="
              w-full
              resize-none
              rounded-lg
              border border-white/10
              bg-transparent
              px-1.5
              py-1
              uppercase
              outline-none
              text-center
              text-neutral-100
            "
            style={{
              fontSize: `${fontSize}px`,
              lineHeight: "1.15",
              minHeight: "48px",
            }}
            aria-label="Role"
          />
        ) : (
          <div
            onClick={() => {
              if (!isOwner) return;
              setEditing(true);
              setValue(slot.role || "");
            }}
            className="
              min-h-12
              cursor-pointer
              rounded-lg
              border border-white/10
              bg-transparent
              px-1.5
              flex
              items-center
              justify-center
              text-center
              hover:border-white/20
              hover:bg-white/[0.03]
              transition-colors
            "
          >
            <span
              className="block min-h-[1em] uppercase text-neutral-300"
              style={{
                fontSize: `${fontSize}px`,
                lineHeight: "1.1",
                display: "block",
                wordBreak: "break-word",
                overflowWrap: "break-word",
              }}
            >
              {slot.role}
            </span>
          </div>
        )}
      </div>

      {/* PLAYER SLOT */}
      <div
        onDragOver={(e) => isOwner && e.preventDefault()}
        onDrop={(e) => {
          if (!isOwner) return;
          const playerId = e.dataTransfer.getData("playerId");
          onDropPlayer(partyId, slot.id, playerId);
        }}
        className="
          flex-1
          min-h-12
          rounded-lg
          border border-neutral-700/45
          bg-black
          flex
          items-center
          justify-between
          px-3
        "
      >
        {/* LEFT SIDE: Player or Empty */}
        <div className="min-w-0 flex flex-1 items-center gap-2">
          {slot.player ? (
            <Player
              player={slot.player}
              isOwner={isOwner}
              isInSlot={true}
            />
          ) : (
            <span className="text-xs font-medium uppercase tracking-wider text-neutral-600">
              Drop player here
            </span>
          )}
        </div>

        {/* RIGHT SIDE: ALWAYS SHOW X BUTTON */}
        {isOwner && slot.player && (
          <button
            onClick={() => {
              if (slot.player) unsign(slot.player.id);
            }}
            aria-label={`Remove ${slot.player.name}`}
            className="rounded p-1 text-xs font-bold text-neutral-500 hover:bg-rose-500/10 hover:text-rose-300"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}
