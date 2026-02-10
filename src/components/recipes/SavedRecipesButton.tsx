'use client';

import { Button } from "react-bootstrap";
import { BookmarkFill } from "react-bootstrap-icons";
import swal from "sweetalert";
import '../../styles/buttons.css';

type Props = {
  recipeId: number;
  owner: string | null;
};

export default function SavedRecipeButton({ recipeId, owner }: Props) {

  async function handleSave() {
    try {
      const res = await fetch("/api/saved-recipes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipeId,
          owner,
        }),
      });

      if (!res.ok) {
        await swal("Error", "Failed to save recipe", "error");
      } else {
        await swal("Success", "Your item has been saved", "success", {
          timer: 2000,
        });
      }
    } catch (err) {
      console.error("Error saving recipe:", err);
      await swal("Error", "Something went wrong", "error");
    }
  }

  return (
    <>
      <Button
        size="lg"
        className="w-100 d-flex align-items-center justify-content-center gap-2 dish-btn-primary"
        style={{
          fontWeight: 600,
          padding: '0.75rem 1.5rem',
          fontSize: '1.05rem',
          whiteSpace: 'normal',
        }}
        onClick={handleSave}
        disabled={!owner}
      >
        <BookmarkFill size={18} />
        Save Recipe
      </Button>

      {!owner && (
        <small className="text-muted d-block text-center mt-2">
          Sign in to save recipes
        </small>
      )}
    </>
  );
}
