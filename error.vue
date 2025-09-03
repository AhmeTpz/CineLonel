<template>
  <div class="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-purple-50 flex items-center justify-center p-4">
    <div class="text-center max-w-md">
      <div class="w-24 h-24 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-12 h-12 text-white">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
      </div>
      <h1 class="text-4xl font-bold text-gray-800 mb-4">{{ error?.statusCode || 'Error' }}</h1>
      <h2 class="text-xl font-semibold text-gray-700 mb-4">{{ error?.message || 'Something went wrong' }}</h2>
      <p class="text-gray-600 mb-8">Something went wrong. Please try again later.</p>
      <button @click="handleError" class="bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-200">
        Go Home
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const error = useError()

const handleError = () => {
  clearError({ redirect: '/' })
}
</script>
