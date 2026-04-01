import { useState } from 'react'

/** Set VITE_USE_MOCK_AI=true in .env — fake recipes, no API key, no network. */
const USE_MOCK_AI = import.meta.env.VITE_USE_MOCK_AI === 'true'

/**
 * Key from build-time env only (no UI). Vite inlines VITE_* into the bundle —
 * fine for a private household app on GitHub Pages; use low limits on the key.
 */
const ENV_AI_KEY = (import.meta.env.VITE_AI_API_KEY || '').trim()
const ENV_LEGACY_KEY = (import.meta.env.VITE_ANTHROPIC_API_KEY || '').trim()
const API_KEY = ENV_AI_KEY || ENV_LEGACY_KEY

function buildMockRecipe(ingredients) {
  const parts = ingredients
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  const lead = parts[0] || 'your ingredients'
  const titled =
    lead.length > 0
      ? lead.charAt(0).toUpperCase() + lead.slice(1)
      : 'Tonight'

  return {
    recipeName: `Candlelit ${titled} for Two`,
    servings: 2,
    prepTime: '15 minutes',
    cookTime: '25 minutes',
    ingredients: parts.map((p) => `2 portions ${p}`),
    instructions: [
      'Prep and mise en place: chop aromatics and warm a serving plate.',
      'Sear or roast the main ingredients until golden and cooked through.',
      'Deglaze, finish with a simple pan sauce, rest briefly, then plate.',
    ],
    tips: [
      'Taste and adjust salt before serving.',
      'Pair with something bubbly or a crisp white wine.',
    ],
    originalIngredients: ingredients,
    rawResponse:
      '[Mock response — no API call. Set VITE_USE_MOCK_AI=false and add a key for real AI.]',
  }
}

export function RecipeGenerator({ onRecipeGenerated, onViewRecipes }) {
  const [ingredients, setIngredients] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const generateRecipe = async () => {
    if (!ingredients.trim()) {
      setError('Please enter some ingredients to get started')
      return
    }

    if (USE_MOCK_AI) {
      setLoading(true)
      setError('')
      setSuccess(false)
      try {
        await new Promise((r) => setTimeout(r, 700))
        const recipe = buildMockRecipe(ingredients)
        onRecipeGenerated(recipe)
        setIngredients('')
        setSuccess(true)
        setTimeout(() => onViewRecipes(), 1500)
      } catch (err) {
        console.error(err)
        setError('Something went wrong in mock mode.')
      } finally {
        setLoading(false)
      }
      return
    }

    if (!API_KEY) {
      setError(
        'Missing API key: set VITE_AI_API_KEY in .env, then rebuild (or set VITE_USE_MOCK_AI=true for offline mock recipes).',
      )
      return
    }

    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [
            {
              role: 'user',
              content: `Create a romantic, date-night quality recipe using these ingredients: ${ingredients}.

Respond ONLY with a JSON object (no markdown, no explanations) in this exact format:
{
  "recipeName": "creative romantic name",
  "servings": 2,
  "prepTime": "X minutes",
  "cookTime": "X minutes",
  "ingredients": ["ingredient 1 with amount", "ingredient 2 with amount"],
  "instructions": ["step 1", "step 2"],
  "tips": ["tip 1", "tip 2"]
}`,
            },
          ],
        }),
      })

      const rawBody = await response.text()
      let data
      try {
        data = JSON.parse(rawBody)
      } catch {
        throw new Error('Invalid response from API')
      }

      if (!response.ok) {
        const msg =
          data?.error?.message ||
          data?.message ||
          `Request failed (${response.status})`
        throw new Error(msg)
      }

      const content = data.content?.[0]?.text
      if (!content) {
        throw new Error('No recipe text in API response')
      }

      let recipeData
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/)
        recipeData = JSON.parse(jsonMatch ? jsonMatch[0] : content)
      } catch {
        recipeData = {
          recipeName: 'Delicious Creation',
          servings: 2,
          prepTime: '20 minutes',
          cookTime: '30 minutes',
          ingredients: ingredients
            .split(',')
            .map((i) => `1 portion ${i.trim()}`),
          instructions: [
            'Prepare ingredients',
            'Cook with love',
            'Serve and enjoy!',
          ],
          tips: ['Season to taste', 'Adjust cooking time as needed'],
        }
      }

      const recipe = {
        ...recipeData,
        originalIngredients: ingredients,
        rawResponse: content,
      }

      onRecipeGenerated(recipe)
      setIngredients('')
      setSuccess(true)
      setTimeout(() => {
        onViewRecipes()
      }, 1500)
    } catch (err) {
      console.error('Error generating recipe:', err)
      setError(
        err.message ||
          'Failed to generate recipe. Check your API key in .env and rebuild.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto animate-fadeInUp">
      <div className="glass rounded-3xl shadow-2xl p-8 md:p-12">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-orange-400 to-red-500 rounded-full mb-6 text-5xl shadow-2xl animate-float">
            🍳
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-3 tracking-tight">
            What&apos;s cooking?
          </h2>
          <p className="text-lg text-gray-600 max-w-xl mx-auto">
            Tell me what&apos;s in your kitchen, and I&apos;ll craft a
            restaurant-quality recipe just for you
          </p>
        </div>

        {USE_MOCK_AI && (
          <div className="mb-8 p-4 bg-amber-50 border-2 border-amber-200 rounded-2xl text-sm text-amber-900">
            <strong>Mock mode:</strong> recipes are generated locally — no API key and
            no API calls. Set{' '}
            <code className="bg-amber-100 px-1 rounded">VITE_USE_MOCK_AI=false</code>{' '}
            (or remove it) for real AI.
          </div>
        )}

        <div className="mb-8">
          <label
            htmlFor="ingredients"
            className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2"
          >
            <span className="text-lg">🥘</span>
            Your Ingredients
          </label>
          <textarea
            id="ingredients"
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                generateRecipe()
              }
            }}
            placeholder="chicken breast, cherry tomatoes, garlic, fresh basil, mozzarella..."
            rows={5}
            className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none resize-none bg-white/80 text-lg transition-all"
            disabled={loading}
          />
          <p className="text-xs text-gray-500 mt-2">
            💡 Tip: Be specific! &quot;boneless chicken thighs&quot; works
            better than just &quot;chicken&quot;
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl animate-fadeInUp">
            <p className="text-sm text-red-800 flex items-center gap-2">
              <span>⚠️</span>
              {error}
            </p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border-2 border-green-200 rounded-xl animate-fadeInUp">
            <p className="text-sm text-green-800 flex items-center gap-2">
              <span>✓</span>
              Recipe created! Redirecting to your collection...
            </p>
          </div>
        )}

        <button
          type="button"
          onClick={generateRecipe}
          disabled={
            loading || !ingredients.trim() || (!USE_MOCK_AI && !API_KEY)
          }
          className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold py-5 px-8 rounded-2xl text-lg hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98]"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-3">
              <svg
                className="animate-spin h-6 w-6 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span className="shimmer">Crafting your masterpiece...</span>
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <span className="text-2xl">✨</span>
              Generate My Recipe
            </span>
          )}
        </button>

        <div className="mt-8 pt-8 border-t-2 border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <span>🌟</span>
            Try these combinations:
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              'salmon, asparagus, lemon, dill',
              'pasta, sun-dried tomatoes, goat cheese',
              'chicken thighs, honey, soy sauce, ginger',
              'shrimp, garlic, white wine, butter',
            ].map((example, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIngredients(example)}
                className="text-left px-4 py-3 bg-white hover:bg-orange-50 border-2 border-gray-200 hover:border-orange-300 rounded-xl text-sm text-gray-700 transition-all"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
