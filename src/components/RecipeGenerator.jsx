import { useState } from 'react'

/** Set VITE_USE_MOCK_AI=true in .env — fake recipes, no API key, no network. */
const USE_MOCK_AI = import.meta.env.VITE_USE_MOCK_AI === 'true'

/**
 * OpenAI API key from build-time env (no UI). Vite inlines VITE_* into the bundle.
 * Prefer VITE_OPENAI_API_KEY; VITE_AI_API_KEY still works for older setups.
 */
const ENV_OPENAI_KEY = (import.meta.env.VITE_OPENAI_API_KEY || '').trim()
const ENV_GENERIC_KEY = (import.meta.env.VITE_AI_API_KEY || '').trim()
const API_KEY = ENV_OPENAI_KEY || ENV_GENERIC_KEY

const OPENAI_MODEL =
  (import.meta.env.VITE_OPENAI_MODEL || 'gpt-4o-mini').trim() || 'gpt-4o-mini'

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
        'No API key in this build. Add VITE_OPENAI_API_KEY (or VITE_AI_API_KEY) to .env and run npm run build. On GitHub Pages: add that name as a repository secret, then re-run “Deploy to GitHub Pages”. Or set VITE_USE_MOCK_AI=true for offline mock recipes.',
      )
      return
    }

    setLoading(true)
    setError('')
    setSuccess(false)

    const userPrompt = `Create a romantic, date-night quality recipe using these ingredients: ${ingredients}.

Return ONLY a JSON object (no markdown, no extra text) with these keys:
recipeName, servings (number), prepTime, cookTime, ingredients (array of strings), instructions (array of strings), tips (array of strings).`

    try {
      const response = await fetch(
        'https://api.openai.com/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${API_KEY}`,
          },
          body: JSON.stringify({
            model: OPENAI_MODEL,
            max_tokens: 1500,
            response_format: { type: 'json_object' },
            messages: [
              {
                role: 'system',
                content:
                  'You are an expert chef. Reply with valid JSON only, matching the user schema.',
              },
              { role: 'user', content: userPrompt },
            ],
          }),
        },
      )

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

      const content = data.choices?.[0]?.message?.content
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
    <div className="max-w-3xl mx-auto animate-fadeInUp w-full">
      <div className="glass rounded-2xl sm:rounded-3xl shadow-2xl p-5 sm:p-8 md:p-12">
        <div className="text-center mb-8 sm:mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-orange-400 to-red-500 rounded-full mb-5 sm:mb-6 text-4xl sm:text-5xl shadow-2xl animate-float">
            🍳
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-800 mb-2 sm:mb-3 tracking-tight px-1">
            What&apos;s cooking?
          </h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-xl mx-auto leading-relaxed px-1">
            Tell me what&apos;s in your kitchen, and I&apos;ll craft a
            restaurant-quality recipe just for you
          </p>
        </div>

        {USE_MOCK_AI && (
          <div className="mb-6 sm:mb-8 p-4 sm:p-5 bg-amber-50 border-2 border-amber-200 rounded-2xl text-sm text-amber-900 leading-relaxed">
            <strong>Mock mode:</strong> recipes are generated locally — no API key and
            no API calls. Set{' '}
            <code className="bg-amber-100 px-1 rounded">VITE_USE_MOCK_AI=false</code>{' '}
            (or remove it) for real AI.
          </div>
        )}

        {!USE_MOCK_AI && !API_KEY && (
          <div className="mb-6 sm:mb-8 p-4 sm:p-5 bg-orange-50 border-2 border-orange-200 rounded-2xl text-sm text-orange-950 leading-relaxed">
            <strong>No API key in this deployment.</strong> The key is baked in when
            the site is built. On GitHub: Settings → Secrets → Actions → repository
            secret{' '}
            <code className="bg-white/80 px-1 rounded">VITE_OPENAI_API_KEY</code>{' '}
            or{' '}
            <code className="bg-white/80 px-1 rounded">VITE_AI_API_KEY</code>,
            then Actions → re-run the latest &quot;Deploy to GitHub Pages&quot;
            workflow. Locally: use a <code className="bg-white/80 px-1 rounded">.env</code>{' '}
            file and <code className="bg-white/80 px-1 rounded">npm run build</code>.
          </div>
        )}

        <div className="mb-6 sm:mb-8 space-y-3">
          <label
            htmlFor="ingredients"
            className="block text-sm font-semibold text-gray-700 flex items-center gap-2"
          >
            <span className="text-lg" aria-hidden>
              🥘
            </span>
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
            rows={6}
            className="w-full min-h-[140px] px-4 sm:px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none resize-y bg-white/80 text-base sm:text-lg leading-relaxed transition-all"
            disabled={loading}
          />
          <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
            💡 Tip: Be specific! &quot;boneless chicken thighs&quot; works
            better than just &quot;chicken&quot;
          </p>
        </div>

        {error && (
          <div className="mb-5 sm:mb-6 p-4 sm:p-5 bg-red-50 border-2 border-red-200 rounded-xl animate-fadeInUp">
            <p className="text-sm text-red-800 flex gap-2.5 leading-relaxed">
              <span className="shrink-0" aria-hidden>
                ⚠️
              </span>
              <span>{error}</span>
            </p>
          </div>
        )}

        {success && (
          <div className="mb-5 sm:mb-6 p-4 sm:p-5 bg-green-50 border-2 border-green-200 rounded-xl animate-fadeInUp">
            <p className="text-sm text-green-800 flex gap-2.5 leading-relaxed">
              <span className="shrink-0" aria-hidden>
                ✓
              </span>
              <span>Recipe created! Redirecting to your collection...</span>
            </p>
          </div>
        )}

        <button
          type="button"
          onClick={generateRecipe}
          disabled={loading || !ingredients.trim()}
          className="w-full min-h-[52px] bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold py-4 sm:py-5 px-6 rounded-2xl text-base sm:text-lg hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.99] sm:hover:scale-[1.02] sm:active:scale-[0.98]"
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

        <div className="mt-8 sm:mt-10 pt-6 sm:pt-8 border-t-2 border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 sm:mb-4 flex items-center gap-2">
            <span aria-hidden>🌟</span>
            Try these combinations:
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
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
                className="text-left min-h-[48px] px-4 py-3.5 bg-white hover:bg-orange-50 border-2 border-gray-200 hover:border-orange-300 rounded-xl text-sm sm:text-base text-gray-700 leading-snug transition-colors"
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
