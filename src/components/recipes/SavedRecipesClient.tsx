"use client";

import { useEffect, useMemo, useState } from "react";
import { Row, Col, Form, Button } from "react-bootstrap";
import { useSession } from "next-auth/react";
import RecipeCard from "./RecipeCard";
import UnsaveButton from "@/components/recipes/UnsaveButton";

type ProduceName = { name: string };

export default function SavedRecipesClient() {
  const { data: session } = useSession();
  const currentUserEmail = session?.user?.email ?? null;

  const [recipes, setRecipes] = useState<any[]>([]);
  const [produce, setProduce] = useState<ProduceName[]>([]);
  const [search, setSearch] = useState("");
  const [editMode, setEditMode] = useState(false);

  const pantryNames = useMemo(
    () => new Set(produce.map((p) => (p.name ?? "").trim().toLowerCase())),
    [produce]
  );

  useEffect(() => {
    if (!currentUserEmail) return;

    const load = async () => {
      try {
        // Saved recipes
        const savedUrl = new URL("/api/saved-recipes", window.location.origin);
        savedUrl.searchParams.set("owner", currentUserEmail);

        const savedRes = await fetch(savedUrl.toString());
        if (!savedRes.ok) throw new Error(await savedRes.text());
        const savedData = await savedRes.json();
        setRecipes(Array.isArray(savedData) ? savedData : []);

        // Produce names for pantry
        const produceUrl = new URL(
          `/api/produce/${encodeURIComponent(currentUserEmail)}/names`,
          window.location.origin
        );
        produceUrl.searchParams.set("owner", currentUserEmail);

        const produceRes = await fetch(produceUrl.toString());
        if (!produceRes.ok) throw new Error(await produceRes.text());
        const produceData = await produceRes.json();

        const normalized: ProduceName[] = Array.isArray(produceData)
          ? produceData
              .map((p: any) =>
                typeof p === "string" ? { name: p } : { name: p?.name ?? "" }
              )
              .filter((p: ProduceName) => p.name.trim().length > 0)
          : [];

        setProduce(normalized);
      } catch (e) {
        console.error("SavedRecipesClient load error:", e);
      }
    };

    load();
  }, [currentUserEmail]);

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

      {/* Cards */}
      <Row xs={1} md={2} lg={3} className="g-4">
        {filteredRecipes.length > 0 ? (
          filteredRecipes.map((r) => {
            const owner = r.owner ?? "Pantry Pals Team";

            return (
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
                    owner={owner}
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
            );
          })
        ) : (
          <p className="text-center text-muted w-100 py-4">
            No saved recipes found.
          </p>
        )}
      </Row>
    </>
  );
}
