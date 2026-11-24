export type Product = {
  id: string;
  createdAt: string;
  title: string;
  category: string;
  location: string;
  price: number;
  likes: number;
  time: string;
  icon: string;
  background: string;
  description?: string;
  images?: string[];
};

export type ProductSortOption =
  | "추천"
  | "최신순"
  | "인기순"
  | "낮은 가격순";

export function sortProducts<T extends Product>(
  items: T[],
  sort: ProductSortOption,
): T[] {
  switch (sort) {
    case "최신순":
      return [...items].sort(
        (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt),
      );
    case "인기순":
      return [...items].sort((a, b) => b.likes - a.likes);
    case "낮은 가격순":
      return [...items].sort((a, b) => a.price - b.price);
    default:
      return items;
  }
}

export function formatPrice(price: number): string {
  return `${price.toLocaleString("ko-KR")}원`;
}

export function formatRelativeTime(createdAt: Date): string {
  const diffMs = Date.now() - createdAt.getTime();
  const diffMinutes = Math.max(0, Math.floor(diffMs / 60000));

  if (diffMinutes < 1) return "방금 전";
  if (diffMinutes < 60) return `${diffMinutes}분 전`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}시간 전`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "어제";
  if (diffDays < 7) return `${diffDays}일 전`;

  const year = createdAt.getFullYear();
  const month = String(createdAt.getMonth() + 1).padStart(2, "0");
  const day = String(createdAt.getDate()).padStart(2, "0");
  return `${year}.${month}.${day}`;
}
