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
      <div className="max-w-2xl mx-auto w-full animate-fadeInUp">
        <div className="glass rounded-2xl sm:rounded-3xl shadow-2xl p-8 sm:p-12 text-center">
          <div className="text-6xl sm:text-8xl mb-5 sm:mb-6 animate-float">
            📖
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3 leading-tight">
            Your cookbook is empty
          </h2>
          <p className="text-gray-600 mb-6 sm:mb-8 text-base sm:text-lg leading-relaxed">
            Start creating delicious recipes with AI!
          </p>
          <div className="inline-flex flex-wrap items-center justify-center gap-2 text-orange-600 font-semibold text-sm sm:text-base">
            <span>Click &quot;Create&quot; above to get started</span>
            <span className="text-xl sm:text-2xl" aria-hidden>
              →
            </span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto w-full space-y-6 sm:space-y-8">
      <div className="animate-fadeInUp">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 leading-tight">
          <span className="text-4xl sm:text-5xl shrink-0" aria-hidden>
            📚
          </span>
          <span>Your Recipe Collection</span>
        </h2>

        <div className="relative">
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search recipes by name or ingredients..."
            className="w-full min-h-[52px] px-4 sm:px-6 py-3.5 pl-12 sm:pl-14 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none bg-white/80 text-base sm:text-lg transition-all"
          />
          <svg
            className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 h-5 w-5 sm:h-6 sm:w-6 text-gray-400 pointer-events-none"
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

      <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredRecipes.map((recipe, index) => (
          <div
            key={recipe.id}
            role="button"
            tabIndex={0}
            className="recipe-card glass rounded-2xl shadow-lg p-5 sm:p-6 cursor-pointer group animate-fadeInUp"
            style={{ animationDelay: `${index * 0.1}s` }}
            onClick={() => onViewRecipe(recipe)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onViewRecipe(recipe)
              }
            }}
          >
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2 group-hover:text-orange-600 transition-colors line-clamp-2 leading-snug">
                  {recipe.recipeName || 'Untitled Recipe'}
                </h3>
                <div className="flex flex-wrap gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600">
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
                className="text-gray-400 hover:text-red-600 transition-colors p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-red-50 shrink-0"
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
              <div className="mb-4 p-3 sm:p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl border border-orange-200/50">
                <p className="text-sm text-gray-700 line-clamp-2 leading-relaxed">
                  <span className="font-semibold">Ingredients: </span>
                  {recipe.originalIngredients}
                </p>
              </div>
            )}

            <div className="flex items-center justify-between gap-3 pt-4 border-t-2 border-gray-100">
              <span className="text-xs text-gray-500 shrink-0">
                {formatDate(recipe.createdAt)}
              </span>
              <span className="text-orange-600 font-semibold text-sm flex items-center gap-1 group-hover:gap-2 transition-all shrink-0">
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
        <div className="glass rounded-2xl sm:rounded-3xl shadow-lg p-8 sm:p-12 text-center animate-fadeInUp">
          <div className="text-5xl sm:text-6xl mb-4" aria-hidden>
            🔍
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
            No recipes found
          </h3>
          <p className="text-gray-600 text-sm sm:text-base">
            Try a different search term
          </p>
        </div>
      )}

      <div className="mt-6 sm:mt-8 glass rounded-2xl shadow-lg p-5 sm:p-6 bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200/50 animate-fadeInUp">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-gray-600 font-semibold">
              Your Collection
            </p>
            <p className="text-3xl sm:text-4xl font-bold text-gray-800 mt-1">
              {recipes.length}
            </p>
            <p className="text-sm text-gray-600">
              {recipes.length === 1 ? 'recipe' : 'recipes'} saved
            </p>
          </div>
          <div className="text-5xl sm:text-6xl animate-float shrink-0" aria-hidden>
            🎉
          </div>
        </div>
      </div>
    </div>
  )
}
