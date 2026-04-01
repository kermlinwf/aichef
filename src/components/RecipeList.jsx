import { useState } from 'react'

export function RecipeList({ recipes, onViewRecipe, onDeleteRecipe }) {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredRecipes = recipes.filter(
    (recipe) =>
      recipe.recipeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipe.originalIngredients
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()),
  )

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  if (recipes.length === 0) {
    return (
      <div className="max-w-2xl mx-auto animate-fadeInUp">
        <div className="glass rounded-3xl shadow-2xl p-12 text-center">
          <div className="text-8xl mb-6 animate-float">📖</div>
          <h2 className="text-3xl font-bold text-gray-800 mb-3">
            Your cookbook is empty
          </h2>
          <p className="text-gray-600 mb-8 text-lg">
            Start creating delicious recipes with AI!
          </p>
          <div className="inline-flex items-center gap-2 text-orange-600 font-semibold">
            <span>Click &quot;Create&quot; above to get started</span>
            <span className="text-2xl">→</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8 animate-fadeInUp">
        <h2 className="text-4xl font-bold text-gray-800 mb-6 flex items-center gap-3">
          <span className="text-5xl">📚</span>
          Your Recipe Collection
        </h2>

        <div className="relative">
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search recipes by name or ingredients..."
            className="w-full px-6 py-4 pl-14 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none bg-white/80 text-lg transition-all"
          />
          <svg
            className="absolute left-5 top-5 h-6 w-6 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredRecipes.map((recipe, index) => (
          <div
            key={recipe.id}
            role="button"
            tabIndex={0}
            className="recipe-card glass rounded-2xl shadow-lg p-6 cursor-pointer group animate-fadeInUp"
            style={{ animationDelay: `${index * 0.1}s` }}
            onClick={() => onViewRecipe(recipe)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onViewRecipe(recipe)
              }
            }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-orange-600 transition-colors line-clamp-2">
                  {recipe.recipeName || 'Untitled Recipe'}
                </h3>
                <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                  {recipe.servings && (
                    <span className="flex items-center gap-1 bg-orange-50 px-2 py-1 rounded-lg">
                      <span>👥</span>
                      {recipe.servings}
                    </span>
                  )}
                  {recipe.prepTime && (
                    <span className="flex items-center gap-1 bg-orange-50 px-2 py-1 rounded-lg">
                      <span>⏱</span>
                      {recipe.prepTime}
                    </span>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  if (confirm('Delete this recipe?')) {
                    onDeleteRecipe(recipe.id)
                  }
                }}
                className="text-gray-400 hover:text-red-600 transition-colors p-2 rounded-lg hover:bg-red-50"
                aria-label="Delete recipe"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>

            {recipe.originalIngredients && (
              <div className="mb-4 p-3 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl border border-orange-200/50">
                <p className="text-sm text-gray-700 line-clamp-2">
                  <span className="font-semibold">Ingredients: </span>
                  {recipe.originalIngredients}
                </p>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t-2 border-gray-100">
              <span className="text-xs text-gray-500">
                {formatDate(recipe.createdAt)}
              </span>
              <span className="text-orange-600 font-semibold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                View Recipe
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </span>
            </div>
          </div>
        ))}
      </div>

      {filteredRecipes.length === 0 && searchTerm && (
        <div className="glass rounded-3xl shadow-lg p-12 text-center animate-fadeInUp">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">
            No recipes found
          </h3>
          <p className="text-gray-600">Try a different search term</p>
        </div>
      )}

      <div className="mt-8 glass rounded-2xl shadow-lg p-6 bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200/50 animate-fadeInUp">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 font-semibold">
              Your Collection
            </p>
            <p className="text-4xl font-bold text-gray-800">{recipes.length}</p>
            <p className="text-sm text-gray-600">
              {recipes.length === 1 ? 'recipe' : 'recipes'} saved
            </p>
          </div>
          <div className="text-6xl animate-float">🎉</div>
        </div>
      </div>
    </div>
  )
}
