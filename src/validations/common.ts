import type { Ref } from 'vue'
import { email, helpers, minLength, required, sameAs } from '@vuelidate/validators'

export const nameRules = {
  required: helpers.withMessage('Please enter a name.', required),
  validCharacters: helpers.withMessage(
    'Name can only contain letters and spaces.',
    helpers.regex(/^[\p{L}\s]+$/u),
  ),
  minLength: helpers.withMessage('Name must have at least 2 characters.', minLength(2)),
}

export const emailRules = {
  required: helpers.withMessage('Please enter an email address.', required),
  email: helpers.withMessage('Please enter a valid email address.', email),
}

export const passwordRules = {
  required: helpers.withMessage('Please enter a password.', required),
  minLength: helpers.withMessage('Password must be at least 6 characters.', minLength(6)),
  specialCharacter: helpers.withMessage(
    'Password must include at least one special character (e.g. !@#$%^&*).',
    helpers.regex(/[^A-Za-z0-9\s]/),
  ),
}

export const confirmPasswordRules = (password: Ref<string>) => ({
  required: helpers.withMessage('Please confirm your password.', required),
  sameAsPassword: helpers.withMessage('Passwords do not match.', sameAs(password)),
})

export const addressRules = {
  required: helpers.withMessage('Please enter an address.', required),
}
