import type { Ref } from 'vue'
import {
  decimal,
  email,
  helpers,
  integer,
  maxValue,
  minLength,
  maxLength,
  minValue,
  required,
  sameAs,
} from '@vuelidate/validators'

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

export const productNameRules = {
  required: helpers.withMessage('Please enter a product name.', required),
  minLength: helpers.withMessage('Product name must be at least 2 characters.', minLength(2)),
  maxLength: helpers.withMessage('Product name must not exceed 120 characters.', maxLength(120)),
}

export const productSlugRules = {
  required: helpers.withMessage('Please enter a product slug.', required),
  validSlug: helpers.withMessage(
    'Slug may contain lowercase letters, numbers, and hyphens only.',
    helpers.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  ),
}

export const productSubtitleRules = {
  required: helpers.withMessage('Please enter a product subtitle.', required),
  maxLength: helpers.withMessage('Subtitle must not exceed 160 characters.', maxLength(160)),
}

export const productCategoryRules = {
  required: helpers.withMessage('Please select at least one category.', required),
}

export const productPriceRules = {
  required: helpers.withMessage('Please enter a price.', required),
  decimal: helpers.withMessage('Price must be a valid number.', decimal),
  minValue: helpers.withMessage('Price cannot be negative.', minValue(0)),
  maxValue: helpers.withMessage('Price must not exceed 10,000,000.', maxValue(10_000_000)),
}

export const productStockRules = {
  required: helpers.withMessage('Please enter a stock quantity.', required),
  integer: helpers.withMessage('Stock quantity must be a whole number.', integer),
  minValue: helpers.withMessage('Stock quantity cannot be negative.', minValue(0)),
  maxValue: helpers.withMessage('Stock quantity must not exceed 1,000,000.', maxValue(1_000_000)),
}

export const productDescriptionRules = {
  required: helpers.withMessage('Please enter a product description.', required),
  minLength: helpers.withMessage(
    'Product description must be at least 10 characters.',
    minLength(10),
  ),
  maxLength: helpers.withMessage(
    'Product description must not exceed 5000 characters.',
    maxLength(5000),
  ),
}
