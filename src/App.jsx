import { useState, useEffect } from 'react'
import { RecipeGenerator } from './components/RecipeGenerator'
import { RecipeList } from './components/RecipeList'
import { RecipeDetail } from './components/RecipeDetail'

const RECIPES_STORAGE_KEY = 'ai-chef-recipes'

export default function App() {
  const [recipes, setRecipes] = useState([])
  const [selectedRecipe, setSelectedRecipe] = useState(null)
  const [view, setView] = useState('generator')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const savedRecipes = localStorage.getItem(RECIPES_STORAGE_KEY)
    if (savedRecipes) {
      try {
        setRecipes(JSON.parse(savedRecipes))
      } catch (error) {
        console.error('Error loading recipes:', error)
      }
    }
  }, [])

  useEffect(() => {
    if (mounted) {
      localStorage.setItem(RECIPES_STORAGE_KEY, JSON.stringify(recipes))
    }
  }, [recipes, mounted])

  const addRecipe = (recipe) => {
    const newRecipe = {
      ...recipe,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    }
    setRecipes([newRecipe, ...recipes])
  }

  const deleteRecipe = (id) => {
    setRecipes(recipes.filter((recipe) => recipe.id !== id))
    if (selectedRecipe?.id === id) {
      setSelectedRecipe(null)
      setView('list')
    }
  }

  const viewRecipe = (recipe) => {
    setSelectedRecipe(recipe)
    setView('detail')
  }

  return (
    <div className="min-h-screen min-h-dvh bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 -left-20 w-64 h-64 bg-orange-200 rounded-full opacity-20 blur-3xl animate-float" />
        <div
          className="absolute bottom-20 -right-20 w-96 h-96 bg-red-200 rounded-full opacity-20 blur-3xl animate-float"
          style={{ animationDelay: '1s' }}
        />
        <div
          className="absolute top-1/2 left-1/2 w-80 h-80 bg-amber-200 rounded-full opacity-10 blur-3xl animate-float"
          style={{ animationDelay: '2s' }}
        />
      </div>

      <header className="relative glass border-b border-white/20 shadow-lg pt-[env(safe-area-inset-top,0)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
            <div className="flex items-center gap-3 sm:gap-4 animate-fadeInUp min-w-0">
              <div className="relative shrink-0">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl shadow-xl transform hover:scale-110 transition-transform">
                  👨‍🍳
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full border-2 border-white" />
              </div>
              <div className="min-w-0">
                <h1 className="brand text-2xl sm:text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent leading-tight">
                  AI Chef
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 italic mt-0.5">
                  Your culinary companion
                </p>
              </div>
            </div>
            <div
              className="flex items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto animate-fadeInUp"
              style={{ animationDelay: '0.1s' }}
            >
              <button
                type="button"
                onClick={() => setView('generator')}
                className={`nav-btn flex-1 sm:flex-none min-h-[48px] px-4 sm:px-6 py-3 rounded-xl font-semibold text-sm sm:text-base transition-all ${
                  view === 'generator'
                    ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg'
                    : 'bg-white/50 text-gray-700 hover:bg-white/80'
                }`}
              >
                <span className="flex items-center justify-center gap-2">
                  <span className="text-lg sm:text-xl" aria-hidden>
                    ✨
                  </span>
                  Create
                </span>
              </button>
              <button
                type="button"
                onClick={() => setView('list')}
                className={`nav-btn flex-1 sm:flex-none min-h-[48px] px-4 sm:px-6 py-3 rounded-xl font-semibold text-sm sm:text-base transition-all relative ${
                  view === 'list' || view === 'detail'
                    ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg'
                    : 'bg-white/50 text-gray-700 hover:bg-white/80'
                }`}
              >
                <span className="flex items-center justify-center gap-2">
                  <span className="text-lg sm:text-xl" aria-hidden>
                    📚
                  </span>
                  Recipes
                </span>
                {recipes.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 bg-gradient-to-br from-green-400 to-emerald-500 text-white text-xs font-bold rounded-full min-w-[1.5rem] h-6 px-1 flex items-center justify-center shadow-lg">
                    {recipes.length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 lg:py-12 pb-10 sm:pb-12">
        {view === 'generator' && (
          <RecipeGenerator
            onRecipeGenerated={addRecipe}
            onViewRecipes={() => setView('list')}
          />
        )}

        {view === 'list' && (
          <RecipeList
            recipes={recipes}
            onViewRecipe={viewRecipe}
            onDeleteRecipe={deleteRecipe}
          />
        )}

        {view === 'detail' && selectedRecipe && (
          <RecipeDetail
            recipe={selectedRecipe}
            onBack={() => setView('list')}
            onDelete={deleteRecipe}
          />
        )}
      </main>
    </div>
  )
}
