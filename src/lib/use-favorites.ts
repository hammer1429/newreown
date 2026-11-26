"use client";

import { useMemo, useState, useSyncExternalStore } from "react";

const storageKey = "reown-favorite-product-ids";
const favoriteChangeEvent = "reown-favorites-change";
const storageErrorSnapshot = "__reown_favorites_storage_error__";

function parseFavoriteIds(value: string | null): string[] {
  if (!value) {
    return [];
  }

  const parsed: unknown = JSON.parse(value);
  if (!Array.isArray(parsed)) {
    throw new Error("Invalid favorite list");
  }

  const ids: string[] = [];
  for (const id of parsed) {
    if (typeof id !== "string") {
      throw new Error("Invalid favorite list");
    }
    ids.push(id);
  }

  return [...new Set(ids)];
}

function getSnapshot() {
  try {
    return window.localStorage.getItem(storageKey) ?? "[]";
  } catch {
    return storageErrorSnapshot;
  }
}

function getServerSnapshot() {
  return "[]";
}

function subscribe(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(favoriteChangeEvent, onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(favoriteChangeEvent, onStoreChange);
  };
}

export function useFavorites() {
  const snapshot = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  const [writeError, setWriteError] = useState("");

  const { favorites, readError } = useMemo(() => {
    if (snapshot === storageErrorSnapshot) {
      return {
        favorites: [],
        readError: "찜 목록을 읽지 못했어요. 브라우저 저장 공간을 확인해 주세요.",
      };
    }

    try {
      return { favorites: parseFavoriteIds(snapshot), readError: "" };
    } catch {
      return {
        favorites: [],
        readError: "찜 목록을 읽지 못했어요. 브라우저 저장 공간을 확인해 주세요.",
      };
    }
  }, [snapshot]);

  function toggleFavorite(id: string) {
    try {
      const current = parseFavoriteIds(window.localStorage.getItem(storageKey));
      const next = current.includes(id)
        ? current.filter((favoriteId) => favoriteId !== id)
        : [...current, id];

      window.localStorage.setItem(storageKey, JSON.stringify(next));
      window.dispatchEvent(new Event(favoriteChangeEvent));
      setWriteError("");
    } catch {
      setWriteError("찜 목록을 저장하지 못했어요. 브라우저 저장 공간을 확인해 주세요.");
    }
  }

  return {
    favorites,
    toggleFavorite,
    error: readError || writeError,
  };
}
