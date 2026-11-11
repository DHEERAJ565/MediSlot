import { useState, useCallback } from 'react';

/**
 * ============================================================================
 * UNIT IV: Custom Hook — useFormValidation (Zod Schema Integration)
 * ============================================================================
 * Demonstrates:
 * - Controlled component form state management.
 * - Schema-based validation using Zod.
 * - Immutability principles when updating nested state.
 * - Granular field-level error mapping and clearing.
 * - Reusable form submission lifecycle handling.
 *
 * @param {object} initialValues - Initial field values
 * @param {import('zod').ZodSchema} schema - Zod validation schema
 */
export const useFormValidation = (initialValues, schema) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState({});

  // Controlled input change handler
  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    const finalValue = type === 'checkbox' ? checked : value;

    // Immutability: return a new object with updated field
    setValues((prev) => ({
      ...prev,
      [name]: finalValue,
    }));

    // Clear error for this field as user types
    setErrors((prev) => {
      if (!prev[name]) return prev;
      const copy = { ...prev };
      delete copy[name];
      return copy;
    });
  }, []);

  // Mark field as touched on blur
  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  }, []);

  // Direct programmatic value setter
  const setFieldValue = useCallback((name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => {
      if (!prev[name]) return prev;
      const copy = { ...prev };
      delete copy[name];
      return copy;
    });
  }, []);

  // Validate all fields against schema
  const validate = useCallback(() => {
    if (!schema) return { isValid: true, data: values };

    const result = schema.safeParse(values);
    if (result.success) {
      setErrors({});
      return { isValid: true, data: result.data };
    }

    // Map Zod error issues into a key-value map: { fieldName: errorMessage }
    const formattedErrors = {};
    result.error.issues.forEach((issue) => {
      const fieldPath = issue.path[0];
      if (fieldPath && !formattedErrors[fieldPath]) {
        formattedErrors[fieldPath] = issue.message;
      }
    });

    setErrors(formattedErrors);
    return { isValid: false, errors: formattedErrors };
  }, [schema, values]);

  // Reset form to initial state
  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    setIsSubmitting,
    handleChange,
    handleBlur,
    setFieldValue,
    setValues,
    validate,
    resetForm,
  };
};

export default useFormValidation;
