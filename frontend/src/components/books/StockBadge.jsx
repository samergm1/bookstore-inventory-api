import Badge from "../ui/Badge";

export default function StockBadge({ quantity, threshold = 10 }) {
  if (quantity === 0) return <Badge tone="danger">Agotado</Badge>;
  if (quantity <= threshold) return <Badge tone="warning">{quantity} · Bajo</Badge>;
  return <Badge tone="success">{quantity}</Badge>;
}
