"use client";

import { useEffect, useMemo, useState } from "react";
import { Row, Col, Form, Button } from "react-bootstrap";
import { useSession } from "next-auth/react";
import RecipeCard from "./RecipeCard";
import UnsaveButton from "@/components/recipes/UnsaveButton";
import { Produce } from "@prisma/client";

export default function SavedRecipesClient() {
  const { data: session } = useSession();
  const currentUserEmail = session?.user?.email ?? null;

  const [recipes, setRecipes] = useState<any[]>([]);
  const [pantry, setPantry] = useState<Produce[]>([]);
  const [search, setSearch] = useState("");
  const [editMode, setEditMode] = useState(false);

  // Quick lookup for names
  const pantryNames = useMemo(
    () => new Set(pantry.map((p) => p.name.toLowerCase())),
    [pantry]
  );

  useEffect(() => {
    if (!currentUserEmail) return;

    const loadData = async () => {
      try {
        // 1️⃣ Fetch saved recipes
        const savedRes = await fetch(`/api/saved-recipes?owner=${encodeURIComponent(currentUserEmail)}`);
        if (!savedRes.ok) throw new Error(await savedRes.text());
        const savedData = await savedRes.json();
        setRecipes(Array.isArray(savedData) ? savedData : []);

        // 2️⃣ Fetch full produce items for pantry
        const pantryRes = await fetch(`/api/produce?owner=${encodeURIComponent(currentUserEmail)}`);
        if (!pantryRes.ok) throw new Error(await pantryRes.text());
        const pantryData: Produce[] = await pantryRes.json();
        setPantry(Array.isArray(pantryData) ? pantryData : []);
      } catch (error) {
        console.error("SavedRecipesClient load error:", error);
      }
    };

    loadData();
  }, [currentUserEmail]);

  // Filter recipes by search
  const filteredRecipes = useMemo(() => {
    const query = search.toLowerCase().trim();
    if (!query) return recipes;

    return recipes.filter((r) => {
      const titleMatch = (r.title ?? "").toLowerCase().includes(query);
      const cuisineMatch = (r.cuisine ?? "").toLowerCase().includes(query);
      const dietaryMatch = (r.dietary ?? []).some((tag: string) =>
        tag.toLowerCase().includes(query)
      );
      const ingredientMatch = (r.ingredientItems ?? []).some((item: any) =>
        (item.name ?? "").toLowerCase().includes(query)
      );

      return titleMatch || cuisineMatch || dietaryMatch || ingredientMatch;
    });
  }, [recipes, search]);

  const removeFromUI = (recipeId: number) => {
    setRecipes((prev) => prev.filter((r) => r.id !== recipeId));
  };

  if (!currentUserEmail) {
    return <p className="text-muted">Sign in to view your saved recipes.</p>;
  }

  return (
    <>
      {/* Search + Edit */}
      <Row className="mb-3 align-items-center g-2">
        <Col md={3} className="d-none d-md-block" />
        <Col xs={12} md={6} className="d-flex flex-column align-items-center">
          <Form style={{ width: "100%", maxWidth: 400 }}>
            <Form.Control
              type="text"
              placeholder="Search saved recipes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </Form>
        </Col>
        <Col xs={12} md={3} className="d-flex justify-content-center justify-content-md-end">
          <Button
            variant={editMode ? "danger" : "outline-secondary"}
            onClick={() => setEditMode((v) => !v)}
          >
            {editMode ? "Done" : "Edit Saved"}
          </Button>
        </Col>
      </Row>

      {/* Recipe Cards */}
      <Row xs={1} md={2} lg={3} className="g-4">
        {filteredRecipes.length > 0 ? (
          filteredRecipes.map((r) => (
            <Col key={r.id}>
              <div className={`saved-card-wrap ${editMode ? "is-edit" : ""}`}>
                <RecipeCard
                  id={r.id}
                  title={r.title}
                  description={r.description}
                  imageUrl={r.imageUrl ?? undefined}
                  cuisine={r.cuisine}
                  dietary={r.dietary ?? []}
                  ingredientItems={r.ingredientItems ?? []}
                  owner={r.owner ?? "Pantry Pals Team"}
                  canEdit={false}
                  editMode={false}
                  instructions={r.instructions ?? null}
                  servings={r.servings ?? null}
                  prepMinutes={r.prepMinutes ?? null}
                  cookMinutes={r.cookMinutes ?? null}
                  proteinGrams={r.proteinGrams ?? null}
                  carbsGrams={r.carbsGrams ?? null}
                  fatGrams={r.fatGrams ?? null}
                  sourceUrl={r.sourceUrl ?? null}
                  pantryNames={pantryNames}
                  pantryItems={pantry} // ✅ full Produce[]
                />

                {editMode && (
                  <div className="saved-card-footer">
                    <UnsaveButton
                      recipeId={r.id}
                      ownerEmail={currentUserEmail}
                      onRemoved={removeFromUI}
                    />
                  </div>
                )}
              </div>
            </Col>
          ))
        ) : (
          <p className="text-center text-muted w-100 py-4">
            No saved recipes found.
          </p>
        )}
      </Row>
    </>
  );
}
