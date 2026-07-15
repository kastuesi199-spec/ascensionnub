"use client";
import { useEffect, useState } from "react";
import Slot from "./Slot";

type PartyProps = {
  partyId: string;
  slots: {
    id: string;
    role: string;
    player: {
      id: string;
      name: string;
      role1: string;
      role2: string;
      fillRole: string;
    } | null;
  }[];
  onDropPlayer: (partyId: string, slotId: string, playerId: string) => void;
  isOwner: boolean;
  editSlotRole: (partyId: string, slotId: string, role: string) => void;
  addSlot: (partyId: string) => void;
  unsign: (playerId: string) => void;
  removeSlot: (partyId: string) => void;
};

export default function Party({
  partyId,
  slots,
  onDropPlayer,
  isOwner,
  editSlotRole,
  addSlot,
  unsign,
  removeSlot,
}: PartyProps) {

  // ⭐ Prevent hydration mismatch
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
if (!mounted) return null;

  return (
    <div className="flex flex-col gap-1.5">

      {slots.map((slot) => (
        <Slot
          key={slot.id}
          slot={slot}
          partyId={partyId}
          onDropPlayer={onDropPlayer}
          isOwner={isOwner}
          editSlotRole={editSlotRole}
          unsign={unsign}
        />
      ))}

      {/* ⭐ Render owner controls ONLY after client mounts */}
      {mounted && isOwner && (
        <div className="mt-1 grid grid-cols-2 gap-2 border-t border-slate-800 pt-3">
          <button
            onClick={() => addSlot(partyId)}
            className="rounded-md border border-neutral-700 bg-neutral-900 px-2 py-1.5 text-xs font-medium text-neutral-300 hover:border-neutral-500 hover:bg-neutral-800"
          >
            + Add Slot
          </button>

          <button
            onClick={() => removeSlot(partyId)}
            className="rounded-md border border-neutral-700 bg-neutral-900 px-2 py-1.5 text-xs font-medium text-neutral-300 hover:border-rose-400/60 hover:text-rose-200"
          >
            - Remove Slot
          </button>
        </div>
      )}
    </div>
  );
}