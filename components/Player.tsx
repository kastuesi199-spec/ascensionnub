"use client";
import { useState, useEffect, type DragEvent } from "react";

type PlayerProps = {
  player: {
    id: string;
    name: string;
    role1: string;
    role2: string;
    fillRole: string;
    avatar: string;
  };
  isOwner: boolean;
  isInSlot: boolean;
};

export default function Player({ player, isOwner, isInSlot }: PlayerProps) {
  // ⭐ Prevent hydration mismatch
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  function scrollWhileDragging(event: DragEvent<HTMLDivElement>) {
    if (!isOwner || isInSlot) return;

    const edgeSize = 120;
    const scrollAmount = 18;

    if (event.clientY < edgeSize) {
      window.scrollBy({ top: -scrollAmount });
    } else if (window.innerHeight - event.clientY < edgeSize) {
      window.scrollBy({ top: scrollAmount });
    }
  }

  return (
    <div
      draggable={isOwner && !isInSlot}
      onDragStart={(e) => {
        if (!isOwner || isInSlot) return;
        e.dataTransfer.setData("playerId", player.id);
      }}
      onDrag={scrollWhileDragging}
      className={`min-w-0 rounded-lg border px-3 py-2 leading-tight transition-colors ${
        isInSlot
          ? "border-transparent bg-transparent px-0 py-0 text-sm"
          : "cursor-grab border-neutral-700 bg-neutral-900 text-sm hover:border-neutral-500 hover:bg-neutral-800 active:cursor-grabbing"
      }`}
    >
      <div className="flex items-center gap-2">
        {player.avatar && (
          <img
            src={player.avatar}
            className="w-6 h-6 rounded-full"
            alt="avatar"
          />
        )}

        <span className="truncate font-medium">{player.name}</span>
      </div>

      {!isInSlot && (
        <span className="break-words text-[13px] uppercase leading-5 text-neutral-400">
          {player.role1} · {player.role2} · {player.fillRole}
        </span>
      )}
    </div>
  );
}