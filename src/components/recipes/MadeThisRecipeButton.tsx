"use client";

import { Button } from "react-bootstrap";
import { CheckCircleFill } from "react-bootstrap-icons";
import { useEffect, useState } from "react";
import swal from "sweetalert";

type Props = {
  recipeId: number;
  initialCount?: number;
  onIncrement?: (newCount: number) => void;
  layout?: "full" | "compact";
  disabled?: boolean;
};

export default function MadeThisButton({
  recipeId,
  initialCount = 0,
  onIncrement,
  layout = "full",
  disabled = false,
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

      const data = await res.json();

      if (!res.ok) throw new Error(data?.error ?? "Failed to update");

      setCount(data.count);
      onIncrement?.(data.count);

      swal({
        title: "Logged!",
        text: `Made ${data.count} time${data.count === 1 ? "" : "s"}.`,
        icon: "success",
        timer: 1200,
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
    </div>
  );
}
