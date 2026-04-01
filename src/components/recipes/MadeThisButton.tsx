"use client";

import { Button } from "react-bootstrap";
import { CheckCircleFill } from "react-bootstrap-icons";
import { useEffect, useState } from "react";
import swal from "sweetalert";
import { loadTotals, saveTotals } from "@/components/dashboard/MacroTracker";

type Props = {
  recipeId: number;
  initialCount?: number;
  onIncrement?: (newCount: number) => void;
  layout?: "full" | "compact";
  disabled?: boolean;
  // Optional macro logging (absorbed from CookRecipeButton)
  owner?: string | null;
  proteinGrams?: number | null;
  carbsGrams?: number | null;
  fatGrams?: number | null;
};

export default function MadeThisButton({
  recipeId,
  initialCount = 0,
  onIncrement,
  layout = "full",
  disabled = false,
  owner,
  proteinGrams,
  carbsGrams,
  fatGrams,
}: Props) {
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setCount(initialCount);
  }, [initialCount]);

  const handleMadeThis = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/recipes/${recipeId}/made`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      let data: any = null;
      try {
        data = await res.json();
      } catch {
        data = null;
      }

      if (!res.ok) throw new Error(data?.error ?? "Failed to update");

      const newCount = data.count;
      setCount(newCount);
      onIncrement?.(newCount);

      // --- Macro logging (CookRecipeButton logic) ---
      let macroLines: string[] = [];
      if (owner) {
        const p = proteinGrams ?? 0;
        const c = carbsGrams   ?? 0;
        const f = fatGrams     ?? 0;
        const current = loadTotals(owner);
        saveTotals(owner, {
          protein:  current.protein  + p,
          carbs:    current.carbs    + c,
          fat:      current.fat      + f,
          calories: current.calories + Math.round(4 * p + 4 * c + 9 * f),
        });
        if (p > 0) macroLines.push(`Protein: +${p}g`);
        if (c > 0) macroLines.push(`Carbs: +${c}g`);
        if (f > 0) macroLines.push(`Fat: +${f}g`);
        if (p > 0 || c > 0 || f > 0)
          macroLines.push(`Calories: +${Math.round(4 * p + 4 * c + 9 * f)}kcal`);
      }

      // --- Two-column popup ---
      const content = document.createElement("div");
      content.style.cssText =
        "display:flex;gap:1.25rem;text-align:left;align-items:flex-start;";

      // Left: made count
      const left = document.createElement("div");
      left.style.cssText =
        "flex:1;border-right:1px solid #dee2e6;padding-right:1.25rem;text-align:center;";
      left.innerHTML = `
        <div style="font-size:0.8rem;color:#6c757d;text-transform:uppercase;letter-spacing:0.05em;">Times Made</div>
        <div style="font-size:2rem;font-weight:700;line-height:1.1;">${newCount}</div>
        <div style="font-size:0.85rem;color:#6c757d;">time${newCount === 1 ? "" : "s"}</div>
      `;

      // Right: macros added
      const right = document.createElement("div");
      right.style.cssText = "flex:1;padding-left:0.25rem;";
      if (!owner) {
        right.innerHTML = `<div style="font-size:0.8rem;color:#6c757d;">Sign in to log macros.</div>`;
      } else if (macroLines.length === 0) {
        right.innerHTML = `<div style="font-size:0.8rem;color:#6c757d;">No macro data for this recipe.</div>`;
      } else {
        right.innerHTML = `
          <div style="font-size:0.8rem;color:#6c757d;text-transform:uppercase;letter-spacing:0.05em;
          margin-bottom:0.4rem;">Added to Daily Macros</div>
          ${macroLines
            .map(
              (line) =>
                `<div style="font-size:0.9rem;font-weight:500;">${line}</div>`
            )
            .join("")}
        `;
      }

      content.appendChild(left);
      content.appendChild(right);

      swal({
        title: "Logged!",
        icon: "success",
        content: content as any,
        timer: 2500,
        buttons: false as any,
      });
    } catch (err: any) {
      swal({
        title: "Error",
        text: err?.message ?? "Something went wrong",
        icon: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const isCompact = layout === "compact";

  return (
    <div className={isCompact ? "" : "d-grid gap-2"}>
      {!isCompact && (
        <div className="text-muted">
          Made <strong>{count}</strong> time{count === 1 ? "" : "s"}
        </div>
      )}

      <Button
        variant="success"
        className={isCompact ? "" : "w-100"}
        onClick={handleMadeThis}
        disabled={disabled || loading}
      >
        <CheckCircleFill className="me-2" />
        {loading ? "Saving..." : isCompact ? `Made ${count}` : "I Made This"}
      </Button>

      {!owner && !isCompact && (
        <small className="text-muted text-center">Sign in to log macros</small>
      )}
    </div>
  );
}
