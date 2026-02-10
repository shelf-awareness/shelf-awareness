"use client";

import { useEffect, useMemo, useState } from "react";
import { Row, Col, Form } from "react-bootstrap";
import { useSession } from "next-auth/react";
import RecipeCard from "./RecipeCard";

type ProduceName = { name: string };

export default function SavedRecipesClient() {
  const { data: session } = useSession();
  const currentUserEmail = session?.user?.email ?? null;

  const [recipes, setRecipes] = useState<any[]>([]);
  const [produce, setProduce] = useState<ProduceName[]>([]);
  const [search, setSearch] = useState("");

  // Build pantryNames exactly like your RecipesClient
  const pantryNames = useMemo(
  () => new Set(produce.map((p) => (p.name ?? "").trim().toLowerCase())),
  [produce]
);



  useEffect(() => {
  if (!currentUserEmail) return;

  const load = async () => {
    try {
      const savedUrl = new URL("/api/saved-recipes", window.location.origin);
      savedUrl.searchParams.set("owner", currentUserEmail);

      const savedRes = await fetch(savedUrl.toString());
      if (!savedRes.ok) throw new Error(await savedRes.text());
      const savedData = await savedRes.json();
      setRecipes(Array.isArray(savedData) ? savedData : []);

      const produceUrl = new URL(
        `/api/produce/${encodeURIComponent(currentUserEmail)}/names`,
            window.location.origin
        );
        produceUrl.searchParams.set("owner", currentUserEmail);

const produceRes = await fetch(produceUrl.toString());
if (!produceRes.ok) throw new Error(await produceRes.text());
const produceData = await produceRes.json();
setProduce(Array.isArray(produceData) ? produceData : []);

    } catch (e) {
      console.error("SavedRecipesClient load error:", e);
    }
  };

  load();
}, [currentUserEmail]);


  // Search filter like your RecipesClient
  const filteredRecipes = useMemo(() => {
    const query = search.toLowerCase();
    if (!query) return recipes;

    return recipes.filter((r) => {
      const titleMatch = (r.title ?? "").toLowerCase().includes(query);
      const cuisineMatch = (r.cuisine ?? "").toLowerCase().includes(query);
      const dietaryMatch = (r.dietary ?? []).some((tag: string) => tag.toLowerCase().includes(query));
      const ingredientMatch = (r.ingredientItems ?? []).some((item: any) =>
        (item.name ?? "").toLowerCase().includes(query)
      );

      return titleMatch || cuisineMatch || dietaryMatch || ingredientMatch;
    });
  }, [recipes, search]);

  if (!currentUserEmail) {
    return <p className="text-muted">Sign in to view your saved recipes.</p>;
  }

  return (
    <>
      <div className="d-flex justify-content-center mb-3">
        <Form style={{ width: "100%", maxWidth: 400 }}>
          <Form.Control
            type="text"
            placeholder="Search saved recipes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </Form>
      </div>

      <Row xs={1} md={2} lg={3} className="g-4">
        {filteredRecipes.length > 0 ? (
          filteredRecipes.map((r) => {
            const owner = r.owner ?? "Pantry Pals Team";

            return (
              <Col key={r.id}>
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
