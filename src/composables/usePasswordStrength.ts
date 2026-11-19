import { computed, type Ref } from 'vue'

export const usePasswordStrength = (password: Ref<string>) =>
  computed(() => {
    const checks = [
      password.value.length >= 8,
      /[a-z]/.test(password.value) && /[A-Z]/.test(password.value),
      /\d/.test(password.value),
      /[^A-Za-z0-9\s]/.test(password.value),
    ]
    const score = checks.filter(Boolean).length

    return {
      score,
      label: score <= 1 ? 'Weak' : score === 2 ? 'Fair' : score === 3 ? 'Good' : 'Strong',
      indicatorClass:
        score <= 1
          ? 'bg-red-500'
          : score === 2
            ? 'bg-amber-500'
            : score === 3
              ? 'bg-lime-600'
              : 'bg-green-600',
      textColorClass:
        score <= 1
          ? 'text-red-600'
          : score === 2
            ? 'text-amber-600'
            : score === 3
              ? 'text-lime-700'
              : 'text-green-700',
    }
  })
