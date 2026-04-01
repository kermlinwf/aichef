import { useState } from 'react'

export function RecipeDetail({ recipe, onBack, onDelete }) {
  const [showRaw, setShowRaw] = useState(false)

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <div className="max-w-4xl mx-auto w-full">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-5 sm:mb-6 font-semibold transition-colors group animate-fadeInUp min-h-[44px] -ml-1 px-1 rounded-xl"
      >
        <svg
          className="w-5 h-5 group-hover:-translate-x-1 transition-transform"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Back to Collection
      </button>

      <div
        className="glass rounded-2xl sm:rounded-3xl shadow-2xl p-5 sm:p-8 md:p-12 animate-fadeInUp"
        style={{ animationDelay: '0.1s' }}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-6 sm:mb-8 pb-6 sm:pb-8 border-b-2 border-gray-200">
          <div className="flex-1 min-w-0 pr-2">
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-gray-800 mb-2 sm:mb-3 leading-tight">
              {recipe.recipeName || 'Untitled Recipe'}
            </h1>
            <p className="text-sm text-gray-500 flex items-center gap-2 flex-wrap">
              <span aria-hidden>📅</span>
              {formatDate(recipe.createdAt)}
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              if (confirm('Delete this recipe?')) {
                onDelete(recipe.id)
              }
            }}
            className="bg-red-50 hover:bg-red-100 text-red-600 p-3 rounded-xl transition-all self-start sm:self-auto min-w-[48px] min-h-[48px] flex items-center justify-center shrink-0"
            aria-label="Delete recipe"
          >
            <svg
              className="w-6 h-6"
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

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 sm:mb-8 p-4 sm:p-6 bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl border-2 border-orange-200/50">
          <div className="text-center py-2 sm:py-0">
            <div className="text-2xl sm:text-3xl mb-2" aria-hidden>
              👥
            </div>
            <p className="text-xs text-gray-600 font-semibold">Servings</p>
            <p className="text-xl sm:text-2xl font-bold text-gray-800 mt-1">
              {recipe.servings || 'N/A'}
            </p>
          </div>
          <div className="text-center py-2 sm:py-0 border-y sm:border-y-0 border-orange-200/50 sm:border-0">
            <div className="text-2xl sm:text-3xl mb-2" aria-hidden>
              ⏱
            </div>
            <p className="text-xs text-gray-600 font-semibold">Prep Time</p>
            <p className="text-base sm:text-lg font-bold text-gray-800 mt-1 break-words px-1">
              {recipe.prepTime || 'N/A'}
            </p>
          </div>
          <div className="text-center py-2 sm:py-0">
            <div className="text-2xl sm:text-3xl mb-2" aria-hidden>
              🔥
            </div>
            <p className="text-xs text-gray-600 font-semibold">Cook Time</p>
            <p className="text-base sm:text-lg font-bold text-gray-800 mt-1 break-words px-1">
              {recipe.cookTime || 'N/A'}
            </p>
          </div>
        </div>

        {recipe.originalIngredients && (
          <div className="mb-6 sm:mb-8 p-4 sm:p-6 bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-orange-200 rounded-2xl">
            <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2 text-base sm:text-lg">
              <span className="text-xl sm:text-2xl" aria-hidden>
                🛒
              </span>
              Original Ingredients
            </h3>
            <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
              {recipe.originalIngredients}
            </p>
          </div>
        )}

        {recipe.ingredients && (
          <div className="mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
              <span className="text-3xl sm:text-4xl shrink-0" aria-hidden>
                📝
              </span>
              Ingredients
            </h2>
            <div className="space-y-2 sm:space-y-3">
              {recipe.ingredients.map((ingredient, index) => (
                <div
                  key={index}
                  className="ingredient-item text-gray-700 text-base sm:text-lg py-2 leading-relaxed"
                >
                  {ingredient}
                </div>
              ))}
            </div>
          </div>
        )}

        {recipe.instructions && (
          <div className="mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
              <span className="text-3xl sm:text-4xl shrink-0" aria-hidden>
                👨‍🍳
              </span>
              Instructions
            </h2>
            <div className="space-y-5 sm:space-y-6">
              {recipe.instructions.map((step, index) => (
                <div key={index} className="flex gap-3 sm:gap-4">
                  <div className="step-number flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-full text-white text-sm sm:text-lg font-bold flex items-center justify-center">
                    {index + 1}
                  </div>
                  <p className="text-gray-700 pt-1 sm:pt-2 text-base sm:text-lg leading-relaxed min-w-0">
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {recipe.tips && recipe.tips.length > 0 && (
          <div className="p-4 sm:p-6 bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-200 rounded-2xl">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2 sm:gap-3">
              <span className="text-2xl sm:text-3xl shrink-0" aria-hidden>
                💡
              </span>
              Pro Tips
            </h2>
            <ul className="space-y-3">
              {recipe.tips.map((tip, index) => (
                <li
                  key={index}
                  className="flex items-start gap-3 text-gray-700 text-sm sm:text-base leading-relaxed"
                >
                  <span className="text-yellow-600 text-lg sm:text-xl shrink-0">
                    ✓
                  </span>
                  <span className="pt-0.5">{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {recipe.rawResponse && (
          <div className="mt-6 sm:mt-8">
            <button
              type="button"
              onClick={() => setShowRaw(!showRaw)}
              className="w-full min-h-[48px] bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-xl transition-all text-sm sm:text-base"
            >
              {showRaw ? 'Hide' : 'Show'} Raw AI Response
            </button>
            {showRaw && (
              <div className="mt-4 p-4 sm:p-6 bg-gray-900 text-green-400 rounded-2xl font-mono text-xs sm:text-sm overflow-x-auto max-h-[50vh] overflow-y-auto">
                <pre className="whitespace-pre-wrap break-words">
                  {recipe.rawResponse}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
