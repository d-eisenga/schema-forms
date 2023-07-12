import * as E from '@effect/data/Either';
import {pipe} from '@effect/data/Function';
import * as N from '@effect/data/Number';
import * as O from '@effect/data/Option';
import * as R from '@effect/data/ReadonlyRecord';
import {FormValue, ErrorList, ErrorFreeFormData, FormData} from './types';

export const validValue = <From, To>(
  from: From,
  value: To
): FormValue<From, To> => E.right({
  value,
  from,
});

export const errorValue = <From, To>(
  from: From,
  errors: ErrorList
): FormValue<From, To> => E.left({
  errors,
  from,
});

export const chainOption = <A, B>(
  fn: (a: A) => O.Option<B>
) => (self: O.Option<A>): O.Option<B> => (
  O.isSome(self) ? fn(self.value) : O.none()
);

export const getRawValue = <From, To>(value: FormValue<From, To>) => pipe(
  value,
  E.match({
    onLeft: e => e.from,
    onRight: v => v.from,
  })
);

export const getDecodedValue = <From, To>(value: FormValue<From, To>) => pipe(
  value,
  E.getRight,
  O.map(v => v.value)
);

export const isErrorFreeFormData = (formData: FormData): formData is ErrorFreeFormData => pipe(
  formData,
  R.map(E.getLeft),
  R.compact,
  R.size,
  N.lessThan(1)
);

export const foldFormData = <A>(
  onErrors: (formData: FormData) => A,
  onErrorFree: (formData: ErrorFreeFormData) => A
) => (formData: FormData) => (
  isErrorFreeFormData(formData) ? onErrorFree(formData) : onErrors(formData)
);

