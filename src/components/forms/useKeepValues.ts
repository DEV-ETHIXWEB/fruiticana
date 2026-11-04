import { startTransition } from "react";

/**
 * Submit handler for forms backed by useActionState. React resets a form after its `action`
 * runs, including when the server sends back validation errors, so a shopper would lose
 * everything they typed. Dispatching from onSubmit instead keeps the fields; the form's
 * `action` attribute still works when JavaScript hasn't loaded.
 */
export function keepValues(dispatch: (data: FormData) => void) {
  return (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    startTransition(() => dispatch(data));
  };
}
