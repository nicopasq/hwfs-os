export default function HexLogo({ size = 60, color = "#4f8fff" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <polygon points="50,5 93,27.5 93,72.5 50,95 7,72.5 7,27.5" fill="none" stroke={color} strokeWidth="3" />
      <polygon points="50,20 78,35 78,65 50,80 22,65 22,35" fill={color} opacity=".15" />
      <text x="50" y="58" textAnchor="middle" fill={color} fontSize="28" fontWeight="800" fontFamily="'IBM Plex Sans',sans-serif">HW</text>
    </svg>
  );
}
