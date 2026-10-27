import { BtnLink } from "@/components/ui";

export default function NotFound() {
  return (
    <div className="wrap page">
      <div className="panel center">
        <div style={{ fontSize: 64 }}>🕳️</div>
        <h2>You fell into the void</h2>
        <p className="muted">This page doesn't exist. Respawn?</p>
        <BtnLink href="/home" kind="primary">Respawn at Base Camp</BtnLink>
      </div>
    </div>
  );
}
