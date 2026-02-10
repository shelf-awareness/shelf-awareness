import SavedRecipesClient from "@/components/recipes/SavedRecipesClient";

export default function SavedRecipesPage() {
  return (
    <div className="container py-4">
      <h2 className="mb-3">Saved Recipes</h2>
      <SavedRecipesClient />
    </div>
  );
}
